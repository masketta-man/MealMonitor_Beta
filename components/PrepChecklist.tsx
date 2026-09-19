import { Ionicons } from "@expo/vector-icons"
import React, { useState } from "react"
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import Button from "./Button"

interface Ingredient {
  id: string
  name: string
  amount: string
  category?: string
}

interface PrepItem {
  name: string
  amount: string
  prepInstructions?: string
  isPrepared: boolean
}

interface PrepChecklistProps {
  visible: boolean
  onClose: () => void
  onStartCooking: () => void
  recipeTitle: string
  ingredients: Ingredient[]
  prepTime: number
  servings?: number
}

export default function PrepChecklist({
  visible,
  onClose,
  onStartCooking,
  recipeTitle,
  ingredients,
  prepTime,
  servings,
}: PrepChecklistProps) {
  const [prepItems, setPrepItems] = useState<PrepItem[]>(
    ingredients.map((ing) => ({
      name: ing.name,
      amount: ing.amount,
      prepInstructions: generatePrepInstructions(ing.name),
      isPrepared: false,
    })),
  )

  const [equipmentChecked, setEquipmentChecked] = useState<{
    [key: string]: boolean
  }>({})

  // Generate suggested equipment based on recipe
  const suggestedEquipment = [
    "Cutting board",
    "Chef's knife",
    "Mixing bowls",
    "Measuring cups",
    "Measuring spoons",
    "Large pot or pan",
    "Wooden spoon",
  ]

  const togglePrepItem = (index: number) => {
    const newItems = [...prepItems]
    newItems[index].isPrepared = !newItems[index].isPrepared
    setPrepItems(newItems)
  }

  const toggleEquipment = (item: string) => {
    setEquipmentChecked({
      ...equipmentChecked,
      [item]: !equipmentChecked[item],
    })
  }

  const prepProgress =
    (prepItems.filter((item) => item.isPrepared).length / prepItems.length) *
    100
  const equipmentProgress =
    (Object.values(equipmentChecked).filter(Boolean).length /
      suggestedEquipment.length) *
    100

  const allPrepComplete =
    prepItems.every((item) => item.isPrepared) &&
    Object.keys(equipmentChecked).length === suggestedEquipment.length &&
    Object.values(equipmentChecked).every(Boolean)

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#1f2937" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Prep Checklist</Text>
            <Text style={styles.headerSubtitle}>{recipeTitle}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Cards */}
          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <Ionicons name="time-outline" size={24} color="#22c55e" />
              <Text style={styles.infoCardValue}>{prepTime}m</Text>
              <Text style={styles.infoCardLabel}>Prep Time</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="restaurant-outline" size={24} color="#22c55e" />
              <Text style={styles.infoCardValue}>{servings || 4}</Text>
              <Text style={styles.infoCardLabel}>Servings</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="nutrition-outline" size={24} color="#22c55e" />
              <Text style={styles.infoCardValue}>{ingredients.length}</Text>
              <Text style={styles.infoCardLabel}>Ingredients</Text>
            </View>
          </View>

          {/* Ingredients Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ingredients to Prepare</Text>
              <View style={styles.progressBadge}>
                <Text style={styles.progressText}>
                  {prepItems.filter((item) => item.isPrepared).length}/
                  {prepItems.length}
                </Text>
              </View>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${prepProgress}%` }]}
              />
            </View>

            <View style={styles.checklistItems}>
              {prepItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.checklistItem,
                    item.isPrepared && styles.checklistItemCompleted,
                  ]}
                  onPress={() => togglePrepItem(index)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      item.isPrepared && styles.checkboxChecked,
                    ]}
                  >
                    {item.isPrepared && (
                      <Ionicons name="checkmark" size={18} color="white" />
                    )}
                  </View>
                  <View style={styles.checklistContent}>
                    <View style={styles.itemHeader}>
                      <Text
                        style={[
                          styles.itemName,
                          item.isPrepared && styles.itemNameCompleted,
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[
                          styles.itemAmount,
                          item.isPrepared && styles.itemAmountCompleted,
                        ]}
                      >
                        {item.amount}
                      </Text>
                    </View>
                    {item.prepInstructions && (
                      <Text style={styles.prepInstructions}>
                        <Ionicons name="bulb-outline" size={12} color="#6b7280" />{" "}
                        {item.prepInstructions}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Equipment Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Equipment Needed</Text>
              <View style={styles.progressBadge}>
                <Text style={styles.progressText}>
                  {Object.values(equipmentChecked).filter(Boolean).length}/
                  {suggestedEquipment.length}
                </Text>
              </View>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${equipmentProgress}%` },
                ]}
              />
            </View>

            <View style={styles.checklistItems}>
              {suggestedEquipment.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.checklistItem,
                    equipmentChecked[item] && styles.checklistItemCompleted,
                  ]}
                  onPress={() => toggleEquipment(item)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      equipmentChecked[item] && styles.checkboxChecked,
                    ]}
                  >
                    {equipmentChecked[item] && (
                      <Ionicons name="checkmark" size={18} color="white" />
                    )}
                  </View>
                  <View style={styles.checklistContent}>
                    <Text
                      style={[
                        styles.itemName,
                        equipmentChecked[item] && styles.itemNameCompleted,
                      ]}
                    >
                      {item}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tips */}
          <View style={styles.tipsSection}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb" size={20} color="#f59e0b" />
              <Text style={styles.tipTitle}>Prep Tips</Text>
            </View>
            <Text style={styles.tipText}>
              • Read through all steps before starting{"\n"}
              • Prepare ingredients (mise en place) for smoother cooking{"\n"}
              • Have a clean workspace and trash bowl handy{"\n"}
              • Gather all equipment before you begin
            </Text>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {allPrepComplete ? (
            <Button
              text="🎉 Start Cooking!"
              color="white"
              backgroundColor="#22c55e"
              onPress={() => {
                onStartCooking()
                onClose()
              }}
              style={styles.startButton}
            />
          ) : (
            <View style={styles.footerInfo}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#6b7280"
              />
              <Text style={styles.footerText}>
                Check off all items to start cooking
              </Text>
            </View>
          )}
          <TouchableOpacity onPress={onClose} style={styles.skipButton}>
            <Text style={styles.skipButtonText}>Skip Prep Checklist</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

// Helper function to generate prep instructions
function generatePrepInstructions(ingredientName: string): string | undefined {
  const name = ingredientName.toLowerCase()

  if (name.includes("onion")) return "Dice or chop"
  if (name.includes("garlic")) return "Mince or crush"
  if (name.includes("carrot")) return "Peel and dice"
  if (name.includes("potato")) return "Peel and cube"
  if (name.includes("tomato")) return "Dice or slice"
  if (name.includes("pepper") || name.includes("bell pepper"))
    return "Remove seeds and dice"
  if (name.includes("chicken")) return "Cut into bite-sized pieces"
  if (name.includes("beef")) return "Cut into cubes"
  if (name.includes("cheese")) return "Grate or shred"
  if (name.includes("herb") || name.includes("parsley") || name.includes("basil"))
    return "Wash and chop"

  return undefined
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  closeButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#166534",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  infoCards: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoCardValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#166534",
    marginTop: 8,
  },
  infoCardLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
  },
  section: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  progressBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 4,
  },
  checklistItems: {
    gap: 8,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  checklistItemCompleted: {
    backgroundColor: "#f0fdf4",
    borderColor: "#22c55e",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  checklistContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  itemNameCompleted: {
    color: "#166534",
    textDecorationLine: "line-through",
  },
  itemAmount: {
    fontSize: 13,
    color: "#6b7280",
    marginLeft: 8,
  },
  itemAmountCompleted: {
    color: "#16a34a",
  },
  prepInstructions: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 4,
  },
  tipsSection: {
    backgroundColor: "#fffbeb",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fef3c7",
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400e",
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#78350f",
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    padding: 16,
    paddingBottom: 24,
  },
  startButton: {
    marginBottom: 12,
  },
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#6b7280",
  },
  skipButton: {
    paddingVertical: 8,
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
})
