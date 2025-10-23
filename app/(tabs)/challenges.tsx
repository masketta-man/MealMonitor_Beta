import { useState, useEffect, useCallback } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

// Components
import Card from "@/components/Card"
import Badge from "@/components/Badge"
import Button from "@/components/Button"
import ProgressBar from "@/components/ProgressBar"

// Hooks and Services
import { useAuth } from "@/hooks/useAuth"
import { challengeService, ChallengeWithDetails } from "@/services/challengeService"

export default function ChallengesScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("active")
  const [activeChallenges, setActiveChallenges] = useState<ChallengeWithDetails[]>([])
  const [upcomingChallenges, setUpcomingChallenges] = useState<ChallengeWithDetails[]>([])
  const [completedChallenges, setCompletedChallenges] = useState<ChallengeWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch challenges from Supabase
  const fetchChallenges = useCallback(async () => {
    try {
      setError(null)
      
      if (!user) {
        setLoading(false)
        return
      }

      // Fetch all active challenges with user progress
      const allChallenges = await challengeService.getActiveChallenges(user.id)
      
      // Separate into active (started by user) and upcoming (not started)
      const active: ChallengeWithDetails[] = []
      const upcoming: ChallengeWithDetails[] = []
      
      allChallenges.forEach((challenge) => {
        if (challenge.userProgress && !challenge.userProgress.is_completed) {
          active.push(challenge)
        } else if (!challenge.userProgress) {
          upcoming.push(challenge)
        }
      })
      
      setActiveChallenges(active)
      setUpcomingChallenges(upcoming)
      
      // Fetch completed challenges
      const completed = await challengeService.getUserCompletedChallenges(user.id)
      setCompletedChallenges(completed)
    } catch (err) {
      console.error("Error fetching challenges:", err)
      setError("Failed to load challenges")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  useEffect(() => {
    fetchChallenges()
  }, [fetchChallenges])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchChallenges()
  }, [fetchChallenges])

  const navigateToChallenge = (id: string) => {
    router.push(`/(tabs)/challenges/${id}`)
  }

  const startChallenge = async (challengeId: string) => {
    if (!user) return
    
    const success = await challengeService.startChallenge(user.id, challengeId)
    if (success) {
      // Refresh challenges to show updated state
      fetchChallenges()
    }
  }

  // Calculate total stats
  const totalCompleted = completedChallenges.length
  const totalActive = activeChallenges.length
  const totalPoints = completedChallenges.reduce((sum, c) => sum + c.reward_points, 0)

  return (
    <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Challenges</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="information-circle-outline" size={24} color="#166534" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Challenge Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalCompleted}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalActive}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalPoints}</Text>
                <Text style={styles.statLabel}>Points Earned</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "active" ? styles.activeTabButton : {}]}
            onPress={() => setActiveTab("active")}
          >
            <Text style={[styles.tabText, activeTab === "active" ? styles.activeTabText : {}]}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "upcoming" ? styles.activeTabButton : {}]}
            onPress={() => setActiveTab("upcoming")}
          >
            <Text style={[styles.tabText, activeTab === "upcoming" ? styles.activeTabText : {}]}>Upcoming</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "completed" ? styles.activeTabButton : {}]}
            onPress={() => setActiveTab("completed")}
          >
            <Text style={[styles.tabText, activeTab === "completed" ? styles.activeTabText : {}]}>Completed</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#166534"]} />
          }
        >
          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#166534" />
              <Text style={styles.loadingText}>Loading challenges...</Text>
            </View>
          )}

          {/* Error State */}
          {error && !loading && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#dc2626" />
              <Text style={styles.errorText}>{error}</Text>
              <Button 
                text="Retry" 
                color="white" 
                backgroundColor="#166534" 
                onPress={fetchChallenges}
              />
            </View>
          )}

          {/* Active Challenges */}
          {!loading && !error && activeTab === "active" && (
            <View style={styles.challengesContainer}>
              {activeChallenges.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="trophy-outline" size={64} color="#cbd5e1" />
                  <Text style={styles.emptyStateTitle}>No Active Challenges</Text>
                  <Text style={styles.emptyStateText}>Check out upcoming challenges to get started!</Text>
                </View>
              ) : (
                activeChallenges.map((challenge: ChallengeWithDetails) => {
                  const completedTasks = challenge.userProgress?.completed_tasks || 0
                  const totalTasks = challenge.total_tasks
                  const daysLeft = challenge.daysLeft || 0
                  
                  return (
                    <Card key={challenge.id} style={styles.challengeCard}>
                      <View style={styles.challengeHeader}>
                        <View style={styles.challengeTitleContainer}>
                          <View style={[styles.challengeIconContainer, { backgroundColor: challenge.bg_color }]}>
                            <Ionicons name={challenge.icon as any} size={20} color={challenge.color} />
                          </View>
                          <Text style={[styles.challengeTitle, { color: challenge.color }]}>{challenge.title}</Text>
                        </View>
                        <Badge text={`+${challenge.reward_points}`} color="white" backgroundColor={challenge.color} />
                      </View>
                      <Text style={styles.challengeDescription}>{challenge.description}</Text>
                      <View style={styles.challengeProgressContainer}>
                        <ProgressBar
                          progress={completedTasks / totalTasks}
                          colors={[challenge.color, challenge.color]}
                          height={8}
                        />
                        <Text style={[styles.challengeProgressText, { color: challenge.color }]}>
                          Progress: {completedTasks}/{totalTasks}
                        </Text>
                      </View>
                      <View style={styles.challengeFooter}>
                        <View style={styles.challengeDaysLeft}>
                          <Ionicons name="time-outline" size={16} color="#64748b" />
                          <Text style={styles.challengeDaysLeftText}>{daysLeft} days left</Text>
                        </View>
                        <Button
                          text="View Details"
                          color={challenge.color}
                          backgroundColor="transparent"
                          outline={challenge.color}
                          onPress={() => navigateToChallenge(challenge.id)}
                        />
                      </View>
                    </Card>
                  )
                })
              )}
            </View>
          )}

          {/* Upcoming Challenges */}
          {!loading && !error && activeTab === "upcoming" && (
            <View style={styles.challengesContainer}>
              {upcomingChallenges.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
                  <Text style={styles.emptyStateTitle}>No Upcoming Challenges</Text>
                  <Text style={styles.emptyStateText}>All challenges are active or completed!</Text>
                </View>
              ) : (
                upcomingChallenges.map((challenge: ChallengeWithDetails) => {
                  const daysLeft = challenge.daysLeft || 0
                  const startDate = new Date(challenge.start_date).toLocaleDateString()
                  const endDate = new Date(challenge.end_date).toLocaleDateString()
                  
                  return (
                    <Card key={challenge.id} style={styles.challengeCard}>
                      <View style={styles.challengeHeader}>
                        <View style={styles.challengeTitleContainer}>
                          <View style={[styles.challengeIconContainer, { backgroundColor: challenge.bg_color }]}>
                            <Ionicons name={challenge.icon as any} size={20} color={challenge.color} />
                          </View>
                          <Text style={[styles.challengeTitle, { color: challenge.color }]}>{challenge.title}</Text>
                        </View>
                        <Badge text={`+${challenge.reward_points}`} color="white" backgroundColor={challenge.color} />
                      </View>
                      <Text style={styles.challengeDescription}>{challenge.description}</Text>
                      <View style={styles.upcomingChallengeDetails}>
                        <View style={styles.upcomingChallengeDetail}>
                          <Ionicons name="calendar-outline" size={16} color="#64748b" />
                          <Text style={styles.upcomingChallengeDetailText}>
                            {startDate} - {endDate}
                          </Text>
                        </View>
                        <View style={styles.upcomingChallengeDetail}>
                          <Ionicons name="time-outline" size={16} color="#64748b" />
                          <Text style={styles.upcomingChallengeDetailText}>{daysLeft} days</Text>
                        </View>
                      </View>
                      <Button
                        text="Start Challenge"
                        color="white"
                        backgroundColor={challenge.color}
                        onPress={() => startChallenge(challenge.id)}
                        style={styles.upcomingChallengeButton}
                      />
                    </Card>
                  )
                })
              )}
            </View>
          )}

          {/* Completed Challenges */}
          {!loading && !error && activeTab === "completed" && (
            <View style={styles.challengesContainer}>
              {completedChallenges.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="medal-outline" size={64} color="#cbd5e1" />
                  <Text style={styles.emptyStateTitle}>No Completed Challenges</Text>
                  <Text style={styles.emptyStateText}>Complete challenges to see them here!</Text>
                </View>
              ) : (
                completedChallenges.map((challenge: ChallengeWithDetails) => {
                  const completedDate = challenge.userProgress?.completed_at 
                    ? new Date(challenge.userProgress.completed_at).toLocaleDateString()
                    : "Recently"
                  
                  return (
                    <Card key={challenge.id} style={styles.challengeCard}>
                      <View style={styles.challengeHeader}>
                        <View style={styles.challengeTitleContainer}>
                          <View style={[styles.challengeIconContainer, { backgroundColor: challenge.bg_color }]}>
                            <Ionicons name={challenge.icon as any} size={20} color={challenge.color} />
                          </View>
                          <Text style={[styles.challengeTitle, { color: challenge.color }]}>{challenge.title}</Text>
                        </View>
                        <Badge text={`+${challenge.reward_points}`} color="white" backgroundColor={challenge.color} />
                      </View>
                      <Text style={styles.challengeDescription}>{challenge.description}</Text>
                      <View style={styles.completedChallengeDetails}>
                        <View style={styles.completedChallengeDetail}>
                          <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                          <Text style={styles.completedChallengeDetailText}>Completed {completedDate}</Text>
                        </View>
                        <View style={styles.completedChallengeReward}>
                          <Ionicons name="trophy" size={16} color="#f59e0b" />
                          <Text style={styles.completedChallengeRewardText}>
                            {challenge.reward_points} points earned
                          </Text>
                        </View>
                      </View>
                      <View style={styles.completedChallengeBadge}>
                        <Ionicons name="trophy" size={48} color="#f59e0b" />
                        <Text style={styles.completedChallengeBadgeText}>Challenge Completed!</Text>
                      </View>
                    </Card>
                  )
                })
              )}
            </View>
          )}

          {/* Bottom padding to account for tab bar */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingBottom: 80, // Space for tab bar
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0fdf4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#166534",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 8,
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  statsCard: {
    padding: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#166534",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e2e8f0",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  activeTabButton: {
    backgroundColor: "#dcfce7",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  activeTabText: {
    color: "#166534",
  },
  challengesContainer: {
    paddingHorizontal: 16,
  },
  challengeCard: {
    marginBottom: 16,
    padding: 16,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  challengeTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  challengeIconContainer: {
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 8,
  },
  challengeDescription: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 12,
  },
  challengeProgressContainer: {
    marginVertical: 10,
  },
  challengeProgressText: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 6,
  },
  challengeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  challengeDaysLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  challengeDaysLeftText: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 4,
  },
  upcomingChallengeDetails: {
    marginVertical: 10,
  },
  upcomingChallengeDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  upcomingChallengeDetailText: {
    fontSize: 14,
    color: "#4b5563",
    marginLeft: 6,
  },
  upcomingChallengeButton: {
    marginTop: 8,
  },
  completedChallengeDetails: {
    marginVertical: 10,
  },
  completedChallengeDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  completedChallengeDetailText: {
    fontSize: 14,
    color: "#4b5563",
    marginLeft: 6,
  },
  completedChallengeReward: {
    flexDirection: "row",
    alignItems: "center",
  },
  completedChallengeRewardText: {
    fontSize: 14,
    color: "#4b5563",
    marginLeft: 6,
  },
  completedChallengeBadge: {
    alignItems: "center",
    marginTop: 12,
  },
  completedChallengeBadgeImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  completedChallengeBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#22c55e",
  },
  bottomPadding: {
    height: 100, // Adjust based on tab bar height
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
})
