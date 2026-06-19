import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const BASE_TOTAL = 3262; // 3234 + 28 visites de la semaine confirmées par l'admin
const BASE_WEEKLY = 135; // 107 + 28 visites de la semaine confirmées par l'admin

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
        // Lit le compteur agrégé public (table visitor_counters, lecture anon autorisée)
        const { data, error } = await (supabase as any)
          .from('visitor_counters')
          .select('total_visitors, weekly_visitors')
          .eq('id', 'public')
          .maybeSingle();
        if (!error && data && isMounted) {
          const total = Math.max(BASE_TOTAL, Number(data.total_visitors) || 0);
          const weekly = Math.max(BASE_WEEKLY, Number(data.weekly_visitors) || 0);
          setTotalVisitors(total);
          setWeeklyVisitors(weekly);
          localStorage.setItem('cached_visitor_count', String(total));
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
        { event: 'UPDATE', schema: 'public', table: 'visitor_counters' },
        () => {
          fetchVisitorCount();
        }
      )
      .subscribe();

    const interval = window.setInterval(fetchVisitorCount, 20000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  return { totalVisitors, weeklyVisitors, isLoading };
};

export default useVisitorCount;
