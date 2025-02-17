import React, { useState } from "react";
import {
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Menu, PaperProvider } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import notifee, {
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RootStackParamList = {
  Home: undefined;
  CreateNotification: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "CreateNotification">;

export default function CreateNotificationScreen() {

  const route = useRoute();
  const { index, notification } = route.params || {};

  const [title, setTitle] = useState(notification?.title || "");
  const [message, setMessage] = useState(notification?.message || "");
  const [date, setDate] = useState(notification?.date ? new Date(notification.date) : new Date());
  const [category, setCategory] = useState(notification?.category || "General");
  const [repeat, setRepeat] = useState(notification?.repeat || "None");
  const [notificationType, setNotificationType] = useState(notification?.notificationType || "Reminder");

  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [repeatMenuVisible, setRepeatMenuVisible] = useState(false);
  const navigation = useNavigation<any>();
  const notificationDetails = false;
  const [notificationTypeMenuVisible, setNotificationTypeMenuVisible] =
    useState(false);

  const saveNotification = async (notification: any) => {
    try {
      const existingNotifications = await AsyncStorage.getItem("notifications");
      const notifications = existingNotifications
        ? JSON.parse(existingNotifications)
        : [];

      notifications.push(notification);

      await AsyncStorage.setItem(
        "notifications",
        JSON.stringify(notifications)
      );
    } catch (error) {
      console.error("Error saving notification", error);
    }
  };

  const scheduleNotification = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert("Error", "Title and message cannot be empty.");
      return;
    }

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: "default",
      name: "Default Channel",
    });

    if (repeat !== "None") {
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: date.getTime(),
        repeatFrequency:
          repeat === "None"
            ? undefined
            : RepeatFrequency[repeat as keyof typeof RepeatFrequency],
      };

      await notifee.createTriggerNotification(
        {
          title: title,
          body: message,
          android: {
            channelId,
            smallIcon: "ic_launcher", // optional, defaults to 'ic_launcher'.
            // pressAction is needed if you want the notification to open the app when pressed
            pressAction: {
              id: "default",
            },
          },
        },
        trigger
      );
    }

    // Display a notification
    await notifee.displayNotification({
      title: title,
      body: message,
      ios: {
        interruptionLevel: "timeSensitive",
        criticalVolume: 0.9,
        foregroundPresentationOptions: {
          badge: true,
          sound: false,
          banner: true,
          list: true,
        },
      },
      android: {
        channelId,
        smallIcon: "ic_launcher", // optional, defaults to 'ic_launcher'.
        // pressAction is needed if you want the notification to open the app when pressed
        pressAction: {
          id: "default",
        },
      },
    });
    await notifee.incrementBadgeCount();
    const newNotification = {
      id: Date.now(),
      title,
      message,
      date: date.toLocaleString(),
      category,
      repeat,
      notificationType,
    };
    await saveNotification(newNotification);
    Alert.alert("Success", "Notification scheduled successfully.");
    navigation.navigate("(tabs)", { newNotification });
  };

  return (
    <PaperProvider>
      <ThemedView style={styles.container}>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Notification Title"
          placeholderTextColor="#999"
        />

        <TextInput
          style={[styles.input, styles.messageInput]}
          value={message}
          onChangeText={setMessage}
          placeholder="Message"
          placeholderTextColor="#999"
          multiline
        />

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowPicker(true)}
        >
          <ThemedText>{date.toLocaleString()}</ThemedText>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            display="default"
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <Menu
          visible={categoryMenuVisible}
          onDismiss={() => setCategoryMenuVisible(false)}
          anchor={
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setCategoryMenuVisible(true)}
            >
              <ThemedText>{category}</ThemedText>
            </TouchableOpacity>
          }
        >
          <Menu.Item
            onPress={() => {
              setCategory("General");
              setCategoryMenuVisible(false);
            }}
            title="General"
          />
          <Menu.Item
            onPress={() => {
              setCategory("Work");
              setCategoryMenuVisible(false);
            }}
            title="Work"
          />
          <Menu.Item
            onPress={() => {
              setCategory("Personal");
              setCategoryMenuVisible(false);
            }}
            title="Personal"
          />
        </Menu>
        <Menu
          visible={repeatMenuVisible}
          onDismiss={() => setRepeatMenuVisible(false)}
          anchor={
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setRepeatMenuVisible(true)}
            >
              <ThemedText>{repeat}</ThemedText>
            </TouchableOpacity>
          }
        >
          <Menu.Item
            onPress={() => {
              setRepeat("None");
              setRepeatMenuVisible(false);
            }}
            title="No Repeat"
          />
          <Menu.Item
            onPress={() => {
              setRepeat("Daily");
              setRepeatMenuVisible(false);
            }}
            title="Daily"
          />
          <Menu.Item
            onPress={() => {
              setRepeat("Weekly");
              setRepeatMenuVisible(false);
            }}
            title="Weekly"
          />
        </Menu>

        {/* Notification Type Selection */}
        <Menu
          visible={notificationTypeMenuVisible}
          onDismiss={() => setNotificationTypeMenuVisible(false)}
          anchor={
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setNotificationTypeMenuVisible(true)}
            >
              <ThemedText>{notificationType}</ThemedText>
            </TouchableOpacity>
          }
        >
          <Menu.Item
            onPress={() => {
              setNotificationType("Reminder");
              setNotificationTypeMenuVisible(false);
            }}
            title="Reminder"
          />
          <Menu.Item
            onPress={() => {
              setNotificationType("Task Notifications");
              setNotificationTypeMenuVisible(false);
            }}
            title="Task Notifications"
          />
        </Menu>

        <TouchableOpacity
          style={styles.createButton}
          onPress={scheduleNotification}
        >
          <ThemedText style={styles.createButtonText}>
            {notificationDetails
              ? "Update Notification"
              : "Create a Notification"}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 55,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#fff",
  },
  messageInput: {
    height: 80,
    textAlignVertical: "top",
  },
  picker: {
    height: 50,
    width: "100%",
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  dateButton: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  fab: {
    position: "absolute",
    right: 36,
    bottom: 96,
    backgroundColor: "black",
  },
  createButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
    position: "absolute",
    bottom: Platform?.OS === "ios" ? 55 : 120,
    left: 20,
    right: 20,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
