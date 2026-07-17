import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleRoutineReminder(hour: number, minute: number, timeOfDay: 'AM' | 'PM'): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: timeOfDay === 'AM' ? '☀️ Morning Routine' : '🌙 Evening Routine',
      body: timeOfDay === 'AM'
        ? "Time to start your morning skincare! Glow up ✨"
        : "Don't forget your evening skincare routine 💆",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  return id;
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledReminders() {
  return Notifications.getAllScheduledNotificationsAsync();
}
