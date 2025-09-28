import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Challenge = Database['public']['Tables']['challenges']['Row']
type ChallengeTask = Database['public']['Tables']['challenge_tasks']['Row']
type UserChallengeProgress = Database['public']['Tables']['user_challenge_progress']['Row']
type UserChallengeTaskProgress = Database['public']['Tables']['user_challenge_task_progress']['Row']

export interface ChallengeWithDetails extends Challenge {
  tasks: ChallengeTask[]
  userProgress?: UserChallengeProgress
  userTaskProgress?: UserChallengeTaskProgress[]
  daysLeft?: number
}

export const challengeService = {
  // Get all active challenges
  async getActiveChallenges(userId?: string): Promise<ChallengeWithDetails[]> {
    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        challenge_tasks (*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching challenges:', error)
      return []
    }

    const challenges: ChallengeWithDetails[] = data.map((challenge: any) => ({
      ...challenge,
      tasks: challenge.challenge_tasks.sort((a: any, b: any) => a.order_number - b.order_number),
      daysLeft: this.calculateDaysLeft(challenge.end_date),
    }))

    // If userId provided, get user progress
    if (userId) {
      return this.enrichChallengesWithUserProgress(challenges, userId)
    }

    return challenges
  },

  // Get single challenge with details
  async getChallenge(challengeId: string, userId?: string): Promise<ChallengeWithDetails | null> {
    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        challenge_tasks (*)
      `)
      .eq('id', challengeId)
      .single()

    if (error) {
      console.error('Error fetching challenge:', error)
      return null
    }

    const challenge: ChallengeWithDetails = {
      ...data,
      tasks: data.challenge_tasks.sort((a: any, b: any) => a.order_number - b.order_number),
      daysLeft: this.calculateDaysLeft(data.end_date),
    }

    // If userId provided, get user progress
    if (userId) {
      const [enrichedChallenge] = await this.enrichChallengesWithUserProgress([challenge], userId)
      return enrichedChallenge
    }

    return challenge
  },

  // Get user's challenge progress
  async getUserChallengeProgress(userId: string, challengeId: string): Promise<UserChallengeProgress | null> {
    const { data, error } = await supabase
      .from('user_challenge_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
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

    const { error } = await supabase
      .from('user_challenge_progress')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        completed_tasks: 0,
        is_completed: false,
      })

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
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .eq('task_id', taskId)
      .single()

    if (existingTaskProgress?.is_completed) {
      return true // Already completed
    }

    // Mark task as completed
    const { error: taskError } = await supabase
      .from('user_challenge_task_progress')
      .upsert({
        user_id: userId,
        challenge_id: challengeId,
        task_id: taskId,
        is_completed: true,
        completed_at: new Date().toISOString(),
      })

    if (taskError) {
      console.error('Error completing task:', taskError)
      return false
    }

    // Update challenge progress
    const { data: completedTasks } = await supabase
      .from('user_challenge_task_progress')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .eq('is_completed', true)

    const completedCount = completedTasks?.length || 0

    // Get total tasks for this challenge
    const { data: challenge } = await supabase
      .from('challenges')
      .select('total_tasks, reward_points')
      .eq('id', challengeId)
      .single()

    if (!challenge) return false

    const isCompleted = completedCount >= challenge.total_tasks

    // Update user challenge progress
    const { error: progressError } = await supabase
      .from('user_challenge_progress')
      .update({
        completed_tasks: completedCount,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)

    if (progressError) {
      console.error('Error updating challenge progress:', progressError)
      return false
    }

    // If challenge is completed, award points (handled by userService)
    if (isCompleted) {
      // This would typically trigger a badge check and point award
      console.log(`Challenge completed! User ${userId} earned ${challenge.reward_points} points`)
    }

    return true
  },

  // Uncomplete a challenge task
  async uncompleteTask(userId: string, challengeId: string, taskId: string): Promise<boolean> {
    // Mark task as not completed
    const { error: taskError } = await supabase
      .from('user_challenge_task_progress')
      .update({
        is_completed: false,
        completed_at: null,
      })
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .eq('task_id', taskId)

    if (taskError) {
      console.error('Error uncompleting task:', taskError)
      return false
    }

    // Update challenge progress
    const { data: completedTasks } = await supabase
      .from('user_challenge_task_progress')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .eq('is_completed', true)

    const completedCount = completedTasks?.length || 0

    // Update user challenge progress
    const { error: progressError } = await supabase
      .from('user_challenge_progress')
      .update({
        completed_tasks: completedCount,
        is_completed: false,
        completed_at: null,
      })
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
      .select(`
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

    return data.map((progress: any) => ({
      ...progress.challenges,
      tasks: progress.challenges.challenge_tasks.sort((a: any, b: any) => a.order_number - b.order_number),
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
      daysLeft: this.calculateDaysLeft(progress.challenges.end_date),
    }))
  },

  // Get user's completed challenges
  async getUserCompletedChallenges(userId: string): Promise<ChallengeWithDetails[]> {
    const { data, error } = await supabase
      .from('user_challenge_progress')
      .select(`
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

    return data.map((progress: any) => ({
      ...progress.challenges,
      tasks: progress.challenges.challenge_tasks.sort((a: any, b: any) => a.order_number - b.order_number),
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
    }))
  },

  // Helper method to enrich challenges with user progress
  async enrichChallengesWithUserProgress(challenges: ChallengeWithDetails[], userId: string): Promise<ChallengeWithDetails[]> {
    const challengeIds = challenges.map(c => c.id)

    // Get user progress for all challenges
    const { data: userProgress } = await supabase
      .from('user_challenge_progress')
      .select('*')
      .eq('user_id', userId)
      .in('challenge_id', challengeIds)

    // Get user task progress for all challenges
    const { data: userTaskProgress } = await supabase
      .from('user_challenge_task_progress')
      .select('*')
      .eq('user_id', userId)
      .in('challenge_id', challengeIds)

    const progressMap = new Map(userProgress?.map(p => [p.challenge_id, p]) || [])
    const taskProgressMap = new Map<string, UserChallengeTaskProgress[]>()

    // Group task progress by challenge
    userTaskProgress?.forEach(tp => {
      const existing = taskProgressMap.get(tp.challenge_id) || []
      existing.push(tp)
      taskProgressMap.set(tp.challenge_id, existing)
    })

    return challenges.map(challenge => ({
      ...challenge,
      userProgress: progressMap.get(challenge.id),
      userTaskProgress: taskProgressMap.get(challenge.id) || [],
    }))
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