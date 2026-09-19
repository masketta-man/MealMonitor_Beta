import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"
import { badgeService } from "./badgeService"
import { streakService } from "./streakService"
import { userService } from "./userService"

// Define types before using them
type Challenge = Database["public"]["Tables"]["challenges"]["Row"]
type ChallengeInsert = Database["public"]["Tables"]["challenges"]["Insert"]
type ChallengeUpdate = Database["public"]["Tables"]["challenges"]["Update"]
type ChallengeTask = Database["public"]["Tables"]["challenge_tasks"]["Row"]
type ChallengeTaskInsert =
  Database["public"]["Tables"]["challenge_tasks"]["Insert"]
type ChallengeTaskUpdate =
  Database["public"]["Tables"]["challenge_tasks"]["Update"]
type UserChallengeProgress =
  Database["public"]["Tables"]["user_challenge_progress"]["Row"] & {
    activated_at?: string | null
    quest_end_date?: string | null
    is_active?: boolean | null
  }
type UserChallengeProgressInsert =
  Database["public"]["Tables"]["user_challenge_progress"]["Insert"] & {
    activated_at?: string | null
    quest_end_date?: string | null
    is_active?: boolean | null
  }
type UserChallengeProgressUpdate =
  Database["public"]["Tables"]["user_challenge_progress"]["Update"] & {
    activated_at?: string | null
    quest_end_date?: string | null
    is_active?: boolean | null
  }
type UserChallengeTaskProgress =
  Database["public"]["Tables"]["user_challenge_task_progress"]["Row"]
type UserChallengeTaskProgressInsert =
  Database["public"]["Tables"]["user_challenge_task_progress"]["Insert"]
type UserChallengeTaskProgressUpdate =
  Database["public"]["Tables"]["user_challenge_task_progress"]["Update"]

type ChallengeRowWithTasks = Challenge & {
  challenge_tasks: ChallengeTask[] | null
}
type UserChallengeProgressWithChallenge = UserChallengeProgress & {
  challenges: ChallengeRowWithTasks
}

export interface ChallengeWithDetails extends Omit<
  Challenge,
  "challenge_tasks"
> {
  challenge_tasks: ChallengeTask[]
  tasks: ChallengeTask[]
  userProgress?: UserChallengeProgress
  userTaskProgress?: UserChallengeTaskProgress[]
  daysLeft?: number
  questDaysLeft?: number
  isActivated?: boolean
  isLocked?: boolean
  prerequisiteMet?: boolean
  chainInfo?: {
    chainName: string
    chainOrder: number
    totalInChain: number
    prerequisiteTitle?: string
  }
}

/**
 * Whole days between now and `endDate`, floored at zero.
 *
 * Defined at module scope rather than only as a method on `challengeService`,
 * because the enrich helpers below run outside that object and called it bare —
 * which threw "calculateDaysLeft is not defined" and surfaced in the UI as
 * "Failed to load challenges".
 */
const calculateDaysLeft = (endDate: string): number => {
  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

/**
 * Whether a quest task should advance automatically when the user cooks any
 * recipe, versus staying a manual tap-to-confirm.
 *
 * Auto-advance covers tasks whose only requirement is "cook a meal" with no
 * constraint the app can verify from a completion: the streak quests ("Cook on
 * Day 3") and generic single-meal tasks ("Prepare at least one meal"). Tasks that
 * name a cuisine, a calorie ceiling, a specific dish, or a non-cooking action
 * (tracking water) can't be confirmed from a bare completion yet, so they remain
 * manual. Kept deliberately conservative: it is better to leave a task manual
 * than to auto-complete one the user didn't actually satisfy.
 *
 * Exported so the quest detail screen can render auto tasks as read-only.
 */
export const isAutoAdvanceTask = (taskTitle: string): boolean => {
  const title = taskTitle.trim().toLowerCase()

  // Streak quests: "Cook on Day 1" ... "Cook on Day 7".
  if (/^cook on day \d+$/.test(title)) return true

  // Generic "cook/prepare/make a meal" with nothing further to verify.
  const genericMealTask =
    /^(cook|prepare|make)\b/.test(title) &&
    /\b(meal|dish|recipe|something)\b/.test(title)

  // Exclude anything that names a constraint we can't check from a completion.
  const hasUnverifiableConstraint =
    /\b(chinese|japanese|thai|filipino|korean|italian|mexican|indian|cuisine|adobo|sinigang|pancit|kare-kare|lumpia|bistek|lechon|halo-halo|breakfast|lunch|dinner|dessert|appetizer|salad|calorie|cal\b|protein|fiber|whole grain|fruit|veggie|vegetable|track|water)\b/.test(
      title,
    )

  return genericMealTask && !hasUnverifiableConstraint
}

// Helper function to enrich challenges with user progress
const enrichChallengesWithUserProgress = async (
  challenges: ChallengeWithDetails[],
  userId: string,
): Promise<ChallengeWithDetails[]> => {
  const challengeIds = challenges.map((c) => c.id)

  if (challengeIds.length === 0) {
    return challenges
  }

  // Get user progress for all challenges
  const { data: userProgress } = await supabase
    .from("user_challenge_progress")
    .select<string, UserChallengeProgress>("*")
    .eq("user_id", userId)
    .in("challenge_id", challengeIds)

  // Get user task progress for all challenges
  const { data: userTaskProgress } = await supabase
    .from("user_challenge_task_progress")
    .select<string, UserChallengeTaskProgress>("*")
    .eq("user_id", userId)
    .in("challenge_id", challengeIds)

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
    isActivated: progressMap.get(challenge.id)?.is_active || false,
    questDaysLeft: progressMap.get(challenge.id)?.quest_end_date
      ? calculateDaysLeft(progressMap.get(challenge.id)!.quest_end_date!)
      : undefined,
  }))
}

export const challengeService = {
  // Exposed as a method because callers use this.calculateDaysLeft /
  // challengeService.calculateDaysLeft. The implementation lives at module scope so
  // the module-level helpers above can reach it too.
  calculateDaysLeft(endDate: string): number {
    return calculateDaysLeft(endDate)
  },

  /**
   * Check if a quest's prerequisites are met using the database function
   */
  async checkQuestPrerequisites(
    userId: string,
    challengeId: string,
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc("check_quest_prerequisites", {
        p_user_id: userId,
        p_challenge_id: challengeId,
      })

      if (error) {
        console.error("Error checking prerequisites:", error)
        return false
      }

      return data === true
    } catch (error) {
      console.error("Error in checkQuestPrerequisites:", error)
      return false
    }
  },

  /**
   * Get chain information for a quest
   */
  async getQuestChainInfo(
    challengeId: string,
  ): Promise<ChallengeWithDetails["chainInfo"] | null> {
    try {
      const { data: challenge } = await supabase
        .from("challenges")
        .select("chain_name, chain_order, prerequisite_challenge_id")
        .eq("id", challengeId)
        .single()

      if (!challenge || !challenge.chain_name) {
        return null
      }

      // Get total quests in chain
      const { count } = await supabase
        .from("challenges")
        .select("*", { count: "exact", head: true })
        .eq("chain_name", challenge.chain_name)

      // Get prerequisite title if exists
      let prerequisiteTitle: string | undefined
      if (challenge.prerequisite_challenge_id) {
        const { data: prereqChallenge } = await supabase
          .from("challenges")
          .select("title")
          .eq("id", challenge.prerequisite_challenge_id)
          .single()

        prerequisiteTitle = prereqChallenge?.title
      }

      return {
        chainName: challenge.chain_name,
        chainOrder: challenge.chain_order || 0,
        totalInChain: count || 1,
        prerequisiteTitle,
      }
    } catch (error) {
      console.error("Error getting quest chain info:", error)
      return null
    }
  },

  /**
   * Get all quests in a chain
   */
  async getQuestChain(
    chainName: string,
    userId?: string,
  ): Promise<ChallengeWithDetails[]> {
    const { data, error } = await supabase
      .from("challenges")
      .select<string, ChallengeRowWithTasks>(
        `
        *,
        challenge_tasks (*)
      `,
      )
      .eq("chain_name", chainName)
      .eq("is_active", true)
      .order("chain_order", { ascending: true })

    if (error) {
      console.error("Error fetching quest chain:", error)
      return []
    }

    const challenges: ChallengeWithDetails[] = (data ?? []).map((challenge) => {
      const sortedTasks = [...(challenge.challenge_tasks ?? [])].sort(
        (a, b) => (a?.order_number ?? 0) - (b?.order_number ?? 0),
      )

      return {
        ...challenge,
        challenge_tasks: challenge.challenge_tasks ?? [],
        tasks: sortedTasks,
        daysLeft: this.calculateDaysLeft(challenge.end_date),
      }
    })

    // Enrich with user progress if userId provided
    if (userId) {
      const enriched = await enrichChallengesWithUserProgress(
        challenges,
        userId,
      )

      // Check prerequisites for each quest
      const withPrereqs = await Promise.all(
        enriched.map(async (challenge) => {
          const prerequisiteMet = await this.checkQuestPrerequisites(
            userId,
            challenge.id,
          )
          const chainInfo = await this.getQuestChainInfo(challenge.id)

          return {
            ...challenge,
            prerequisiteMet,
            isLocked: !prerequisiteMet && !challenge.isActivated,
            chainInfo,
          }
        }),
      )

      return withPrereqs
    }

    return challenges
  },

  /**
   * Get all unique chain names
   */
  async getAllChainNames(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("challenges")
        .select("chain_name")
        .not("chain_name", "is", null)
        .eq("is_active", true)

      if (error) {
        console.error("Error fetching chain names:", error)
        return []
      }

      const uniqueChains = [
        ...new Set(data.map((item) => item.chain_name).filter(Boolean)),
      ] as string[]
      return uniqueChains
    } catch (error) {
      console.error("Error in getAllChainNames:", error)
      return []
    }
  },

  // Get all active challenges (now returns available quests that user hasn't started or completed)
  async getActiveChallenges(userId?: string): Promise<ChallengeWithDetails[]> {
    const { data, error } = await supabase
      .from("challenges")
      .select<string, ChallengeRowWithTasks>(
        `
        *,
        challenge_tasks (*)
      `,
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching challenges:", error)
      return []
    }

    const challenges: ChallengeWithDetails[] = (data ?? []).map((challenge) => {
      const sortedTasks = [...(challenge.challenge_tasks ?? [])].sort(
        (a, b) => (a?.order_number ?? 0) - (b?.order_number ?? 0),
      )

      return {
        ...challenge,
        challenge_tasks: challenge.challenge_tasks ?? [],
        tasks: sortedTasks,
        daysLeft: this.calculateDaysLeft(challenge.end_date),
      }
    })

    // If userId provided, get user progress and check prerequisites
    if (userId) {
      const enriched = await enrichChallengesWithUserProgress(
        challenges,
        userId,
      )

      // Check prerequisites and add chain info for each quest
      const withChainInfo = await Promise.all(
        enriched.map(async (challenge) => {
          const prerequisiteMet = challenge.prerequisite_challenge_id
            ? await this.checkQuestPrerequisites(userId, challenge.id)
            : true

          const chainInfo = challenge.chain_name
            ? await this.getQuestChainInfo(challenge.id)
            : null

          return {
            ...challenge,
            prerequisiteMet,
            isLocked: !prerequisiteMet && !challenge.isActivated,
            chainInfo: chainInfo || undefined,
          }
        }),
      )

      return withChainInfo
    }

    return challenges
  },

  // Get single challenge with details
  async getChallenge(
    challengeId: string,
    userId?: string,
  ): Promise<ChallengeWithDetails | null> {
    const { data, error } = await supabase
      .from("challenges")
      .select<string, ChallengeRowWithTasks>(
        `
        *,
        challenge_tasks (*)
      `,
      )
      .eq("id", challengeId)
      .single()

    if (error || !data) {
      console.error("Error fetching challenge:", error)
      return null
    }

    const sortedTasks = [...(data.challenge_tasks ?? [])].sort(
      (a, b) => (a?.order_number ?? 0) - (b?.order_number ?? 0),
    )

    const challenge: ChallengeWithDetails = {
      ...data,
      challenge_tasks: data.challenge_tasks ?? [],
      tasks: sortedTasks,
      daysLeft: this.calculateDaysLeft(data.end_date),
    }

    // If userId provided, get user progress and check prerequisites
    if (userId) {
      const enrichedChallenges = await enrichChallengesWithUserProgress(
        [challenge],
        userId,
      )

      const enriched = enrichedChallenges[0]

      // Check prerequisites and add chain info
      const prerequisiteMet = enriched.prerequisite_challenge_id
        ? await this.checkQuestPrerequisites(userId, enriched.id)
        : true

      const chainInfo = enriched.chain_name
        ? await this.getQuestChainInfo(enriched.id)
        : null

      return {
        ...enriched,
        prerequisiteMet,
        isLocked: !prerequisiteMet && !enriched.isActivated,
        chainInfo: chainInfo || undefined,
      }
    }

    return challenge
  },

  // Get user's challenge progress
  async getUserChallengeProgress(
    userId: string,
    challengeId: string,
  ): Promise<UserChallengeProgress | null> {
    const { data, error } = await supabase
      .from("user_challenge_progress")
      .select<string, UserChallengeProgress>("*")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .maybeSingle()

    if (error) {
      console.error("Error fetching user challenge progress:", error)
      return null
    }

    return data
  },

  // Start a challenge for user
  // Start/Activate a challenge (quest) for user - sets timer based on quest duration
  async startChallenge(userId: string, challengeId: string): Promise<boolean> {
    try {
      // Check if user already started this challenge
      const existing = await this.getUserChallengeProgress(userId, challengeId)

      // If already completed, don't allow reactivation
      if (existing?.is_completed) {
        console.log("Challenge already completed, cannot reactivate")
        return false
      }

      // Check prerequisites before allowing activation
      const prerequisiteMet = await this.checkQuestPrerequisites(
        userId,
        challengeId,
      )
      if (!prerequisiteMet && !existing) {
        console.log("Prerequisites not met, cannot start quest")
        return false
      }

      // Get challenge details to calculate quest end date
      const { data: challenge } = await supabase
        .from("challenges")
        .select("duration_days")
        .eq("id", challengeId)
        .single()

      if (!challenge) {
        console.error("Challenge not found")
        return false
      }

      const durationDays = challenge.duration_days || 7
      const questEndDate = new Date()
      questEndDate.setDate(questEndDate.getDate() + durationDays)

      if (existing && !existing.is_active) {
        // Reactivate existing progress
        const { error } = await supabase
          .from("user_challenge_progress")
          .update({
            activated_at: new Date().toISOString(),
            quest_end_date: questEndDate.toISOString(),
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("challenge_id", challengeId)

        if (error) {
          console.error("Error reactivating challenge:", error)
          return false
        }

        return true
      }

      if (!existing) {
        // Create new progress entry with activation
        const progressData: UserChallengeProgressInsert = {
          user_id: userId,
          challenge_id: challengeId,
          activated_at: new Date().toISOString(),
          quest_end_date: questEndDate.toISOString(),
          is_active: true,
          completed_tasks: 0,
          is_completed: false,
        }

        const { error } = await supabase
          .from("user_challenge_progress")
          .insert(progressData)
          .select()
          .single()

        if (error) {
          console.error("Error starting challenge:", error)
          return false
        }
      }

      return true
    } catch (error) {
      console.error("Error in startChallenge:", error)
      return false
    }
  },

  // Complete a challenge task
  async completeTask(
    userId: string,
    challengeId: string,
    taskId: string,
  ): Promise<boolean> {
    // First, ensure user has started the challenge
    await this.startChallenge(userId, challengeId)

    // Check if task is already completed
    const { data: existingTaskProgress } = await supabase
      .from("user_challenge_task_progress")
      .select<string, UserChallengeTaskProgress>("*")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .eq("task_id", taskId)
      .maybeSingle()

    if (existingTaskProgress?.is_completed) {
      return true // Already completed
    }
    // Track current challenge completion state so we only award points once
    const currentProgress = await this.getUserChallengeProgress(
      userId,
      challengeId,
    )
    const wasCompleted = currentProgress?.is_completed ?? false

    // Mark task as completed
    if (existingTaskProgress) {
      // Update existing record
      const { error: taskError } = await supabase
        .from("user_challenge_task_progress")
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("challenge_id", challengeId)
        .eq("task_id", taskId)

      if (taskError) {
        console.error("Error completing task:", taskError)
        return false
      }
    } else {
      // Insert new record
      const insertTask: UserChallengeTaskProgressInsert = {
        user_id: userId,
        challenge_id: challengeId,
        task_id: taskId,
        is_completed: true,
        completed_at: new Date().toISOString(),
      }

      const { error: taskError } = await supabase
        .from("user_challenge_task_progress")
        .insert(insertTask)

      if (taskError) {
        console.error("Error completing task:", taskError)
        return false
      }
    }

    // Update challenge progress
    const { count: completedCount, error: completedCountError } = await supabase
      .from("user_challenge_task_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .eq("is_completed", true)

    if (completedCountError) {
      console.error(
        "Error counting completed challenge tasks:",
        completedCountError,
      )
      return false
    }

    // Get total tasks for this challenge
    const { data: challenge } = await supabase
      .from("challenges")
      .select<
        string,
        Pick<Challenge, "total_tasks" | "reward_points">
      >("total_tasks, reward_points")
      .eq("id", challengeId)
      .single()

    if (!challenge) return false

    const totalTasks = challenge.total_tasks ?? 0
    const isCompleted =
      totalTasks > 0 ? (completedCount ?? 0) >= totalTasks : false

    // Update user challenge progress
    const progressUpdate: UserChallengeProgressUpdate = {
      completed_tasks: completedCount ?? 0,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    }

    const { error: progressError } = await supabase
      .from("user_challenge_progress")
      .update(progressUpdate)
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)

    if (progressError) {
      console.error("Error updating challenge progress:", progressError)
      return false
    }

    // If challenge is completed, award points (handled by userService)
    if (isCompleted && !wasCompleted) {
      const rewardPoints = challenge.reward_points ?? 0

      if (rewardPoints > 0) {
        const updatedProfile = await userService.updateExperience(
          userId,
          rewardPoints,
        )

        if (!updatedProfile) {
          console.error(
            "Error awarding challenge reward points to user profile",
          )
        }
      }

      // Update streak when completing a challenge
      const streakInfo = await streakService.checkAndUpdateStreak(userId)
      console.log("🔥 Streak updated after challenge completion:", streakInfo)

      // Check and award badges
      const newBadges = await badgeService.checkAndAwardBadges(userId)
      if (newBadges.length > 0) {
        console.log(
          `🏆 User ${userId} earned ${newBadges.length} new badge(s)!`,
        )
      }

      console.log(
        `Challenge completed! User ${userId} earned ${rewardPoints} points`,
      )
    }

    return true
  },

  // Uncomplete a challenge task
  async uncompleteTask(
    userId: string,
    challengeId: string,
    taskId: string,
  ): Promise<boolean> {
    // Mark task as not completed
    const taskUpdate: UserChallengeTaskProgressUpdate = {
      is_completed: false,
      completed_at: null,
    }

    const { error: taskError } = await supabase
      .from("user_challenge_task_progress")
      .update(taskUpdate)
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .eq("task_id", taskId)

    if (taskError) {
      console.error("Error uncompleting task:", taskError)
      return false
    }

    // Update challenge progress
    const { count: completedCount, error: completedCountError } = await supabase
      .from("user_challenge_task_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .eq("is_completed", true)

    if (completedCountError) {
      console.error(
        "Error counting completed challenge tasks:",
        completedCountError,
      )
      return false
    }

    // Update user challenge progress
    const progressUpdate: UserChallengeProgressUpdate = {
      completed_tasks: completedCount ?? 0,
      is_completed: false,
      completed_at: null,
    }

    const { error: progressError } = await supabase
      .from("user_challenge_progress")
      .update(progressUpdate)
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)

    if (progressError) {
      console.error("Error updating challenge progress:", progressError)
      return false
    }

    return true
  },

  /**
   * Advance the user's active cooking quests after they complete a recipe.
   *
   * For each active, non-expired quest, this completes the earliest incomplete
   * auto-advanceable task (see isAutoAdvanceTask) — one task per quest per cook,
   * so a single meal ticks off one day of a streak rather than the whole thing.
   * Semantic quests (cuisine, calorie, specific dish) are left untouched and stay
   * manual.
   *
   * Best-effort and self-contained: it swallows its own errors and returns the
   * number of tasks advanced, so a failure here never disrupts recipe completion.
   */
  async advanceCookingQuests(userId: string): Promise<number> {
    try {
      const activeQuests = await this.getUserActiveChallenges(userId)
      let advanced = 0

      for (const quest of activeQuests) {
        // Skip expired quests: their tasks can no longer be completed.
        const daysLeft = quest.questDaysLeft ?? quest.daysLeft ?? 0
        if (daysLeft <= 0) continue
        if (quest.userProgress?.is_completed) continue

        // Earliest incomplete task (tasks are pre-sorted by order_number) that is
        // eligible for auto-advance.
        const nextTask = quest.tasks.find((task) => {
          if (!isAutoAdvanceTask(task.title)) return false
          const progress = quest.userTaskProgress?.find(
            (tp) => tp.task_id === task.id,
          )
          return !progress?.is_completed
        })

        if (!nextTask) continue

        const ok = await this.completeTask(userId, quest.id, nextTask.id)
        if (ok) {
          advanced += 1
          console.log(
            `🎯 Auto-advanced quest "${quest.title}": completed task "${nextTask.title}"`,
          )
        }
      }

      return advanced
    } catch (error) {
      console.error("Error advancing cooking quests:", error)
      return 0
    }
  },

  // Get user's active challenges
  // Get user's active challenges (quests that have been activated)
  async getUserActiveChallenges(
    userId: string,
  ): Promise<ChallengeWithDetails[]> {
    const { data, error } = await supabase
      .from("user_challenge_progress")
      .select<string, UserChallengeProgressWithChallenge>(
        `
        *,
        challenges (
          *,
          challenge_tasks (*)
        )
      `,
      )
      .eq("user_id", userId)
      .eq("is_active", true)
      .eq("is_completed", false)

    if (error) {
      console.error("Error fetching user active challenges:", error)
      return []
    }

    const progressEntries = (data ?? []).filter(
      (progress): progress is UserChallengeProgressWithChallenge =>
        !!progress.challenges,
    )

    return progressEntries.map((progress) => {
      const challenge = progress.challenges
      const sortedTasks = [...(challenge.challenge_tasks ?? [])].sort(
        (a, b) => (a?.order_number ?? 0) - (b?.order_number ?? 0),
      )

      const questDaysLeft = progress.quest_end_date
        ? this.calculateDaysLeft(progress.quest_end_date)
        : 0

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
          activated_at: progress.activated_at,
          quest_end_date: progress.quest_end_date,
          is_active: progress.is_active,
        },
        isActivated: true,
        questDaysLeft,
        daysLeft: questDaysLeft,
      }
    })
  },

  // Get user's completed challenges
  async getUserCompletedChallenges(
    userId: string,
  ): Promise<ChallengeWithDetails[]> {
    const { data, error } = await supabase
      .from("user_challenge_progress")
      .select<string, UserChallengeProgressWithChallenge>(
        `
        *,
        challenges (
          *,
          challenge_tasks (*)
        )
      `,
      )
      .eq("user_id", userId)
      .eq("is_completed", true)
      .order("completed_at", { ascending: false })

    if (error) {
      console.error("Error fetching user completed challenges:", error)
      return []
    }

    const progressEntries = (data ?? []).filter(
      (progress): progress is UserChallengeProgressWithChallenge =>
        !!progress.challenges,
    )

    return progressEntries.map((progress) => {
      const challenge = progress.challenges
      const sortedTasks = [...(challenge.challenge_tasks ?? [])].sort(
        (a, b) => (a?.order_number ?? 0) - (b?.order_number ?? 0),
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
}
