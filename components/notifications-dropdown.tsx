"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, ExternalLink, Clock, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { apiFetch } from "@/lib/api";

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchedOnce = useRef(false);

  useEffect(() => {
    if (open && !fetchedOnce.current) {
      fetchedOnce.current = true;
      fetchNotifications();
    }
  }, [open]);

  // ⭐ FINAL FIXED FETCH FUNCTION ⭐
  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const readIds = JSON.parse(localStorage.getItem("readPushNotifications") || "[]");

      const json = await apiFetch<{ success?: boolean; data?: any[] }>(
        `/api/marketing/push-notifications?status=all`,
        { auth: true },
      );
      if (!json.success) return;
      const list = (json.data ?? []).filter((n: any) => !readIds.includes(n.id));
      setNotifications(list);
      setUnreadCount(list.length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Mark one as read (PERMANENT HIDE) ⭐
  const markAsRead = (id: string) => {
    const readIds = JSON.parse(localStorage.getItem("readPushNotifications") || "[]");

    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem("readPushNotifications", JSON.stringify(readIds));
    }

    // Remove from UI
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => Math.max(prev - 1, 0));
  };

  // ⭐ Mark ALL as read (PERMANENT HIDE) ⭐
  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    localStorage.setItem("readPushNotifications", JSON.stringify(allIds));

    setNotifications([]);
    setUnreadCount(0);
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3 text-green-600" />;
      case "failed":
        return <AlertCircle className="h-3 w-3 text-red-600" />;
      case "scheduled":
        return <Clock className="h-3 w-3 text-blue-600" />;
      default:
        return <Clock className="h-3 w-3 text-gray-600" />;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
          <Bell className="h-5 w-5" />

          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-96 max-h-[80vh]" align="end" forceMount>
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="text-base font-semibold">Notifications</DropdownMenuLabel>

          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>

        <DropdownMenuSeparator />

        {loading ? (
          <div className="px-2 py-4 text-center">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="px-2 py-6 text-center text-gray-500">No notifications</div>
        ) : (
          <ScrollArea className="h-[400px]">
            {notifications.map((n) => (
              <div key={n.id}>
                <DropdownMenuItem
                  className={cn("flex flex-col items-start p-3 cursor-pointer hover:bg-gray-50")}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className="flex w-full justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(n.status)}
                      <span className="font-medium text-sm">{n.title}</span>
                    </div>

                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{n.body}</p>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
              </div>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
