// components/MyPerformance.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    RefreshCw,
    Upload,
    Pencil,
    Calendar as CalendarIcon,
    Activity,
    TrendingUp,
    Award,
    Clock,
    CheckCircle,
    Eye,
} from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { formatLocalDateKey, parseLocalDateKey } from "@/lib/format-local-date-key";
import type { SubAdminActivityPoint } from "@/lib/sub-admin-activity-types";

// Import from api.ts (not admin-api.ts) since these functions are there
import {
    getCurrentUserId,
    getCurrentUserDisplayName,
    getCurrentUserEmail,
    getCurrentUserRole
} from "@/lib/api";

interface MyPerformanceData {
    adminId: string;
    name: string;
    email: string;
    role: string;
    totalCreated: number;
    totalUpdated: number;
    totalActions: number;
    dailyActivity: SubAdminActivityPoint[];
    streak: {
        currentStreak: number;
        bestStreak: number;
        lastActiveDate: string;
    };
}

export default function MyPerformance() {
    const [performanceData, setPerformanceData] = useState<MyPerformanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly">("daily");

    const fetchMyPerformance = async () => {
        setLoading(true);
        try {
            // Call the functions to get values
            const userId = getCurrentUserId();

            if (!userId) {
                console.error("User not authenticated");
                setLoading(false);
                return;
            }

            // Fetch data for the logged-in sub-admin only
            const res = await adminApi<{ data: any }>(`/analytics/sub-admin-activity/${userId}`);

            if (res?.data) {
                const dailyActivity = res.data.daily || [];

                // Calculate streak from daily activity
                let currentStreak = 0;
                let bestStreak = 0;
                let streakCount = 0;

                // Sort dates in descending order
                const sortedDates = [...dailyActivity]
                    .sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime());

                for (let i = 0; i < sortedDates.length; i++) {
                    const hasActivity = sortedDates[i].total > 0 || (sortedDates[i].totalUpdated ?? 0) > 0;
                    if (hasActivity) {
                        streakCount++;
                        bestStreak = Math.max(bestStreak, streakCount);
                    } else {
                        break;
                    }
                }
                currentStreak = streakCount;

                const lastActive = sortedDates.find(d => d.total > 0 || (d.totalUpdated ?? 0) > 0);

                setPerformanceData({
                    adminId: userId,
                    name: getCurrentUserDisplayName() || res.data.name || "Sub Admin",
                    email: getCurrentUserEmail() || res.data.email || "",
                    role: getCurrentUserRole() || "SUB_ADMIN",
                    totalCreated: res.data.totals?.total || 0,
                    totalUpdated: res.data.totalsUpdated?.totalUpdated || 0,
                    totalActions: (res.data.totals?.total || 0) + (res.data.totalsUpdated?.totalUpdated || 0),
                    dailyActivity: dailyActivity,
                    streak: {
                        currentStreak: currentStreak,
                        bestStreak: bestStreak,
                        lastActiveDate: lastActive?.period || new Date().toISOString()
                    }
                });
            } else {
                // No data available
                setPerformanceData({
                    adminId: userId,
                    name: getCurrentUserDisplayName() || "Sub Admin",
                    email: getCurrentUserEmail() || "",
                    role: getCurrentUserRole() || "SUB_ADMIN",
                    totalCreated: 0,
                    totalUpdated: 0,
                    totalActions: 0,
                    dailyActivity: [],
                    streak: {
                        currentStreak: 0,
                        bestStreak: 0,
                        lastActiveDate: new Date().toISOString()
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching performance:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyPerformance();
    }, []);

    const selectedDateKey = selectedDate ? formatLocalDateKey(selectedDate) : "";
    const selectedDateActivity = performanceData?.dailyActivity.find(
        (activity) => activity.period === selectedDateKey
    );

    const activeDates = useMemo(() => {
        if (!performanceData) return [];
        return performanceData.dailyActivity
            .filter(activity => activity.total > 0 || (activity.totalUpdated ?? 0) > 0)
            .map(activity => parseLocalDateKey(activity.period));
    }, [performanceData]);

    const getActivityData = () => {
        if (!performanceData) return [];
        return performanceData.dailyActivity.slice(-30);
    };

    const maxTotal = useMemo(() => {
        const activityData = getActivityData();
        if (activityData.length === 0) return 1;
        return Math.max(...activityData.map(a => a.total + (a.totalUpdated ?? 0)), 1);
    }, [getActivityData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!performanceData) {
        return (
            <Card>
                <CardContent className="text-center py-12">
                    <Activity className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No performance data available yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Start adding leads to see your performance metrics
                    </p>
                    <Button onClick={fetchMyPerformance} variant="outline" className="mt-4">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">My Performance</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track your leads, updates, and activity streak
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchMyPerformance}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* User Info Card */}
            {/* <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-blue-100 text-sm">Welcome back,</p>
                            <h3 className="text-xl font-bold">{performanceData.name}</h3>
                            <p className="text-blue-100 text-sm mt-1">{performanceData.email}</p>
                            <Badge className="mt-2 bg-white/20 text-white border-none">
                                {performanceData.role || "Sub Admin"}
                            </Badge>
                        </div>
                        <div className="text-right">
                            <p className="text-blue-100 text-sm">Total Actions</p>
                            <p className="text-3xl font-bold">{performanceData.totalActions}</p>
                            <p className="text-blue-100 text-sm mt-1">
                                {performanceData.totalCreated} created · {performanceData.totalUpdated} updated
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card> */}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Upload className="h-4 w-4 text-green-600" />
                            Total Created
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{performanceData.totalCreated}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Pencil className="h-4 w-4 text-blue-600" />
                            Total Updated
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{performanceData.totalUpdated}</div>
                    </CardContent>
                </Card>

                {/* <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-orange-600" />
                            Current Streak
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{performanceData.streak.currentStreak} days</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Best: {performanceData.streak.bestStreak} days
                        </p>
                    </CardContent>
                </Card> */}

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Award className="h-4 w-4 text-purple-600" />
                            Total Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{performanceData.totalActions}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Chart and Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Activity Overview</CardTitle>
                            <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
                                <TabsList className="h-8">
                                    <TabsTrigger value="daily" className="text-xs h-7">Daily</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {getActivityData().length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No activity data available yet
                                </div>
                            ) : (
                                getActivityData().slice(-14).map((activity, idx) => {
                                    const total = activity.total + (activity.totalUpdated ?? 0);
                                    const dateLabel = new Date(activity.period).toLocaleDateString();

                                    return (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">{dateLabel}</span>
                                                <span>+{activity.total} / {activity.totalUpdated ?? 0}↑</span>
                                            </div>
                                            <div className="h-8 bg-slate-100 rounded-lg overflow-hidden flex">
                                                <div
                                                    className="bg-green-500 h-full transition-all"
                                                    style={{ width: `${(activity.total / maxTotal) * 100}%` }}
                                                />
                                                <div
                                                    className="bg-blue-500 h-full transition-all"
                                                    style={{ width: `${((activity.totalUpdated ?? 0) / maxTotal) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            Your Activity Calendar
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            modifiers={{
                                hasActivity: activeDates
                            }}
                            modifiersClassNames={{
                                hasActivity: "bg-green-100 text-green-900 font-semibold rounded-full"
                            }}
                            className="mx-auto"
                        />
                        {selectedDateActivity && (
                            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                                <p className="text-sm font-medium mb-2">
                                    {selectedDate?.toLocaleDateString()}
                                </p>
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-600">Created: {selectedDateActivity.total}</span>
                                    <span className="text-blue-600">Updated: {selectedDateActivity.totalUpdated ?? 0}</span>
                                </div>
                            </div>
                        )}
                        {!selectedDateActivity && activeDates.length === 0 && (
                            <div className="text-center text-sm text-muted-foreground mt-4">
                                No activity recorded yet
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Streak Info */}
            {/* <Card className="bg-gradient-to-r from-orange-50 to-amber-50">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-100 rounded-full">
                                <TrendingUp className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Current Streak</p>
                                <p className="text-2xl font-bold text-orange-600">{performanceData.streak.currentStreak} days</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-amber-100 rounded-full">
                                <Award className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Best Streak</p>
                                <p className="text-2xl font-bold text-amber-600">{performanceData.streak.bestStreak} days</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-full">
                                <Clock className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Last Active</p>
                                <p className="text-sm font-medium">
                                    {new Date(performanceData.streak.lastActiveDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card> */}
        </div>
    );
}