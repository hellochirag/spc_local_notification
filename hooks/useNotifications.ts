import notifee, {
    AuthorizationStatus,
    EventType,
    Notification,
    TimestampTrigger,
    TriggerType,
    AndroidAction,
  } from '@notifee/react-native';
  
  class Notifications {
    constructor() {
      this.bootstrap();
      this.setupEventHandlers();
    }
  
    // Check if app was opened via a notification
    private async bootstrap() {
      const initialNotification = await notifee.getInitialNotification();
      if (initialNotification) {
        this.handleNotificationAction(initialNotification.notification);
      }
    }
  
    // Handle foreground and background notification actions
    private setupEventHandlers() {
      notifee.onForegroundEvent(({ type, detail }) => {
        if (type === EventType.PRESS && detail.notification) {
          this.handleNotificationAction(detail.notification);
        }
      });
  
      notifee.onBackgroundEvent(async ({ type, detail }) => {
        if (type === EventType.PRESS && detail.notification) {
          this.handleNotificationAction(detail.notification);
        }
      });
    }
  
    // Handle notification actions
    private async handleNotificationAction(notification: Notification) {
      const action = notification?.pressAction?.id;
  
      if (action === 'snooze') { 
        await this.snoozeNotification(notification);
      } else if (action === 'mark_done') {
        await notifee.cancelNotification(notification.id!);
      }
    }
  
    // Request notification permissions
    public async checkPermissions() {
      const settings = await notifee.requestPermission();
      return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
    }
  
    // Schedule a notification (Reminder or Task Notification)
    public async scheduleNotification({
      id,
      title,
      message,
      date,
      type,
    }: {
      id: string;
      title: string;
      message: string;
      date: Date;
      type: 'Reminder' | 'Task';
    }) {
      const hasPermissions = await this.checkPermissions();
      if (!hasPermissions) return;
  
      const actions: AndroidAction[] =
        type === 'Reminder'
          ? [
              { title: 'Snooze', pressAction: { id: 'snooze' } },
              { title: 'Mark as Done', pressAction: { id: 'mark_done' } },
            ]
          : [
              { title: 'Accept', pressAction: { id: 'accept' } },
              { title: 'Decline', pressAction: { id: 'decline' } },
            ];
  
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: date.getTime(),
      };
  
      await notifee.createTriggerNotification(
        {
          id,
          title,
          body: message,
          android: {
            channelId: 'default',
            pressAction: { id: 'default' },
            actions,
          },
          data: { id, type },
        },
        trigger
      );
    }
  
    // Snooze notification (reschedules for 10 minutes later)
    public async snoozeNotification(notification: Notification) {
      const newTime = new Date();
      newTime.setMinutes(newTime.getMinutes() + 10);
  
      await this.scheduleNotification({
        id: notification.id!,
        title: notification.title!,
        message: notification.body!,
        date: newTime,
        type: notification.data?.type,
      });
  
      await notifee.cancelNotification(notification.id!);
    }
  }
  
  export default new Notifications();