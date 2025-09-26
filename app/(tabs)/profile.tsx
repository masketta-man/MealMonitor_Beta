"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Pressable } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

// Components
import Card from "@/components/Card"
import Badge from "@/components/Badge"
import ProgressBar from "@/components/ProgressBar"
import TabView from "@/components/TabView"

const { width } = Dimensions.get("window")

// Mock data for user profile
const userData = {
  name: "Johnny Bravo",
  username: "johnnyb",
  level: 7,
  experience: 350,
  nextLevelExp: 500,
  streakDays: 5,
  totalPoints: 1250,
  joinDate: "March 2023",
  stats: {
    mealsCompleted: 48,
    challengesCompleted: 12,
    ingredientsUsed: 86,
    perfectWeeks: 3,
  },
}

// Mock data for achievements/badges
const achievements = [
  {
    id: 1,
    name: "Veggie Master",
    description: "Complete 10 vegetable-based recipes",
    icon: "leaf",
    color: "#22c55e",
    progress: 10,
    total: 10,
    earned: true,
    earnedDate: "2 weeks ago",
  },
  {
    id: 2,
    name: "Protein Pro",
    description: "Prepare 15 high-protein meals",
    icon: "fitness",
    color: "#f97316",
    progress: 15,
    total: 15,
    earned: true,
    earnedDate: "1 week ago",
  },
  {
    id: 3,
    name: "Hydration Hero",
    description: "Log water intake for 14 consecutive days",
    icon: "water",
    color: "#3b82f6",
    progress: 8,
    total: 14,
    earned: false,
  },
  {
    id: 4,
    name: "Meal Planner",
    description: "Create 5 weekly meal plans",
    icon: "calendar",
    color: "#8b5cf6",
    progress: 5,
    total: 5,
    earned: true,
    earnedDate: "3 days ago",
  },
  {
    id: 5,
    name: "Breakfast Champion",
    description: "Prepare 20 healthy breakfast recipes",
    icon: "sunny",
    color: "#f59e0b",
    progress: 14,
    total: 20,
    earned: false,
  },
  {
    id: 6,
    name: "Nutrition Expert",
    description: "Complete the nutrition quiz with 100% score",
    icon: "school",
    color: "#ec4899",
    progress: 1,
    total: 1,
    earned: true,
    earnedDate: "1 month ago",
  },
]

// Mock data for activity history
const activityHistory = [
  {
    id: 1,
    type: "recipe",
    title: "Completed Mediterranean Salad recipe",
    points: 60,
    date: "Today",
    icon: "restaurant",
    color: "#22c55e",
  },
  {
    id: 2,
    type: "challenge",
    title: "Completed Veggie Week challenge",
    points: 200,
    date: "Yesterday",
    icon: "trophy",
    color: "#f59e0b",
  },
  {
    id: 3,
    type: "level",
    title: "Reached Level 7",
    points: 0,
    date: "2 days ago",
    icon: "star",
    color: "#3b82f6",
  },
  {
    id: 4,
    type: "badge",
    title: "Earned Meal Planner badge",
    points: 100,
    date: "3 days ago",
    icon: "ribbon",
    color: "#8b5cf6",
  },
  {
    id: 5,
    type: "recipe",
    title: "Completed Avocado & Egg Toast recipe",
    points: 45,
    date: "4 days ago",
    icon: "restaurant",
    color: "#22c55e",
  },
  {
    id: 6,
    type: "ingredient",
    title: "Added 5 new ingredients to inventory",
    points: 25,
    date: "5 days ago",
    icon: "nutrition",
    color: "#ec4899",
  },
]

export default function ProfileScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("achievements")

  // Calculate experience percentage for progress bar
  const expPercentage = (userData.experience / userData.nextLevelExp) * 100

  return (
    <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                console.log("Settings pressed")
                // In a real app, you would navigate to settings
                // router.push("/(tabs)/settings");
                alert("Settings feature coming soon!")
              }}
            >
              <Ionicons name="settings-outline" size={24} color="#166534" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                console.log("Share profile pressed")
                // In a real app, you would open a share dialog
                alert("Share profile feature coming soon!")
              }}
            >
              <Ionicons name="share-social-outline" size={24} color="#166534" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* User Profile Card */}
          <Card style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileImageContainer}>
                <Text style={styles.profileImageText}>{userData.name.charAt(0)}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userData.name}</Text>
                <Text style={styles.profileUsername}>@{userData.username}</Text>
                <View style={styles.profileMeta}>
                  <View style={styles.profileMetaItem}>
                    <Ionicons name="calendar-outline" size={14} color="#64748b" />
                    <Text style={styles.profileMetaText}>Joined {userData.joinDate}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.levelContainer}>
              <View style={styles.levelHeader}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>Level {userData.level}</Text>
                </View>
                <Text style={styles.expText}>
                  {userData.experience}/{userData.nextLevelExp} XP
                </Text>
              </View>
              <ProgressBar progress={expPercentage / 100} colors={["#4ade80", "#22c55e"]} height={8} />
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={[styles.statIconContainer, { backgroundColor: "#dcfce7" }]}>
                    <Ionicons name="flame" size={20} color="#22c55e" />
                  </View>
                  <Text style={styles.statValue}>{userData.streakDays}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>

                <View style={styles.statItem}>
                  <View style={[styles.statIconContainer, { backgroundColor: "#fef3c7" }]}>
                    <Ionicons name="star" size={20} color="#f59e0b" />
                  </View>
                  <Text style={styles.statValue}>{userData.totalPoints}</Text>
                  <Text style={styles.statLabel}>Total Points</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={[styles.statIconContainer, { backgroundColor: "#dbeafe" }]}>
                    <Ionicons name="restaurant" size={20} color="#3b82f6" />
                  </View>
                  <Text style={styles.statValue}>{userData.stats.mealsCompleted}</Text>
                  <Text style={styles.statLabel}>Meals</Text>
                </View>

                <View style={styles.statItem}>
                  <View style={[styles.statIconContainer, { backgroundColor: "#f3e8ff" }]}>
                    <Ionicons name="trophy" size={20} color="#8b5cf6" />
                  </View>
                  <Text style={styles.statValue}>{userData.stats.challengesCompleted}</Text>
                  <Text style={styles.statLabel}>Challenges</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Tabs for Achievements and Activity */}
          <View style={styles.tabsContainer}>
            <TabView
              tabs={[
                { key: "achievements", title: "Achievements" },
                { key: "activity", title: "Activity" },
              ]}
              activeTab={activeTab}
              onChangeTab={setActiveTab}
            >
              {activeTab === "achievements" ? (
                <View style={styles.achievementsContainer}>
                  {/* Earned Badges Section */}
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Earned Badges</Text>
                    <Badge
                      text={`${achievements.filter((a) => a.earned).length}/${achievements.length}`}
                      color="#166534"
                      backgroundColor="#dcfce7"
                    />
                  </View>

                  <View style={styles.badgesGrid}>
                    {achievements.map((badge) => (
                      <Pressable key={badge.id} style={styles.badgeItem}>
                        <View
                          style={[
                            styles.badgeIconContainer,
                            { backgroundColor: badge.earned ? badge.color : "#e2e8f0" },
                          ]}
                        >
                          <Ionicons
                            name={badge.icon as keyof typeof Ionicons.glyphMap}
                            size={24}
                            color={badge.earned ? "white" : "#94a3b8"}
                          />
                          {!badge.earned && (
                            <View style={styles.badgeLock}>
                              <Ionicons name="lock-closed" size={12} color="white" />
                            </View>
                          )}
                        </View>
                        <Text style={[styles.badgeName, { color: badge.earned ? "#1e293b" : "#94a3b8" }]}>
                          {badge.name}
                        </Text>
                        {badge.earned ? (
                          <Text style={styles.badgeEarned}>{badge.earnedDate}</Text>
                        ) : (
                          <View style={styles.badgeProgressContainer}>
                            <View style={styles.badgeProgressBar}>
                              <View
                                style={[
                                  styles.badgeProgressFill,
                                  { width: `${(badge.progress / badge.total) * 100}%` },
                                ]}
                              />
                            </View>
                            <Text style={styles.badgeProgressText}>
                              {badge.progress}/{badge.total}
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.activityContainer}>
                  {/* Activity History */}
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                  </View>

                  {activityHistory.map((activity) => (
                    <Card key={activity.id} style={styles.activityCard}>
                      <View style={styles.activityContent}>
                        <View style={[styles.activityIconContainer, { backgroundColor: activity.color }]}>
                          <Ionicons name={activity.icon as keyof typeof Ionicons.glyphMap} size={20} color="white" />
                        </View>
                        <View style={styles.activityInfo}>
                          <Text style={styles.activityTitle}>{activity.title}</Text>
                          <Text style={styles.activityDate}>{activity.date}</Text>
                        </View>
                        {activity.points > 0 && (
                          <View style={styles.activityPoints}>
                            <Ionicons name="star" size={16} color="#f59e0b" />
                            <Text style={styles.activityPointsText}>+{activity.points}</Text>
                          </View>
                        )}
                      </View>
                    </Card>
                  ))}

                  <TouchableOpacity
                    style={styles.viewMoreButton}
                    onPress={() => {
                      console.log("View more activity pressed")
                      // In a real app, you would load more activity items
                      alert("More activity history coming soon!")
                    }}
                  >
                    <Text style={styles.viewMoreText}>View More Activity</Text>
                    <Ionicons name="chevron-down" size={16} color="#22c55e" />
                  </TouchableOpacity>
                </View>
              )}
            </TabView>
          </View>

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
    marginLeft: 8,
  },
  profileCard: {
    margin: 16,
    padding: 16,
  },
  profileHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  profileImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileImageText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#166534",
    marginBottom: 2,
  },
  profileUsername: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 6,
  },
  profileMeta: {
    flexDirection: "row",
  },
  profileMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  profileMetaText: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 4,
  },
  levelContainer: {
    marginBottom: 16,
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  levelBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelText: {
    color: "#22c55e",
    fontWeight: "bold",
  },
  expText: {
    fontSize: 14,
    color: "#64748b",
  },
  statsContainer: {
    marginTop: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  tabsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#166534",
  },
  achievementsContainer: {
    marginTop: 16,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  badgeItem: {
    width: "30%",
    marginBottom: 20,
    alignItems: "center",
  },
  badgeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    position: "relative",
  },
  badgeLock: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#94a3b8",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeName: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  badgeEarned: {
    fontSize: 10,
    color: "#64748b",
    textAlign: "center",
  },
  badgeProgressContainer: {
    width: "100%",
    alignItems: "center",
  },
  badgeProgressBar: {
    width: "80%",
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    marginBottom: 4,
  },
  badgeProgressFill: {
    height: "100%",
    backgroundColor: "#94a3b8",
    borderRadius: 2,
  },
  badgeProgressText: {
    fontSize: 10,
    color: "#64748b",
  },
  activityContainer: {
    marginTop: 16,
  },
  activityCard: {
    marginBottom: 12,
    padding: 12,
  },
  activityContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: "#64748b",
  },
  activityPoints: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityPointsText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400e",
    marginLeft: 4,
  },
  viewMoreButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#22c55e",
    marginRight: 4,
  },
  bottomPadding: {
    height: 50,
  },
})
