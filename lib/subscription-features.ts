// lib/subscription-features.ts
import type { CurrentDashboardPlan } from "@/lib/dashboard-packages"

export type SubscriptionFeature = 
  | 'canFeature'
  | 'canVerify' 
  | 'canPromote'
  | 'canVip'
  | 'canMakePublic'
  | 'canDelete'

export type SubscriptionFeatures = Record<SubscriptionFeature, boolean>

// Map plan slugs to their features based on your dashboard plans
const PLAN_FEATURES: Record<string, SubscriptionFeatures> = {
  // Visitor plans
  'visitor-free': {
    canFeature: false,
    canVerify: false,
    canPromote: false,
    canVip: false,
    canMakePublic: true,
    canDelete: true,
  },
  'visitor-user': {
    canFeature: false,
    canVerify: false,
    canPromote: false,
    canVip: false,
    canMakePublic: true,
    canDelete: true,
  },
  'visitor-premium': {
    canFeature: false,
    canVerify: false,
    canPromote: false,
    canVip: false,
    canMakePublic: true,
    canDelete: true,
  },

  // Exhibitor plans
  'exhibitor-basic': {
    canFeature: false,
    canVerify: false,
    canPromote: false,
    canVip: false,
    canMakePublic: true,
    canDelete: true,
  },
  'exhibitor-standard': {
    canFeature: false,
    canVerify: false,
    canPromote: false,
    canVip: false,
    canMakePublic: true,
    canDelete: true,
  },
  'exhibitor-premium': {
    canFeature: false,
    canVerify: false,
    canPromote: false,
    canVip: false,
    canMakePublic: true,
    canDelete: true,
  },

  // Organizer plans - GOLD and PLATINUM get premium features
  'organizer-free': {
    canFeature: false,
    canVerify: false,
    canPromote: false,
    canVip: false,
    canMakePublic: true,
    canDelete: true,
  },
  'organizer-silver': {
    canFeature: false,
    canVerify: false,
    canPromote: false,
    canVip: false,
    canMakePublic: true,
    canDelete: true,
  },
  'organizer-gold': {
    canFeature: true,
    canVerify: true,
    canPromote: true,
    canVip: false, // Only Platinum gets VIP
    canMakePublic: true,
    canDelete: true,
  },
  'organizer-platinum': {
    canFeature: true,
    canVerify: true,
    canPromote: true,
    canVip: true, // Platinum only
    canMakePublic: true,
    canDelete: true,
  },
}

// Plan display names for UI
const PLAN_DISPLAY_NAMES: Record<string, string> = {
  'organizer-free': 'Free',
  'organizer-silver': 'Silver',
  'organizer-gold': 'Gold',
  'organizer-platinum': 'Platinum',
  'visitor-free': 'Visitor Free',
  'visitor-user': 'Visitor User',
  'visitor-premium': 'Visitor Premium',
  'exhibitor-basic': 'Exhibitor Basic',
  'exhibitor-standard': 'Exhibitor Standard',
  'exhibitor-premium': 'Exhibitor Premium',
}

const PLAN_TIER_LEVELS: Record<string, number> = {
  'organizer-free': 0,
  'organizer-silver': 1,
  'organizer-gold': 2,
  'organizer-platinum': 3,
  'visitor-free': 0,
  'visitor-user': 1,
  'visitor-premium': 2,
  'exhibitor-basic': 0,
  'exhibitor-standard': 1,
  'exhibitor-premium': 2,
}

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  'organizer-free': { bg: '#F3F4F6', text: '#6B7280' },
  'organizer-silver': { bg: '#E5E7EB', text: '#374151' },
  'organizer-gold': { bg: '#FEF3C7', text: '#92400E' },
  'organizer-platinum': { bg: '#DBEAFE', text: '#1E40AF' },
}

// Required tier for each premium feature
export const FEATURE_REQUIRED_TIER: Record<SubscriptionFeature, string> = {
  canFeature: 'Gold',
  canVerify: 'Gold',
  canPromote: 'Gold',
  canVip: 'Platinum',
  canMakePublic: 'Free',
  canDelete: 'Free',
}

export function getPlanFeatures(planSlug: string): SubscriptionFeatures {
  return PLAN_FEATURES[planSlug] || PLAN_FEATURES['organizer-free']
}

export function canFeatureEvent(planSlug: string): boolean {
  return getPlanFeatures(planSlug).canFeature
}

export function canVerifyEvent(planSlug: string): boolean {
  return getPlanFeatures(planSlug).canVerify
}

export function canPromoteEvent(planSlug: string): boolean {
  return getPlanFeatures(planSlug).canPromote
}

export function canSetVIP(planSlug: string): boolean {
  return getPlanFeatures(planSlug).canVip
}

export function getPlanDisplayName(planSlug: string): string {
  return PLAN_DISPLAY_NAMES[planSlug] || planSlug
}

export function getPlanTierLevel(planSlug: string): number {
  return PLAN_TIER_LEVELS[planSlug] ?? 0
}

export function getPlanColor(planSlug: string): { bg: string; text: string } {
  return TIER_COLORS[planSlug] || { bg: '#F3F4F6', text: '#6B7280' }
}

export function getUpgradeMessage(planSlug: string, feature: SubscriptionFeature): string {
  const currentPlan = getPlanDisplayName(planSlug)
  const requiredTier = FEATURE_REQUIRED_TIER[feature]
  return `${feature.replace('can', '')} requires ${requiredTier} subscription. Current: ${currentPlan}`
}

// Check if any premium feature is available
export function hasAnyPremiumFeature(planSlug: string): boolean {
  const features = getPlanFeatures(planSlug)
  return features.canFeature || features.canVerify || features.canPromote || features.canVip
}

// Get upgrade URL for a plan
export function getUpgradeUrl(planSlug: string, role: string): string {
  return `/dashboard/subscription?role=${role}&upgrade=${planSlug}`
}

// Helper to get organizer's plan from event
export function getOrganizerPlanFromEvent(event: { organizerPlanSlug?: string }): string {
  return event.organizerPlanSlug || 'organizer-free'
}