import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { userService } from './userService'

// Define types before using them
type Challenge = Database['public']['Tables']['challenges']['Row']
type ChallengeInsert = Database['public']['Tables']['challenges']['Insert']
type ChallengeUpdate = Database['public']['Tables']['challenges']['Update']
type ChallengeTask = Database['public']['Tables']['challenge_tasks']['Row']
type ChallengeTaskInsert = Database['public']['Tables']['challenge_tasks']['Insert']
type ChallengeTaskUpdate = Database['public']['Tables']['challenge_tasks']['Update']
type UserChallengeProgress = Database['public']['Tables']['user_challenge_progress']['Row']
type UserChallengeProgressInsert = Database['public']['Tables']['user_challenge_progress']['Insert']
type UserChallengeProgressUpdate = Database['public']['Tables']['user_challenge_progress']['Update']
type UserChallengeTaskProgress = Database['public']['Tables']['user_challenge_task_progress']['Row']
type UserChallengeTaskProgressInsert = Database['public']['Tables']['user_challenge_task_progress']['Insert']
type UserChallengeTaskProgressUpdate = Database['public']['Tables']['user_challenge_task_progress']['Update']

type ChallengeRowWithTasks = Challenge & { challenge_tasks: ChallengeTask[] | null }
type UserChallengeProgressWithChallenge = UserChallengeProgress & {
  challenges: ChallengeRowWithTasks
}

export interface ChallengeWithDetails extends Omit<Challenge, 'challenge_tasks'> {
  challenge_tasks: ChallengeTask[]
  tasks: ChallengeTask[]
  userProgress?: UserChallengeProgress
  userTaskProgress?: UserChallengeTaskProgress[]
  daysLeft?: number
}

// Helper function to enrich challenges with user progress
const enrichChallengesWithUserProgress = async (challenges: ChallengeWithDetails[], userId: string): Promise<ChallengeWithDetails[]> => {
  const challengeIds = challenges.map((c) => c.id)

  if (challengeIds.length === 0) {
    return challenges
  }

  // Get user progress for all challenges
  const { data: userProgress } = await supabase
    .from('user_challenge_progress')
    .select<string, UserChallengeProgress>('*')
    .eq('user_id', userId)
    .in('challenge_id', challengeIds)

  // Get user task progress for all challenges
  const { data: userTaskProgress } = await supabase
    .from('user_challenge_task_progress')
    .select<string, UserChallengeTaskProgress>('*')
    .eq('user_id', userId)
    .in('challenge_id', challengeIds)

  const progressMap = new Map<string, UserChallengeProgress>()
  const taskProgressMap = new Map<string, UserChallengeTaskProgress[]>()

  // Populate progress map
  if (userProgress) {
    userProgress.forEach((progress) => {
      progressMap.set(progress.challenge_id, progress)
    })
  }

  // Group task progress by challenge
  if (userTaskProgress) {
    userTaskProgress.forEach((tp: UserChallengeTaskProgress) => {
      const existing = taskProgressMap.get(tp.challenge_id) || []
      existing.push(tp)
      taskProgressMap.set(tp.challenge_id, existing)
    })
  }

  return challenges.map((challenge) => ({
    ...challenge,
    userProgress: progressMap.get(challenge.id),
    userTaskProgress: taskProgressMap.get(challenge.id) || [],
  }))
}

export const challengeService = {
  // Get all active challenges
  async getActiveChallenges(userId?: string): Promise<ChallengeWithDetails[]> {
    const { data, error } = await supabase
      .from('challenges')
      .select<string, ChallengeRowWithTasks>(`
        *,
        challenge_tasks (*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching challenges:', error)
      return []
    }

    const challenges: ChallengeWithDetails[] = (data ?? []).map((challenge) => {
      const sortedTasks = [...(challenge.challenge_tasks ?? [])].sort(
        (a, b) => (a?.order_number ?? 0) - (b?.order_number ?? 0)
      )

      return {
        ...challenge,
        challenge_tasks: challenge.challenge_tasks ?? [],
        tasks: sortedTasks,
        daysLeft: this.calculateDaysLeft(challenge.end_date),
      }
    })

    // If userId provided, get user progress
    if (userId) {
      return enrichChallengesWithUserProgress(challenges, userId)
    }

    return challenges
  },

  // Get single challenge with details
  async getChallenge(challengeId: string, userId?: string): Promise<ChallengeWithDetails | null> {
    const { data, error } = await supabase
      .from('challenges')
      .select<string, ChallengeRowWithTasks>(`
        *,
        challenge_tasks (*)
      `)
      .eq('id', challengeId)
      .single()

    if (error || !data) {
      console.error('Error fetching challenge:', error)
      return null
    }

    const sortedTasks = [...(data.challenge_tasks ?? [])].sort(
      (a, b) => (a?.order_number ?? 0) - (b?.order_number ?? 0)
    )

    const challenge: ChallengeWithDetails = {
      ...data,
      challenge_tasks: data.challenge_tasks ?? [],
      tasks: sortedTasks,
      daysLeft: this.calculateDaysLeft(data.end_date),
    }

    // If userId provided, get user progress
    if (userId) {
      const enrichedChallenges = await enrichChallengesWithUserProgress([challenge], userId)
      return enrichedChallenges[0]
    }

    return challenge
  },

  // Get user's challenge progress
  async getUserChallengeProgress(userId: string, challengeId: string): Promise<UserChallengeProgress | null> {
    const { data, error } = await supabase
      .from('user_challenge_progress')
      .select<string, UserChallengeProgress>('*')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching user challenge progress:', error)
      return null
    }

    return data
  },

  // Start a challenge for user
  async startChallenge(userId: string, challengeId: string): Promise<boolean> {
    // Check if user already started this challenge
    const existing = await this.getUserChallengeProgress(userId, challengeId)
    if (existing) {
      return true // Already started
    }

    const progressData: UserChallengeProgressInsert = {
      user_id: userId,
      challenge_id: challengeId,
      completed_tasks: 0,
      is_completed: false,
      completed_at: null,
    }

    const { error } = await supabase
      .from('user_challenge_progress')
      .insert(progressData)
      .select()
      .single()

    if (error) {
      console.error('Error starting challenge:', error)
      return false
    }

    return true
  },

  // Complete a challenge task
  async completeTask(userId: string, challengeId: string, taskId: string): Promise<boolean> {
    // First, ensure user has started the challenge
    await this.startChallenge(userId, challengeId)

    // Check if task is already completed
    const { data: existingTaskProgress } = await supabase
      .from('user_challenge_task_progress')
      .select<string, UserChallengeTaskProgress>('*')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .eq('task_id', taskId)
      .maybeSingle()

    if (existingTaskProgress?.is_completed) {
      return true // Already completed
    }

    // Track current challenge completion state so we only award points once
    const currentProgress = await this.getUserChallengeProgress(userId, challengeId)
    const wasCompleted = currentProgress?.is_completed ?? false

    // Mark task as completed
    const upsertTask: UserChallengeTaskProgressInsert = {
      user_id: userId,
      challenge_id: challengeId,
      task_id: taskId,
      is_completed: true,
      completed_at: new Date().toISOString(),
    }

    const { error: taskError } = await supabase
      .from('user_challenge_task_progress')
      .upsert(upsertTask)

    if (taskError) {
      console.error('Error completing task:', taskError)
      return false
    }

    // Update challenge progress
    const { count: completedCount, error: completedCountError } = await supabase
      .from('user_challenge_task_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .eq('is_completed', true)

    if (completedCountError) {
      console.error('Error counting completed challenge tasks:', completedCountError)
      return false
    }

    // Get total tasks for this challenge
    const { data: challenge } = await supabase
      .from('challenges')
      .select<string, Pick<Challenge, 'total_tasks' | 'reward_points'>>('total_tasks, reward_points')
      .eq('id', challengeId)
      .single()

    if (!challenge) return false

    const totalTasks = challenge.total_tasks ?? 0
    const isCompleted = totalTasks > 0 ? (completedCount ?? 0) >= totalTasks : false

    // Update user challenge progress
    const progressUpdate: UserChallengeProgressUpdate = {
      completed_tasks: completedCount ?? 0,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    }

    const { error: progressError } = await supabase
      .from('user_challenge_progress')
      .update(progressUpdate)
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)

    if (progressError) {
      console.error('Error updating challenge progress:', progressError)
      return false
    }

    // If challenge is completed, award points (handled by userService)
    if (isCompleted && !wasCompleted) {
      const rewardPoints = challenge.reward_points ?? 0

      if (rewardPoints > 0) {
        const updatedProfile = await userService.updateExperience(userId, rewardPoints)

        if (!updatedProfile) {
          console.error('Error awarding challenge reward points to user profile')
        }
      }

      console.log(`Challenge completed! User ${userId} earned ${rewardPoints} points`)
    }

    return true
  },

  // Uncomplete a challenge task
  async uncompleteTask(userId: string, challengeId: string, taskId: string): Promise<boolean> {
    // Mark task as not completed
    const taskUpdate: UserChallengeTaskProgressUpdate = {
      is_completed: false,
      completed_at: null,
    }

    const { error: taskError } = await supabase
      .from('user_challenge_task_progress')
      .update(taskUpdate)
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .eq('task_id', taskId)

    if (taskError) {
      console.error('Error uncompleting task:', taskError)
      return false
    }

    // Update challenge progress
    const { count: completedCount, error: completedCountError } = await supabase
      .from('user_challenge_task_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .eq('is_completed', true)

    if (completedCountError) {
      console.error('Error counting completed challenge tasks:', completedCountError)
      return false
    }

    // Update user challenge progress
    const progressUpdate: UserChallengeProgressUpdate = {
      completed_tasks: completedCount ?? 0,
      is_completed: false,
      completed_at: null,
    }

    const { error: progressError } = await supabase
      .from('user_challenge_progress')
      .update(progressUpdate)
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)

    if (progressError) {
      console.error('Error updating challenge progress:', progressError)
      return false
    }

    return true
  },

  // Get user's active challenges
  async getUserActiveChallenges(userId: string): Promise<ChallengeWithDetails[]> {
    const { data, error } = await supabase
      .from('user_challenge_progress')
      .select<string, UserChallengeProgressWithChallenge>(`
        *,
        challenges (
          *,
          challenge_tasks (*)
        )
      `)
      .eq('user_id', userId)
      .eq('is_completed', false)

    if (error) {
      console.error('Error fetching user active challenges:', error)
      return []
    }

    const progressEntries = (data ?? []).filter(
      (progress): progress is UserChallengeProgressWithChallenge => !!progress.challenges
    )

    return progressEntries.map((progress) => {
      const challenge = progress.challenges
      const sortedTasks = [...(challenge.challenge_tasks ?? [])].sort(
        (a, b) => (a?.order_number ?? 0) - (b?.order_number ?? 0)
      )

      return {
        ...challenge,
        challenge_tasks: challenge.challenge_tasks ?? [],
        tasks: sortedTasks,
        userProgress: {
          id: progress.id,
          user_id: progress.user_id,
          challenge_id: progress.challenge_id,
          completed_tasks: progress.completed_tasks,
          is_completed: progress.is_completed,
          completed_at: progress.completed_at,
          created_at: progress.created_at,
          updated_at: progress.updated_at,
        },
        daysLeft: this.calculateDaysLeft(challenge.end_date),
      }
    })
  },

  // Get user's completed challenges
  async getUserCompletedChallenges(userId: string): Promise<ChallengeWithDetails[]> {
    const { data, error } = await supabase
      .from('user_challenge_progress')
      .select<string, UserChallengeProgressWithChallenge>(`
        *,
        challenges (
          *,
          challenge_tasks (*)
        )
      `)
      .eq('user_id', userId)
      .eq('is_completed', true)
      .order('completed_at', { ascending: false })

    if (error) {
      console.error('Error fetching user completed challenges:', error)
      return []
    }

    const progressEntries = (data ?? []).filter(
      (progress): progress is UserChallengeProgressWithChallenge => !!progress.challenges
    )

    return progressEntries.map((progress) => {
      const challenge = progress.challenges
      const sortedTasks = [...(challenge.challenge_tasks ?? [])].sort(
        (a, b) => (a?.order_number ?? 0) - (b?.order_number ?? 0)
      )

      return {
        ...challenge,
        challenge_tasks: challenge.challenge_tasks ?? [],
        tasks: sortedTasks,
        userProgress: {
          id: progress.id,
          user_id: progress.user_id,
          challenge_id: progress.challenge_id,
          completed_tasks: progress.completed_tasks,
          is_completed: progress.is_completed,
          completed_at: progress.completed_at,
          created_at: progress.created_at,
          updated_at: progress.updated_at,
        },
        daysLeft: 0, // Completed challenges have 0 days left
      }
    })
  },

  // Helper method to calculate days left
  calculateDaysLeft(endDate: string): number {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  },
}