import { z } from 'zod'

export const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'America/New_York', label: 'America/New_York' },
]

export const createPlantSchema = z.object({
  company_id: z.string().uuid('Select a company'),
  name: z.string().trim().min(2, 'Plant name is required'),
  code: z.string().trim().min(2, 'Plant code is required'),
  address: z.string().trim().optional(),
  latitude: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  timezone: z.string().min(1, 'Timezone is required'),
  is_active: z.boolean(),
})

export const updatePlantSchema = createPlantSchema

export const createGeofenceSchema = z.object({
  plant_id: z.string().uuid(),
  name: z.string().trim().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius_meters: z
    .number()
    .positive('Radius must be greater than 0')
    .max(10000, 'Radius cannot exceed 10,000m'),
  is_active: z.boolean(),
})

export type CreatePlantFormValues = z.infer<typeof createPlantSchema>
export type CreateGeofenceFormValues = z.infer<typeof createGeofenceSchema>
