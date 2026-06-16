import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Search, RefreshCw, Download, Eye, User, Building2, 
  Mail, Phone, MapPin, Handshake, FileText, Users, TrendingUp
} from "lucide-react";

interface PartnershipRequest {
  id: string;
  request_type: string;
  partner_type: string;
  category: string | null;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  company_logo_url: string | null;
  photo_url: string | null;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  country: string | null;
  city: string | null;
  land_area_hectares: number | null;
  investment_amount: number | null;
  preferred_offer: string | null;
  message: string | null;
  language: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

const AdminPartnershipRequests = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<PartnershipRequest | null>(null);
  const [notes, setNotes] = useState("");

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ["partnership-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partnership_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PartnershipRequest[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from("partnership_requests")
        .update({ status, notes })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnership-requests"] });
      toast.success("Demande mise à jour");
      setSelectedRequest(null);
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });

  const filteredRequests = requests?.filter((req) => {
    const matchesSearch = 
      req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (req.last_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (req.company_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: requests?.length || 0,
    pending: requests?.filter(r => r.status === "pending").length || 0,
    contacted: requests?.filter(r => r.status === "contacted").length || 0,
    approved: requests?.filter(r => r.status === "approved").length || 0,
  };

  const exportToCSV = () => {
    if (!requests?.length) return;

    const headers = ["Date", "Type", "Partenaire", "Nom", "Email", "Téléphone", "Ville", "Offre", "Status"];
    const csvContent = [
      headers.join(","),
      ...requests.map(r => [
        format(new Date(r.created_at), "dd/MM/yyyy"),
        r.request_type,
        r.partner_type,
        r.partner_type === "company" ? r.company_name : `${r.first_name} ${r.last_name}`,
        r.email,
        r.phone || "",
        r.city || "",
        r.preferred_offer || "",
        r.status,
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `demandes-partenariat-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "contacted": return "bg-blue-100 text-blue-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "En attente";
      case "contacted": return "Contacté";
      case "approved": return "Approuvé";
      case "rejected": return "Refusé";
      default: return status;
    }
  };

  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      landowner: "Propriétaire Terrien",
      producer: "Producteur",
      investor: "Investisseur",
      institution: "Institution/ONG",
      industrial: "Partenaire Industriel",
      technical: "Partenaire Technique",
    };
    return labels[type] || type;
  };

  return (
    <AdminLayout title="Demandes de Partenariat">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Handshake className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total demandes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">En attente</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.contacted}</p>
                <p className="text-xs text-muted-foreground">Contactés</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                <p className="text-xs text-muted-foreground">Approuvés</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="contacted">Contacté</SelectItem>
              <SelectItem value="approved">Approuvé</SelectItem>
              <SelectItem value="rejected">Refusé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Offre</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredRequests?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucune demande trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests?.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(req.created_at), "dd/MM/yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {req.partner_type === "company" ? (
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <User className="w-4 h-4 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {getRequestTypeLabel(req.request_type)}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {req.partner_type}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {req.partner_type === "company" 
                              ? req.company_name 
                              : `${req.first_name || ""} ${req.last_name || ""}`}
                          </p>
                          <p className="text-xs text-muted-foreground">{req.email}</p>
                          {req.city && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {req.city}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {req.preferred_offer ? (
                          <Badge variant="outline">{req.preferred_offer}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(req.status)}>
                          {getStatusLabel(req.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(req);
                            setNotes(req.notes || "");
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Handshake className="w-5 h-5" />
                Détails de la demande
              </DialogTitle>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="space-y-6">
                {/* Photo/Logo */}
                {(selectedRequest.photo_url || selectedRequest.company_logo_url) && (
                  <div className="flex justify-center">
                    <img 
                      src={selectedRequest.photo_url || selectedRequest.company_logo_url || ""} 
                      alt="Photo" 
                      className="w-24 h-24 rounded-lg object-cover border"
                    />
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Type de partenariat</p>
                    <p className="font-medium">{getRequestTypeLabel(selectedRequest.request_type)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type de partenaire</p>
                    <p className="font-medium capitalize">{selectedRequest.partner_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nom</p>
                    <p className="font-medium">
                      {selectedRequest.partner_type === "company" 
                        ? selectedRequest.company_name 
                        : `${selectedRequest.first_name || ""} ${selectedRequest.last_name || ""}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a href={`mailto:${selectedRequest.email}`} className="font-medium text-primary hover:underline flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {selectedRequest.email}
                    </a>
                  </div>
                  {selectedRequest.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Téléphone</p>
                      <a href={`tel:${selectedRequest.phone}`} className="font-medium flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {selectedRequest.phone}
                      </a>
                    </div>
                  )}
                  {selectedRequest.whatsapp && (
                    <div>
                      <p className="text-sm text-muted-foreground">WhatsApp</p>
                      <a 
                        href={`https://wa.me/${selectedRequest.whatsapp.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-green-600 hover:underline"
                      >
                        {selectedRequest.whatsapp}
                      </a>
                    </div>
                  )}
                  {selectedRequest.city && (
                    <div>
                      <p className="text-sm text-muted-foreground">Localisation</p>
                      <p className="font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {selectedRequest.city}, {selectedRequest.country}
                      </p>
                    </div>
                  )}
                  {selectedRequest.preferred_offer && (
                    <div>
                      <p className="text-sm text-muted-foreground">Offre préférée</p>
                      <Badge>{selectedRequest.preferred_offer}</Badge>
                    </div>
                  )}
                  {selectedRequest.land_area_hectares && (
                    <div>
                      <p className="text-sm text-muted-foreground">Superficie</p>
                      <p className="font-medium">{selectedRequest.land_area_hectares} hectares</p>
                    </div>
                  )}
                  {selectedRequest.investment_amount && (
                    <div>
                      <p className="text-sm text-muted-foreground">Montant investissement</p>
                      <p className="font-medium">{selectedRequest.investment_amount.toLocaleString()} FCFA</p>
                    </div>
                  )}
                </div>

                {/* Message */}
                {selectedRequest.message && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Message</p>
                    <p className="p-3 bg-muted rounded-lg text-sm">{selectedRequest.message}</p>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes internes</p>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ajouter des notes..."
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => updateMutation.mutate({ 
                      id: selectedRequest.id, 
                      status: "contacted",
                      notes 
                    })}
                  >
                    Marquer comme contacté
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => updateMutation.mutate({ 
                      id: selectedRequest.id, 
                      status: "approved",
                      notes 
                    })}
                  >
                    Approuver
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateMutation.mutate({ 
                      id: selectedRequest.id, 
                      status: "rejected",
                      notes 
                    })}
                  >
                    Refuser
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminPartnershipRequests;
