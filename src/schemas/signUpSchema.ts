import {z} from "zod";

export const usernameValidation = z.string().min(2, "username must be atleast 2 chracter  ").max(20, "username cannot be more than 20 characters ").regex(/^[a-zA-Z0-9_]+$/, " username must not contain special character")

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "password must be atleast 8 chracter").max(50, "password cannot be more than 50 characters").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
})

export const verifySchema = z.object({
    code: z.string().length(6, "verificstion code must be 6 digits ")
})