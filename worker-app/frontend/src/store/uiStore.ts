import { create } from 'zustand'

interface UiState {
  sidebarCollapsed: boolean
  commandOpen: boolean
  notificationOpen: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  setCommandOpen: (v: boolean) => void
  setNotificationOpen: (v: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  commandOpen: false,
  notificationOpen: false,
  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  setNotificationOpen: (notificationOpen) => set({ notificationOpen }),
}))
