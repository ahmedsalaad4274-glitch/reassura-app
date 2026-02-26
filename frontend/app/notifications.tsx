import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../src/constants/theme';
import { useAppStore } from '../src/store/appStore';
import { notificationApi } from '../src/services/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  related_user_id?: string;
  read: boolean;
  created_at: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'morning_prompt',
    title: 'Good morning! 👋',
    message: 'Leaving for work today? Let your circle know.',
    read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'safety_alert',
    title: "Jamie hasn't checked in",
    message: 'Jamie set a safety window ending at 8:00am.',
    related_user_id: 'user-jamie',
    read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    type: 'place_arrival',
    title: 'Mum has arrived at Home 🏠',
    message: 'She arrived just now.',
    related_user_id: 'user-mum',
    read: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '4',
    type: 'low_battery',
    title: "Dad's phone is at 12% 🔋",
    message: 'He may go offline soon.',
    related_user_id: 'user-dad',
    read: true,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '5',
    type: 'safe_arrival',
    title: 'Sara has landed safely in Lagos! 🌍',
    message: 'Send her a welcome message.',
    related_user_id: 'user-sara',
    read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'morning_prompt': return 'sunny';
      case 'safety_alert': return 'warning';
      case 'place_arrival': return 'home';
      case 'low_battery': return 'battery-dead';
      case 'driving_alert': return 'car';
      case 'check_in': return 'hand-left';
      case 'safe_arrival': return 'airplane';
      case 'sos': return 'alert-circle';
      default: return 'notifications';
    }
  };
  
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'safety_alert':
      case 'sos': return COLORS.terracotta;
      case 'morning_prompt': return COLORS.gold;
      case 'low_battery': return COLORS.gold;
      case 'safe_arrival': return COLORS.navyBlue;
      default: return COLORS.sageGreen;
    }
  };
  
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };
  
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A2E1E', '#0F0D0B']}
        style={styles.gradient}
      >
        {/* Lock Screen Style Header */}
        <View style={styles.lockHeader}>
          <Text style={styles.time}>{hours}:{minutes}</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
        
        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={COLORS.white} />
        </TouchableOpacity>
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {notifications.map(notification => (
            <View
              key={notification.id}
              style={[
                styles.notificationCard,
                notification.type === 'safety_alert' && styles.notificationCardAlert,
                notification.read && styles.notificationCardRead,
              ]}
            >
              <View style={styles.notificationHeader}>
                <View style={styles.appIcon}>
                  <Ionicons
                    name={getNotificationIcon(notification.type) as any}
                    size={16}
                    color={getNotificationColor(notification.type)}
                  />
                </View>
                <Text style={styles.appName}>Reassura</Text>
                <Text style={styles.notificationTime}>{formatTime(notification.created_at)}</Text>
              </View>
              
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              
              {!notification.read && (
                <View style={styles.actionButtons}>
                  {notification.type === 'morning_prompt' && (
                    <>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => router.push('/update-status')}
                      >
                        <Text style={[styles.actionButtonText, { color: COLORS.sageGreen }]}>
                          Update circle
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]}>
                        <Text style={styles.actionButtonTextSecondary}>Later</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {notification.type === 'safety_alert' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: 'rgba(196, 105, 79, 0.2)' }]}
                        onPress={() => router.push('/circles')}
                      >
                        <Text style={[styles.actionButtonText, { color: COLORS.terracotta }]}>
                          View circle
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]}>
                        <Text style={styles.actionButtonTextSecondary}>Dismiss</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
            </View>
          ))}
          
          {/* Empty state */}
          {notifications.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off" size={48} color={COLORS.muted} />
              <Text style={styles.emptyStateText}>No notifications</Text>
              <Text style={styles.emptyStateSubtext}>
                When your circle sends updates, they'll appear here
              </Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  lockHeader: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: SPACING.xl,
  },
  time: {
    fontFamily: FONTS.heading,
    color: COLORS.white,
    fontSize: 64,
    fontWeight: '300',
  },
  date: {
    fontFamily: FONTS.body,
    color: COLORS.white,
    fontSize: 16,
    marginTop: SPACING.xs,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 50,
  },
  notificationCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    backdropFilter: 'blur(10px)',
  },
  notificationCardAlert: {
    backgroundColor: 'rgba(196, 105, 79, 0.15)',
  },
  notificationCardRead: {
    opacity: 0.7,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  appIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  appName: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 13,
    flex: 1,
  },
  notificationTime: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 12,
  },
  notificationTitle: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.white,
    fontSize: 15,
    marginBottom: SPACING.xs,
  },
  notificationMessage: {
    fontFamily: FONTS.body,
    color: COLORS.cream,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
  actionButton: {
    backgroundColor: 'rgba(122, 158, 135, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
  },
  actionButtonSecondary: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionButtonText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
  },
  actionButtonTextSecondary: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyStateText: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 18,
    marginTop: SPACING.md,
  },
  emptyStateSubtext: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 14,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});