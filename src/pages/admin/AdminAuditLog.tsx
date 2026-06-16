import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  History, Search, Filter, User, Clock, Database, Eye, 
  Edit, Trash2, Plus, RefreshCw, FileText, Settings, Download
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_data: any;
  new_data: any;
  ip_address: string | null;
  user_agent: string | null;
  metadata: any;
  created_at: string;
}

const actionIcons: Record<string, any> = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  view: Eye,
  export: Download,
  settings: Settings,
};

const actionColors: Record<string, string> = {
  create: "bg-green-500/10 text-green-600 border-green-500/20",
  update: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  delete: "bg-red-500/10 text-red-600 border-red-500/20",
  view: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  export: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  settings: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

const AdminAuditLog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterEntity, setFilterEntity] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ["audit-logs", filterAction, filterEntity],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (filterAction !== "all") {
        query = query.eq("action", filterAction);
      }
      if (filterEntity !== "all") {
        query = query.eq("entity_type", filterEntity);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AuditLog[];
    },
  });

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.entity_id && log.entity_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const entityTypes = [...new Set(logs.map(l => l.entity_type))];
  const actionTypes = [...new Set(logs.map(l => l.action))];

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: "Création",
      update: "Modification",
      delete: "Suppression",
      view: "Consultation",
      export: "Export",
      settings: "Paramètres",
      login: "Connexion",
      logout: "Déconnexion",
    };
    return labels[action] || action;
  };

  const getEntityLabel = (entity: string) => {
    const labels: Record<string, string> = {
      testimonials: "Témoignages",
      news: "Actualités",
      partnership_requests: "Demandes partenariat",
      contact_messages: "Messages contact",
      newsletter_subscribers: "Abonnés newsletter",
      site_content: "Contenu site",
      site_pages: "Pages",
      site_settings: "Paramètres",
      user_roles: "Rôles utilisateurs",
      profiles: "Profils",
    };
    return labels[entity] || entity;
  };

  const stats = {
    total: logs.length,
    today: logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length,
    creates: logs.filter(l => l.action === "create").length,
    updates: logs.filter(l => l.action === "update").length,
    deletes: logs.filter(l => l.action === "delete").length,
  };

  return (
    <AdminLayout title="Journal d'Audit">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <History className="w-6 h-6 text-primary" />
              Journal d'Audit
            </h1>
            <p className="text-muted-foreground">Historique de toutes les actions administratives</p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total actions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-500">{stats.today}</p>
              <p className="text-xs text-muted-foreground">Aujourd'hui</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-500">{stats.creates}</p>
              <p className="text-xs text-muted-foreground">Créations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-500">{stats.updates}</p>
              <p className="text-xs text-muted-foreground">Modifications</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-500">{stats.deletes}</p>
              <p className="text-xs text-muted-foreground">Suppressions</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les actions</SelectItem>
                  {actionTypes.map(action => (
                    <SelectItem key={action} value={action}>{getActionLabel(action)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterEntity} onValueChange={setFilterEntity}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Entité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les entités</SelectItem>
                  {entityTypes.map(entity => (
                    <SelectItem key={entity} value={entity}>{getEntityLabel(entity)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Historique des actions ({filteredLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Chargement...
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Aucune action enregistrée</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredLogs.map((log) => {
                    const ActionIcon = actionIcons[log.action] || FileText;
                    return (
                      <div
                        key={log.id}
                        className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedLog(log)}
                      >
                        <div className={`p-2 rounded-lg ${actionColors[log.action] || "bg-gray-100"}`}>
                          <ActionIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{getActionLabel(log.action)}</span>
                            <Badge variant="outline">{getEntityLabel(log.entity_type)}</Badge>
                            {log.entity_id && (
                              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                                #{log.entity_id.slice(0, 8)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: fr })}</span>
                            {log.ip_address && (
                              <>
                                <span>•</span>
                                <span>IP: {log.ip_address}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails de l'action</DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Action</label>
                    <p className="font-medium">{getActionLabel(selectedLog.action)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Entité</label>
                    <p className="font-medium">{getEntityLabel(selectedLog.entity_type)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date</label>
                    <p className="font-medium">
                      {format(new Date(selectedLog.created_at), "PPP 'à' HH:mm:ss", { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">ID Entité</label>
                    <p className="font-medium font-mono text-sm">{selectedLog.entity_id || "N/A"}</p>
                  </div>
                </div>

                {selectedLog.ip_address && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Adresse IP</label>
                    <p className="font-medium">{selectedLog.ip_address}</p>
                  </div>
                )}

                {selectedLog.old_data && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Données précédentes</label>
                    <pre className="mt-1 p-3 bg-muted rounded-lg text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.old_data, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.new_data && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nouvelles données</label>
                    <pre className="mt-1 p-3 bg-muted rounded-lg text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.new_data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminAuditLog;
