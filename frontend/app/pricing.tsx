import React from 'react';
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
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../src/constants/theme';

const PLANS = [
  {
    id: 'free',
    name: 'Free Forever',
    price: '£0',
    period: '',
    features: [
      '2 Circles (up to 5 people each)',
      'Max 6 people total',
      'One-tap manual footprints',
      '✈️ Travel mode basic — always free',
      '🚨 Emergency alert — always free',
    ],
    note: 'Includes 1 month Premium trial',
    highlighted: false,
  },
  {
    id: 'plus',
    name: 'Reassura Plus',
    price: '£2.99',
    period: '/mo',
    features: [
      'Unlimited Circles',
      'Up to 10 people per circle',
      'Automatic footprints',
      '✈️ Travel mode + auto arrival',
      'Scheduled check-in windows',
      'Battery & driving alerts',
      '🚨 Emergency alert — always free',
    ],
    note: '1 month free, then £2.99/mo',
    highlighted: true,
  },
  {
    id: 'family',
    name: 'Family Plan',
    price: '£6.99',
    period: '/mo',
    features: [
      'Unlimited Circles',
      'Up to 20 people per circle',
      'All Plus features',
      '✈️ Full travel suite & itineraries',
      'Safety window alerts',
      'Peace Score dashboard',
      'Place detection & danger zones',
      'Driving behaviour reports',
      '🚨 Emergency alert — always free',
    ],
    note: '1 month free, then £6.99/mo',
    highlighted: false,
  },
];

export default function PricingScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose your plan</Text>
        <View style={{ width: 28 }} />
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Promise Banner */}
        <View style={styles.promiseBanner}>
          <Ionicons name="leaf" size={24} color={COLORS.sageGreen} />
          <View style={styles.promiseText}>
            <Text style={styles.promiseTitle}>The Reassura Promise</Text>
            <Text style={styles.promiseSubtitle}>
              Safety is never behind a paywall. Emergency alerts and core features are free, forever, for everyone.
            </Text>
          </View>
        </View>
        
        {/* Trial Note */}
        <Text style={styles.trialNote}>
          ✨ All plans include a FREE 1-month Premium trial
        </Text>
        
        {/* Plan Cards */}
        {PLANS.map(plan => (
          <View
            key={plan.id}
            style={[
              styles.planCard,
              plan.highlighted && styles.planCardHighlighted,
            ]}
          >
            {plan.highlighted && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>Most Popular</Text>
              </View>
            )}
            
            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.planPrice}>{plan.price}</Text>
              <Text style={styles.planPeriod}>{plan.period}</Text>
            </View>
            
            <View style={styles.featuresList}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Ionicons
                    name={feature.includes('🚨') ? 'shield-checkmark' : 'checkmark-circle'}
                    size={18}
                    color={feature.includes('🚨') ? COLORS.terracotta : COLORS.sageGreen}
                  />
                  <Text style={[
                    styles.featureText,
                    feature.includes('always free') && styles.featureTextHighlight,
                  ]}>{feature}</Text>
                </View>
              ))}
            </View>
            
            <Text style={styles.planNote}>{plan.note}</Text>
            
            <TouchableOpacity
              style={[
                styles.selectButton,
                plan.highlighted && styles.selectButtonHighlighted,
              ]}
            >
              <Text style={[
                styles.selectButtonText,
                plan.highlighted && styles.selectButtonTextHighlighted,
              ]}>
                {plan.id === 'free' ? 'Current Plan' : 'Start Free Trial'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🌿 Emergency alerts are always free on every plan
          </Text>
          <Text style={styles.footerSubtext}>
            Cancel anytime · No questions asked
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerTitle: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  promiseBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.sageDark,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'flex-start',
  },
  promiseText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  promiseTitle: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.sageGreen,
    fontSize: 15,
  },
  promiseSubtitle: {
    fontFamily: FONTS.body,
    color: COLORS.cream,
    fontSize: 13,
    marginTop: SPACING.xs,
    lineHeight: 18,
  },
  trialNote: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.gold,
    fontSize: 14,
    textAlign: 'center',
    marginVertical: SPACING.lg,
  },
  planCard: {
    backgroundColor: COLORS.backgroundCard,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardHighlighted: {
    borderColor: COLORS.sageGreen,
    backgroundColor: 'rgba(61, 46, 34, 0.95)',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: SPACING.lg,
    backgroundColor: COLORS.sageGreen,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  popularBadgeText: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.backgroundDark,
    fontSize: 11,
  },
  planName: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 22,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: SPACING.xs,
  },
  planPrice: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 36,
  },
  planPeriod: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 16,
    marginLeft: SPACING.xs,
  },
  featuresList: {
    marginTop: SPACING.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureText: {
    fontFamily: FONTS.body,
    color: COLORS.cream,
    fontSize: 14,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  featureTextHighlight: {
    color: COLORS.terracotta,
  },
  planNote: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 12,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  selectButton: {
    backgroundColor: COLORS.backgroundDark,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
  },
  selectButtonHighlighted: {
    backgroundColor: COLORS.sageGreen,
  },
  selectButtonText: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.white,
    fontSize: 15,
    textAlign: 'center',
  },
  selectButtonTextHighlighted: {
    color: COLORS.backgroundDark,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  footerText: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.sageGreen,
    fontSize: 14,
    textAlign: 'center',
  },
  footerSubtext: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
});