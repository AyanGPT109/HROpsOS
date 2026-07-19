import { z } from 'zod'

export const createAdminSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name is required'),
  email: z.string().trim().email('Enter a valid email'),
  phone: z.string().trim().min(8, 'Phone number is required').optional().or(z.literal('')),
  temporary_password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Include an uppercase letter')
    .regex(/[0-9]/, 'Include a number'),
  company_id: z.string().uuid('Select a company'),
  plant_ids: z.array(z.string().uuid()).min(1, 'Select at least one plant'),
  force_password_change: z.boolean().default(true),
  is_active: z.boolean().default(true),
})

export const updateAdminSchema = z.object({
  full_name: z.string().trim().min(2).optional(),
  phone: z.string().trim().optional().nullable(),
  company_id: z.string().uuid().optional(),
  plant_ids: z.array(z.string().uuid()).min(1).optional(),
  is_active: z.boolean().optional(),
})

export type CreateAdminInput = z.infer<typeof createAdminSchema>
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>
