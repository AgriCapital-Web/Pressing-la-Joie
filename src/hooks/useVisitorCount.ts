import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const BASE_TOTAL = 3234;
const BASE_WEEKLY = 107;

export const useVisitorCount = () => {
  const [totalVisitors, setTotalVisitors] = useState<number>(() => {
    const cached = localStorage.getItem('cached_visitor_count');
    const v = cached ? parseInt(cached, 10) : 0;
    return Math.max(BASE_TOTAL, v);
  });
  const [weeklyVisitors, setWeeklyVisitors] = useState<number>(() => {
    const cached = localStorage.getItem('cached_weekly_count');
    const v = cached ? parseInt(cached, 10) : 0;
    return Math.max(BASE_WEEKLY, v);
  });
  const [isLoading, setIsLoading] = useState(() => !localStorage.getItem('cached_visitor_count'));

  useEffect(() => {
    let isMounted = true;

    const fetchVisitorCount = async () => {
      try {
        const { data, error } = await supabase.rpc('get_public_visitor_count');
        if (!error && typeof data === 'number' && isMounted) {
          const adjusted = Math.max(BASE_TOTAL, data + BASE_TOTAL);
          setTotalVisitors(adjusted);
          localStorage.setItem('cached_visitor_count', String(adjusted));
          const weekly = Math.max(BASE_WEEKLY, BASE_WEEKLY + Math.floor((data || 0) * 0.18));
          setWeeklyVisitors(weekly);
          localStorage.setItem('cached_weekly_count', String(weekly));
        }
      } catch (error) {
        console.error("Error fetching visitor count:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchVisitorCount();

    const channel = supabase
      .channel('visitor-count')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'page_visits' },
        () => {
          setTotalVisitors(prev => {
            const newVal = prev + 1;
            localStorage.setItem('cached_visitor_count', String(newVal));
            return newVal;
          });
          setWeeklyVisitors(prev => {
            const newVal = prev + 1;
            localStorage.setItem('cached_weekly_count', String(newVal));
            return newVal;
          });
        }
      )
      .subscribe();

    const interval = window.setInterval(fetchVisitorCount, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  return { totalVisitors, weeklyVisitors, isLoading };
};

export default useVisitorCount;
