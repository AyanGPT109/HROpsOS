import { z } from 'zod'

export const createWorkerSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name is required'),
  email: z.string().trim().email('Enter a valid email'),
  phone: z.string().trim().min(8, 'Phone number is required').optional().or(z.literal('')),
  temporary_password: z.string().min(8, 'Password must be at least 8 characters'),
  employee_id: z.string().trim().min(1, 'Employee ID is required'),
  plant_id: z.string().uuid('Select a site'),
  department: z.string().trim().optional().or(z.literal('')),
  designation: z.string().trim().optional().or(z.literal('')),
})

export type CreateWorkerInput = z.infer<typeof createWorkerSchema>

export const updateWorkerSchema = z.object({
  full_name: z.string().trim().min(2).optional(),
  phone: z.string().trim().optional().nullable(),
  employee_id: z.string().trim().min(1).optional(),
  plant_id: z.string().uuid().optional(),
  department: z.string().trim().optional().nullable(),
  designation: z.string().trim().optional().nullable(),
  is_active: z.boolean().optional(),
})

export type UpdateWorkerInput = z.infer<typeof updateWorkerSchema>
