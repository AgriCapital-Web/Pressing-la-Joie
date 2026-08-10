import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Eye, Download, Loader2, FileSpreadsheet } from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
  Bar, BarChart,
} from "recharts";

const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

interface Props {
  pubs: any[];
}

export default function DataroomTrends({ pubs }: Props) {
  const [range, setRange] = useState<Range>(30);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      const since = new Date(Date.now() - range * 24 * 3600 * 1000).toISOString();
      const { data } = await supabase
        .from("dataroom_access_logs")
        .select("action, created_at, publication_id")
        .gte("created_at", since)
        .order("created_at", { ascending: true })
        .limit(20000);
      if (!cancelled) {
        setLogs(data ?? []);
        setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [range]);

  const series = useMemo(() => {
    const days: Record<string, { date: string; vues: number; telechargements: number }> = {};
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 3600 * 1000);
      const key = d.toISOString().slice(0, 10);
      days[key] = { date: key, vues: 0, telechargements: 0 };
    }
    logs.forEach((l) => {
      const key = String(l.created_at).slice(0, 10);
      if (!days[key]) return;
      if (/download/i.test(l.action)) days[key].telechargements += 1;
      else days[key].vues += 1;
    });
    return Object.values(days).map((d) => ({
      ...d,
      label: new Date(d.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
    }));
  }, [logs, range]);

  const totals = useMemo(() => {
    const vues = series.reduce((s, d) => s + d.vues, 0);
    const dl = series.reduce((s, d) => s + d.telechargements, 0);
    return { vues, dl };
  }, [series]);

  const topDocs = useMemo(() => {
    const byPub: Record<string, { vues: number; telechargements: number }> = {};
    logs.forEach((l) => {
      if (!l.publication_id) return;
      byPub[l.publication_id] ||= { vues: 0, telechargements: 0 };
      if (/download/i.test(l.action)) byPub[l.publication_id].telechargements += 1;
      else byPub[l.publication_id].vues += 1;
    });
    const rows = Object.entries(byPub).map(([id, v]) => ({
      id,
      titre: (pubs.find((p) => p.id === id)?.title || "Document").slice(0, 28),
      ...v,
      total: v.vues + v.telechargements,
    }));
    if (rows.length === 0) {
      // Repli sur les compteurs cumulés si aucun log sur la période
      return [...pubs]
        .sort((a, b) => (b.views_count || 0) + (b.downloads_count || 0) - ((a.views_count || 0) + (a.downloads_count || 0)))
        .slice(0, 8)
        .map((p) => ({
          id: p.id,
          titre: String(p.title || "Document").slice(0, 28),
          vues: p.views_count || 0,
          telechargements: p.downloads_count || 0,
          total: (p.views_count || 0) + (p.downloads_count || 0),
        }));
    }
    return rows.sort((a, b) => b.total - a.total).slice(0, 8);
  }, [logs, pubs]);

  const downloadCsv = (filename: string, rows: (string | number)[][]) => {
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportDaily = () => {
    downloadCsv(
      `dataroom-tendances-${range}j-${new Date().toISOString().slice(0, 10)}.csv`,
      [["Date", "Vues", "Téléchargements"], ...series.map((d) => [d.date, d.vues, d.telechargements])],
    );
  };

  const exportDocs = () => {
    downloadCsv(
      `dataroom-documents-${range}j-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        ["Document", "Vues", "Téléchargements", "Total", "Vues cumulées", "Téléch. cumulés"],
        ...topDocs.map((d) => {
          const p = pubs.find((x) => x.id === d.id);
          return [p?.title ?? d.titre, d.vues, d.telechargements, d.total, p?.views_count ?? 0, p?.downloads_count ?? 0];
        }),
      ],
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Tendances vues & téléchargements</h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          {RANGES.map((r) => (
            <Button key={r} size="sm" variant={range === r ? "default" : "outline"} onClick={() => setRange(r)}>
              {r} jours
            </Button>
          ))}
          <Button size="sm" variant="outline" onClick={exportDaily}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />CSV quotidien
          </Button>
          <Button size="sm" variant="outline" onClick={exportDocs}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />CSV documents
          </Button>
        </div>
      </div>


      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Eye className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{totals.vues}</p>
              <p className="text-xs text-muted-foreground">Vues sur {range} jours</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Download className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{totals.dl}</p>
              <p className="text-xs text-muted-foreground">Téléchargements sur {range} jours</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">
                {totals.vues ? Math.round((totals.dl / totals.vues) * 100) : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Taux de téléchargement</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Évolution quotidienne</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px]">
          {loading ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="label" fontSize={11} interval={Math.max(0, Math.floor(series.length / 10))} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="vues" stroke="hsl(var(--primary))" fill="url(#gv)" name="Vues" />
                <Area type="monotone" dataKey="telechargements" stroke="hsl(var(--accent))" fill="url(#gd)" name="Téléchargements" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            Documents les plus populaires
            <Badge variant="outline">{range} jours</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topDocs} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis type="number" fontSize={11} allowDecimals={false} />
              <YAxis type="category" dataKey="titre" width={150} fontSize={11} />
              <Tooltip />
              <Legend />
              <Bar dataKey="vues" fill="hsl(var(--primary))" name="Vues" radius={[0, 4, 4, 0]} />
              <Bar dataKey="telechargements" fill="hsl(var(--accent))" name="Téléchargements" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
