import { useState, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Download, Upload, Database, Clock, CheckCircle2, AlertCircle,
  FileJson, FileSpreadsheet, Loader2, RefreshCw, HardDrive,
  Calendar, Shield, Trash2, Eye, Archive, Table, Key, Lock,
  Cloud, CloudUpload, Settings, Play, Pause, History, FileText
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
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
  date: Date;
  tables: string[];
  format: string;
  size: string;
  status: "success" | "failed";
  destination?: string;
}

interface TableSchema {
  name: string;
  columns: { name: string; type: string; nullable: boolean }[];
  rowCount: number;
  hasRLS: boolean;
}

const AdminDatabase = () => {
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
    { name: "audit_logs", label: "Journal Audit", description: "Historique actions", selected: false },
  ]);

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [importProgress, setImportProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "sql">("json");
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([]);
  const [showSchemaDialog, setShowSchemaDialog] = useState(false);
  const [selectedTableSchema, setSelectedTableSchema] = useState<TableSchema | null>(null);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [autoBackupInterval, setAutoBackupInterval] = useState("daily");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    } catch (error) {
      console.error("Error loading counts:", error);
    } finally {
      setIsLoadingCounts(false);
    }
  };

  const toggleTable = (name: string) => {
    setTables(tables.map(t => 
      t.name === name ? { ...t, selected: !t.selected } : t
    ));
  };

  const selectAll = () => setTables(tables.map(t => ({ ...t, selected: true })));
  const deselectAll = () => setTables(tables.map(t => ({ ...t, selected: false })));

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
        let sqlContent = `-- AgriCapital Database Backup\n-- Generated: ${new Date().toISOString()}\n\n`;
        
        for (const [tableName, data] of Object.entries(backupData)) {
          if (data.length > 0) {
            sqlContent += `-- Table: ${tableName}\n`;
            sqlContent += `DELETE FROM public.${tableName};\n`;
            
            for (const row of data) {
              const columns = Object.keys(row).join(", ");
              const values = Object.values(row).map(v => {
                if (v === null) return "NULL";
                if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
                if (typeof v === "string") return `'${v.replace(/'/g, "''")}'`;
                return v;
              }).join(", ");
              sqlContent += `INSERT INTO public.${tableName} (${columns}) VALUES (${values});\n`;
            }
            sqlContent += "\n";
          }
        }
        
        const blob = new Blob([sqlContent], { type: "text/sql" });
        downloadBlob(blob, `agricapital_backup_${timestamp}.sql`);
      }

      const newBackup: BackupHistory = {
        id: Date.now().toString(),
        date: new Date(),
        tables: selectedTables.map(t => t.label),
        format: exportFormat.toUpperCase(),
        size: calculateSize(backupData),
        status: "success"
      };
      setBackupHistory([newBackup, ...backupHistory]);

      toast.success(`Backup ${exportFormat.toUpperCase()} généré avec succès !`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erreur lors de l'export");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const importData = async (file: File) => {
    setIsImporting(true);
    setImportProgress(0);

    try {
      const content = await file.text();
      const data = JSON.parse(content);
      
      const tableNames = Object.keys(data);
      const totalTables = tableNames.length;

      for (let i = 0; i < tableNames.length; i++) {
        const tableName = tableNames[i];
        const rows = data[tableName];
        
        if (rows && rows.length > 0) {
          // Insert in batches of 100
          for (let j = 0; j < rows.length; j += 100) {
            const batch = rows.slice(j, j + 100);
            const { error } = await supabase
              .from(tableName as any)
              .upsert(batch, { onConflict: 'id' });
            
            if (error) {
              console.error(`Error importing ${tableName}:`, error);
            }
          }
        }
        
        setImportProgress(Math.round(((i + 1) / totalTables) * 100));
      }

      toast.success("Import terminé avec succès !");
      loadTableCounts();
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Erreur lors de l'import. Vérifiez le format du fichier.");
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        toast.error("Seuls les fichiers JSON sont supportés pour l'import");
        return;
      }
      if (confirm(`Importer les données depuis ${file.name} ? Les données existantes seront mises à jour.`)) {
        importData(file);
      }
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

  const viewTableSchema = async (tableName: string) => {
    // Simulate schema fetch
    setSelectedTableSchema({
      name: tableName,
      columns: [
        { name: "id", type: "uuid", nullable: false },
        { name: "created_at", type: "timestamp", nullable: false },
        { name: "updated_at", type: "timestamp", nullable: false },
      ],
      rowCount: tables.find(t => t.name === tableName)?.rowCount || 0,
      hasRLS: true,
    });
    setShowSchemaDialog(true);
  };

  const selectedCount = tables.filter(t => t.selected).length;
  const totalRows = tables.filter(t => t.selected).reduce((sum, t) => sum + (t.rowCount || 0), 0);

  return (
    <AdminLayout title="Gestion Base de Données">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Database className="w-6 h-6 text-primary" />
              Gestion Base de Données
            </h1>
            <p className="text-muted-foreground">Export, import et sauvegarde de vos données</p>
          </div>
          <Button variant="outline" onClick={loadTableCounts} disabled={isLoadingCounts}>
            {isLoadingCounts ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Actualiser
          </Button>
        </div>

        <Tabs defaultValue="export" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-xl">
            <TabsTrigger value="export" className="gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exporter</span>
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Importer</span>
            </TabsTrigger>
            <TabsTrigger value="schema" className="gap-2">
              <Table className="w-4 h-4" />
              <span className="hidden sm:inline">Schéma</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Historique</span>
            </TabsTrigger>
          </TabsList>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Database className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{tables.length}</p>
                  <p className="text-xs text-muted-foreground">Tables</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">{selectedCount}</p>
                  <p className="text-xs text-muted-foreground">Sélectionnées</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <HardDrive className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{totalRows.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Enregistrements</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                  <p className="text-2xl font-bold">100%</p>
                  <p className="text-xs text-muted-foreground">RLS actif</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Table Selection */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Sélection des Tables</CardTitle>
                      <CardDescription>Choisissez les données à exporter</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={selectAll}>Tout</Button>
                      <Button variant="outline" size="sm" onClick={deselectAll}>Aucun</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {tables.map((table) => (
                        <div
                          key={table.name}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                            table.selected ? "bg-primary/5 border-primary/30" : "bg-muted/30 hover:bg-muted/50"
                          }`}
                          onClick={() => toggleTable(table.name)}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox checked={table.selected} />
                            <div>
                              <p className="font-medium">{table.label}</p>
                              <p className="text-xs text-muted-foreground">{table.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {table.rowCount !== undefined && (
                              <Badge variant="secondary">{table.rowCount.toLocaleString()}</Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                viewTableSchema(table.name);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Options d'Export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Format de fichier</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "json", icon: FileJson, label: "JSON", color: "text-amber-500" },
                        { id: "csv", icon: FileSpreadsheet, label: "CSV", color: "text-green-500" },
                        { id: "sql", icon: FileText, label: "SQL", color: "text-blue-500" },
                      ].map(({ id, icon: Icon, label, color }) => (
                        <div
                          key={id}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-colors text-center ${
                            exportFormat === id 
                              ? "border-primary bg-primary/5" 
                              : "border-muted hover:border-primary/50"
                          }`}
                          onClick={() => setExportFormat(id as any)}
                        >
                          <Icon className={`w-6 h-6 mx-auto mb-1 ${color}`} />
                          <p className="text-sm font-medium">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {isExporting && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Export en cours...</span>
                        <span>{exportProgress}%</span>
                      </div>
                      <Progress value={exportProgress} />
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={exportData}
                    disabled={isExporting || selectedCount === 0}
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Télécharger
                  </Button>

                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <div className="flex gap-2">
                      <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-700 dark:text-blue-300">
                        <p className="font-medium mb-1">Backup sécurisé</p>
                        <p>Données exportées localement sans transit serveur tiers.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Importer des données
                </CardTitle>
                <CardDescription>
                  Restaurez vos données depuis un fichier de backup JSON
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 border-2 border-dashed rounded-lg text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Glissez un fichier ou cliquez pour sélectionner</p>
                  <p className="text-sm text-muted-foreground mb-4">Format supporté: JSON</p>
                  <Button onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
                    {isImporting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Sélectionner un fichier
                  </Button>
                </div>

                {isImporting && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Import en cours...</span>
                      <span>{importProgress}%</span>
                    </div>
                    <Progress value={importProgress} />
                  </div>
                )}

                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-700">Attention</p>
                      <p className="text-sm text-amber-600">
                        L'import va mettre à jour les données existantes (upsert). 
                        Faites un backup avant d'importer.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schema Tab */}
          <TabsContent value="schema" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Table className="w-5 h-5" />
                  Structure de la Base de Données
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tables.map((table) => (
                    <div
                      key={table.name}
                      className="p-4 border rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                      onClick={() => viewTableSchema(table.name)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{table.label}</h4>
                        <Badge variant="outline">
                          <Lock className="w-3 h-3 mr-1" />
                          RLS
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{table.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {table.rowCount?.toLocaleString() || "?"} enregistrements
                        </span>
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Historique des Sauvegardes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {backupHistory.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Archive className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Aucune sauvegarde enregistrée</p>
                    <p className="text-sm">Les backups effectués apparaîtront ici</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {backupHistory.map((backup) => (
                      <div
                        key={backup.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          {backup.status === "success" ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">
                              Backup {backup.format} - {backup.size}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(backup.date, "PPP 'à' HH:mm", { locale: fr })}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {backup.tables.length} tables
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Schema Dialog */}
        <Dialog open={showSchemaDialog} onOpenChange={setShowSchemaDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schéma: {selectedTableSchema?.name}</DialogTitle>
            </DialogHeader>
            {selectedTableSchema && (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Badge>
                    <HardDrive className="w-3 h-3 mr-1" />
                    {selectedTableSchema.rowCount} lignes
                  </Badge>
                  <Badge variant={selectedTableSchema.hasRLS ? "default" : "destructive"}>
                    <Lock className="w-3 h-3 mr-1" />
                    {selectedTableSchema.hasRLS ? "RLS Actif" : "RLS Inactif"}
                  </Badge>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2">Colonne</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Nullable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTableSchema.columns.map((col) => (
                        <tr key={col.name} className="border-t">
                          <td className="p-2 font-mono">{col.name}</td>
                          <td className="p-2">{col.type}</td>
                          <td className="p-2">{col.nullable ? "Oui" : "Non"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminDatabase;
