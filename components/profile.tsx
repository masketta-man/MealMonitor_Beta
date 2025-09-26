import { View, Text, StyleSheet } from "react-native"

const Profile = () => {
  return (
    <View style={styles.container}>
      <Text>Profile Screen</Text>
      {/* Add profile content here */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 80, // Space for tab bar
  },
})

export default Profile
