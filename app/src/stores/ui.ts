import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  notifications: NotificationItem[]
  modalStack: ModalItem[]
  loadingStates: Record<string, boolean>
}

interface ModalItem {
  id: string
  type: string
  props?: any
}

interface NotificationItem {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

interface UIActions {
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  addNotification: (notification: Omit<NotificationItem, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  openModal: (modal: ModalItem) => void
  closeModal: (id: string) => void
  closeAllModals: () => void
  setLoading: (key: string, loading: boolean) => void
}

type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>((set, get) => ({
  // Initial state
  sidebarOpen: true,
  theme: 'system',
  notifications: [],
  modalStack: [],
  loadingStates: {},

  // Actions
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme: 'light' | 'dark' | 'system') => set({ theme }),

  addNotification: (notification) => {
    const id = Date.now().toString()
    const newNotification: NotificationItem = {
      id,
      ...notification,
    }

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }))

    // Auto remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        get().removeNotification(id)
      }, notification.duration || 5000)
    }
  },

  removeNotification: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),

  openModal: (modal: ModalItem) =>
    set((state) => ({
      modalStack: [...state.modalStack, modal],
    })),

  closeModal: (id: string) =>
    set((state) => ({
      modalStack: state.modalStack.filter((m) => m.id !== id),
    })),

  closeAllModals: () => set({ modalStack: [] }),

  setLoading: (key: string, loading: boolean) =>
    set((state) => ({
      loadingStates: {
        ...state.loadingStates,
        [key]: loading,
      },
    })),
}))