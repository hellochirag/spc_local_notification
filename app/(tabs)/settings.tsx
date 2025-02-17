import React, { useState } from "react";
import { StyleSheet, Platform, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { List, Switch, Modal, Portal, Button, RadioButton, PaperProvider } from "react-native-paper";
import { IconSymbol } from '@/components/ui/IconSymbol';
export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [sound, setSound] = useState("default");
  const [modalVisible, setModalVisible] = useState(false);
  const [reminderToggle, setReminderToggle] = useState(true);
  const [taskToggle, setTaskToggle] = useState(true);

  return (
    <PaperProvider>
    <ThemedView style={styles.container}>
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
        {/* Enable/Disable All Notifications */}
        <List.Item
          title="Enable Notifications"
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={() => setNotificationsEnabled(!notificationsEnabled)}
            />
          )}
        />

        {/* Sound Selection */}
        <List.Item
          title="Notification Sound"
          description={sound === "default" ? "Default Sound" : "Custom Sound"}
          right={() => (
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <ThemedText type="defaultSemiBold">Change</ThemedText>
            </TouchableOpacity>
          )}
        />

        {/* Toggle for Different Notification Types */}
        <List.Item
          title="Reminder Notifications"
          right={() => (
            <Switch value={reminderToggle} onValueChange={() => setReminderToggle(!reminderToggle)} />
          )}
        />
        <List.Item
          title="Task Notifications"
          right={() => (
            <Switch value={taskToggle} onValueChange={() => setTaskToggle(!taskToggle)} />
          )}
        />

        {/* Sound Selection Modal */}
        <Portal>
          <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modal}>
            <ThemedText type="subtitle">Select Notification Sound</ThemedText>
            <RadioButton.Group
              onValueChange={(newValue) => {
                setSound(newValue);
                setModalVisible(false);
              }}
              value={sound}
            >
              <RadioButton.Item label="Default Sound" value="default" />
              <RadioButton.Item label="Custom Sound" value="custom" />
            </RadioButton.Group>
            <Button onPress={() => setModalVisible(false)}>Close</Button>
          </Modal>
        </Portal>
      </ParallaxScrollView>
    </ThemedView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
});