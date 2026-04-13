import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";

export type DeactivationSummary = {
  status: "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  requestId?: string;
  requestedAt?: string;
  reviewedAt?: string;
  deactivateEffectiveAt?: string;
  rejectReason?: string | null;
};

export type SettingsResponse = Record<string, unknown> & { deactivation?: DeactivationSummary };

export function useSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      return apiFetch<SettingsResponse>("/api/settings", { auth: true });
    },
    retry: 1,
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Record<string, unknown>) => {
      return apiFetch<{ message?: string; settings?: SettingsResponse }>("/api/settings", {
        method: "PATCH",
        body: newSettings,
        auth: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({ title: "Settings updated", description: "Your settings have been saved." });
    },
    onError: (err: Error) =>
      toast({ title: "Error updating settings", description: err.message, variant: "destructive" }),
  });

  const sendEmailVerification = useMutation({
    mutationFn: async (email: string) => {
      return apiFetch("/api/settings/verify", {
        method: "POST",
        body: { email },
        auth: true,
      });
    },
  });

  const verifyEmailCode = useMutation({
    mutationFn: async ({ code, email }: { code: string; email: string }) => {
      return apiFetch("/api/settings/verify", {
        method: "PUT",
        body: { code, email },
        auth: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const requestDeactivation = useMutation({
    mutationFn: async () => {
      return apiFetch<{ message?: string; settings?: SettingsResponse }>("/api/settings/account", {
        method: "PATCH",
        body: { action: "requestDeactivation" },
        auth: true,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({
        title: "Request submitted",
        description: data?.message ?? "An administrator will review your request.",
      });
    },
    onError: (err: Error) =>
      toast({ title: "Request failed", description: err.message, variant: "destructive" }),
  });

  const cancelDeactivationRequest = useMutation({
    mutationFn: async () => {
      return apiFetch<{ message?: string; settings?: SettingsResponse }>("/api/settings/account", {
        method: "PATCH",
        body: { action: "cancelDeactivationRequest" },
        auth: true,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({
        title: "Cancelled",
        description: data?.message ?? "Your pending request was withdrawn.",
      });
    },
    onError: (err: Error) =>
      toast({ title: "Could not cancel", description: err.message, variant: "destructive" }),
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateSettings.mutate,
    sendEmailVerification: sendEmailVerification.mutate,
    verifyEmailCode: verifyEmailCode.mutate,
    requestDeactivation: requestDeactivation.mutate,
    cancelDeactivationRequest: cancelDeactivationRequest.mutate,
    isUpdating: updateSettings.isPending,
    isSendingCode: sendEmailVerification.isPending,
    isVerifyingCode: verifyEmailCode.isPending,
    isRequestingDeactivation: requestDeactivation.isPending,
    isCancellingDeactivation: cancelDeactivationRequest.isPending,
  };
}
