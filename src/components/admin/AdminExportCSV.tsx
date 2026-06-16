import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, Loader2, FileSpreadsheet, Users, MessageSquare, BarChart3 } from "lucide-react";
import { toast } from "sonner";

interface ExportOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  table: string;
  columns: string[];
  headers: string[];
}

const exportOptions: ExportOption[] = [
  {
    id: 'newsletter',
    label: 'Abonnés Newsletter',
    icon: <Users className="w-5 h-5" />,
    table: 'newsletter_subscribers',
    columns: ['email', 'subscribed_at', 'is_active'],
    headers: ['Email', 'Date d\'inscription', 'Actif']
  },
  {
    id: 'testimonials',
    label: 'Témoignages',
    icon: <MessageSquare className="w-5 h-5" />,
    table: 'testimonials',
    columns: ['first_name', 'last_name', 'email', 'testimonial', 'status', 'approved', 'created_at'],
    headers: ['Prénom', 'Nom', 'Email', 'Témoignage', 'Statut', 'Approuvé', 'Date']
  },
  {
    id: 'contacts',
    label: 'Messages de Contact',
    icon: <MessageSquare className="w-5 h-5" />,
    table: 'contact_messages',
    columns: ['name', 'email', 'subject', 'message', 'status', 'created_at'],
    headers: ['Nom', 'Email', 'Sujet', 'Message', 'Statut', 'Date']
  },
  {
    id: 'visits',
    label: 'Visites du Site',
    icon: <BarChart3 className="w-5 h-5" />,
    table: 'page_visits',
    columns: ['page_path', 'referrer', 'created_at'],
    headers: ['Page', 'Référent', 'Date']
  }
];

const AdminExportCSV = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedExports, setSelectedExports] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const toggleExport = (id: string) => {
    setSelectedExports(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const exportData = async () => {
    if (selectedExports.length === 0) {
      toast.error("Veuillez sélectionner au moins une option");
      return;
    }

    setIsExporting(true);

    try {
      for (const exportId of selectedExports) {
        const option = exportOptions.find(o => o.id === exportId);
        if (!option) continue;

        const { data, error } = await supabase
          .from(option.table as any)
          .select(option.columns.join(','))
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!data || data.length === 0) {
          toast.info(`Aucune donnée à exporter pour: ${option.label}`);
          continue;
        }

        // Generate CSV
        const csvContent = [
          option.headers.join(';'),
          ...data.map(row => 
            option.columns.map(col => {
              let value = (row as any)[col];
              if (value === null || value === undefined) return '';
              if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
              if (col.includes('_at') && value) {
                return new Date(value).toLocaleDateString('fr-FR');
              }
              return String(value).replace(/"/g, '""').replace(/;/g, ',');
            }).map(cell => `"${cell}"`).join(';')
          )
        ].join('\n');

        // Download file
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${option.id}-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
      }

      toast.success(`${selectedExports.length} fichier(s) exporté(s)`);
      setIsOpen(false);
      setSelectedExports([]);
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Erreur lors de l'export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Exporter les données en CSV
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {exportOptions.map((option) => (
            <Card 
              key={option.id}
              className={`cursor-pointer transition-all ${
                selectedExports.includes(option.id) 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => toggleExport(option.id)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <Checkbox 
                  checked={selectedExports.includes(option.id)}
                  onCheckedChange={() => toggleExport(option.id)}
                />
                <div className="text-primary">{option.icon}</div>
                <div className="flex-1">
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {option.headers.slice(0, 3).join(', ')}...
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={exportData} 
            disabled={isExporting || selectedExports.length === 0}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Exporter ({selectedExports.length})
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminExportCSV;
