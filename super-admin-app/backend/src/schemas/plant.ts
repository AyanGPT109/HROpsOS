import { z } from 'zod'

export const createPlantSchema = z.object({
  company_id: z.string().uuid('Select a company'),
  name: z.string().trim().min(2, 'Plant name is required'),
  code: z.string().trim().min(2, 'Plant code is required'),
  address: z.string().trim().optional().or(z.literal('')),
  latitude: z.coerce.number().min(-90, 'Latitude must be ≥ -90').max(90, 'Latitude must be ≤ 90'),
  longitude: z.coerce
    .number()
    .min(-180, 'Longitude must be ≥ -180')
    .max(180, 'Longitude must be ≤ 180'),
  timezone: z.string().trim().min(1, 'Timezone is required'),
  is_active: z.boolean().default(true),
})

export const updatePlantSchema = createPlantSchema.partial().extend({
  company_id: z.string().uuid().optional(),
  name: z.string().trim().min(2).optional(),
  code: z.string().trim().min(2).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  timezone: z.string().trim().min(1).optional(),
  is_active: z.boolean().optional(),
})

export const createGeofenceSchema = z.object({
  plant_id: z.string().uuid('Plant is required'),
  name: z.string().trim().optional().or(z.literal('')),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radius_meters: z.coerce.number().positive().max(10000),
  is_active: z.boolean().default(true),
})

export type CreatePlantInput = z.infer<typeof createPlantSchema>
export type UpdatePlantInput = z.infer<typeof updatePlantSchema>
export type CreateGeofenceInput = z.infer<typeof createGeofenceSchema>
