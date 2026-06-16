import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare, 
  User, 
  Bot, 
  Search, 
  Calendar, 
  Globe, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  Clock,
  Mail,
  Phone,
  UserCircle,
  Mic,
  MessageCircle,
  TrendingUp,
  Eye
} from "lucide-react";
import { format, isToday, isYesterday, isThisWeek, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface ChatLog {
  id: string;
  session_id: string;
  user_message: string;
  assistant_response: string;
  language: string | null;
  created_at: string;
}

interface VisitorContact {
  id: string;
  session_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  language: string | null;
  created_at: string;
}

interface GroupedConversation {
  session_id: string;
  messages: ChatLog[];
  language: string | null;
  first_message_at: string;
  last_message_at: string;
  visitor?: VisitorContact;
  hasVoice: boolean;
  messageCount: number;
}

const AdminAIConversations = () => {
  const [conversations, setConversations] = useState<GroupedConversation[]>([]);
  const [visitorContacts, setVisitorContacts] = useState<VisitorContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMessages: 0,
    todayMessages: 0,
    todayConversations: 0,
    weekConversations: 0,
    voiceMessages: 0,
    identifiedVisitors: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch conversations and visitor contacts in parallel
      const [chatResult, contactsResult] = await Promise.all([
        supabase
          .from('ai_chat_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000),
        supabase
          .from('visitor_contacts')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (chatResult.error) throw chatResult.error;
      if (contactsResult.error) throw contactsResult.error;

      const data = chatResult.data || [];
      const contacts = contactsResult.data || [];
      setVisitorContacts(contacts);

      // Create a map of contacts by session_id
      const contactsMap = new Map(contacts.map(c => [c.session_id, c]));

      // Group by session_id
      const grouped = data.reduce((acc, log) => {
        const existing = acc.find(g => g.session_id === log.session_id);
        const isVoice = log.user_message.startsWith('[AUDIO]') || log.user_message.includes('audio:');
        
        if (existing) {
          existing.messages.push(log);
          existing.hasVoice = existing.hasVoice || isVoice;
          existing.messageCount++;
          if (new Date(log.created_at) < new Date(existing.first_message_at)) {
            existing.first_message_at = log.created_at;
          }
          if (new Date(log.created_at) > new Date(existing.last_message_at)) {
            existing.last_message_at = log.created_at;
          }
        } else {
          acc.push({
            session_id: log.session_id,
            messages: [log],
            language: log.language,
            first_message_at: log.created_at,
            last_message_at: log.created_at,
            visitor: contactsMap.get(log.session_id),
            hasVoice: isVoice,
            messageCount: 1,
          });
        }
        return acc;
      }, [] as GroupedConversation[]);

      // Sort messages within each conversation
      grouped.forEach(conv => {
        conv.messages.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });

      setConversations(grouped);

      // Calculate stats
      const today = new Date().toDateString();
      const todayMsgs = data.filter(log => new Date(log.created_at).toDateString() === today);
      const todayConvs = grouped.filter(g => new Date(g.first_message_at).toDateString() === today);
      const weekConvs = grouped.filter(g => isThisWeek(new Date(g.first_message_at)));
      const voiceMsgs = data.filter(log => log.user_message.startsWith('[AUDIO]') || log.user_message.includes('audio:'));
      const identified = grouped.filter(g => g.visitor && (g.visitor.email || g.visitor.phone));

      setStats({
        totalConversations: grouped.length,
        totalMessages: data.length,
        todayMessages: todayMsgs.length,
        todayConversations: todayConvs.length,
        weekConversations: weekConvs.length,
        voiceMessages: voiceMsgs.length,
        identifiedVisitors: identified.length,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const toggleSession = (sessionId: string) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedSessions(new Set(filteredConversations.map(c => c.session_id)));
  };

  const collapseAll = () => {
    setExpandedSessions(new Set());
  };

  const getLanguageLabel = (lang: string | null) => {
    const labels: Record<string, string> = {
      fr: 'Français',
      en: 'English',
      ar: 'العربية',
      es: 'Español',
      de: 'Deutsch',
      zh: '中文',
    };
    return labels[lang || 'fr'] || lang || 'Français';
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Aujourd'hui";
    if (isYesterday(date)) return "Hier";
    return format(date, "dd MMMM yyyy", { locale: fr });
  };

  const filteredConversations = conversations.filter(conv => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = conv.messages.some(
        msg => 
          msg.user_message.toLowerCase().includes(searchLower) ||
          msg.assistant_response.toLowerCase().includes(searchLower)
      ) || 
      conv.visitor?.first_name?.toLowerCase().includes(searchLower) ||
      conv.visitor?.last_name?.toLowerCase().includes(searchLower) ||
      conv.visitor?.email?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Date filter
    if (dateFilter !== "all") {
      const convDate = new Date(conv.first_message_at);
      switch (dateFilter) {
        case "today":
          if (!isToday(convDate)) return false;
          break;
        case "yesterday":
          if (!isYesterday(convDate)) return false;
          break;
        case "week":
          if (!isThisWeek(convDate)) return false;
          break;
        case "month":
          if (convDate < subDays(new Date(), 30)) return false;
          break;
      }
    }

    // Language filter
    if (languageFilter !== "all" && conv.language !== languageFilter) {
      return false;
    }

    return true;
  });

  const exportToCSV = () => {
    const rows: string[] = ['Session ID,Visiteur,Email,Téléphone,Date,Langue,Message Utilisateur,Réponse Assistant'];
    conversations.forEach(conv => {
      conv.messages.forEach(msg => {
        const visitor = conv.visitor;
        const visitorName = visitor ? `${visitor.first_name || ''} ${visitor.last_name || ''}`.trim() : '';
        const userMsg = msg.user_message.replace(/"/g, '""').replace(/\n/g, ' ');
        const assistantMsg = msg.assistant_response.replace(/"/g, '""').replace(/\n/g, ' ');
        rows.push(
          `"${msg.session_id}","${visitorName}","${visitor?.email || ''}","${visitor?.phone || ''}","${format(new Date(msg.created_at), 'dd/MM/yyyy HH:mm')}","${msg.language || 'fr'}","${userMsg}","${assistantMsg}"`
        );
      });
    });
    
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversations-ia-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV téléchargé');
  };

  return (
    <AdminLayout title="Conversations IA">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Conversations IA</h1>
            <p className="text-muted-foreground">Historique complet des échanges avec KAPITA</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button variant="outline" onClick={expandAll}>
              <Eye className="h-4 w-4 mr-2" />
              Tout déplier
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalConversations}</p>
                  <p className="text-xs text-muted-foreground">Conversations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalMessages}</p>
                  <p className="text-xs text-muted-foreground">Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.todayConversations}</p>
                  <p className="text-xs text-muted-foreground">Aujourd'hui</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.weekConversations}</p>
                  <p className="text-xs text-muted-foreground">Cette semaine</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Mic className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.voiceMessages}</p>
                  <p className="text-xs text-muted-foreground">Vocaux</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-500/10 rounded-lg">
                  <UserCircle className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.identifiedVisitors}</p>
                  <p className="text-xs text-muted-foreground">Identifiés</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.todayMessages}</p>
                  <p className="text-xs text-muted-foreground">Msgs aujourd'hui</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email, message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes dates</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="yesterday">Hier</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
              </SelectContent>
            </Select>
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-40">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Langue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes langues</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          {filteredConversations.length} conversation(s) trouvée(s)
        </div>

        {/* Conversations List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Chargement des conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune conversation trouvée</p>
              </CardContent>
            </Card>
          ) : (
            filteredConversations.map((conv) => (
              <Card key={conv.session_id} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSession(conv.session_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          {conv.visitor?.first_name || conv.visitor?.last_name ? (
                            <span>{conv.visitor.first_name} {conv.visitor.last_name}</span>
                          ) : (
                            <span>Visiteur anonyme</span>
                          )}
                          {conv.hasVoice && (
                            <Badge variant="outline" className="text-xs">
                              <Mic className="h-3 w-3 mr-1" />
                              Vocal
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                          <Calendar className="h-3 w-3" />
                          {getDateLabel(new Date(conv.first_message_at))} à {format(new Date(conv.first_message_at), "HH:mm")}
                          {conv.visitor?.email && (
                            <>
                              <span className="mx-1">•</span>
                              <Mail className="h-3 w-3" />
                              {conv.visitor.email}
                            </>
                          )}
                          {conv.visitor?.phone && (
                            <>
                              <span className="mx-1">•</span>
                              <Phone className="h-3 w-3" />
                              {conv.visitor.phone}
                            </>
                          )}
                          <span className="mx-1">•</span>
                          <Globe className="h-3 w-3" />
                          {getLanguageLabel(conv.language)}
                          <span className="mx-1">•</span>
                          <Badge variant="secondary" className="text-xs">
                            {conv.messageCount} messages
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {expandedSessions.has(conv.session_id) ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                
                {expandedSessions.has(conv.session_id) && (
                  <CardContent className="border-t bg-muted/20">
                    <ScrollArea className="max-h-[500px]">
                      <div className="space-y-4 p-4">
                        {conv.messages.map((msg, idx) => (
                          <div key={msg.id || idx} className="space-y-3">
                            {/* User message */}
                            <div className="flex gap-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full h-fit shrink-0">
                                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">
                                    {conv.visitor?.first_name || 'Visiteur'}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(msg.created_at), "HH:mm:ss")}
                                  </span>
                                  {(msg.user_message.startsWith('[AUDIO]') || msg.user_message.includes('audio:')) && (
                                    <Badge variant="outline" className="text-xs">
                                      <Mic className="h-3 w-3 mr-1" />
                                      Vocal
                                    </Badge>
                                  )}
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm break-words">
                                  {msg.user_message}
                                </div>
                              </div>
                            </div>
                            
                            {/* Assistant response */}
                            {msg.assistant_response && msg.assistant_response !== 'streaming' && (
                              <div className="flex gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full h-fit shrink-0">
                                  <Bot className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-green-700 dark:text-green-400">KAPITA</span>
                                  </div>
                                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-sm whitespace-pre-wrap break-words">
                                    {msg.assistant_response}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAIConversations;