"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Pressable } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useAuth } from "@/hooks/useAuth"
import { userService } from "@/services/userService"
import { badgeService, type BadgeWithProgress } from "@/services/badgeService"

// Components
import Card from "@/components/Card"
import Badge from "@/components/Badge"
import ProgressBar from "@/components/ProgressBar"
import { LevelProgress } from "@/components/LevelProgress"
import TabView from "@/components/TabView"

const { width } = Dimensions.get("window")

interface UserStats {
  profile: any
  stats: {
    mealsCompleted: number
    challengesCompleted: number
    badgesEarned: number
  }
  levelProgress: {
    level: number
    currentLevelXp: number
    nextLevelXp: number
    progress: number
  } | null
}

interface ActivityItem {
  id: string
  type: string
  title: string
  points: number
  date: string
  icon: string
  color: string
}

export default function ProfileScreen() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState("achievements")
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [badges, setBadges] = useState<BadgeWithProgress[]>([])
  const [activityHistory, setActivityHistory] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Load user stats
      const stats = await userService.getUserStats(user.id)
      setUserStats(stats)

      // Load badges with progress
      const badgesData = await badgeService.getBadgesWithProgress(user.id)
      setBadges(badgesData)

      // Mock activity history for now - in a real app, this would come from the database
      const mockActivity: ActivityItem[] = [
        {
          id: "1",
          type: "recipe",
          title: "Completed a delicious recipe",
          points: 60,
          date: "Today",
          icon: "restaurant",
          color: "#22c55e",
        },
        {
          id: "2",
          type: "challenge",
          title: "Completed weekly challenge",
          points: 200,
          date: "Yesterday",
          icon: "trophy",
          color: "#f59e0b",
        },
        {
          id: "3",
          type: "level",
          title: `Reached Level ${stats.profile?.level || 1}`,
          points: 0,
          date: "2 days ago",
          icon: "star",
          color: "#3b82f6",
        },
      ]
      setActivityHistory(mockActivity)

    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.replace("/(auth)/login")
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading || !userStats?.profile) {
    return (
      <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  const profile = userStats.profile
  const levelProgress = userStats.levelProgress
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  })

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
                handleSignOut()
              }}
            >
              <Ionicons name="log-out-outline" size={24} color="#166534" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                console.log("Share profile pressed")
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
                <Text style={styles.profileImageText}>{profile.full_name?.charAt(0) || 'U'}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profile.full_name || 'User'}</Text>
                <Text style={styles.profileUsername}>@{profile.username || 'user'}</Text>
                <View style={styles.profileMeta}>
                  <View style={styles.profileMetaItem}>
                    <Ionicons name="calendar-outline" size={14} color="#64748b" />
                    <Text style={styles.profileMetaText}>Joined {joinDate}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.levelContainer}>
              <LevelProgress
                level={levelProgress?.level || profile.level}
                currentXp={levelProgress?.currentLevelXp ?? profile.experience}
                nextLevelXp={levelProgress?.nextLevelXp ?? 500}
                progress={levelProgress?.progress ?? ((profile.experience % 500) / 500)}
              />
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={[styles.statIconContainer, { backgroundColor: "#dcfce7" }]}>
                    <Ionicons name="flame" size={20} color="#22c55e" />
                  </View>
                  <Text style={styles.statValue}>{profile.streak_days}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>

                <View style={styles.statItem}>
                  <View style={[styles.statIconContainer, { backgroundColor: "#fef3c7" }]}>
                    <Ionicons name="star" size={20} color="#f59e0b" />
                  </View>
                  <Text style={styles.statValue}>{profile.total_points}</Text>
                  <Text style={styles.statLabel}>Total Points</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={[styles.statIconContainer, { backgroundColor: "#dbeafe" }]}>
                    <Ionicons name="restaurant" size={20} color="#3b82f6" />
                  </View>
                  <Text style={styles.statValue}>{userStats.stats.mealsCompleted}</Text>
                  <Text style={styles.statLabel}>Meals</Text>
                </View>

                <View style={styles.statItem}>
                  <View style={[styles.statIconContainer, { backgroundColor: "#f3e8ff" }]}>
                    <Ionicons name="trophy" size={20} color="#8b5cf6" />
                  </View>
                  <Text style={styles.statValue}>{userStats.stats.challengesCompleted}</Text>
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
                      text={`${badges.filter((b) => b.isEarned).length}/${badges.length}`}
                      color="#166534"
                      backgroundColor="#dcfce7"
                    />
                  </View>

                  <View style={styles.badgesGrid}>
                    {badges.map((badge) => (
                      <Pressable key={badge.id} style={styles.badgeItem}>
                        <View
                          style={[
                            styles.badgeIconContainer,
                            { backgroundColor: badge.isEarned ? badge.color : "#e2e8f0" },
                          ]}
                        >
                          <Ionicons
                            name={badge.icon as keyof typeof Ionicons.glyphMap}
                            size={24}
                            color={badge.isEarned ? "white" : "#94a3b8"}
                          />
                          {!badge.isEarned && (
                            <View style={styles.badgeLock}>
                              <Ionicons name="lock-closed" size={12} color="white" />
                            </View>
                          )}
                        </View>
                        <Text style={[styles.badgeName, { color: badge.isEarned ? "#1e293b" : "#94a3b8" }]}>
                          {badge.name}
                        </Text>
                        {badge.isEarned ? (
                          <Text style={styles.badgeEarned}>
                            {badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : 'Earned'}
                          </Text>
                        ) : (
                          <View style={styles.badgeProgressContainer}>
                            <View style={styles.badgeProgressBar}>
                              <View
                                style={[
                                  styles.badgeProgressFill,
                                  { width: `${(badge.progress / badge.requirement_value) * 100}%` },
                                ]}
                              />
                            </View>
                            <Text style={styles.badgeProgressText}>
                              {badge.progress}/{badge.requirement_value}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: "#166534",
    textAlign: "center",
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
