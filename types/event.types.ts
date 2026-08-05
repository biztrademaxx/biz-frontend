// types/event.types.ts
export type SubscriptionTier = 'free' | 'gold' | 'platinum' | 'enterprise'

export interface OrganizerSubscription {
  tier: SubscriptionTier
  isActive: boolean
  features: {
    canFeature: boolean
    canVerify: boolean
    canPromote: boolean
    canVip: boolean
    organizerPlanSlug?: string 
    _loadingPlan?: boolean
  }
}