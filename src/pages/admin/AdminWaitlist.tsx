import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, RefreshCw, Search, Users } from "lucide-react";
import { format } from "date-fns";

type WaitlistRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  residence: string | null;
  land_status: string;
  desired_area_hectares: number | null;
  land_area_hectares: number | null;
  message: string | null;
  status: string;
  created_at: string;
};

const AdminWaitlist = () => {
  const [search, setSearch] = useState("");
  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ["waitlist-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("waitlist_submissions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as WaitlistRow[];
    },
  });

  const rows = data.filter((row) => [row.full_name, row.email, row.phone, row.whatsapp, row.residence].join(" ").toLowerCase().includes(search.toLowerCase()));
  const withLand = data.filter((row) => row.land_status === "has_land").length;

  const exportCsv = () => {
    const headers = ["Date", "Nom complet", "Email", "Contact", "WhatsApp", "Résidence", "Statut foncier", "Superficie souhaitée", "Superficie terre", "Message"];
    const csv = [headers, ...rows.map((r) => [format(new Date(r.created_at), "dd/MM/yyyy HH:mm"), r.full_name, r.email, r.phone || "", r.whatsapp || "", r.residence || "", r.land_status === "has_land" ? "A une terre" : "Pas de terre", r.desired_area_hectares || "", r.land_area_hectares || "", (r.message || "").replace(/\n/g, " ")])].map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    link.download = `liste-attente-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <AdminLayout title="Liste d'attente">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total inscriptions</p><p className="text-3xl font-bold text-primary">{data.length}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Avec terre</p><p className="text-3xl font-bold text-primary">{withLand}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Sans terre</p><p className="text-3xl font-bold text-primary">{data.length - withLand}</p></CardContent></Card>
        </div>
        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Inscriptions</CardTitle>
            <div className="flex gap-2"><Button variant="outline" onClick={() => refetch()}><RefreshCw className="mr-2 h-4 w-4" /> Actualiser</Button><Button onClick={exportCsv}><Download className="mr-2 h-4 w-4" /> Export CSV</Button></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher nom, email, contact..." className="pl-10" /></div>
            <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Nom</TableHead><TableHead>Contacts</TableHead><TableHead>Résidence</TableHead><TableHead>Terre</TableHead><TableHead>Superficie</TableHead><TableHead>Message</TableHead></TableRow></TableHeader><TableBody>{isLoading ? <TableRow><TableCell colSpan={7} className="py-8 text-center">Chargement...</TableCell></TableRow> : rows.map((row) => <TableRow key={row.id}><TableCell>{format(new Date(row.created_at), "dd/MM/yyyy HH:mm")}</TableCell><TableCell className="font-medium">{row.full_name}</TableCell><TableCell><div className="text-sm"><a href={`mailto:${row.email}`} className="text-primary hover:underline">{row.email}</a><br />{row.phone || "—"}<br />{row.whatsapp || "—"}</div></TableCell><TableCell>{row.residence || "—"}</TableCell><TableCell><Badge variant="outline">{row.land_status === "has_land" ? "A une terre" : "Pas de terre"}</Badge></TableCell><TableCell>{row.land_status === "has_land" ? `${row.land_area_hectares || "—"} ha` : `${row.desired_area_hectares || "—"} ha souhaités`}</TableCell><TableCell className="max-w-xs truncate">{row.message || "—"}</TableCell></TableRow>)}</TableBody></Table></div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminWaitlist;