package controller

import (
	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestOnboardingPasswordResetUsesChosenPasswordAndRevokesSessions(t *testing.T) {
	user, _ := setupSecurityEnrollmentTest(t)
	email := "reset@example.com"
	require.NoError(t, model.DB.Model(user).Update("email", email).Error)
	common.RegisterVerificationCodeWithKey(email, "reset-secret", common.PasswordResetPurpose)
	router := gin.New()
	router.POST("/reset", ResetPassword)
	for _, attempt := range []struct {
		password, token string
		success         bool
	}{
		{"short", "reset-secret", false}, {"new-password-123", "wrong", false}, {"new-password-123", "reset-secret", true}, {"another-password", "reset-secret", false},
	} {
		body, err := common.Marshal(map[string]string{"email": email, "token": attempt.token, "password": attempt.password})
		require.NoError(t, err)
		response := httptest.NewRecorder()
		router.ServeHTTP(response, httptest.NewRequest("POST", "/reset", strings.NewReader(string(body))))
		var result struct {
			Success bool `json:"success"`
			Data    any  `json:"data"`
		}
		require.NoError(t, common.Unmarshal(response.Body.Bytes(), &result))
		require.Equal(t, attempt.success, result.Success, response.Body.String())
		require.Nil(t, result.Data)
		require.NotContains(t, response.Body.String(), attempt.password)
	}
	var updated model.User
	require.NoError(t, model.DB.First(&updated, user.Id).Error)
	require.True(t, common.ValidatePasswordAndHash("new-password-123", updated.Password))
	require.Greater(t, updated.AuthVersion, user.AuthVersion)
	count, err := model.CountActiveUserSessions(user.Id, time.Now().Unix())
	require.NoError(t, err)
	require.Zero(t, count)
}
func TestOnboardingEmailRegistrationRequiresVerificationWithoutUsername(t *testing.T) {
	setupSecurityEnrollmentTest(t)
	previousRegister, previousPassword, previousEmail, previousToken := common.RegisterEnabled, common.PasswordRegisterEnabled, common.EmailVerificationEnabled, constant.GenerateDefaultToken
	common.RegisterEnabled, common.PasswordRegisterEnabled, common.EmailVerificationEnabled, constant.GenerateDefaultToken = true, true, true, false
	t.Cleanup(func() {
		common.RegisterEnabled, common.PasswordRegisterEnabled, common.EmailVerificationEnabled, constant.GenerateDefaultToken = previousRegister, previousPassword, previousEmail, previousToken
	})
	common.RegisterVerificationCodeWithKey("new@example.com", "abcdef", common.EmailVerificationPurpose)
	router := gin.New()
	router.POST("/register", Register)
	for _, attempt := range []struct {
		code    string
		success bool
	}{{"wrong", false}, {"abcdef", true}, {"abcdef", false}} {
		body, err := common.Marshal(map[string]string{"email": "new@example.com", "password": "registered-password", "verification_code": attempt.code})
		require.NoError(t, err)
		response := httptest.NewRecorder()
		router.ServeHTTP(response, httptest.NewRequest("POST", "/register", strings.NewReader(string(body))))
		var result struct {
			Success bool `json:"success"`
		}
		require.NoError(t, common.Unmarshal(response.Body.Bytes(), &result))
		require.Equal(t, attempt.success, result.Success, response.Body.String())
	}
	user, err := model.GetUniqueUserByEmail("new@example.com")
	require.NoError(t, err)
	require.True(t, strings.HasPrefix(user.Username, "user_"))
	require.True(t, common.ValidatePasswordAndHash("registered-password", user.Password))
}
