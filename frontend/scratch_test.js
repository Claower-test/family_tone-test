const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,}$/;
const CYRILLIC_RE = /[а-яА-ЯёЁ]/;

const passwords = [
  "short",          // Fail: too short
  "nocaps1!",       // Fail: no upper
  "NODIGITS!",      // Fail: no digits
  "NoSpecial1",     // Fail: no special
  "Пароль1!",      // Fail: Cyrillic
  "ValidP@ss1",     // Success
];

passwords.forEach(p => {
  let fail = false;
  if (p.length < 6) {
    console.log(`Password [${p}]: FAIL -> Too short`);
    fail = true;
  } else if (CYRILLIC_RE.test(p)) {
    console.log(`Password [${p}]: FAIL -> Cyrillic`);
    fail = true;
  } else if (!PASSWORD_RE.test(p)) {
    console.log(`Password [${p}]: FAIL -> Missing requirements`);
    fail = true;
  } else {
    console.log(`Password [${p}]: SUCCESS`);
  }
});
