package common

import (
	"github.com/stretchr/testify/require"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

func TestAuthRedirectRejectsExternalAndAuthLoops(t *testing.T) {
	for _, target := range []string{"https://evil.example", "//evil.example", "/\\evil.example", "/sign-in?redirect=/sign-in", "/oauth/github", "/dashboard\n//evil"} {
		require.Empty(t, SanitizeAuthRedirect(target), target)
	}
	require.Equal(t, "/dashboard/tokens?tab=keys#new", SanitizeAuthRedirect("/dashboard/tokens?tab=keys#new"))
}
func TestConsumeVerificationCodeSingleUseAcrossConcurrentRequests(t *testing.T) {
	RegisterVerificationCodeWithKey("consume-concurrent", "abcdef", EmailVerificationPurpose)
	var successes atomic.Int32
	var group sync.WaitGroup
	for range 20 {
		group.Go(func() {
			if ConsumeVerificationCode("consume-concurrent", "abcdef", EmailVerificationPurpose) {
				successes.Add(1)
			}
		})
	}
	group.Wait()
	require.EqualValues(t, 1, successes.Load())
}
func TestConsumeVerificationCodeExpiryAndAttemptLimit(t *testing.T) {
	RegisterVerificationCodeWithKey("consume-expired", "abcdef", PasswordResetPurpose)
	verificationMutex.Lock()
	verificationMap[PasswordResetPurpose+"consume-expired"] = verificationValue{code: "abcdef", time: time.Now().Add(-time.Hour)}
	verificationMutex.Unlock()
	require.False(t, ConsumeVerificationCode("consume-expired", "abcdef", PasswordResetPurpose))
	RegisterVerificationCodeWithKey("consume-attempts", "abcdef", EmailVerificationPurpose)
	require.False(t, ConsumeVerificationCode("consume-attempts", "abcdef", PasswordResetPurpose))
	for range 5 {
		require.False(t, ConsumeVerificationCode("consume-attempts", "wrong", EmailVerificationPurpose))
	}
	require.False(t, ConsumeVerificationCode("consume-attempts", "abcdef", EmailVerificationPurpose))
}
