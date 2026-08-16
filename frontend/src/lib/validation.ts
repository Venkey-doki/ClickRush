export const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type ValidationResult = {
    valid: boolean
    sanitized: string
    message?: string
}

export type SignupValidationResult =
    | {
          valid: true
          data: {
              email: string
              username: string
              password: string
          }
      }
    | {
          valid: false
          message: string
      }

export type LoginValidationResult =
    | {
          valid: true
          data: {
              loginId: string
              password: string
          }
      }
    | {
          valid: false
          message: string
      }

export const sanitizeText = (value: string) => value.trim()

export const validateUsername = (value: string): ValidationResult => {
    const sanitized = sanitizeText(value)

    if (!sanitized) {
        return {
            valid: false,
            sanitized: "",
            message: "Username is required.",
        }
    }

    if (sanitized.length < 3 || sanitized.length > 20) {
        return {
            valid: false,
            sanitized,
            message: "Username must be between 3 and 20 characters long.",
        }
    }

    if (!USERNAME_REGEX.test(sanitized)) {
        return {
            valid: false,
            sanitized,
            message:
                "Username should contain only letters, numbers, and underscores. No spaces or special symbols.",
        }
    }

    return { valid: true, sanitized }
}

export const validateEmail = (value: string): ValidationResult => {
    const sanitized = sanitizeText(value)

    if (!sanitized) {
        return {
            valid: false,
            sanitized: "",
            message: "Email is required.",
        }
    }

    if (!EMAIL_REGEX.test(sanitized)) {
        return {
            valid: false,
            sanitized,
            message: "Please enter a valid email address.",
        }
    }

    return { valid: true, sanitized }
}

export const validatePassword = (value: string): ValidationResult => {
    const sanitized = value.trim()

    if (!sanitized) {
        return {
            valid: false,
            sanitized: "",
            message: "Password is required.",
        }
    }

    if (sanitized.length < 8) {
        return {
            valid: false,
            sanitized,
            message: "Password must be at least 8 characters long.",
        }
    }

    return { valid: true, sanitized }
}

export const validateSignupPayload = (payload: {
    email: string
    username: string
    password: string
}): SignupValidationResult => {
    const emailValidation = validateEmail(payload.email)
    if (!emailValidation.valid)
        return {
            valid: false,
            message: emailValidation.message ?? "Invalid email.",
        }

    const usernameValidation = validateUsername(payload.username)
    if (!usernameValidation.valid)
        return {
            valid: false,
            message: usernameValidation.message ?? "Invalid username.",
        }

    const passwordValidation = validatePassword(payload.password)
    if (!passwordValidation.valid)
        return {
            valid: false,
            message: passwordValidation.message ?? "Invalid password.",
        }

    return {
        valid: true,
        data: {
            email: emailValidation.sanitized,
            username: usernameValidation.sanitized,
            password: passwordValidation.sanitized,
        },
    }
}

export const validateLoginPayload = (payload: {
    loginId: string
    password: string
}): LoginValidationResult => {
    const trimmedLoginId = sanitizeText(payload.loginId)
    const passwordValidation = validatePassword(payload.password)

    if (!trimmedLoginId) {
        return {
            valid: false,
            message: "Please enter your username or email.",
        }
    }

    if (!passwordValidation.valid) {
        return {
            valid: false,
            message: passwordValidation.message ?? "Invalid password.",
        }
    }

    const loginIdIsEmail = trimmedLoginId.includes("@")
    const loginIdValidation = loginIdIsEmail
        ? validateEmail(trimmedLoginId)
        : validateUsername(trimmedLoginId)

    if (!loginIdValidation.valid) {
        return {
            valid: false,
            message: loginIdValidation.message ?? "Invalid username or email.",
        }
    }

    return {
        valid: true,
        data: {
            loginId: loginIdValidation.sanitized,
            password: passwordValidation.sanitized,
        },
    }
}
