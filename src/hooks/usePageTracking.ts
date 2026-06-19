import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const TRACKING_DOMAIN = "www.agricapital.ci";

const getVisitorId = (): string => {
  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
};

const getGeolocation = async (): Promise<{ country: string; city: string; latitude: number; longitude: number } | null> => {
  try {
    const response = await fetch('https://ipapi.co/json/', { 
      signal: AbortSignal.timeout(1500)
    });
    if (!response.ok) return null;
    const data = await response.json();
    return {
      country: data.country_name || 'Unknown',
      city: data.city || 'Unknown',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0
    };
  } catch {
    return null;
  }
};

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const trackVisit = async () => {
      if (location.pathname.startsWith('/admin')) return;

      try {
        const visitorId = getVisitorId();

        // Throttle: 1 visite par page max toutes les 30 minutes / visiteur
        const throttleKey = `visit_${location.pathname}`;
        const last = Number(sessionStorage.getItem(throttleKey) || 0);
        if (Date.now() - last < 30 * 60 * 1000) return;
        sessionStorage.setItem(throttleKey, String(Date.now()));

        const insertData: any = {
          page_path: location.pathname,
          visitor_id: visitorId,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
          domain: TRACKING_DOMAIN,
        };

        const { error } = await (supabase as any).from('page_visits').insert(insertData);
        if (error) {
          // surfaced for debugging si RLS/grants posent problème
          console.warn('page_visits insert error:', error.message);
          return;
        }

        // Géolocalisation en best-effort, mise à jour de la ligne ensuite (non bloquant)
        const geo = await getGeolocation();
        if (geo) {
          try {
            await (supabase as any)
              .from('page_visits')
              .update({
                country: geo.country,
                city: geo.city,
                latitude: geo.latitude,
                longitude: geo.longitude,
              })
              .eq('visitor_id', visitorId)
              .eq('page_path', location.pathname)
              .order('created_at', { ascending: false })
              .limit(1);
          } catch {/* ignore */}
        }
      } catch {
        // Silently fail
      }
    };

    trackVisit();
  }, [location.pathname]);
};

export default usePageTracking;
