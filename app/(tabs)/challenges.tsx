"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

// Components
import Card from "@/components/Card"
import Badge from "@/components/Badge"
import Button from "@/components/Button"
import ProgressBar from "@/components/ProgressBar"

// Mock data for challenges
const ACTIVE_CHALLENGES = [
  {
    id: "1",
    title: "Veggie Week",
    description: "Eat 5 vegetable-based meals this week",
    progress: 3,
    total: 5,
    reward: 200,
    daysLeft: 4,
    color: "#a855f7",
    bgColor: "#f3e8ff",
    icon: "leaf",
  },
  {
    id: "2",
    title: "Protein Power",
    description: "Prepare 3 high-protein meals with at least 25g of protein",
    progress: 1,
    total: 3,
    reward: 150,
    daysLeft: 5,
    color: "#3b82f6",
    bgColor: "#dbeafe",
    icon: "fitness",
  },
]

const UPCOMING_CHALLENGES = [
  {
    id: "3",
    title: "Breakfast Champion",
    description: "Start your day right with 7 healthy breakfasts",
    reward: 250,
    startDate: "Next Monday",
    duration: "7 days",
    color: "#f59e0b",
    bgColor: "#fef3c7",
    icon: "sunny",
  },
  {
    id: "4",
    title: "Hydration Hero",
    description: "Track your water intake for 14 consecutive days",
    reward: 300,
    startDate: "Next Week",
    duration: "14 days",
    color: "#0ea5e9",
    bgColor: "#e0f2fe",
    icon: "water",
  },
]

const COMPLETED_CHALLENGES = [
  {
    id: "5",
    title: "Meal Prep Master",
    description: "Prepare meals in advance for 5 days",
    reward: 180,
    completedDate: "Last week",
    color: "#22c55e",
    bgColor: "#dcfce7",
    icon: "time",
  },
]

export default function ChallengesScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("active")

  const navigateToChallenge = (id: string) => {
    router.push(`/(tabs)/challenges/${id}`)
  }

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
                <Text style={styles.statValue}>5</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>2</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>750</Text>
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

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Active Challenges */}
          {activeTab === "active" && (
            <View style={styles.challengesContainer}>
              {ACTIVE_CHALLENGES.map((challenge) => (
                <Card key={challenge.id} style={styles.challengeCard}>
                  <View style={styles.challengeHeader}>
                    <View style={styles.challengeTitleContainer}>
                      <View style={[styles.challengeIconContainer, { backgroundColor: challenge.bgColor }]}>
                        <Ionicons name={challenge.icon as any} size={20} color={challenge.color} />
                      </View>
                      <Text style={[styles.challengeTitle, { color: challenge.color }]}>{challenge.title}</Text>
                    </View>
                    <Badge text={`+${challenge.reward}`} color="white" backgroundColor={challenge.color} />
                  </View>
                  <Text style={styles.challengeDescription}>{challenge.description}</Text>
                  <View style={styles.challengeProgressContainer}>
                    <ProgressBar
                      progress={challenge.progress / challenge.total}
                      colors={[challenge.color, challenge.color]}
                      height={8}
                    />
                    <Text style={[styles.challengeProgressText, { color: challenge.color }]}>
                      Progress: {challenge.progress}/{challenge.total}
                    </Text>
                  </View>
                  <View style={styles.challengeFooter}>
                    <View style={styles.challengeDaysLeft}>
                      <Ionicons name="time-outline" size={16} color="#64748b" />
                      <Text style={styles.challengeDaysLeftText}>{challenge.daysLeft} days left</Text>
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
              ))}
            </View>
          )}

          {/* Upcoming Challenges */}
          {activeTab === "upcoming" && (
            <View style={styles.challengesContainer}>
              {UPCOMING_CHALLENGES.map((challenge) => (
                <Card key={challenge.id} style={styles.challengeCard}>
                  <View style={styles.challengeHeader}>
                    <View style={styles.challengeTitleContainer}>
                      <View style={[styles.challengeIconContainer, { backgroundColor: challenge.bgColor }]}>
                        <Ionicons name={challenge.icon as any} size={20} color={challenge.color} />
                      </View>
                      <Text style={[styles.challengeTitle, { color: challenge.color }]}>{challenge.title}</Text>
                    </View>
                    <Badge text={`+${challenge.reward}`} color="white" backgroundColor={challenge.color} />
                  </View>
                  <Text style={styles.challengeDescription}>{challenge.description}</Text>
                  <View style={styles.upcomingChallengeDetails}>
                    <View style={styles.upcomingChallengeDetail}>
                      <Ionicons name="calendar-outline" size={16} color="#64748b" />
                      <Text style={styles.upcomingChallengeDetailText}>Starts: {challenge.startDate}</Text>
                    </View>
                    <View style={styles.upcomingChallengeDetail}>
                      <Ionicons name="time-outline" size={16} color="#64748b" />
                      <Text style={styles.upcomingChallengeDetailText}>Duration: {challenge.duration}</Text>
                    </View>
                  </View>
                  <Button
                    text="Set Reminder"
                    color={challenge.color}
                    backgroundColor="transparent"
                    outline={challenge.color}
                    onPress={() => {}}
                    style={styles.upcomingChallengeButton}
                  />
                </Card>
              ))}
            </View>
          )}

          {/* Completed Challenges */}
          {activeTab === "completed" && (
            <View style={styles.challengesContainer}>
              {COMPLETED_CHALLENGES.map((challenge) => (
                <Card key={challenge.id} style={styles.challengeCard}>
                  <View style={styles.challengeHeader}>
                    <View style={styles.challengeTitleContainer}>
                      <View style={[styles.challengeIconContainer, { backgroundColor: challenge.bgColor }]}>
                        <Ionicons name={challenge.icon as any} size={20} color={challenge.color} />
                      </View>
                      <Text style={[styles.challengeTitle, { color: challenge.color }]}>{challenge.title}</Text>
                    </View>
                    <Badge text={`+${challenge.reward}`} color="white" backgroundColor={challenge.color} />
                  </View>
                  <Text style={styles.challengeDescription}>{challenge.description}</Text>
                  <View style={styles.completedChallengeDetails}>
                    <View style={styles.completedChallengeDetail}>
                      <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                      <Text style={styles.completedChallengeDetailText}>Completed {challenge.completedDate}</Text>
                    </View>
                    <View style={styles.completedChallengeReward}>
                      <Ionicons name="trophy" size={16} color="#f59e0b" />
                      <Text style={styles.completedChallengeRewardText}>{challenge.reward} points earned</Text>
                    </View>
                  </View>
                  <View style={styles.completedChallengeBadge}>
                    <Image
                      source={{ uri: "https://via.placeholder.com/100" }}
                      style={styles.completedChallengeBadgeImage}
                    />
                    <Text style={styles.completedChallengeBadgeText}>Challenge Completed</Text>
                  </View>
                </Card>
              ))}
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
})
