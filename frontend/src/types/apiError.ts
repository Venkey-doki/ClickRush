export type ErrorCode =
    | "VALIDATION_ERROR"
    | "BAD_REQUEST"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "CONFLICT"
    | "UNPROCESSABLE_ENTITY"
    | "INTERNAL_SERVER_ERROR"

export interface ApiErrorDetail {
    field?: string
    message: string
}

export interface ApiErrorPayload {
    success: false
    message: string
    error: {
        code: ErrorCode
        details: ApiErrorDetail[]
    }
}
