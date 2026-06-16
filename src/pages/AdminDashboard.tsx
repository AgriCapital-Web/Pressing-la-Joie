import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MessageSquare, Mail, Users, TrendingUp, Bot, Send, Handshake } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminExportCSV from "@/components/admin/AdminExportCSV";
import InteractiveVisitorMap from "@/components/admin/InteractiveVisitorMap";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface PageVisit {
  page_path: string;
  visit_count: number;
}

interface DailyVisit {
  date: string;
  visits: number;
}

const COLORS = ['hsl(var(--primary))', '#22c55e', '#f59e0b', '#3b82f6', '#8b5cf6'];

const AdminDashboard = () => {
  const [totalVisits, setTotalVisits] = useState(0);
  const [todayVisits, setTodayVisits] = useState(0);
  const [weekVisits, setWeekVisits] = useState(0);
  const [topPages, setTopPages] = useState<PageVisit[]>([]);
  const [dailyVisits, setDailyVisits] = useState<DailyVisit[]>([]);
  const [newsletterCount, setNewsletterCount] = useState(0);
  const [testimonialCount, setTestimonialCount] = useState(0);
  const [pendingTestimonials, setPendingTestimonials] = useState(0);
  const [aiChatCount, setAiChatCount] = useState(0);
  const [emailsSent, setEmailsSent] = useState(0);
  const [partnershipsCount, setPartnershipsCount] = useState(0);
  const [contactMessages, setContactMessages] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([
      fetchAnalytics(), 
      fetchNewsletter(), 
      fetchTestimonials(),
      fetchAiChatLogs(),
      fetchEmailLogs(),
      fetchPartnerships(),
      fetchContactMessages()
    ]);
  };

  const fetchTestimonials = async () => {
    const { count: total } = await supabase
      .from('testimonials')
      .select('*', { count: 'exact', head: true });
    setTestimonialCount(total || 0);

    const { count: pending } = await supabase
      .from('testimonials')
      .select('*', { count: 'exact', head: true })
      .eq('approved', false);
    setPendingTestimonials(pending || 0);
  };

  const fetchNewsletter = async () => {
    const { count } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true });
    setNewsletterCount(count || 0);
  };

  const fetchAiChatLogs = async () => {
    const { count } = await supabase
      .from('ai_chat_logs')
      .select('*', { count: 'exact', head: true });
    setAiChatCount(count || 0);
  };

  const fetchEmailLogs = async () => {
    const { count } = await supabase
      .from('email_logs')
      .select('*', { count: 'exact', head: true });
    setEmailsSent(count || 0);
  };

  const fetchPartnerships = async () => {
    const { count } = await supabase
      .from('partnerships')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    setPartnershipsCount(count || 0);
  };

  const fetchContactMessages = async () => {
    const { count: total } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true });
    setContactMessages(total || 0);

    const { count: unread } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');
    setUnreadMessages(unread || 0);
  };

  const fetchAnalytics = async () => {
    // Total visits
    const { count: total } = await supabase
      .from('page_visits')
      .select('*', { count: 'exact', head: true });
    setTotalVisits(total || 0);

    // Today visits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayCount } = await supabase
      .from('page_visits')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());
    setTodayVisits(todayCount || 0);

    // Week visits
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: weekCount } = await supabase
      .from('page_visits')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString());
    setWeekVisits(weekCount || 0);

    // Top pages and daily visits
    const { data: visits } = await supabase
      .from('page_visits')
      .select('page_path, created_at');
    
    if (visits) {
      // Top pages
      const pageCount: Record<string, number> = {};
      visits.forEach(v => {
        pageCount[v.page_path] = (pageCount[v.page_path] || 0) + 1;
      });
      const sorted = Object.entries(pageCount)
        .map(([page_path, visit_count]) => ({ page_path, visit_count }))
        .sort((a, b) => b.visit_count - a.visit_count)
        .slice(0, 10);
      setTopPages(sorted);

      // Daily visits for last 7 days
      const dailyCounts: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyCounts[dateStr] = 0;
      }
      
      visits.forEach(v => {
        const dateStr = new Date(v.created_at).toISOString().split('T')[0];
        if (dailyCounts[dateStr] !== undefined) {
          dailyCounts[dateStr]++;
        }
      });

      const dailyData = Object.entries(dailyCounts).map(([date, visits]) => ({
        date: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        visits
      }));
      setDailyVisits(dailyData);
    }
  };

  const pieData = topPages.slice(0, 5).map((page, index) => ({
    name: page.page_path || 'Accueil',
    value: page.visit_count,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <AdminLayout title="Tableau de Bord">
      <div className="space-y-6">
        {/* Export Button */}
        <div className="flex justify-end">
          <AdminExportCSV />
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Visiteurs Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalVisits.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{todayVisits} aujourd'hui</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Cette Semaine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{weekVisits.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">7 derniers jours</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Abonnés Newsletter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{newsletterCount}</p>
              <p className="text-xs text-muted-foreground">Actifs</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Témoignages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">{testimonialCount}</p>
              {pendingTestimonials > 0 && (
                <p className="text-xs text-amber-500">{pendingTestimonials} en attente</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Bot className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{aiChatCount}</p>
                <p className="text-xs text-muted-foreground">Conversations IA</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-pink-500/10 rounded-lg">
                <Send className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{emailsSent}</p>
                <p className="text-xs text-muted-foreground">Emails envoyés</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-teal-500/10 rounded-lg">
                <Handshake className="w-5 h-5 text-teal-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{partnershipsCount}</p>
                <p className="text-xs text-muted-foreground">Partenariats actifs</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Users className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{contactMessages}</p>
                <p className="text-xs text-muted-foreground">
                  Messages {unreadMessages > 0 && <span className="text-orange-500">({unreadMessages} non lus)</span>}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart - Daily Visits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Évolution des Visites (7 jours)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dailyVisits.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={dailyVisits}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="visits" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">Aucune donnée disponible</p>
              )}
            </CardContent>
          </Card>

          {/* Bar Chart - Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Pages les Plus Visitées
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topPages.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topPages.slice(0, 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis 
                      type="category" 
                      dataKey="page_path" 
                      tick={{ fontSize: 11 }}
                      width={100}
                      tickFormatter={(value) => value || 'Accueil'}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="visit_count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">Aucune donnée disponible</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity and Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Répartition du Trafic</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">Aucune donnée disponible</p>
              )}
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: entry.color }} />
                    <span className="text-xs">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Eye className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{todayVisits} visiteurs aujourd'hui</p>
                    <p className="text-xs text-muted-foreground">Trafic du site</p>
                  </div>
                </div>
                {pendingTestimonials > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium">{pendingTestimonials} témoignage(s) en attente</p>
                      <p className="text-xs text-muted-foreground">À valider</p>
                    </div>
                  </div>
                )}
                {unreadMessages > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-orange-500/10 rounded-lg">
                    <Mail className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">{unreadMessages} message(s) non lu(s)</p>
                      <p className="text-xs text-muted-foreground">À traiter</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Mail className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">{newsletterCount} abonnés</p>
                    <p className="text-xs text-muted-foreground">Newsletter active</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Bot className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">{aiChatCount} conversations</p>
                    <p className="text-xs text-muted-foreground">Assistant IA</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visitor Map */}
          <InteractiveVisitorMap />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
