package common

import (
	"net/url"
	"strings"
	"unicode"
)

func SanitizeAuthRedirect(target string) string {
	target = strings.TrimSpace(target)
	if !strings.HasPrefix(target, "/") || strings.HasPrefix(target, "//") || strings.Contains(target, "\\") || strings.IndexFunc(target, unicode.IsControl) >= 0 {
		return ""
	}
	u, err := url.Parse(target)
	if err != nil || u.Host != "" || u.Scheme != "" {
		return ""
	}
	for _, path := range []string{"/sign-in", "/sign-up", "/forgot-password", "/reset", "/user/reset", "/otp", "/oauth"} {
		if u.Path == path || strings.HasPrefix(u.Path, path+"/") {
			return ""
		}
	}
	return u.String()
}
