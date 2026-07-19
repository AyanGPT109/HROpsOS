import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { plantService, type ListPlantsParams } from '../services/plantService'
import type { CreateGeofenceInput, CreatePlantInput, UpdatePlantInput } from '@/types'
import { ApiError } from '@/lib/apiClient'
import { adminService } from '@/services/adminService'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

function errorMessage(err: unknown) {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export function useCompaniesForPlants() {
  return useQuery({
    queryKey: ['sa', 'companies'],
    queryFn: () => adminService.listCompanies({ pageSize: 200 }),
    enabled: isSupabaseConfigured,
  })
}

export function usePlants(params: ListPlantsParams) {
  return useQuery({
    queryKey: ['sa', 'plants-list', params],
    queryFn: () => plantService.list(params),
    enabled: isSupabaseConfigured,
  })
}

export function usePlant(plantId?: string | null) {
  return useQuery({
    queryKey: ['sa', 'plant', plantId],
    queryFn: () => plantService.getById(plantId!),
    enabled: Boolean(plantId) && isSupabaseConfigured,
  })
}

export function useCreatePlant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePlantInput) => plantService.create(input),
    onSuccess: () => {
      toast.success('Plant created')
      void qc.invalidateQueries({ queryKey: ['sa', 'plants-list'] })
      void qc.invalidateQueries({ queryKey: ['sa', 'plants'] })
    },
    onError: (err) => toast.error(errorMessage(err)),
  })
}

export function useUpdatePlant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePlantInput }) =>
      plantService.update(id, input),
    onSuccess: () => {
      toast.success('Plant updated')
      void qc.invalidateQueries({ queryKey: ['sa', 'plants-list'] })
      void qc.invalidateQueries({ queryKey: ['sa', 'plant'] })
      void qc.invalidateQueries({ queryKey: ['sa', 'plants'] })
    },
    onError: (err) => toast.error(errorMessage(err)),
  })
}

export function useSoftDeletePlant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => plantService.softDelete(id),
    onSuccess: () => {
      toast.success('Plant deactivated')
      void qc.invalidateQueries({ queryKey: ['sa', 'plants-list'] })
    },
    onError: (err) => toast.error(errorMessage(err)),
  })
}

export function useRestorePlant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => plantService.restore(id),
    onSuccess: () => {
      toast.success('Plant restored')
      void qc.invalidateQueries({ queryKey: ['sa', 'plants-list'] })
    },
    onError: (err) => toast.error(errorMessage(err)),
  })
}

export function useCreateGeofence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateGeofenceInput) => plantService.createGeofence(input),
    onSuccess: () => {
      toast.success('Geo fence saved')
      void qc.invalidateQueries({ queryKey: ['sa', 'plants-list'] })
      void qc.invalidateQueries({ queryKey: ['sa', 'plant'] })
    },
    onError: (err) => toast.error(errorMessage(err)),
  })
}
