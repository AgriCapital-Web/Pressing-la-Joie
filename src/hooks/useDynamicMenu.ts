import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, type Language } from "@/contexts/LanguageContext";

interface MenuItem {
  id: string;
  label: string;
  url: string | null;
  target: string;
  order_index: number;
  parent_id: string | null;
  children?: MenuItem[];
}

interface RawMenuItem {
  id: string;
  label_fr: string;
  label_en: string | null;
  label_ar: string | null;
  label_es: string | null;
  label_de: string | null;
  label_zh: string | null;
  url: string | null;
  target: string | null;
  order_index: number;
  parent_id: string | null;
  is_active: boolean;
}

export const useDynamicMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    fetchMenu();
  }, [language]);

  const fetchMenu = async () => {
    try {
      const { data, error } = await supabase
        .from('site_menu')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;

      const rawItems = data as RawMenuItem[];
      
      // Map raw items to menu items with proper language
      const mappedItems: MenuItem[] = rawItems.map((item) => ({
        id: item.id,
        label: getLabel(item, language),
        url: item.url,
        target: item.target || '_self',
        order_index: item.order_index,
        parent_id: item.parent_id,
      }));

      // Build tree structure
      const rootItems = mappedItems.filter(item => !item.parent_id);
      const tree = rootItems.map(item => ({
        ...item,
        children: mappedItems.filter(child => child.parent_id === item.id)
      }));

      setMenuItems(tree);
    } catch (error) {
      console.error("Error fetching menu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLabel = (item: RawMenuItem, lang: Language): string => {
    const key = `label_${lang}` as keyof RawMenuItem;
    return (item[key] as string) || item.label_fr;
  };

  return { menuItems, isLoading };
};

export default useDynamicMenu;
