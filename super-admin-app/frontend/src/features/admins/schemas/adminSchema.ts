import { z } from 'zod'

export const createCompanyAdminSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name is required'),
  email: z.string().trim().email('Enter a valid email'),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || v.length >= 8, 'Enter a valid phone number'),
  temporary_password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Include an uppercase letter')
    .regex(/[0-9]/, 'Include a number'),
  company_id: z.string().uuid('Select a company'),
  plant_ids: z.array(z.string().uuid()).min(1, 'Select at least one plant'),
  force_password_change: z.boolean(),
  is_active: z.boolean(),
})

export const updateCompanyAdminSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name is required'),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || v.length >= 8, 'Enter a valid phone number'),
  company_id: z.string().uuid('Select a company'),
  plant_ids: z.array(z.string().uuid()).min(1, 'Select at least one plant'),
  is_active: z.boolean(),
})

export type CreateCompanyAdminFormValues = z.infer<typeof createCompanyAdminSchema>
export type UpdateCompanyAdminFormValues = z.infer<typeof updateCompanyAdminSchema>
