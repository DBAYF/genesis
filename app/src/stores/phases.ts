import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Phase,
  Module,
  PHASES,
  MODULES,
  getPhaseById,
  getModulesForPhase,
  getPhaseProgress,
  canAccessPhase,
  canAccessModule,
} from '@/types/phases'

interface PhaseExecutionState {
  companyId: string | null
  currentPhaseId: string | null
  completedPhases: string[]
  completedModules: string[]
  moduleData: Record<string, any>
  phaseProgress: Record<string, number>
  isLoading: boolean
  error: string | null
}

interface PhaseExecutionActions {
  initializeForCompany: (companyId: string) => void
  setCurrentPhase: (phaseId: string) => void
  startPhase: (phaseId: string) => void
  completePhase: (phaseId: string) => void
  startModule: (moduleId: string) => void
  completeModule: (moduleId: string, data?: any) => void
  updateModuleData: (moduleId: string, data: any) => void
  getAvailablePhases: () => Phase[]
  getAvailableModules: (phaseId: string) => Module[]
  getPhaseStatus: (phaseId: string) => Phase['status']
  getModuleStatus: (moduleId: string) => Module['status']
  resetProgress: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

type PhaseStore = PhaseExecutionState & PhaseExecutionActions

export const usePhaseStore = create<PhaseStore>()(
  persist(
    (set, get) => ({
      // Initial state
      companyId: null,
      currentPhaseId: null,
      completedPhases: [],
      completedModules: [],
      moduleData: {},
      phaseProgress: {},
      isLoading: false,
      error: null,

      // Actions
      initializeForCompany: (companyId: string) => {
        set({
          companyId,
          currentPhaseId: 'discovery', // Always start with discovery
          completedPhases: [],
          completedModules: [],
          moduleData: {},
          phaseProgress: {},
        })
      },

      setCurrentPhase: (phaseId: string) => {
        set({ currentPhaseId: phaseId })
      },

      startPhase: (phaseId: string) => {
        const phase = getPhaseById(phaseId)
        if (!phase) return

        set((state) => ({
          currentPhaseId: phaseId,
          phaseProgress: {
            ...state.phaseProgress,
            [phaseId]: 0,
          },
        }))
      },

      completePhase: (phaseId: string) => {
        set((state) => ({
          completedPhases: [...state.completedPhases, phaseId],
          phaseProgress: {
            ...state.phaseProgress,
            [phaseId]: 100,
          },
        }))
      },

      startModule: (moduleId: string) => {
        // Implementation for starting a module
        console.log('Starting module:', moduleId)
      },

      completeModule: (moduleId: string, data?: any) => {
        const state = get()
        const module = MODULES[moduleId]
        if (!module) return

        const newCompletedModules = [...state.completedModules, moduleId]
        const newModuleData = { ...state.moduleData }

        if (data) {
          newModuleData[moduleId] = data
        }

        // Update phase progress
        const phaseModules = getModulesForPhase(module.phaseId)
        const completedPhaseModules = phaseModules.filter(m =>
          newCompletedModules.includes(m.id)
        ).length
        const phaseProgress = Math.round((completedPhaseModules / phaseModules.length) * 100)

        // Check if phase is complete
        const phaseCompleted = phaseProgress === 100
        const newCompletedPhases = phaseCompleted && !state.completedPhases.includes(module.phaseId)
          ? [...state.completedPhases, module.phaseId]
          : state.completedPhases

        set({
          completedModules: newCompletedModules,
          moduleData: newModuleData,
          phaseProgress: {
            ...state.phaseProgress,
            [module.phaseId]: phaseProgress,
          },
          completedPhases: newCompletedPhases,
        })
      },

      updateModuleData: (moduleId: string, data: any) => {
        set((state) => ({
          moduleData: {
            ...state.moduleData,
            [moduleId]: { ...state.moduleData[moduleId], ...data },
          },
        }))
      },

      getAvailablePhases: () => {
        const state = get()
        return Object.values(PHASES).filter(phase =>
          canAccessPhase(phase.id, state.completedPhases)
        )
      },

      getAvailableModules: (phaseId: string) => {
        const state = get()
        return getModulesForPhase(phaseId).filter(module =>
          canAccessModule(module.id, state.completedModules)
        )
      },

      getPhaseStatus: (phaseId: string) => {
        const state = get()

        if (state.completedPhases.includes(phaseId)) {
          return 'completed'
        }

        if (state.currentPhaseId === phaseId) {
          return 'in_progress'
        }

        if (!canAccessPhase(phaseId, state.completedPhases)) {
          return 'blocked'
        }

        return 'not_started'
      },

      getModuleStatus: (moduleId: string) => {
        const state = get()

        if (state.completedModules.includes(moduleId)) {
          return 'completed'
        }

        if (!canAccessModule(moduleId, state.completedModules)) {
          return 'locked'
        }

        return 'available'
      },

      resetProgress: () => {
        set({
          currentPhaseId: 'discovery',
          completedPhases: [],
          completedModules: [],
          moduleData: {},
          phaseProgress: {},
        })
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'genesis-phase-execution',
      partialize: (state) => ({
        companyId: state.companyId,
        currentPhaseId: state.currentPhaseId,
        completedPhases: state.completedPhases,
        completedModules: state.completedModules,
        moduleData: state.moduleData,
        phaseProgress: state.phaseProgress,
      }),
    }
  )
)