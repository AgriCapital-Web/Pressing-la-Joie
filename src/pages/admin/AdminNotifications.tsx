import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, MessageSquare, Mail, Users, Check, ExternalLink, RefreshCw, AlertCircle, Eye, Smartphone, Send, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePushNotifications, useAdminNotifications } from "@/hooks/usePushNotifications";

interface Notification {
  id: string;
  type: 'testimonial' | 'newsletter' | 'contact' | 'message';
  title: string;
  message: string;
  date: string;
  read: boolean;
  link?: string;
}

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingTestimonials, setPendingTestimonials] = useState(0);
  const [newSubscribers, setNewSubscribers] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Push notifications
  const { 
    isSupported, 
    isEnabled, 
    permission, 
    isLoading: pushLoading, 
    requestPermission, 
    showNotification,
    disableNotifications 
  } = usePushNotifications();

  // Activate realtime push listeners
  useAdminNotifications();

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscriptions
    const testimonialsChannel = supabase
      .channel('testimonials-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'testimonials' }, () => {
        toast.info("Nouveau témoignage reçu !");
        fetchNotifications();
      })
      .subscribe();

    const contactChannel = supabase
      .channel('contact-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_messages' }, () => {
        toast.info("Nouveau message de contact !");
        fetchNotifications();
      })
      .subscribe();

    const newsletterChannel = supabase
      .channel('newsletter-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'newsletter_subscribers' }, () => {
        toast.info("Nouvel abonné à la newsletter !");
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(testimonialsChannel);
      supabase.removeChannel(contactChannel);
      supabase.removeChannel(newsletterChannel);
    };
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    
    // Fetch pending testimonials
    const { count: testimonialCount } = await supabase
      .from('testimonials')
      .select('*', { count: 'exact', head: true })
      .eq('approved', false);
    setPendingTestimonials(testimonialCount || 0);

    // Fetch recent subscribers (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: subscriberCount } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .gte('subscribed_at', weekAgo.toISOString());
    setNewSubscribers(subscriberCount || 0);

    // Fetch unread contact messages
    const { count: messageCount } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');
    setUnreadMessages(messageCount || 0);

    // Create notifications array
    const notifs: Notification[] = [];
    
    if (testimonialCount && testimonialCount > 0) {
      notifs.push({
        id: 'testimonials-pending',
        type: 'testimonial',
        title: 'Témoignages en attente',
        message: `${testimonialCount} témoignage(s) en attente d'approbation`,
        date: new Date().toISOString(),
        read: false,
        link: '/admin/testimonials'
      });
    }

    if (subscriberCount && subscriberCount > 0) {
      notifs.push({
        id: 'subscribers-new',
        type: 'newsletter',
        title: 'Nouveaux abonnés',
        message: `${subscriberCount} nouvel(aux) abonné(s) cette semaine`,
        date: new Date().toISOString(),
        read: false,
        link: '/admin/newsletter'
      });
    }

    if (messageCount && messageCount > 0) {
      notifs.push({
        id: 'messages-unread',
        type: 'contact',
        title: 'Messages non lus',
        message: `${messageCount} message(s) de contact à traiter`,
        date: new Date().toISOString(),
        read: false,
        link: '/admin/contact-messages'
      });
    }

    setNotifications(notifs);
    setIsLoading(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'testimonial':
        return <MessageSquare className="w-5 h-5 text-primary" />;
      case 'newsletter':
        return <Mail className="w-5 h-5 text-green-500" />;
      case 'contact':
        return <Users className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'testimonial':
        return 'default';
      case 'newsletter':
        return 'secondary';
      case 'contact':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleEnablePush = async () => {
    const result = await requestPermission();
    if (result.success) {
      toast.success("Notifications push activées!");
      await showNotification("Notifications activées", {
        body: "Vous recevrez des alertes même quand l'onglet est fermé",
        tag: "push-enabled",
      });
    } else {
      toast.error(result.error || "Erreur d'activation");
    }
  };

  const handleTestPush = async () => {
    const success = await showNotification("Test notification", {
      body: "Ceci est une notification de test AgriCapital",
      tag: "test-" + Date.now(),
    });
    if (success) toast.success("Notification envoyée!");
  };

  return (
    <AdminLayout title="Notifications">
      <div className="space-y-6">
        {/* Push Notifications Card */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="w-5 h-5" />
              Notifications Push
            </CardTitle>
            <CardDescription>
              Recevez des alertes même quand l'onglet est fermé
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant={isSupported ? "default" : "destructive"}>
                  {isSupported ? "Supporté" : "Non supporté"}
                </Badge>
                <Badge variant={isEnabled ? "default" : "secondary"}>
                  {isEnabled ? "Activé" : "Désactivé"}
                </Badge>
              </div>
              <div className="flex gap-2">
                {!isEnabled ? (
                  <Button 
                    onClick={handleEnablePush} 
                    disabled={!isSupported || pushLoading || permission === 'denied'}
                    size="sm"
                    className="bg-agri-green hover:bg-agri-green-dark"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    {pushLoading ? "Activation..." : "Activer"}
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={handleTestPush}>
                      <Send className="w-4 h-4 mr-2" />
                      Test
                    </Button>
                    <Button variant="ghost" size="sm" onClick={disableNotifications}>
                      <BellOff className="w-4 h-4 mr-2" />
                      Désactiver
                    </Button>
                  </>
                )}
              </div>
            </div>
            {permission === 'denied' && (
              <p className="text-sm text-destructive">
                Notifications refusées. Autorisez-les dans les paramètres navigateur.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Refresh Button */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={fetchNotifications} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={pendingTestimonials > 0 ? 'border-primary/50 bg-primary/5' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${pendingTestimonials > 0 ? 'bg-primary/20' : 'bg-muted'}`}>
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingTestimonials}</p>
                  <p className="text-sm text-muted-foreground">Témoignages en attente</p>
                </div>
              </div>
              {pendingTestimonials > 0 && (
                <Link to="/admin/testimonials">
                  <Button variant="link" size="sm" className="mt-2 p-0">
                    Voir <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card className={newSubscribers > 0 ? 'border-green-500/50 bg-green-500/5' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${newSubscribers > 0 ? 'bg-green-500/20' : 'bg-muted'}`}>
                  <Mail className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{newSubscribers}</p>
                  <p className="text-sm text-muted-foreground">Nouveaux abonnés (7j)</p>
                </div>
              </div>
              {newSubscribers > 0 && (
                <Link to="/admin/newsletter">
                  <Button variant="link" size="sm" className="mt-2 p-0 text-green-600">
                    Voir <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card className={unreadMessages > 0 ? 'border-orange-500/50 bg-orange-500/5' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${unreadMessages > 0 ? 'bg-orange-500/20' : 'bg-muted'}`}>
                  <AlertCircle className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{unreadMessages}</p>
                  <p className="text-sm text-muted-foreground">Messages non lus</p>
                </div>
              </div>
              {unreadMessages > 0 && (
                <Link to="/admin/contact-messages">
                  <Button variant="link" size="sm" className="mt-2 p-0 text-orange-600">
                    Voir <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Bell className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                  <p className="text-sm text-muted-foreground">Notifications actives</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications Récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium">Tout est à jour !</p>
                <p className="text-muted-foreground">Aucune notification en attente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                      notif.read ? 'bg-muted/30' : 'bg-primary/5 border-primary/20'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-background">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{notif.title}</p>
                        <Badge variant={getBadgeVariant(notif.type)} className="text-xs">
                          {notif.type === 'testimonial' ? 'Témoignage' : 
                           notif.type === 'newsletter' ? 'Newsletter' : 'Contact'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notif.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {notif.link && (
                      <Link to={notif.link}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Voir
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Notifications en temps réel</p>
                <p className="text-sm text-muted-foreground">
                  Les notifications sont mises à jour automatiquement lorsque de nouveaux témoignages, 
                  messages de contact ou abonnés newsletter arrivent. Gardez cette page ouverte pour 
                  recevoir les alertes instantanément.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
