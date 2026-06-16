import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Language } from '@/lib/translations';

interface SiteContent {
  key: string;
  content_fr: string | null;
  content_en: string | null;
  content_ar: string | null;
  content_es: string | null;
  content_de: string | null;
  content_zh: string | null;
}

type TranslationMap = Record<string, Record<Language, string>>;

export const useTranslationSync = () => {
  const [dbTranslations, setDbTranslations] = useState<TranslationMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, content_fr, content_en, content_ar, content_es, content_de, content_zh')
          .eq('is_active', true);

        if (error) throw error;

        const translations: TranslationMap = {};
        
        (data as SiteContent[] || []).forEach((item) => {
          translations[item.key] = {
            fr: item.content_fr || '',
            en: item.content_en || '',
            ar: item.content_ar || '',
            es: item.content_es || '',
            de: item.content_de || '',
            zh: item.content_zh || '',
          };
        });

        setDbTranslations(translations);
      } catch (err) {
        console.error('Error fetching translations:', err);
        setError('Failed to load translations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslations();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('site_content_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_content',
        },
        () => {
          fetchTranslations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Function to get a translation with fallback to static translations
  const getTranslation = (key: string, language: Language, fallback: string = ''): string => {
    const dbValue = dbTranslations[key]?.[language];
    if (dbValue && dbValue.trim() !== '') {
      return dbValue;
    }
    return fallback;
  };

  return {
    dbTranslations,
    isLoading,
    error,
    getTranslation,
  };
};

export default useTranslationSync;
