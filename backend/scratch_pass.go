package main

import (
	"errors"
	"fmt"
	"unicode"
)

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

func main() {
	passwords := []string{
		"short",          // Fail: too short
		"nocaps1!",       // Fail: no upper
		"NODIGITS!",      // Fail: no digits
		"NoSpecial1",     // Fail: no special
		"Пароль1!",      // Fail: Cyrillic
		"ValidP@ss1",     // Success
	}

	for _, p := range passwords {
		err := ValidatePassword(p)
		if err != nil {
			fmt.Printf("Password [%s]: FAIL -> %v\n", p, err)
		} else {
			fmt.Printf("Password [%s]: SUCCESS\n", p)
		}
	}
}
