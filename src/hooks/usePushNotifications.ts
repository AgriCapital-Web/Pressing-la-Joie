import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PushNotificationState {
  isSupported: boolean;
  isEnabled: boolean;
  permission: NotificationPermission | null;
  subscription: PushSubscription | null;
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isEnabled: false,
    permission: null,
    subscription: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      
      if (isSupported) {
        const permission = Notification.permission;
        let subscription: PushSubscription | null = null;

        try {
          const registration = await navigator.serviceWorker.ready;
          subscription = await (registration as any).pushManager?.getSubscription() || null;
        } catch (e) {
          console.log('Error getting subscription:', e);
        }

        setState({
          isSupported: true,
          isEnabled: permission === 'granted' && subscription !== null,
          permission,
          subscription,
        });
      }
    };

    checkSupport();
  }, []);

  const requestPermission = useCallback(async () => {
    if (!state.isSupported) {
      return { success: false, error: 'Push notifications not supported' };
    }

    setIsLoading(true);
    
    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        setState(prev => ({ ...prev, permission, isEnabled: false }));
        return { success: false, error: 'Permission denied' };
      }

      // Register service worker if not already registered
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Create push subscription (without applicationServerKey for local notifications)
      // For real push from server, you'd need VAPID keys
      
      setState(prev => ({
        ...prev,
        permission,
        isEnabled: true,
      }));

      return { success: true };
    } catch (error) {
      console.error('Error requesting push permission:', error);
      return { success: false, error: String(error) };
    } finally {
      setIsLoading(false);
    }
  }, [state.isSupported]);

  const showNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (!state.isSupported || Notification.permission !== 'granted') {
      console.log('Cannot show notification - not permitted');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/favicon.png',
        badge: '/favicon.png',
        ...options,
      });
      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  }, [state.isSupported]);

  const disableNotifications = useCallback(async () => {
    try {
      if (state.subscription) {
        await state.subscription.unsubscribe();
      }
      setState(prev => ({
        ...prev,
        isEnabled: false,
        subscription: null,
      }));
      return { success: true };
    } catch (error) {
      console.error('Error disabling notifications:', error);
      return { success: false, error: String(error) };
    }
  }, [state.subscription]);

  return {
    ...state,
    isLoading,
    requestPermission,
    showNotification,
    disableNotifications,
  };
};

// Hook to listen for realtime events and trigger notifications
export const useAdminNotifications = () => {
  const { showNotification, isEnabled, permission } = usePushNotifications();

  useEffect(() => {
    if (permission !== 'granted') return;

    // Listen for new testimonials
    const testimonialsChannel = supabase
      .channel('admin-testimonials-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'testimonials' },
        (payload) => {
          const testimonial = payload.new as any;
          showNotification('Nouveau témoignage', {
            body: `${testimonial.first_name} ${testimonial.last_name} a laissé un témoignage`,
            tag: 'testimonial-' + testimonial.id,
            data: { url: '/admin/testimonials' },
          });
        }
      )
      .subscribe();

    // Listen for new newsletter subscribers
    const newsletterChannel = supabase
      .channel('admin-newsletter-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'newsletter_subscribers' },
        (payload) => {
          const subscriber = payload.new as any;
          showNotification('Nouvel abonné newsletter', {
            body: `${subscriber.email} s'est abonné à la newsletter`,
            tag: 'newsletter-' + subscriber.id,
            data: { url: '/admin/newsletter' },
          });
        }
      )
      .subscribe();

    // Listen for new contact messages
    const contactChannel = supabase
      .channel('admin-contact-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contact_messages' },
        (payload) => {
          const message = payload.new as any;
          showNotification('Nouveau message de contact', {
            body: `${message.name}: ${message.subject || 'Nouveau message'}`,
            tag: 'contact-' + message.id,
            data: { url: '/admin/contact-messages' },
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(testimonialsChannel);
      supabase.removeChannel(newsletterChannel);
      supabase.removeChannel(contactChannel);
    };
  }, [permission, showNotification]);
};

export default usePushNotifications;
