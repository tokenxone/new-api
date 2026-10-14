package oauth

import (
	"context"
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"github.com/QuantumNous/new-api/common"
	"github.com/coreos/go-oidc/v3/oidc"
	jose "github.com/go-jose/go-jose/v4"
	"github.com/stretchr/testify/require"
	"testing"
	"time"
)

func TestGoogleIdentityVerifiesSignatureIssuerAudienceExpiryAndEmail(t *testing.T) {
	private, err := rsa.GenerateKey(rand.Reader, 2048)
	require.NoError(t, err)
	other, err := rsa.GenerateKey(rand.Reader, 2048)
	require.NoError(t, err)
	keys := &oidc.StaticKeySet{PublicKeys: []crypto.PublicKey{&private.PublicKey}}
	for _, kind := range []string{"valid", "bad signature", "wrong issuer", "wrong audience", "expired", "unverified email", "missing subject", "wrong authorized party"} {
		t.Run(kind, func(t *testing.T) {
			claims := map[string]any{"iss": googleIssuer, "aud": "app-client", "sub": "google-subject", "exp": time.Now().Add(time.Hour).Unix(), "iat": time.Now().Unix(), "email": "member@example.com", "email_verified": true, "name": "Member"}
			signingKey := private
			switch kind {
			case "bad signature":
				signingKey = other
			case "wrong issuer":
				claims["iss"] = "https://evil.example"
			case "wrong audience":
				claims["aud"] = "other-client"
			case "expired":
				claims["exp"] = time.Now().Add(-time.Hour).Unix()
			case "unverified email":
				claims["email_verified"] = false
			case "missing subject":
				delete(claims, "sub")
			case "wrong authorized party":
				claims["azp"] = "other-client"
			}
			signer, err := jose.NewSigner(jose.SigningKey{Algorithm: jose.RS256, Key: signingKey}, nil)
			require.NoError(t, err)
			payload, err := common.Marshal(claims)
			require.NoError(t, err)
			signed, err := signer.Sign(payload)
			require.NoError(t, err)
			raw, err := signed.CompactSerialize()
			require.NoError(t, err)
			user, err := verifyGoogleIdentity(context.Background(), raw, "app-client", keys)
			if kind == "valid" {
				require.NoError(t, err)
				require.Equal(t, "google-subject", user.ProviderUserID)
			} else {
				require.Error(t, err)
				require.Nil(t, user)
			}
		})
	}
}
