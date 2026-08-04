'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getDashboardPlansForRole,
} from '@/lib/dashboard-packages';
import {
  activateFreeDashboardPlan,
  fetchCurrentDashboardPlan,
} from '@/lib/subscription-checkout';
import { PlanPaymentDialog } from '@/components/dashboard-packages/plan-payment-dialog';
import { getAccessToken } from '@/lib/api';
import './packages.css';

type BillingPeriod = 'MONTHLY' | 'QUARTERLY' | 'HALF-YEARLY' | 'YEARLY';

const BILLING_MULTIPLIERS: Record<BillingPeriod, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  'HALF-YEARLY': 6,
  YEARLY: 12
};

const BILLING_LABELS: Record<BillingPeriod, string> = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  'HALF-YEARLY': 'Half-Yearly',
  YEARLY: 'Yearly'
};

type PlanKey = 'free' | 'silver' | 'gold';

// Map display plans to actual subscription slugs (matching backend routes)
const PLAN_SLUG_MAP: Record<PlanKey, string> = {
  free: 'organizer-free',
  silver: 'organizer-silver',
  gold: 'organizer-gold'
};

// Display features for the comparison table
const DISPLAY_FEATURES: Record<PlanKey, {
  id: string;
  name: string;
  tier: string;
  monthlyPrice: number;
  planSlug: string;
  isFree: boolean;
  features: Array<{ key: string; value: any }>;
}> = {
  free: {
    id: 'free',
    name: 'Free',
    tier: 'Free',
    monthlyPrice: 0,
    planSlug: 'organizer-free',
    isFree: true,
    features: [
      { key: 'Pricing starts from', value: 'Free' },
      { key: 'Type of Listing', value: 'Standard' },
      { key: 'Event Visibility Boost', value: 'No Marketing' },
      { key: 'Credits per month', value: '0' },
      { key: 'Event Marked Premium', value: false },
      { key: 'Boost Search Result', value: false },
      { key: 'Banner on Event Search Page higher search ranking', value: false },
      { key: 'Feature Showcase on Targeted Country Search Pages', value: false },
      { key: 'Feature Showcase on Targeted City Search Pages', value: false },
      { key: 'Feature Showcase on Targeted Industry Search Pages', value: false },
      { key: 'Event Featured in Industry e-Newsletters bi-monthly', value: false },
      { key: 'Event Recommendation Widget Coverage', value: false },
      { key: 'Event Coverage on 10times Social Channels', value: false },
      { key: 'Priority Display Across Relevant Search Pages', value: false },
      { key: 'Feature Showcase on 10Times Homepage', value: false },
      { key: 'Search Infeed Slots', value: false },
      { key: 'Top 100 Page Banner', value: false },
      { key: 'Add-on Platform Value', value: true },
      { key: 'Leads & Messaging', value: true },
      { key: 'Advanced Platform Features', value: true },
      { key: 'Support', value: true },
    ]
  },
  silver: {
    id: 'silver',
    name: 'Silver',
    tier: 'Silver',
    monthlyPrice: 25000,
    planSlug: 'organizer-silver',
    isFree: false,
    features: [
      { key: 'Pricing starts from', value: '₹ 25,000 / month' },
      { key: 'Type of Listing', value: 'Highlighted' },
      { key: 'Event Visibility Boost', value: '5x' },
      { key: 'Credits per month', value: '500' },
      { key: 'Event Marked Premium', value: true },
      { key: 'Boost Search Result', value: true },
      { key: 'Banner on Event Search Page higher search ranking', value: true },
      { key: 'Feature Showcase on Targeted Country Search Pages', value: true },
      { key: 'Feature Showcase on Targeted City Search Pages', value: true },
      { key: 'Feature Showcase on Targeted Industry Search Pages', value: true },
      { key: 'Event Featured in Industry e-Newsletters bi-monthly', value: true },
      { key: 'Event Recommendation Widget Coverage', value: true },
      { key: 'Event Coverage on 10times Social Channels', value: false },
      { key: 'Priority Display Across Relevant Search Pages', value: false },
      { key: 'Feature Showcase on 10Times Homepage', value: false },
      { key: 'Search Infeed Slots', value: false },
      { key: 'Top 100 Page Banner', value: false },
      { key: 'Add-on Platform Value', value: true },
      { key: 'Leads & Messaging', value: true },
      { key: 'Advanced Platform Features', value: true },
      { key: 'Support', value: true },
    ]
  },
  gold: {
    id: 'gold',
    name: 'Gold',
    tier: 'Gold',
    monthlyPrice: 50000,
    planSlug: 'organizer-gold',
    isFree: false,
    features: [
      { key: 'Pricing starts from', value: '₹ 50,000 / month' },
      { key: 'Type of Listing', value: 'Highlighted' },
      { key: 'Event Visibility Boost', value: '10x' },
      { key: 'Credits per month', value: '1000' },
      { key: 'Event Marked Premium', value: true },
      { key: 'Boost Search Result', value: true },
      { key: 'Banner on Event Search Page higher search ranking', value: true },
      { key: 'Feature Showcase on Targeted Country Search Pages', value: true },
      { key: 'Feature Showcase on Targeted City Search Pages', value: true },
      { key: 'Feature Showcase on Targeted Industry Search Pages', value: true },
      { key: 'Event Featured in Industry e-Newsletters bi-monthly', value: true },
      { key: 'Event Recommendation Widget Coverage', value: true },
      { key: 'Event Coverage on 10times Social Channels', value: true },
      { key: 'Priority Display Across Relevant Search Pages', value: true },
      { key: 'Feature Showcase on 10Times Homepage', value: true },
      { key: 'Search Infeed Slots', value: true },
      { key: 'Top 100 Page Banner', value: true },
      { key: 'Add-on Platform Value', value: true },
      { key: 'Leads & Messaging', value: true },
      { key: 'Advanced Platform Features', value: true },
      { key: 'Support', value: true },
    ]
  }
};

const HIGHLIGHTED_FEATURES = [
  'Pricing starts from',
  'Type of Listing',
  'Event Visibility Boost',
  'Credits per month'
];

const planKeys: PlanKey[] = ['free', 'silver', 'gold'];

export default function PackagesPage() {
  const { toast } = useToast();
  const plans = getDashboardPlansForRole('ORGANIZER');
  
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('MONTHLY');
  const [currency] = useState<'INR' | 'USD'>('INR');
  const [currentPlanSlug, setCurrentPlanSlug] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [actionPlanId, setActionPlanId] = useState<string | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<any>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const loadCurrentPlan = async () => {
    try {
      // First check if we have a token
      const token = getAccessToken();
      if (!token) {
        setIsAuthenticated(false);
        setLoadingPlan(false);
        // Set a default plan for display
        const fallback = plans.find((p) => p.defaultCurrent)?.id ?? plans[0]?.id ?? null;
        setCurrentPlanSlug(fallback);
        return;
      }

      // Try to fetch the current plan
      const current = await fetchCurrentDashboardPlan('ORGANIZER');
      setIsAuthenticated(true);
      setCurrentPlanSlug(current.planSlug);
    } catch (error) {
      // Handle errors gracefully
      console.error('Failed to load current plan:', error);
      
      // Check if it's a 401/authentication error
      if (error instanceof Error && 
          (error.message.includes('401') || 
           error.message.includes('unauthorized') ||
           error.message.includes('token'))) {
        setIsAuthenticated(false);
        // Clear invalid token
        localStorage.removeItem('accessToken');
      } else {
        // For other errors, we might still be authenticated but couldn't fetch
        setIsAuthenticated(true);
      }
      
      // Set a default plan
      const fallback = plans.find((p) => p.defaultCurrent)?.id ?? plans[0]?.id ?? null;
      setCurrentPlanSlug(fallback);
    } finally {
      setLoadingPlan(false);
    }
  };

  useEffect(() => {
    void loadCurrentPlan();
  }, []);

  const handlePlanActivated = async () => {
    await loadCurrentPlan();
    toast({
      title: "Plan updated",
      description: "Your subscription is now active on this account.",
    });
  };

  const handleCta = async (planSlug: string, isFree: boolean) => {
    // Check authentication before proceeding
    if (isAuthenticated !== true) {
      toast({
        variant: "destructive",
        title: "Please log in",
        description: "You need to be logged in to subscribe to a plan.",
      });
      // Redirect to login page
      window.location.href = '/login?redirect=/packages';
      return;
    }

    // Find the actual plan from the dashboard packages
    const actualPlan = plans.find(p => p.id === planSlug);
    if (!actualPlan) {
      toast({
        variant: "destructive",
        title: "Plan not found",
        description: "The selected plan could not be found.",
      });
      return;
    }

    if (actualPlan.id === currentPlanSlug) {
      toast({
        title: "Already active",
        description: `You are already on the ${actualPlan.name} plan.`,
      });
      return;
    }

    if (isFree) {
      setActionPlanId(actualPlan.id);
      try {
        await activateFreeDashboardPlan('ORGANIZER', actualPlan.id);
        await handlePlanActivated();
        toast({
          title: "Plan activated",
          description: `You are now on the ${actualPlan.name} plan.`,
        });
      } catch (error) {
        console.error('Failed to activate free plan:', error);
        toast({
          variant: "destructive",
          title: "Could not switch plan",
          description: error instanceof Error ? error.message : "Please try again.",
        });
      } finally {
        setActionPlanId(null);
      }
      return;
    }

    // For paid plans, open payment dialog
    setCheckoutPlan(actualPlan);
    setPaymentOpen(true);
  };

  const isPlanActive = (planSlug: string) => {
    return isAuthenticated === true && currentPlanSlug === planSlug;
  };

  const renderFeatureValue = (value: any) => {
    if (value === true) {
      return <span className="check"></span>;
    }
    if (value === false || value === null || value === undefined) {
      return <span></span>;
    }
    return <span className="text-gray-700">{value}</span>;
  };

  const featureKeys = DISPLAY_FEATURES.free.features.map(f => f.key);

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">
              From Invisible to Unmissable
            </h1>
            <p className="mt-2 text-xl text-gray-600">
              Choose the plan that fits your event goals
            </p>
            {!loadingPlan && isAuthenticated === true && currentPlanSlug && (
              <p className="mt-2 text-sm text-gray-500">
                Current plan: <span className="font-semibold text-[#004A96]">
                  {currentPlanSlug === 'organizer-free' ? 'Free' : 
                   currentPlanSlug === 'organizer-silver' ? 'Silver' : 
                   currentPlanSlug === 'organizer-gold' ? 'Gold' : 'Free'}
                </span>
              </p>
            )}
            {!loadingPlan && isAuthenticated === false && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-2xl mx-auto">
                <p className="text-amber-800">
                  <span className="font-semibold">🔑 Please log in</span> to see your current plan and subscribe.
                  <button 
                    onClick={() => window.location.href = '/login?redirect=/packages'}
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Log in now
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-1">
              {Object.entries(BILLING_LABELS).map(([period, label]) => (
                <button
                  key={period}
                  onClick={() => setBillingPeriod(period as BillingPeriod)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    billingPeriod === period
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-1">
              <span className="text-sm text-gray-600 px-2">Currency:</span>
              <button
                className="px-3 py-1 rounded-md text-sm font-medium bg-blue-600 text-white"
              >
                INR ▼
              </button>
            </div>
          </div>

          {/* Feature Comparison Table */}
          <div className="mt-12">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full" id="compare-plan">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 w-1/3">
                        Feature
                      </th>
                      {planKeys.map((planKey) => {
                        const plan = DISPLAY_FEATURES[planKey];
                        const isPopular = planKey === 'gold';
                        const isActive = isPlanActive(plan.planSlug);
                        return (
                          <th key={planKey} className={`text-center py-4 px-6 ${isPopular ? 'bg-blue-50' : ''}`}>
                            <div>
                              <div className="text-lg font-bold text-gray-900">{plan.name}</div>
                              <div className="text-sm text-gray-500">{plan.tier}</div>
                              {isPopular && (
                                <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-0.5 rounded-full">
                                  Most Popular
                                </span>
                              )}
                              {isActive && (
                                <span className="inline-block mt-1 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-0.5 rounded-full">
                                  ✅ Active
                                </span>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {featureKeys.map((featureKey) => {
                      const isHighlighted = HIGHLIGHTED_FEATURES.includes(featureKey);
                      const isPricing = featureKey === 'Pricing starts from';
                      
                      return (
                        <tr 
                          key={featureKey} 
                          className={`border-b border-gray-100 ${isHighlighted ? 'bg-gray-50' : ''} ${isPricing ? 'border-t-2 border-gray-300' : ''}`}
                        >
                          <td className={`py-3 px-6 text-sm ${isHighlighted ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                            {featureKey}
                          </td>
                          {planKeys.map((planKey) => {
                            const plan = DISPLAY_FEATURES[planKey];
                            const feature = plan.features.find(f => f.key === featureKey);
                            const value = feature?.value;
                            const isPopular = planKey === 'gold';
                            
                            if (isPricing) {
                              return (
                                <td 
                                  key={`${planKey}-${featureKey}`} 
                                  className={`text-center py-3 px-6 font-bold ${isPopular ? 'bg-blue-50/50' : ''}`}
                                >
                                  {value}
                                </td>
                              );
                            }
                            
                            return (
                              <td 
                                key={`${planKey}-${featureKey}`} 
                                className={`text-center py-3 px-6 ${isPopular ? 'bg-blue-50/50' : ''}`}
                              >
                                {renderFeatureValue(value)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t border-gray-200">
                      <td className="py-6 px-6"></td>
                      {planKeys.map((planKey) => {
                        const plan = DISPLAY_FEATURES[planKey];
                        const isPopular = planKey === 'gold';
                        const isActive = isPlanActive(plan.planSlug);
                        const isProcessing = actionPlanId === plan.planSlug;
                        
                        return (
                          <td key={planKey} className="text-center py-6 px-6">
                            {loadingPlan ? (
                              <button
                                className="w-full py-3 px-4 rounded-lg font-medium bg-gray-200 text-gray-500 cursor-wait"
                                disabled
                              >
                                <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
                                Loading...
                              </button>
                            ) : isAuthenticated === false ? (
                              <button
                                onClick={() => window.location.href = '/login?redirect=/packages'}
                                className="w-full py-3 px-4 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                              >
                                Login to Subscribe
                              </button>
                            ) : isActive ? (
                              <button
                                className="w-full py-3 px-4 rounded-lg font-medium bg-emerald-100 text-emerald-700 cursor-default"
                                disabled
                              >
                                ✅ Active
                              </button>
                            ) : isProcessing ? (
                              <button
                                className="w-full py-3 px-4 rounded-lg font-medium bg-gray-200 text-gray-500 cursor-wait"
                                disabled
                              >
                                <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </button>
                            ) : (
                              <button
                                onClick={() => handleCta(plan.planSlug, plan.isFree)}
                                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                                  isPopular
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                                }`}
                              >
                                {plan.isFree ? 'Switch to Free' : 'BUY NOW'}
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-gray-500">
            Paid plans are processed securely via Razorpay. Subscription details appear in Admin → Subscriptions
            &amp; plans with payment reference and plan name.
          </p>
        </div>
      </div>

      <PlanPaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        role="ORGANIZER"
        plan={checkoutPlan}
        onSuccess={handlePlanActivated}
      />
    </>
  );
}