// lib/get-organizer-plan.ts
import { getAccessToken } from "@/lib/api"

export interface OrganizerPlanInfo {
  planSlug: string
  planName: string
  tier: 'free' | 'silver' | 'gold' | 'platinum'
  isActive: boolean
  expiresAt: string | null
  amountInr?: number
  billingNote?: string
  startedAt?: string | null
  razorpayPaymentId?: string | null
}

export async function getOrganizerPlansBatch(organizerIds: string[]): Promise<Map<string, OrganizerPlanInfo>> {
  try {
    const token = getAccessToken()
    if (!token) {
      console.warn('No access token available')
      return new Map()
    }
    
    const uniqueIds = [...new Set(organizerIds)]
    
    if (uniqueIds.length === 0) {
      return new Map()
    }
    
    console.log('📡 Sending organizer IDs to backend:', uniqueIds)
    
    // Use the non-admin endpoint with the correct port
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'
    const response = await fetch(`${backendUrl}/api/subscriptions/batch`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ organizerIds: uniqueIds }),
    })
    
    console.log('📡 Response status:', response.status)
    
    if (!response.ok) {
      console.error('❌ Batch fetch failed:', response.status, response.statusText)
      try {
        const errorData = await response.json()
        console.error('❌ Error details:', errorData)
      } catch (e) {
        console.error('❌ Could not parse error response')
      }
      return new Map()
    }
    
    const data = await response.json()
    console.log('✅ Response data:', data)
    
    // Convert object to Map
    const planMap = new Map<string, OrganizerPlanInfo>()
    Object.entries(data).forEach(([id, plan]) => {
      planMap.set(id, plan as OrganizerPlanInfo)
    })
    
    console.log('✅ Plan map size:', planMap.size)
    return planMap
  } catch (error) {
    console.error('❌ Failed to fetch organizer plans:', error)
    return new Map()
  }
}

export async function getOrganizerPlan(organizerId: string): Promise<OrganizerPlanInfo | null> {
  try {
    const token = getAccessToken()
    if (!token) return null

    const response = await fetch(`/api/organizers/${organizerId}/subscription`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return {
          planSlug: 'organizer-free',
          planName: 'Free',
          tier: 'free',
          isActive: true,
          expiresAt: null,
        }
      }
      return null
    }
    
    const data = await response.json()
    return data.data || null
  } catch (error) {
    console.error('Failed to fetch organizer plan:', error)
    return null
  }
}