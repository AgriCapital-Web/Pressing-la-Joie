import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, History, Send, Upload } from "lucide-react";
import AdminNewsletter from "./AdminNewsletter";
import AdminNewsletterHistory from "./AdminNewsletterHistory";
import AdminEmailCampaigns from "./AdminEmailCampaigns";
import AdminImportEmails from "./AdminImportEmails";

const TABS = ["abonnes", "campagnes", "historique", "import"] as const;
type TabKey = typeof TABS[number];

const pathToTab: Record<string, TabKey> = {
  "/admin/newsletter": "abonnes",
  "/admin/email-campaigns": "campagnes",
  "/admin/newsletter-history": "historique",
  "/admin/import-emails": "import",
};

const AdminCampagnes = () => {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const initial =
    (params.get("tab") as TabKey) ||
    pathToTab[location.pathname] ||
    "abonnes";
  const [tab, setTab] = useState<TabKey>(TABS.includes(initial) ? initial : "abonnes");

  useEffect(() => {
    setParams({ tab }, { replace: true });
  }, [tab, setParams]);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Campagnes & Newsletter</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Interface unifiée : abonnés, campagnes Brevo, historique et import IA
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="w-full">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full h-auto gap-1 p-1">
          <TabsTrigger value="abonnes" className="flex items-center gap-2 py-2.5">
            <Users size={16} /> <span>Abonnés</span>
          </TabsTrigger>
          <TabsTrigger value="campagnes" className="flex items-center gap-2 py-2.5">
            <Send size={16} /> <span>Campagnes</span>
          </TabsTrigger>
          <TabsTrigger value="historique" className="flex items-center gap-2 py-2.5">
            <History size={16} /> <span>Historique</span>
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2 py-2.5">
            <Upload size={16} /> <span>Import IA</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="abonnes" className="mt-4 -mx-4 lg:-mx-6">
          <AdminNewsletter />
        </TabsContent>
        <TabsContent value="campagnes" className="mt-4 -mx-4 lg:-mx-6">
          <AdminEmailCampaigns />
        </TabsContent>
        <TabsContent value="historique" className="mt-4 -mx-4 lg:-mx-6">
          <AdminNewsletterHistory />
        </TabsContent>
        <TabsContent value="import" className="mt-4 -mx-4 lg:-mx-6">
          <AdminImportEmails />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCampagnes;