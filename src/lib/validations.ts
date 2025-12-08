import { z } from "zod";

// Phone number validation regex (international format)
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

// Email validation
export const emailSchema = z.string().email("Invalid email address");

// Phone number validation
export const phoneNumberSchema = z
    .string()
    .regex(phoneRegex, "Invalid phone number format. Use international format (e.g., +1234567890)")
    .optional()
    .or(z.literal(""));

// Skill name validation
export const skillNameSchema = z
    .string()
    .min(2, "Skill name must be at least 2 characters")
    .max(50, "Skill name must be less than 50 characters")
    .regex(/^[a-zA-Z0-9\s\-\/\+\#\.]+$/, "Skill name contains invalid characters");

// Profile validation schemas
export const profileSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters")
        .optional()
        .or(z.literal("")),
    industry: z
        .string()
        .max(100, "Industry must be less than 100 characters")
        .optional()
        .or(z.literal("")),
    bio: z
        .string()
        .max(500, "Bio must be less than 500 characters")
        .optional()
        .or(z.literal("")),
    avatarUrl: z
        .string()
        .url("Invalid URL format")
        .optional()
        .or(z.literal("")),
    phoneNumber: phoneNumberSchema,
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Proposal validation schemas
export const proposalSchema = z.object({
    title: z
        .string()
        .min(5, "Title must be at least 5 characters")
        .max(100, "Title must be less than 100 characters"),
    description: z
        .string()
        .min(20, "Description must be at least 20 characters")
        .max(1000, "Description must be less than 1000 characters"),
    modality: z.enum(["REMOTE", "IN_PERSON"], {
        message: "Please select a modality",
    }),
    offeredSkillIds: z
        .array(z.string())
        .min(1, "Please select at least one skill to offer"),
    neededSkillIds: z
        .array(z.string())
        .min(1, "Please select at least one skill you want to learn"),
});

export type ProposalFormData = z.infer<typeof proposalSchema>;

// Application validation schemas
export const applicationSchema = z.object({
    proposalId: z.string().min(1, "Proposal ID is required"),
    pitchMessage: z
        .string()
        .min(10, "Pitch message must be at least 10 characters")
        .max(500, "Pitch message must be less than 500 characters"),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

// Review validation schemas
export const reviewSchema = z.object({
    swapId: z.string().min(1, "Swap ID is required"),
    receiverId: z.string().min(1, "Receiver ID is required"),
    rating: z
        .number()
        .int("Rating must be a whole number")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating must be at most 5"),
    comment: z
        .string()
        .max(500, "Comment must be less than 500 characters")
        .optional()
        .or(z.literal("")),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

// Message validation schemas
export const messageSchema = z.object({
    receiverId: z.string().min(1, "Receiver ID is required"),
    swapId: z.string().optional(),
    content: z
        .string()
        .min(1, "Message cannot be empty")
        .max(1000, "Message must be less than 1000 characters"),
});

export type MessageFormData = z.infer<typeof messageSchema>;

// Skill validation
export const addSkillSchema = z.object({
    name: skillNameSchema,
});

export type AddSkillFormData = z.infer<typeof addSkillSchema>;

// File upload validation
export const imageFileSchema = z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
    .refine(
        (file) => ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"].includes(file.type),
        "File must be an image (JPEG, PNG, WebP, or GIF)"
    );

// Helper function to validate and return errors
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    errors?: Record<string, string>;
} {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors: Record<string, string> = {};
    result.error.issues.forEach((err: z.ZodIssue) => {
        const path = err.path.join(".");
        errors[path] = err.message;
    });

    return { success: false, errors };
}

// Helper to format validation errors for display
export function formatValidationError(errors: Record<string, string>): string {
    return Object.values(errors).join(". ");
}

// Phone number formatter
export function formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, "");
    return cleaned;
}

// Validate phone number format
export function isValidPhoneNumber(phone: string): boolean {
    return phoneRegex.test(formatPhoneNumber(phone));
}
