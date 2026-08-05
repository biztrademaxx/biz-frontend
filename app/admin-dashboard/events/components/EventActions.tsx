// app/admin-dashboard/events/components/EventActions.tsx
"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Star, Crown, ShieldCheck, Trash2, Megaphone, Lock, Sparkles, ArrowUpRight, Loader2 } from "lucide-react"
import type { Event } from "../types/event.types"
import { 
  canFeatureEvent, 
  canVerifyEvent, 
  canPromoteEvent, 
  canSetVIP,
  getPlanDisplayName,
  getUpgradeMessage,
  FEATURE_REQUIRED_TIER,
  hasAnyPremiumFeature,
  type SubscriptionFeature
} from "@/lib/subscription-features"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"

// Extended event type with loading state
type EventWithLoading = Event & {
  _loadingPlan?: boolean;
  organizerPlanSlug?: string;
}

interface EventActionsProps {
  event: EventWithLoading
  onStatusChange: (eventId: string, status: Event["status"]) => void
  onFeatureToggle: (eventId: string, current: boolean) => void
  onVipToggle: (eventId: string, current: boolean) => void
  onPublicToggle: (eventId: string, current: boolean) => void
  onDelete: (eventId: string) => void
  onPromote: (event: Event) => void
  onVerify: (event: Event) => void
}

function ActionItem({ 
  onClick, 
  disabled, 
  icon: Icon, 
  label, 
  planSlug,
  feature,
  role = 'ORGANIZER',
  upgradeLabel,
  showUpgrade = true,
  isLoading = false,
}: { 
  onClick: () => void
  disabled: boolean
  icon: any
  label: string
  planSlug: string
  feature: SubscriptionFeature
  role?: string
  upgradeLabel?: string
  showUpgrade?: boolean
  isLoading?: boolean
}) {
  const router = useRouter()
  const requiredTier = FEATURE_REQUIRED_TIER[feature]
  const planName = getPlanDisplayName(planSlug)
  
  const handleUpgrade = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/dashboard/subscription?role=${role}&upgrade=${planSlug}`)
  }
  
  const content = (
    <DropdownMenuItem 
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={disabled ? "opacity-50 cursor-not-allowed" : ""}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : disabled ? (
        <Lock className="w-4 h-4 mr-2" />
      ) : (
        <Icon className="w-4 h-4 mr-2" />
      )}
      {label}
      {disabled && showUpgrade && !isLoading && (
        <div className="ml-auto flex items-center gap-1">
          <span className="text-xs font-medium text-yellow-600">
            {upgradeLabel || `${requiredTier} only`}
          </span>
          <button
            onClick={handleUpgrade}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
          >
            Upgrade
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      )}
      {isLoading && (
        <span className="ml-auto text-xs text-muted-foreground">Loading...</span>
      )}
    </DropdownMenuItem>
  )

  if (disabled && !isLoading) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{content}</div>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-[240px]">
            <p className="font-medium">{getUpgradeMessage(planSlug, feature)}</p>
            {planSlug !== 'organizer-free' && (
              <p className="text-xs text-muted-foreground mt-1">
                Current: {planName}
              </p>
            )}
            <button
              onClick={handleUpgrade}
              className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Upgrade now <ArrowUpRight className="w-3 h-3" />
            </button>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return content
}

export function EventActions({
  event,
  onFeatureToggle,
  onVipToggle,
  onPublicToggle,
  onDelete,
  onPromote,
  onVerify,
}: EventActionsProps) {
  // Get plan slug from event
  const planSlug = event.organizerPlanSlug || 'organizer-free'
  const isLoadingPlans = event._loadingPlan === true
  
  // Check permissions based on plan
  const canFeature = canFeatureEvent(planSlug)
  const canVerify = canVerifyEvent(planSlug)
  const canPromote = canPromoteEvent(planSlug)
  const canVip = canSetVIP(planSlug)
  const isPremium = hasAnyPremiumFeature(planSlug)
  
  // Use correct event properties
  const isVerified = event.isVerified || false
  const isFeatured = event.isFeatured || event.featured || false
  const isVip = event.vip || false

  // If still loading, show loading state
  if (isLoadingPlans) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <div className="px-3 py-4 text-center">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
            <p className="text-xs text-muted-foreground mt-2">Loading plan info...</p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        {/* Featured - Gold & Platinum */}
        <ActionItem
          onClick={() => canFeature && onFeatureToggle(event.id, isFeatured)}
          disabled={!canFeature}
          icon={Star}
          label={isFeatured ? "Remove Featured" : "Mark Featured"}
          planSlug={planSlug}
          feature="canFeature"
        />

        {/* VIP - Platinum only */}
        <ActionItem
          onClick={() => canVip && onVipToggle(event.id, isVip)}
          disabled={!canVip}
          icon={Crown}
          label={isVip ? "Remove VIP" : "Mark VIP"}
          planSlug={planSlug}
          feature="canVip"
          upgradeLabel="Platinum only"
        />

        <DropdownMenuSeparator />

        {/* Public/Private - All plans */}
        <DropdownMenuItem onClick={() => onPublicToggle(event.id, !!event.isPublic)}>
          {event.isPublic ? "Make Private" : "Make Public"}
        </DropdownMenuItem>

        {/* Verify - Gold & Platinum */}
        <ActionItem
          onClick={() => canVerify && onVerify(event)}
          disabled={!canVerify}
          icon={ShieldCheck}
          label={isVerified ? "Remove Verification" : "Verify Event"}
          planSlug={planSlug}
          feature="canVerify"
        />

        {/* Promote - Gold & Platinum */}
        <ActionItem
          onClick={() => canPromote && onPromote(event)}
          disabled={!canPromote}
          icon={Megaphone}
          label="Promote"
          planSlug={planSlug}
          feature="canPromote"
        />

        <DropdownMenuSeparator />
        
        {/* Delete - All plans */}
        <DropdownMenuItem
          className="text-red-600"
          onClick={() => onDelete(event.id)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>

        {/* Show current plan */}
        <DropdownMenuSeparator />
        <div className="px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Plan:</span>
            <span className="text-xs font-medium">{getPlanDisplayName(planSlug)}</span>
            {isPremium && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">
                <Sparkles className="w-3 h-3" />
                Premium
              </span>
            )}
          </div>
          {!isPremium && planSlug !== 'organizer-free' && (
            <button
              onClick={() => window.location.href = `/dashboard/subscription?role=ORGANIZER&upgrade=${planSlug}`}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
            >
              Upgrade <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}