package oauth

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
)

const googleIssuer = "https://accounts.google.com"

var googleSigningKeys = oidc.NewRemoteKeySet(
	oidc.ClientContext(context.Background(), &http.Client{Timeout: 10 * time.Second}),
	"https://www.googleapis.com/oauth2/v3/certs",
)

// Google identity is taken from a verified ID token, never from an email hint
// or decoded-but-unverified claims. The existing OIDC subject binding is kept.
func verifyGoogleIdentity(ctx context.Context, rawToken, clientID string, keys oidc.KeySet) (*OAuthUser, error) {
	failed := errors.New("Google authorization failed. Please try again.")
	if rawToken == "" || clientID == "" {
		return nil, failed
	}
	verifier := oidc.NewVerifier(googleIssuer, keys, &oidc.Config{ClientID: clientID, SupportedSigningAlgs: []string{"RS256"}})
	token, err := verifier.Verify(ctx, rawToken)
	if err != nil {
		return nil, failed
	}
	var claims struct {
		Email           string `json:"email"`
		Verified        bool   `json:"email_verified"`
		Name            string `json:"name"`
		AuthorizedParty string `json:"azp"`
	}
	if err := token.Claims(&claims); err != nil || token.Subject == "" || claims.Email == "" || !claims.Verified || ((claims.AuthorizedParty != "" || len(token.Audience) > 1) && claims.AuthorizedParty != clientID) {
		return nil, failed
	}
	return &OAuthUser{ProviderUserID: token.Subject, DisplayName: claims.Name, Email: claims.Email}, nil
}
