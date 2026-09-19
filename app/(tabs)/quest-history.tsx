import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useState } from "react"
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

// Components
import Badge from "@/components/Badge"
import Card from "@/components/Card"

// Hooks and Services
import { useAuth } from "@/hooks/useAuth"
import { questHistoryService, QuestHistoryEntry, QuestStats } from "@/services/questHistoryService"

export default function QuestHistoryScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"completed" | "abandoned" | "all">("completed")
  const [history, setHistory] = useState<QuestHistoryEntry[]>([])
  const [stats, setStats] = useState<QuestStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const [statsData, historyData] = await Promise.all([
        questHistoryService.getQuestStats(user.id),
        activeTab === "completed"
          ? questHistoryService.getCompletedQuests(user.id)
          : activeTab === "abandoned"
          ? questHistoryService.getAbandonedQuests(user.id)
          : questHistoryService.getQuestHistory(user.id),
      ])

      setStats(statsData)
      setHistory(historyData)
    } catch (error) {
      console.error("Error fetching quest history:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user, activeTab])

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchHistory()
      }
    }, [user, fetchHistory])
  )

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchHistory()
  }, [fetchHistory])

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "N/A"
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case "easy":
        return "#22c55e"
      case "medium":
        return "#f59e0b"
      case "hard":
        return "#ef4444"
      default:
        return "#64748b"
    }
  }

  const getDifficultyIcon = (difficulty: string | null) => {
    switch (difficulty) {
      case "easy":
        return "leaf-outline"
      case "medium":
        return "flash-outline"
      case "hard":
        return "flame-outline"
      default:
        return "star-outline"
    }
  }

  if (loading) {
    return (
      <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#166534" />
            <Text style={styles.loadingText}>Loading quest history...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#166534" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quest History</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Stats Summary */}
        {stats && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsScrollContent}
            style={styles.statsScroll}
          >
            <Card style={styles.statCard}>
              <Ionicons name="trophy" size={24} color="#f59e0b" />
              <Text style={styles.statValue}>{stats.totalCompleted}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </Card>
            <Card style={styles.statCard}>
              <Ionicons name="star" size={24} color="#22c55e" />
              <Text style={styles.statValue}>{stats.totalXpEarned}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </Card>
            <Card style={styles.statCard}>
              <Ionicons name="flame" size={24} color="#ef4444" />
              <Text style={styles.statValue}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </Card>
            <Card style={styles.statCard}>
              <Ionicons name="time" size={24} color="#3b82f6" />
              <Text style={styles.statValue}>{stats.averageCompletionTime}h</Text>
              <Text style={styles.statLabel}>Avg Time</Text>
            </Card>
            <Card style={styles.statCard}>
              <Ionicons name="trending-up" size={24} color="#8b5cf6" />
              <Text style={styles.statValue}>{stats.completionRate}%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </Card>
          </ScrollView>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "completed" && styles.activeTabButton]}
            onPress={() => setActiveTab("completed")}
          >
            <Text style={[styles.tabText, activeTab === "completed" && styles.activeTabText]}>
              Completed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "abandoned" && styles.activeTabButton]}
            onPress={() => setActiveTab("abandoned")}
          >
            <Text style={[styles.tabText, activeTab === "abandoned" && styles.activeTabText]}>
              Abandoned
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "all" && styles.activeTabButton]}
            onPress={() => setActiveTab("all")}
          >
            <Text style={[styles.tabText, activeTab === "all" && styles.activeTabText]}>
              All
            </Text>
          </TouchableOpacity>
        </View>

        {/* History List */}
        <ScrollView
          style={styles.historyScroll}
          contentContainerStyle={styles.historyContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {history.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyStateTitle}>No History Yet</Text>
              <Text style={styles.emptyStateText}>
                Complete some quests to see your history here!
              </Text>
            </View>
          ) : (
            history.map((quest) => (
              <Card key={quest.id} style={styles.questCard}>
                <View style={styles.questHeader}>
                  <View style={styles.questTitleRow}>
                    <Ionicons
                      name={getDifficultyIcon(quest.difficulty_level) as any}
                      size={20}
                      color={getDifficultyColor(quest.difficulty_level)}
                    />
                    <Text style={styles.questTitle}>{quest.title}</Text>
                  </View>
                  <Badge
                    text={`+${quest.reward_points} XP`}
                    color="white"
                    backgroundColor="#22c55e"
                  />
                </View>

                <View style={styles.questMeta}>
                  <Badge
                    text={quest.category}
                    color="#64748b"
                    backgroundColor="#f1f5f9"
                  />
                  {quest.difficulty_level && (
                    <Badge
                      text={quest.difficulty_level.charAt(0).toUpperCase() + quest.difficulty_level.slice(1)}
                      color={getDifficultyColor(quest.difficulty_level)}
                      backgroundColor={`${getDifficultyColor(quest.difficulty_level)}20`}
                    />
                  )}
                </View>

                <View style={styles.questStats}>
                  <View style={styles.questStatItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#64748b" />
                    <Text style={styles.questStatText}>
                      {quest.completed_tasks}/{quest.total_tasks} tasks
                    </Text>
                  </View>
                  {quest.actual_completion_minutes && (
                    <View style={styles.questStatItem}>
                      <Ionicons name="time" size={16} color="#64748b" />
                      <Text style={styles.questStatText}>
                        {formatDuration(quest.actual_completion_minutes)}
                      </Text>
                    </View>
                  )}
                  {quest.completed_at && (
                    <View style={styles.questStatItem}>
                      <Ionicons name="calendar" size={16} color="#64748b" />
                      <Text style={styles.questStatText}>
                        {new Date(quest.completed_at).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>

                {quest.completed_on_time !== null && (
                  <View style={styles.questBadge}>
                    {quest.completed_on_time ? (
                      <Badge
                        text="✓ Completed On Time"
                        color="#22c55e"
                        backgroundColor="#dcfce7"
                      />
                    ) : (
                      <Badge
                        text="Expired"
                        color="#ef4444"
                        backgroundColor="#fee2e2"
                      />
                    )}
                  </View>
                )}
              </Card>
            ))
          )}

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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 16,
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#166534",
  },
  placeholder: {
    width: 40,
  },
  statsScroll: {
    maxHeight: 120,
  },
  statsScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    width: 120,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#166534",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
    padding: 4,
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
  historyScroll: {
    flex: 1,
  },
  historyContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
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
  questCard: {
    marginBottom: 16,
    padding: 16,
  },
  questHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  questTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
  },
  questMeta: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  questStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  questStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  questStatText: {
    fontSize: 13,
    color: "#64748b",
  },
  questBadge: {
    marginTop: 12,
  },
  bottomPadding: {
    height: 20,
  },
})
