import {
  Image,
  StyleSheet,
  FlatList,
  Platform,
  Alert,
  View,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import { FAB } from "react-native-paper";
import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRoute, useNavigation } from "@react-navigation/native";
import React from "react";

export default function HomeScreen() {
  const [notifications, setNotifications] = useState<string[]>([]);
  const navigation = useNavigation<any>();
  const route = useRoute(); // Get navigation params

  useFocusEffect(
    React.useCallback(() => {
      loadNotifications();
    }, [route?.params?.newNotification]) // Reload when a new notification is added
  );

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const savedNotifications = await AsyncStorage.getItem("notifications");
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    } catch (error) {
      console.error("Error loading notifications", error);
    }
  };

  const deleteNotification = async (index: number) => {
    // const updatedNotifications = notifications.filter((_, i) => i !== index);
    // setNotifications(updatedNotifications);
    try {
      // Retrieve existing notifications from AsyncStorage
      const existingNotifications = await AsyncStorage.getItem("notifications");
      let notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
  
      // Remove the selected notification
      notifications = notifications.filter((_, i) => i !== index);
  
      // Save the updated list back to AsyncStorage
      await AsyncStorage.setItem("notifications", JSON.stringify(notifications));
  
      // Update state after deletion
      setNotifications(notifications);
    } catch (error) {
      console.error("Error deleting notification", error);
    }
  };

  const editNotification = (index: number) => {
    const notificationToEdit = notifications[index];

    navigation.navigate("create-notification", {
      index, // Pass index to update the notification later
      notification: notificationToEdit, // Pass existing notification data
    });
  };

  console.log("notifications", notifications);
  const renderItem = ({ item, index }: { item: string; index: number }) => (
    <Swipeable
      renderRightActions={() => (
        <View style={styles.swipeActions}>
          <TouchableOpacity onPress={() => editNotification(index)}>
            <MaterialIcons name="edit" size={24} color="blue" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteNotification(index)}>
            <MaterialIcons name="delete" size={24} color="red" />
          </TouchableOpacity>
        </View>
      )}
    >
      <ThemedView style={styles.notificationItem}>
        <ThemedText>{`${item?.title} :: ${item?.message}`}</ThemedText>
      </ThemedView>
    </Swipeable>
  );

  return (
    <ThemedView style={styles.container}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#dfdfdf", dark: "#1D3D47" }}
        headerImage={
          <Image
            source={require("@/assets/images/partial-react-logo.png")}
            style={styles.reactLogo}
          />
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Welcome! SPC</ThemedText>
          <HelloWave />
        </ThemedView>
        {notifications?.length > 0 && (
          <ThemedText type="subtitle">Upcoming Notifications</ThemedText>
        )}

        <FlatList
          data={notifications}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <ThemedView style={styles.emptyContainer}>
              <MaterialIcons name="notifications-off" size={50} color="#ccc" />
              <ThemedText style={styles.emptyText}>
                No upcoming notifications.
              </ThemedText>
            </ThemedView>
          }
        />
      </ParallaxScrollView>

      {/* Floating Action Button (FAB) */}
      <FAB
        style={styles.fab}
        icon="plus"
        color="white"
        onPress={() => navigation.navigate("create-notification")}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  notificationItem: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f4f4f4",
  },
  fab: {
    position: "absolute",
    right: 36,
    bottom: Platform?.OS === "ios" ? 116 : 30,
    backgroundColor: "black",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 300,
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
    marginTop: 10,
  },
  swipeActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: 100,
    padding: 10,
  },
});
