import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bell, BellOff, Check, Clock, Filter, Loader2, Mail,
  MessageSquare, RefreshCw, Search, Settings2, Trash2,
  Users, AlertCircle, CheckCircle, Info, XCircle, Eye
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";

const AdminPushNotificationsPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRead, setFilterRead] = useState<string>("all");
  
  const {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    requestNotificationPermission,
  } = useAdminNotifications();

  // Fetch all notifications with full history
  const { data: allNotifications = [], refetch } = useQuery({
    queryKey: ["admin-notifications-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("admin_notifications")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications-full"] });
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      toast.success("Notification supprimée");
    },
  });

  // Filter notifications
  const filteredNotifications = allNotifications.filter((notif) => {
    const matchesSearch =
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || notif.type === filterType;
    const matchesRead =
      filterRead === "all" ||
      (filterRead === "read" && notif.is_read) ||
      (filterRead === "unread" && !notif.is_read);
    return matchesSearch && matchesType && matchesRead;
  });

  // Get notification type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "contact_message":
        return <Mail className="w-4 h-4 text-blue-500" />;
      case "newsletter_subscription":
        return <Users className="w-4 h-4 text-green-500" />;
      case "testimonial":
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case "partnership_request":
        return <Users className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get notification type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "contact_message":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Message</Badge>;
      case "newsletter_subscription":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Newsletter</Badge>;
      case "testimonial":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Témoignage</Badge>;
      case "partnership_request":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Partenariat</Badge>;
      default:
        return <Badge variant="outline">Autre</Badge>;
    }
  };

  // Stats
  const stats = {
    total: allNotifications.length,
    unread: allNotifications.filter(n => !n.is_read).length,
    today: allNotifications.filter(n => {
      const today = new Date();
      const notifDate = new Date(n.created_at);
      return notifDate.toDateString() === today.toDateString();
    }).length,
    byType: {
      contact: allNotifications.filter(n => n.type === "contact_message").length,
      newsletter: allNotifications.filter(n => n.type === "newsletter_subscription").length,
      testimonial: allNotifications.filter(n => n.type === "testimonial").length,
      partnership: allNotifications.filter(n => n.type === "partnership_request").length,
    },
  };

  return (
    <AdminLayout title="Notifications Push">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Centre de Notifications</h1>
            <p className="text-muted-foreground">
              Gérez toutes vos notifications et alertes administrateur
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button onClick={requestNotificationPermission}>
              <Bell className="w-4 h-4 mr-2" />
              Activer Push
            </Button>
            {unreadCount > 0 && (
              <Button variant="secondary" onClick={() => markAllAsRead()}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Tout marquer lu
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700">Non lues</p>
                  <p className="text-2xl font-bold text-amber-800">{stats.unread}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Aujourd'hui</p>
                  <p className="text-2xl font-bold text-green-800">{stats.today}</p>
                </div>
                <Clock className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">Messages</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.byType.contact}</p>
                </div>
                <Mail className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <TabsList>
              <TabsTrigger value="all">Toutes ({stats.total})</TabsTrigger>
              <TabsTrigger value="unread">Non lues ({stats.unread})</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>

            <div className="flex-1 flex gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                className="border rounded-md px-3 py-2 text-sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Tous types</option>
                <option value="contact_message">Messages</option>
                <option value="newsletter_subscription">Newsletter</option>
                <option value="testimonial">Témoignages</option>
                <option value="partnership_request">Partenariats</option>
              </select>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historique complet</CardTitle>
                <CardDescription>
                  Toutes les notifications reçues par ordre chronologique
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BellOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune notification trouvée</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Titre</TableHead>
                          <TableHead className="hidden md:table-cell">Message</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredNotifications.map((notif) => (
                          <TableRow
                            key={notif.id}
                            className={!notif.is_read ? "bg-amber-50/50" : ""}
                          >
                            <TableCell>{getTypeIcon(notif.type)}</TableCell>
                            <TableCell>{getTypeBadge(notif.type)}</TableCell>
                            <TableCell className="font-medium">{notif.title}</TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground max-w-xs truncate">
                              {notif.message}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(notif.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
                            </TableCell>
                            <TableCell>
                              {notif.is_read ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  <Check className="w-3 h-3 mr-1" />
                                  Lu
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Non lu
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {!notif.is_read && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => markAsRead(notif.id)}
                                    title="Marquer comme lu"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteNotificationMutation.mutate(notif.id)}
                                  className="text-destructive hover:text-destructive"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notifications non lues</CardTitle>
                <CardDescription>
                  Notifications en attente de lecture
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredNotifications.filter(n => !n.is_read).map((notif) => (
                    <div
                      key={notif.id}
                      className="flex items-start gap-4 p-4 border rounded-lg bg-amber-50/50 hover:bg-amber-50 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeBadge(notif.type)}
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(notif.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                          </span>
                        </div>
                        <h4 className="font-medium text-foreground">{notif.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{notif.message}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(notif.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Lu
                      </Button>
                    </div>
                  ))}
                  {filteredNotifications.filter(n => !n.is_read).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <p>Toutes les notifications ont été lues !</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres des notifications</CardTitle>
                <CardDescription>
                  Configurez vos préférences de notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Types de notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium">Messages de contact</p>
                          <p className="text-sm text-muted-foreground">Nouveaux messages reçus via le formulaire</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium">Abonnements newsletter</p>
                          <p className="text-sm text-muted-foreground">Nouveaux abonnés à la newsletter</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="font-medium">Témoignages</p>
                          <p className="text-sm text-muted-foreground">Nouveaux témoignages soumis</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="font-medium">Demandes de partenariat</p>
                          <p className="text-sm text-muted-foreground">Nouvelles demandes de partenariat</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">Notifications navigateur</h4>
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <Bell className="w-8 h-8 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Notifications push</p>
                      <p className="text-sm text-muted-foreground">
                        Recevez des alertes même lorsque vous n'êtes pas sur le site
                      </p>
                    </div>
                    <Button onClick={requestNotificationPermission}>
                      Activer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Stats by Type */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Mail className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{stats.byType.contact}</p>
              <p className="text-sm text-muted-foreground">Messages</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{stats.byType.newsletter}</p>
              <p className="text-sm text-muted-foreground">Newsletter</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{stats.byType.testimonial}</p>
              <p className="text-sm text-muted-foreground">Témoignages</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold">{stats.byType.partnership}</p>
              <p className="text-sm text-muted-foreground">Partenariats</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPushNotificationsPage;
