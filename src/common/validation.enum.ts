export enum ValidationErrorMessage {
    REQUIRED = "can't be blank",
    INVALID = "is invalid",
    CONFLICT = "has already been taken"
}

export type ErrorResponse = {
    errors: Record<string, string[]>;
};

export const errorResponse = (field: string, message: string): ErrorResponse => ({
    errors: { [field]: [message] },
});
