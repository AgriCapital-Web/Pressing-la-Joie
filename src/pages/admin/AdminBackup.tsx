import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download, Upload, Database, Clock, CheckCircle2, AlertCircle,
  FileJson, FileSpreadsheet, Loader2, RefreshCw, HardDrive,
  Calendar, Shield, Trash2, Eye, Archive, Bell, Settings, Timer,
  CloudUpload, Play, Pause, FileCode
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface BackupTable {
  name: string;
  label: string;
  description: string;
  rowCount?: number;
  selected: boolean;
}

interface BackupHistory {
  id: string;
  created_at: string;
  backup_type: string;
  format: string;
  file_size: string | null;
  status: string | null;
  tables_included: string[] | null;
  destination: string | null;
  completed_at: string | null;
  error_message: string | null;
}

interface BackupSettings {
  id: string;
  auto_backup_enabled: boolean | null;
  backup_interval: string | null;
  backup_destination: string | null;
  last_backup_at: string | null;
  next_backup_at: string | null;
  google_drive_folder_id: string | null;
}

const AdminBackup = () => {
  const queryClient = useQueryClient();
  
  const [tables, setTables] = useState<BackupTable[]>([
    { name: "news", label: "Actualités", description: "Articles et publications", selected: true },
    { name: "newsletter_subscribers", label: "Abonnés Newsletter", description: "Liste des abonnés", selected: true },
    { name: "contact_messages", label: "Messages Contact", description: "Messages reçus", selected: true },
    { name: "partnership_requests", label: "Demandes Partenariat", description: "Demandes de partenaires", selected: true },
    { name: "testimonials", label: "Témoignages", description: "Avis clients", selected: true },
    { name: "page_visits", label: "Visites Pages", description: "Analytics", selected: false },
    { name: "ai_chat_logs", label: "Logs Chat IA", description: "Historique conversations", selected: false },
    { name: "visitor_contacts", label: "Contacts Visiteurs", description: "Coordonnées collectées", selected: true },
    { name: "site_content", label: "Contenu Site", description: "Textes et traductions", selected: true },
    { name: "site_pages", label: "Pages", description: "Configuration pages", selected: true },
    { name: "site_sections", label: "Sections", description: "Sections des pages", selected: true },
    { name: "site_menu", label: "Menu", description: "Navigation", selected: true },
    { name: "site_settings", label: "Paramètres", description: "Configuration site", selected: true },
    { name: "email_templates", label: "Templates Email", description: "Modèles emails", selected: true },
    { name: "user_roles", label: "Rôles Utilisateurs", description: "Permissions", selected: true },
    { name: "profiles", label: "Profils", description: "Infos utilisateurs", selected: true },
    { name: "audit_logs", label: "Journal Audit", description: "Historique actions", selected: true },
  ]);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "sql">("json");
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [backupInterval, setBackupInterval] = useState("daily");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Fetch backup settings
  const { data: backupSettings } = useQuery({
    queryKey: ["backup-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("backup_settings")
        .select("*")
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as BackupSettings | null;
    }
  });

  // Fetch backup history
  const { data: backupHistory = [], isLoading: isLoadingHistory, refetch: refetchHistory } = useQuery({
    queryKey: ["backup-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("backup_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as BackupHistory[];
    }
  });

  // Update backup settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<BackupSettings>) => {
      const { data: existing } = await supabase
        .from("backup_settings")
        .select("id")
        .limit(1)
        .single();
      
      if (existing) {
        const { error } = await supabase
          .from("backup_settings")
          .update({
            ...settings,
            updated_at: new Date().toISOString()
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("backup_settings")
          .insert([settings]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backup-settings"] });
      toast.success("Paramètres de sauvegarde mis à jour");
    }
  });

  // Initialize settings from DB
  useEffect(() => {
    if (backupSettings) {
      setAutoBackupEnabled(backupSettings.auto_backup_enabled || false);
      setBackupInterval(backupSettings.backup_interval || "daily");
    }
  }, [backupSettings]);

  const loadTableCounts = async () => {
    setIsLoadingCounts(true);
    try {
      const updatedTables = await Promise.all(
        tables.map(async (table) => {
          try {
            const { count, error } = await supabase
              .from(table.name as any)
              .select("*", { count: "exact", head: true });
            
            if (error) throw error;
            return { ...table, rowCount: count || 0 };
          } catch {
            return { ...table, rowCount: 0 };
          }
        })
      );
      setTables(updatedTables);
      toast.success("Compteurs actualisés");
    } catch (error) {
      console.error("Error loading counts:", error);
      toast.error("Erreur lors du chargement des compteurs");
    } finally {
      setIsLoadingCounts(false);
    }
  };

  const toggleTable = (name: string) => {
    setTables(tables.map(t => 
      t.name === name ? { ...t, selected: !t.selected } : t
    ));
  };

  const selectAll = () => {
    setTables(tables.map(t => ({ ...t, selected: true })));
  };

  const deselectAll = () => {
    setTables(tables.map(t => ({ ...t, selected: false })));
  };

  const saveAutoBackupSettings = async () => {
    const nextBackup = new Date();
    if (backupInterval === "daily") {
      nextBackup.setDate(nextBackup.getDate() + 1);
    } else if (backupInterval === "weekly") {
      nextBackup.setDate(nextBackup.getDate() + 7);
    } else if (backupInterval === "monthly") {
      nextBackup.setMonth(nextBackup.getMonth() + 1);
    }

    await updateSettingsMutation.mutateAsync({
      auto_backup_enabled: autoBackupEnabled,
      backup_interval: backupInterval,
      next_backup_at: autoBackupEnabled ? nextBackup.toISOString() : null
    });
  };

  const recordBackupHistory = async (status: string, format: string, size: string, tables: string[], errorMsg?: string) => {
    try {
      await supabase.from("backup_history").insert([{
        backup_type: "manual",
        format,
        file_size: size,
        status,
        tables_included: tables,
        destination: "local",
        completed_at: status === "completed" ? new Date().toISOString() : null,
        error_message: errorMsg || null
      }]);
      refetchHistory();
    } catch (error) {
      console.error("Error recording backup history:", error);
    }
  };

  const exportData = async () => {
    const selectedTables = tables.filter(t => t.selected);
    if (selectedTables.length === 0) {
      toast.error("Sélectionnez au moins une table");
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      const backupData: Record<string, any[]> = {};
      const totalTables = selectedTables.length;

      for (let i = 0; i < selectedTables.length; i++) {
        const table = selectedTables[i];
        
        const { data, error } = await supabase
          .from(table.name as any)
          .select("*");

        if (error) {
          console.error(`Error exporting ${table.name}:`, error);
          backupData[table.name] = [];
        } else {
          backupData[table.name] = data || [];
        }

        setExportProgress(Math.round(((i + 1) / totalTables) * 100));
      }

      const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm", { locale: fr });
      const size = calculateSize(backupData);

      if (exportFormat === "json") {
        const jsonStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        downloadBlob(blob, `agricapital_backup_${timestamp}.json`);
      } else if (exportFormat === "csv") {
        for (const [tableName, data] of Object.entries(backupData)) {
          if (data.length > 0) {
            const csvContent = convertToCSV(data);
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            downloadBlob(blob, `agricapital_${tableName}_${timestamp}.csv`);
          }
        }
      } else if (exportFormat === "sql") {
        const sqlContent = convertToSQL(backupData);
        const blob = new Blob([sqlContent], { type: "text/plain;charset=utf-8;" });
        downloadBlob(blob, `agricapital_backup_${timestamp}.sql`);
      }

      await recordBackupHistory("completed", exportFormat.toUpperCase(), size, selectedTables.map(t => t.name));

      if (notificationsEnabled) {
        toast.success(`✅ Backup ${exportFormat.toUpperCase()} généré avec succès ! (${size})`);
      }
    } catch (error) {
      console.error("Export error:", error);
      await recordBackupHistory("failed", exportFormat.toUpperCase(), "0", selectedTables.map(t => t.name), String(error));
      toast.error("Erreur lors de l'export");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return "";
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map(row => 
        headers.map(h => {
          const val = row[h];
          if (val === null || val === undefined) return "";
          if (typeof val === "object") return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(",")
      )
    ];
    return csvRows.join("\n");
  };

  const convertToSQL = (data: Record<string, any[]>): string => {
    let sql = `-- AgriCapital Database Backup\n-- Generated: ${new Date().toISOString()}\n\n`;
    
    for (const [tableName, rows] of Object.entries(data)) {
      if (rows.length === 0) continue;
      
      sql += `-- Table: ${tableName}\n`;
      sql += `-- ${rows.length} records\n\n`;
      
      for (const row of rows) {
        const columns = Object.keys(row).join(", ");
        const values = Object.values(row).map(v => {
          if (v === null) return "NULL";
          if (typeof v === "number") return v;
          if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
          if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
          return `'${String(v).replace(/'/g, "''")}'`;
        }).join(", ");
        
        sql += `INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`;
      }
      sql += "\n";
    }
    
    return sql;
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const calculateSize = (data: Record<string, any[]>): string => {
    const size = new Blob([JSON.stringify(data)]).size;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Terminé</Badge>;
      case "failed":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Échoué</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">En cours</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const selectedCount = tables.filter(t => t.selected).length;
  const totalRows = tables.filter(t => t.selected).reduce((sum, t) => sum + (t.rowCount || 0), 0);

  return (
    <AdminLayout title="Backup & Export">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Database className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              Sauvegarde des Données
            </h1>
            <p className="text-sm text-muted-foreground">Exportez et programmez vos sauvegardes automatiques</p>
          </div>
          <Button variant="outline" onClick={loadTableCounts} disabled={isLoadingCounts} className="w-full sm:w-auto">
            {isLoadingCounts ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Actualiser les compteurs
          </Button>
        </div>

        <Tabs defaultValue="export" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="export" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Exporter</span>
              <span className="sm:hidden">Export</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Timer className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Programmé</span>
              <span className="sm:hidden">Auto</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Historique</span>
              <span className="sm:hidden">Hist.</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                      <Database className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg sm:text-2xl font-bold">{tables.length}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Tables</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-lg sm:text-2xl font-bold">{selectedCount}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Sélectionnées</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg">
                      <HardDrive className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-lg sm:text-2xl font-bold">{totalRows.toLocaleString()}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Lignes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-amber-500/10 rounded-lg">
                      <Archive className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-lg sm:text-2xl font-bold">{backupHistory.length}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Backups</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Table Selection */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-base sm:text-lg">Sélection des Tables</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Choisissez les données à exporter</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={selectAll}>
                        Tout
                      </Button>
                      <Button variant="outline" size="sm" onClick={deselectAll}>
                        Aucun
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[350px] sm:h-[400px] pr-2 sm:pr-4">
                    <div className="space-y-2 sm:space-y-3">
                      {tables.map((table) => (
                        <div
                          key={table.name}
                          className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border transition-colors cursor-pointer ${
                            table.selected ? "bg-primary/5 border-primary/30" : "bg-muted/30 hover:bg-muted/50"
                          }`}
                          onClick={() => toggleTable(table.name)}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Checkbox
                              checked={table.selected}
                              onCheckedChange={() => toggleTable(table.name)}
                            />
                            <div>
                              <p className="font-medium text-sm">{table.label}</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground">{table.description}</p>
                            </div>
                          </div>
                          {table.rowCount !== undefined && (
                            <Badge variant="secondary" className="text-[10px] sm:text-xs">
                              {table.rowCount.toLocaleString()}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Options d'Export</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Configuration du backup</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  {/* Format Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm">Format de fichier</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div
                        className={`p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-colors text-center ${
                          exportFormat === "json" 
                            ? "border-primary bg-primary/5" 
                            : "border-muted hover:border-primary/50"
                        }`}
                        onClick={() => setExportFormat("json")}
                      >
                        <FileJson className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 text-amber-500" />
                        <p className="font-medium text-xs sm:text-sm">JSON</p>
                      </div>
                      <div
                        className={`p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-colors text-center ${
                          exportFormat === "csv" 
                            ? "border-primary bg-primary/5" 
                            : "border-muted hover:border-primary/50"
                        }`}
                        onClick={() => setExportFormat("csv")}
                      >
                        <FileSpreadsheet className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 text-green-500" />
                        <p className="font-medium text-xs sm:text-sm">CSV</p>
                      </div>
                      <div
                        className={`p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-colors text-center ${
                          exportFormat === "sql" 
                            ? "border-primary bg-primary/5" 
                            : "border-muted hover:border-primary/50"
                        }`}
                        onClick={() => setExportFormat("sql")}
                      >
                        <FileCode className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 text-blue-500" />
                        <p className="font-medium text-xs sm:text-sm">SQL</p>
                      </div>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-sm">Notifications</Label>
                    </div>
                    <Switch
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>

                  {/* Progress */}
                  {isExporting && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Export en cours...</span>
                        <span>{exportProgress}%</span>
                      </div>
                      <Progress value={exportProgress} />
                    </div>
                  )}

                  {/* Export Button */}
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={exportData}
                    disabled={isExporting || selectedCount === 0}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Export en cours...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger le Backup
                      </>
                    )}
                  </Button>

                  {/* Info */}
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <div className="flex gap-2">
                      <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-700 dark:text-blue-300">
                        <p className="font-medium mb-1">Backup sécurisé</p>
                        <p>Données exportées localement sans serveurs tiers.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Auto Backup Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="w-5 h-5" />
                    Sauvegarde Automatique
                  </CardTitle>
                  <CardDescription>
                    Programmez des backups automatiques réguliers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {autoBackupEnabled ? (
                        <Play className="w-5 h-5 text-green-500" />
                      ) : (
                        <Pause className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium">Backup automatique</p>
                        <p className="text-xs text-muted-foreground">
                          {autoBackupEnabled ? "Activé" : "Désactivé"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={autoBackupEnabled}
                      onCheckedChange={setAutoBackupEnabled}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Fréquence de sauvegarde</Label>
                    <Select value={backupInterval} onValueChange={setBackupInterval}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Toutes les heures</SelectItem>
                        <SelectItem value="daily">Quotidien</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        <SelectItem value="monthly">Mensuel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {backupSettings?.next_backup_at && autoBackupEnabled && (
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-500" />
                        <div className="text-sm">
                          <span className="text-muted-foreground">Prochain backup: </span>
                          <span className="font-medium">
                            {format(new Date(backupSettings.next_backup_at), "PPP 'à' HH:mm", { locale: fr })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={saveAutoBackupSettings}
                    disabled={updateSettingsMutation.isPending}
                    className="w-full"
                  >
                    {updateSettingsMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Settings className="w-4 h-4 mr-2" />
                    )}
                    Enregistrer les paramètres
                  </Button>
                </CardContent>
              </Card>

              {/* Cloud Backup Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CloudUpload className="w-5 h-5" />
                    Stockage Cloud
                  </CardTitle>
                  <CardDescription>
                    Synchronisez vos backups avec le cloud
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-700 dark:text-amber-300 mb-1">
                          Fonctionnalité bientôt disponible
                        </p>
                        <p className="text-muted-foreground text-xs">
                          L'intégration Google Drive et autres services cloud sera disponible prochainement. En attendant, téléchargez vos backups localement et stockez-les manuellement sur votre cloud préféré.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium">Services supportés (à venir)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 border rounded-lg opacity-50">
                        <p className="font-medium text-sm">Google Drive</p>
                        <p className="text-xs text-muted-foreground">Synchronisation auto</p>
                      </div>
                      <div className="p-3 border rounded-lg opacity-50">
                        <p className="font-medium text-sm">Dropbox</p>
                        <p className="text-xs text-muted-foreground">Stockage sécurisé</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Archive className="w-5 h-5" />
                      Historique des Backups
                    </CardTitle>
                    <CardDescription>
                      Liste des sauvegardes effectuées
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => refetchHistory()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualiser
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingHistory ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : backupHistory.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">Aucun backup effectué</p>
                    <p className="text-sm">Lancez un export pour créer votre premier backup</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {backupHistory.map((backup) => (
                        <div
                          key={backup.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-lg gap-3"
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className={`p-2 rounded-lg ${
                              backup.status === "completed" 
                                ? "bg-green-500/10" 
                                : "bg-red-500/10"
                            }`}>
                              {backup.status === "completed" ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                Backup {format(new Date(backup.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {backup.tables_included?.slice(0, 3).join(", ")}
                                {backup.tables_included && backup.tables_included.length > 3 && ` +${backup.tables_included.length - 3} autres`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 ml-11 sm:ml-0">
                            <Badge variant="outline">{backup.format}</Badge>
                            {backup.file_size && (
                              <span className="text-xs text-muted-foreground">{backup.file_size}</span>
                            )}
                            {getStatusBadge(backup.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Bonnes Pratiques</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Effectuez un backup complet chaque semaine
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Stockez vos backups sur un support externe (cloud, disque dur)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Le format JSON conserve les relations entre données
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Le format SQL permet une restauration directe en base
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Le format CSV est idéal pour analyse dans Excel
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminBackup;
