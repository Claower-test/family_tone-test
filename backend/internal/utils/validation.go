package utils

import (
	"errors"
	"unicode"
)

// ValidatePassword checks if the password meets the strict requirements:
// - At least 6 characters
// - At least one uppercase Latin letter
// - At least one digit
// - At least one special character
// - No Cyrillic characters
func ValidatePassword(password string) error {
	if len(password) < 6 {
		return errors.New("пароль должен быть не менее 6 символов")
	}

	var (
		hasUpper   = false
		hasDigit   = false
		hasSpecial = false
	)

	for _, r := range password {
		// Detect Cyrillic
		if (r >= '\u0400' && r <= '\u04FF') || (r >= '\u0500' && r <= '\u052F') {
			return errors.New("пароль может содержать только латиницу")
		}

		if unicode.IsUpper(r) {
			hasUpper = true
		}
		if unicode.IsDigit(r) {
			hasDigit = true
		}
		if unicode.IsPunct(r) || unicode.IsSymbol(r) {
			hasSpecial = true
		}
	}

	if !hasUpper {
		return errors.New("пароль должен содержать как минимум одну заглавную букву")
	}
	if !hasDigit {
		return errors.New("пароль должен содержать как минимум одну цифру")
	}
	if !hasSpecial {
		return errors.New("пароль должен содержать как минимум один специальный символ")
	}

	return nil
}
