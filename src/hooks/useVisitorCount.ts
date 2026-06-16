import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useVisitorCount = () => {
  const [totalVisitors, setTotalVisitors] = useState<number>(() => {
    // Load cached count instantly for fast display
    const cached = localStorage.getItem('cached_visitor_count');
    return cached ? parseInt(cached, 10) : 0;
  });
  const [isLoading, setIsLoading] = useState(() => !localStorage.getItem('cached_visitor_count'));

  useEffect(() => {
    let isMounted = true;

    const fetchVisitorCount = async () => {
      try {
        const { data, error } = await supabase.rpc('get_public_visitor_count');
        if (!error && typeof data === 'number' && isMounted) {
          setTotalVisitors(data);
          localStorage.setItem('cached_visitor_count', String(data));
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
        }
      )
      .subscribe();

    // Refresh every 30s instead of 15s to reduce load
    const interval = window.setInterval(fetchVisitorCount, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  return { totalVisitors, isLoading };
};

export default useVisitorCount;
