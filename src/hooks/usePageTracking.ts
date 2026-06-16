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
        // Don't await geolocation - fire and forget
        const geoPromise = getGeolocation();
        
        // Insert immediately without geo, then update
        const visitorId = getVisitorId();
        const insertData: any = {
          page_path: location.pathname,
          visitor_id: visitorId,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
          domain: TRACKING_DOMAIN,
        };

        // Try to get geo data quickly
        const geoData = await Promise.race([
          geoPromise,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000))
        ]);

        if (geoData) {
          insertData.country = geoData.country;
          insertData.city = geoData.city;
          insertData.latitude = geoData.latitude;
          insertData.longitude = geoData.longitude;
        }

        await supabase.from('page_visits').insert(insertData);
      } catch {
        // Silently fail
      }
    };

    trackVisit();
  }, [location.pathname]);
};

export default usePageTracking;
