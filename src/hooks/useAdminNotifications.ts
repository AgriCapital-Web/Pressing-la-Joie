import { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export const useAdminNotifications = () => {
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);

  // Récupérer les notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as AdminNotification[];
    },
  });

  // Calculer le nombre de non-lues
  useEffect(() => {
    const count = notifications.filter(n => !n.is_read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Marquer comme lue
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("admin_notifications")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
  });

  // Marquer toutes comme lues
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("admin_notifications")
        .update({ is_read: true })
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      toast.success("Toutes les notifications marquées comme lues");
    },
  });

  // Écouter les nouvelles notifications en temps réel
  useEffect(() => {
    const channel = supabase
      .channel("admin-notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_notifications",
        },
        (payload) => {
          const newNotification = payload.new as AdminNotification;
          
          // Afficher un toast
          toast.info(newNotification.title, {
            description: newNotification.message,
            duration: 5000,
          });

          // Demander la permission pour les notifications browser
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: "/favicon.png",
              tag: newNotification.id,
            });
          }

          // Rafraîchir la liste
          queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Demander la permission pour les notifications
  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      toast.error("Les notifications ne sont pas supportées par ce navigateur");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      toast.error("Les notifications sont bloquées. Activez-les dans les paramètres du navigateur.");
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      toast.success("Notifications activées");
      return true;
    } else {
      toast.error("Permission refusée pour les notifications");
      return false;
    }
  }, []);

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    requestNotificationPermission,
  };
};
