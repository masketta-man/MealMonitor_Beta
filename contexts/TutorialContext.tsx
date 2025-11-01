import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { settingsService } from '@/services/settingsService'
import { TutorialStep } from '@/components/TutorialOverlay'

interface TutorialContextType {
  isTutorialActive: boolean
  currentSteps: TutorialStep[]
  startTutorial: (steps: TutorialStep[]) => void
  completeTutorial: () => void
  skipTutorial: () => void
  shouldShowTutorial: boolean
  checkTutorialStatus: () => Promise<void>
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined)

export function TutorialProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [isTutorialActive, setIsTutorialActive] = useState(false)
  const [currentSteps, setCurrentSteps] = useState<TutorialStep[]>([])
  const [shouldShowTutorial, setShouldShowTutorial] = useState(false)

  const checkTutorialStatus = async () => {
    if (!user) return

    try {
      const settings = await settingsService.getOrCreateSettings(user.id)

      if (settings && !settings.tutorial_completed) {
        setShouldShowTutorial(true)
      } else {
        setShouldShowTutorial(false)
      }
    } catch (error) {
      console.error('Error checking tutorial status:', error)
      setShouldShowTutorial(false)
    }
  }

  useEffect(() => {
    checkTutorialStatus()
  }, [user])

  const startTutorial = (steps: TutorialStep[]) => {
    setCurrentSteps(steps)
    setIsTutorialActive(true)
  }

  const completeTutorial = async () => {
    setIsTutorialActive(false)
    setCurrentSteps([])
    setShouldShowTutorial(false)

    if (user) {
      try {
        await settingsService.updateUserSettings(user.id, {
          tutorial_completed: true,
        })
        console.log('Tutorial marked as completed')
      } catch (error) {
        console.error('Error marking tutorial as completed:', error)
      }
    }
  }

  const skipTutorial = async () => {
    setIsTutorialActive(false)
    setCurrentSteps([])
    setShouldShowTutorial(false)

    if (user) {
      try {
        await settingsService.updateUserSettings(user.id, {
          tutorial_completed: true,
        })
        console.log('Tutorial skipped and marked as completed')
      } catch (error) {
        console.error('Error marking tutorial as skipped:', error)
      }
    }
  }

  return (
    <TutorialContext.Provider
      value={{
        isTutorialActive,
        currentSteps,
        startTutorial,
        completeTutorial,
        skipTutorial,
        shouldShowTutorial,
        checkTutorialStatus,
      }}
    >
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  const context = useContext(TutorialContext)
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider')
  }
  return context
}
