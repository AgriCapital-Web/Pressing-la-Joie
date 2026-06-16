import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, TrendingUp, Users, Globe, Calendar, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VisitData {
  page_path: string;
  count: number;
}

interface DailyVisit {
  date: string;
  count: number;
}

const AdminAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalVisits, setTotalVisits] = useState(0);
  const [todayVisits, setTodayVisits] = useState(0);
  const [weekVisits, setWeekVisits] = useState(0);
  const [monthVisits, setMonthVisits] = useState(0);
  const [topPages, setTopPages] = useState<VisitData[]>([]);
  const [dailyVisits, setDailyVisits] = useState<DailyVisit[]>([]);
  const [topReferrers, setTopReferrers] = useState<{ referrer: string; count: number }[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Total visits
      const { count: total } = await supabase
        .from("page_visits")
        .select("*", { count: "exact", head: true });
      setTotalVisits(total || 0);

      // Today visits
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayCount } = await supabase
        .from("page_visits")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());
      setTodayVisits(todayCount || 0);

      // Week visits
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: weekCount } = await supabase
        .from("page_visits")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString());
      setWeekVisits(weekCount || 0);

      // Month visits
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const { count: monthCount } = await supabase
        .from("page_visits")
        .select("*", { count: "exact", head: true })
        .gte("created_at", monthAgo.toISOString());
      setMonthVisits(monthCount || 0);

      // Top pages
      const { data: visits } = await supabase
        .from("page_visits")
        .select("page_path");

      if (visits) {
        const pageCount: Record<string, number> = {};
        visits.forEach((v) => {
          pageCount[v.page_path] = (pageCount[v.page_path] || 0) + 1;
        });
        const sorted = Object.entries(pageCount)
          .map(([page_path, count]) => ({ page_path, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
        setTopPages(sorted);
      }

      // Top referrers
      const { data: referrerData } = await supabase
        .from("page_visits")
        .select("referrer")
        .not("referrer", "is", null);

      if (referrerData) {
        const refCount: Record<string, number> = {};
        referrerData.forEach((v) => {
          if (v.referrer) {
            refCount[v.referrer] = (refCount[v.referrer] || 0) + 1;
          }
        });
        const sortedRefs = Object.entries(refCount)
          .map(([referrer, count]) => ({ referrer, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setTopReferrers(sortedRefs);
      }

      // Daily visits for last 7 days
      const dailyData: DailyVisit[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const { count } = await supabase
          .from("page_visits")
          .select("*", { count: "exact", head: true })
          .gte("created_at", date.toISOString())
          .lt("created_at", nextDate.toISOString());

        dailyData.push({
          date: date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }),
          count: count || 0,
        });
      }
      setDailyVisits(dailyData);

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Métrique", "Valeur"],
      ["Visites Totales", totalVisits.toString()],
      ["Visites Aujourd'hui", todayVisits.toString()],
      ["Visites Cette Semaine", weekVisits.toString()],
      ["Visites Ce Mois", monthVisits.toString()],
      [""],
      ["Top Pages", "Visites"],
      ...topPages.map(p => [p.page_path || "/", p.count.toString()]),
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `analytics_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <AdminLayout title="Analytiques">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytiques">
      <div className="space-y-6">
        {/* Export Button */}
        <div className="flex justify-end">
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exporter CSV
          </Button>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Visites Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalVisits.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Aujourd'hui
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">{todayVisits}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Cette Semaine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{weekVisits}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Ce Mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{monthVisits}</p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Visites des 7 Derniers Jours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-40">
              {dailyVisits.map((day, index) => {
                const maxCount = Math.max(...dailyVisits.map(d => d.count), 1);
                const height = (day.count / maxCount) * 100;
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-primary rounded-t transition-all"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                    <p className="text-xs mt-2 text-muted-foreground">{day.date}</p>
                    <p className="text-xs font-medium">{day.count}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Pages & Referrers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Pages les Plus Visitées
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topPages.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Aucune donnée</p>
              ) : (
                <div className="space-y-3">
                  {topPages.map((page, index) => (
                    <div key={page.page_path} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm truncate max-w-[200px]">{page.page_path || "/"}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{page.count} visites</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sources de Trafic</CardTitle>
              <CardDescription>D'où viennent vos visiteurs</CardDescription>
            </CardHeader>
            <CardContent>
              {topReferrers.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Aucun referrer enregistré</p>
              ) : (
                <div className="space-y-3">
                  {topReferrers.map((ref, index) => (
                    <div key={ref.referrer} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm truncate max-w-[250px]">{ref.referrer}</span>
                      <span className="text-sm font-medium">{ref.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
