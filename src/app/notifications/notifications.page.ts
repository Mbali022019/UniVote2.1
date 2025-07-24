import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController } from '@ionic/angular';

interface Notification {
  id: string;
  type: 'voting' | 'poll' | 'results' | 'announcement' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  countdown?: number;
  actionRequired?: boolean;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: false,
})
export class NotificationsPage implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  selectedFilter: string = 'all';
  private countdownInterval: any;

  constructor(private navCtrl: NavController) {}

  ngOnInit() {
    this.loadNotifications();
    this.startCountdownTimer();
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  loadNotifications() {
    this.notifications = [
      {
        id: '1',
        type: 'voting',
        title: 'Voting Ends Soon!',
        message: 'Class Representative election voting ends in 2 hours. Make your voice heard!',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        priority: 'high',
        isRead: false,
        countdown: 7200, // 2 hours in seconds
        actionRequired: true,
        icon: 'ballot',
        color: 'danger'
      },
      {
        id: '2',
        type: 'results',
        title: 'Results Publishing Soon',
        message: 'Student Council election results will be published in 2 minutes. Stay tuned!',
        timestamp: new Date(Date.now() - 180000), // 3 minutes ago
        priority: 'high',
        isRead: false,
        countdown: 120, // 2 minutes in seconds
        actionRequired: false,
        icon: 'trophy',
        color: 'warning'
      },
      {
        id: '3',
        type: 'poll',
        title: 'New Poll Available',
        message: 'Vote for your preferred cafeteria menu for next week. Your opinion matters!',
        timestamp: new Date(Date.now() - 900000), // 15 minutes ago
        priority: 'medium',
        isRead: false,
        actionRequired: true,
        icon: 'restaurant',
        color: 'primary'
      },
      {
        id: '4',
        type: 'announcement',
        title: 'Voting Guidelines Updated',
        message: 'New guidelines for the upcoming elections have been posted. Please review before voting.',
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        priority: 'medium',
        isRead: true,
        actionRequired: false,
        icon: 'document-text',
        color: 'secondary'
      },
      {
        id: '5',
        type: 'voting',
        title: 'Final Hours to Vote',
        message: 'Library funding referendum voting closes at midnight. Final 6 hours remaining!',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        priority: 'high',
        isRead: false,
        countdown: 21600, // 6 hours in seconds
        actionRequired: true,
        icon: 'library',
        color: 'danger'
      },
      {
        id: '6',
        type: 'reminder',
        title: 'Voting Reminder',
        message: 'Don\'t forget to participate in the sports club leadership elections tomorrow.',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        priority: 'low',
        isRead: true,
        actionRequired: false,
        icon: 'time',
        color: 'medium'
      },
      {
        id: '7',
        type: 'poll',
        title: 'Quick Poll: Study Hours',
        message: 'Help us determine optimal library hours by participating in our 2-minute survey.',
        timestamp: new Date(Date.now() - 10800000), // 3 hours ago
        priority: 'low',
        isRead: false,
        actionRequired: true,
        icon: 'stats-chart',
        color: 'success'
      }
    ];

    this.filterNotifications();
  }

  startCountdownTimer() {
    this.countdownInterval = setInterval(() => {
      this.notifications.forEach(notification => {
        if (notification.countdown && notification.countdown > 0) {
          notification.countdown--;
        }
      });
    }, 1000);
  }

  formatCountdown(seconds: number): string {
    if (seconds <= 0) return 'Time expired';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s remaining`;
    } else {
      return `${secs}s remaining`;
    }
  }

  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  filterNotifications(filter: string = 'all') {
    this.selectedFilter = filter;
    
    if (filter === 'all') {
      this.filteredNotifications = [...this.notifications];
    } else if (filter === 'unread') {
      this.filteredNotifications = this.notifications.filter(n => !n.isRead);
    } else if (filter === 'urgent') {
      this.filteredNotifications = this.notifications.filter(n => n.priority === 'high');
    } else {
      this.filteredNotifications = this.notifications.filter(n => n.type === filter);
    }

    // Sort by priority and timestamp
    this.filteredNotifications.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }

  markAsRead(notification: Notification) {
    notification.isRead = true;
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.isRead = true);
  }

  deleteNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.filterNotifications(this.selectedFilter);
  }

  goBack() {
    this.navCtrl.back();
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  getUrgentCount(): number {
    return this.notifications.filter(n => n.priority === 'high' && !n.isRead).length;
  }

  onNotificationClick(notification: Notification) {
    this.markAsRead(notification);
    
    // Handle different notification types
    switch (notification.type) {
      case 'voting':
      case 'poll':
        // Navigate to voting/poll page
        console.log('Navigate to voting page');
        break;
      case 'results':
        // Navigate to results page
        console.log('Navigate to results page');
        break;
      default:
        // Just mark as read
        break;
    }
  }

  trackByFn(index: number, item: Notification): string {
    return item.id;
  }
}
