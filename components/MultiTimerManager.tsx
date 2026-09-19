import { Ionicons } from "@expo/vector-icons"
import React, { useEffect, useRef, useState } from "react"
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Vibration,
} from "react-native"
import * as Haptics from "expo-haptics"

interface Timer {
  id: string
  label: string
  stepNumber: number
  duration: number // in seconds
  remaining: number // in seconds
  isActive: boolean
  isPaused: boolean
  priority: "critical" | "normal" | "optional"
  startedAt?: number
}

interface MultiTimerManagerProps {
  visible: boolean
  onClose: () => void
  currentStep: number
  stepLabel?: string
}

export default function MultiTimerManager({
  visible,
  onClose,
  currentStep,
  stepLabel,
}: MultiTimerManagerProps) {
  const [timers, setTimers] = useState<Timer[]>([])
  const [showAddTimer, setShowAddTimer] = useState(false)
  const [newTimerMinutes, setNewTimerMinutes] = useState(5)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Main timer loop
  useEffect(() => {
    if (timers.some((t) => t.isActive && !t.isPaused)) {
      intervalRef.current = setInterval(() => {
        setTimers((prevTimers) =>
          prevTimers.map((timer) => {
            if (timer.isActive && !timer.isPaused && timer.remaining > 0) {
              const newRemaining = timer.remaining - 1

              // Timer completed
              if (newRemaining === 0) {
                handleTimerComplete(timer)
                return {
                  ...timer,
                  remaining: 0,
                  isActive: false,
                }
              }

              // Warning at 1 minute for critical timers
              if (newRemaining === 60 && timer.priority === "critical") {
                if (Platform.OS !== "web") {
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Warning,
                  )
                }
              }

              return {
                ...timer,
                remaining: newRemaining,
              }
            }
            return timer
          }),
        )
      }, 1000)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [timers])

  const handleTimerComplete = (timer: Timer) => {
    // Vibration pattern
    if (Platform.OS !== "web") {
      Vibration.vibrate([0, 500, 200, 500])
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }

    // Alert
    if (Platform.OS === "web") {
      alert(`⏰ Timer Complete!\n\n${timer.label}\n\nCheck your food now!`)
    } else {
      Alert.alert(
        "⏰ Timer Complete!",
        `${timer.label}\n\nCheck your food now!`,
        [{ text: "OK" }],
      )
    }
  }

  const addTimer = (minutes: number, label?: string) => {
    const newTimer: Timer = {
      id: Date.now().toString(),
      label: label || `Step ${currentStep + 1} - ${stepLabel || "Timer"}`,
      stepNumber: currentStep,
      duration: minutes * 60,
      remaining: minutes * 60,
      isActive: false,
      isPaused: false,
      priority: "normal",
    }

    setTimers([...timers, newTimer])
    setShowAddTimer(false)
    setNewTimerMinutes(5)
  }

  const startTimer = (id: string) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) =>
        timer.id === id
          ? {
              ...timer,
              isActive: true,
              isPaused: false,
              startedAt: Date.now(),
            }
          : timer,
      ),
    )
  }

  const pauseTimer = (id: string) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) =>
        timer.id === id ? { ...timer, isPaused: !timer.isPaused } : timer,
      ),
    )
  }

  const stopTimer = (id: string) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) =>
        timer.id === id
          ? {
              ...timer,
              isActive: false,
              isPaused: false,
              remaining: timer.duration,
            }
          : timer,
      ),
    )
  }

  const deleteTimer = (id: string) => {
    setTimers((prevTimers) => prevTimers.filter((timer) => timer.id !== id))
  }

  const addMinute = (id: string) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) =>
        timer.id === id
          ? {
              ...timer,
              remaining: timer.remaining + 60,
              duration: timer.duration + 60,
            }
          : timer,
      ),
    )
  }

  const removeMinute = (id: string) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) =>
        timer.id === id && timer.remaining > 60
          ? {
              ...timer,
              remaining: timer.remaining - 60,
              duration: timer.duration - 60,
            }
          : timer,
      ),
    )
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTimerColor = (timer: Timer) => {
    if (timer.remaining === 0) return "#ef4444"
    if (timer.remaining <= 60) return "#f59e0b"
    if (timer.priority === "critical") return "#dc2626"
    return "#22c55e"
  }

  const activeTimersCount = timers.filter((t) => t.isActive).length

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Timers ({activeTimersCount} active)
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1f2937" />
            </TouchableOpacity>
          </View>

          {/* Timers List */}
          <ScrollView style={styles.timersList} showsVerticalScrollIndicator={false}>
            {timers.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="timer-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyStateText}>No timers yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Add a timer to track your cooking steps
                </Text>
              </View>
            ) : (
              timers.map((timer) => (
                <View
                  key={timer.id}
                  style={[
                    styles.timerCard,
                    timer.isActive && styles.timerCardActive,
                  ]}
                >
                  {/* Timer Header */}
                  <View style={styles.timerHeader}>
                    <View style={styles.timerInfo}>
                      <Text style={styles.timerLabel} numberOfLines={1}>
                        {timer.label}
                      </Text>
                      {timer.priority === "critical" && (
                        <View style={styles.priorityBadge}>
                          <Ionicons
                            name="alert-circle"
                            size={12}
                            color="#dc2626"
                          />
                          <Text style={styles.priorityText}>Critical</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => deleteTimer(timer.id)}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>

                  {/* Timer Display */}
                  <View style={styles.timerDisplay}>
                    <Text
                      style={[
                        styles.timerTime,
                        { color: getTimerColor(timer) },
                      ]}
                    >
                      {formatTime(timer.remaining)}
                    </Text>
                    {timer.isActive && (
                      <View style={styles.timerProgress}>
                        <View
                          style={[
                            styles.timerProgressBar,
                            {
                              width: `${(timer.remaining / timer.duration) * 100}%`,
                              backgroundColor: getTimerColor(timer),
                            },
                          ]}
                        />
                      </View>
                    )}
                  </View>

                  {/* Timer Controls */}
                  <View style={styles.timerControls}>
                    {!timer.isActive ? (
                      <TouchableOpacity
                        style={[styles.controlButton, styles.startButton]}
                        onPress={() => startTimer(timer.id)}
                      >
                        <Ionicons name="play" size={20} color="white" />
                        <Text style={styles.controlButtonText}>Start</Text>
                      </TouchableOpacity>
                    ) : (
                      <>
                        <TouchableOpacity
                          style={[styles.controlButton, styles.pauseButton]}
                          onPress={() => pauseTimer(timer.id)}
                        >
                          <Ionicons
                            name={timer.isPaused ? "play" : "pause"}
                            size={20}
                            color="#166534"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.controlButton, styles.stopButton]}
                          onPress={() => stopTimer(timer.id)}
                        >
                          <Ionicons name="stop" size={20} color="#dc2626" />
                        </TouchableOpacity>
                      </>
                    )}

                    {/* Time Adjustment */}
                    <View style={styles.timeAdjust}>
                      <TouchableOpacity
                        style={styles.adjustButton}
                        onPress={() => removeMinute(timer.id)}
                        disabled={timer.remaining <= 60}
                      >
                        <Ionicons
                          name="remove"
                          size={16}
                          color={
                            timer.remaining <= 60 ? "#9ca3af" : "#4b5563"
                          }
                        />
                      </TouchableOpacity>
                      <Text style={styles.adjustLabel}>1m</Text>
                      <TouchableOpacity
                        style={styles.adjustButton}
                        onPress={() => addMinute(timer.id)}
                      >
                        <Ionicons name="add" size={16} color="#4b5563" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* Quick Add Buttons */}
          {!showAddTimer ? (
            <View style={styles.quickAddContainer}>
              <Text style={styles.quickAddLabel}>Quick Add:</Text>
              <View style={styles.quickAddButtons}>
                {[1, 3, 5, 10, 15].map((mins) => (
                  <TouchableOpacity
                    key={mins}
                    style={styles.quickAddButton}
                    onPress={() => addTimer(mins)}
                  >
                    <Text style={styles.quickAddButtonText}>{mins}m</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.customAddButton}
                onPress={() => setShowAddTimer(true)}
              >
                <Ionicons name="add-circle-outline" size={20} color="#22c55e" />
                <Text style={styles.customAddButtonText}>Custom Timer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.customTimerForm}>
              <Text style={styles.formLabel}>Add Custom Timer</Text>
              <View style={styles.minutePicker}>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() =>
                    setNewTimerMinutes(Math.max(1, newTimerMinutes - 1))
                  }
                >
                  <Ionicons name="remove" size={24} color="#22c55e" />
                </TouchableOpacity>
                <View style={styles.pickerValue}>
                  <Text style={styles.pickerValueText}>{newTimerMinutes}</Text>
                  <Text style={styles.pickerValueLabel}>minutes</Text>
                </View>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setNewTimerMinutes(newTimerMinutes + 1)}
                >
                  <Ionicons name="add" size={24} color="#22c55e" />
                </TouchableOpacity>
              </View>
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={[styles.formButton, styles.cancelButton]}
                  onPress={() => {
                    setShowAddTimer(false)
                    setNewTimerMinutes(5)
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.formButton, styles.addButton]}
                  onPress={() => addTimer(newTimerMinutes)}
                >
                  <Text style={styles.addButtonText}>Add Timer</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#166534",
  },
  closeButton: {
    padding: 4,
  },
  timersList: {
    maxHeight: 400,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4b5563",
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
  timerCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  timerCardActive: {
    borderColor: "#22c55e",
    backgroundColor: "#f0fdf4",
  },
  timerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  timerInfo: {
    flex: 1,
    marginRight: 8,
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#dc2626",
    marginLeft: 4,
  },
  deleteButton: {
    padding: 4,
  },
  timerDisplay: {
    alignItems: "center",
    marginBottom: 12,
  },
  timerTime: {
    fontSize: 48,
    fontWeight: "800",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  timerProgress: {
    width: "100%",
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    marginTop: 8,
    overflow: "hidden",
  },
  timerProgressBar: {
    height: "100%",
    borderRadius: 2,
  },
  timerControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 4,
  },
  startButton: {
    backgroundColor: "#22c55e",
    flex: 1,
    justifyContent: "center",
  },
  pauseButton: {
    backgroundColor: "#dcfce7",
    marginRight: 8,
  },
  stopButton: {
    backgroundColor: "#fee2e2",
    marginRight: 8,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  timeAdjust: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  adjustButton: {
    padding: 8,
  },
  adjustLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4b5563",
    marginHorizontal: 4,
  },
  quickAddContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  quickAddLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 12,
  },
  quickAddButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  quickAddButton: {
    flex: 1,
    backgroundColor: "#dcfce7",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  quickAddButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
  },
  customAddButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 8,
  },
  customAddButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#22c55e",
  },
  customTimerForm: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 16,
    textAlign: "center",
  },
  minutePicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  pickerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerValue: {
    alignItems: "center",
    marginHorizontal: 32,
  },
  pickerValueText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#166534",
  },
  pickerValueLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  formButtons: {
    flexDirection: "row",
    gap: 12,
  },
  formButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
  },
  addButton: {
    backgroundColor: "#22c55e",
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
})
