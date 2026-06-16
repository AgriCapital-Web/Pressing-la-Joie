import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  MessageSquare, Mail, Clock, Check, Eye, Reply, 
  Trash2, Loader2, Search, Filter, RefreshCw,
  Download, AlertCircle, CheckCircle
} from "lucide-react";
import { toast } from "sonner";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  read_at: string | null;
  created_at: string;
}

const AdminContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setMessages(data);
    if (error) toast.error("Erreur lors du chargement des messages");
    setIsLoading(false);
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ status: 'read', read_at: new Date().toISOString() })
      .eq('id', id);
    
    if (!error) {
      toast.success("Message marqué comme lu");
      fetchMessages();
    }
  };

  const markAsProcessed = async (id: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ status: 'processed' })
      .eq('id', id);
    
    if (!error) {
      toast.success("Message traité");
      fetchMessages();
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return;
    
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);
    
    if (!error) {
      toast.success("Message supprimé");
      setSelectedMessage(null);
      fetchMessages();
    }
  };

  const openReplyDialog = (message: ContactMessage) => {
    setSelectedMessage(message);
    setReplySubject(`Re: ${message.subject || 'Votre message sur AgriCapital'}`);
    setReplyContent(`Bonjour ${message.name},\n\nMerci pour votre message.\n\n\n\nCordialement,\nL'équipe AgriCapital`);
    setReplyDialogOpen(true);
  };

  const sendReply = async () => {
    if (!selectedMessage || !replyContent) {
      toast.error("Veuillez rédiger votre réponse");
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: selectedMessage.email,
          subject: replySubject,
          html: replyContent.replace(/\n/g, '<br/>')
        }
      });

      if (error) throw error;

      // Update message status
      await supabase
        .from('contact_messages')
        .update({ status: 'replied' })
        .eq('id', selectedMessage.id);

      // Log the email
      await supabase.from('email_logs').insert({
        recipient_email: selectedMessage.email,
        recipient_name: selectedMessage.name,
        subject: replySubject,
        body: replyContent,
        status: 'sent',
        sent_at: new Date().toISOString()
      });

      toast.success("Réponse envoyée avec succès");
      setReplyDialogOpen(false);
      setReplyContent("");
      fetchMessages();
    } catch (error) {
      console.error('Reply error:', error);
      toast.error("Erreur lors de l'envoi de la réponse");
    } finally {
      setIsSending(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Nom', 'Email', 'Sujet', 'Message', 'Statut'];
    const csvData = messages.map(m => [
      new Date(m.created_at).toLocaleDateString('fr-FR'),
      m.name,
      m.email,
      m.subject || '',
      m.message.replace(/"/g, '""'),
      m.status
    ]);

    const csvContent = [
      headers.join(';'),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `messages-contact-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success("Export CSV téléchargé");
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode; label: string }> = {
      new: { variant: "destructive", icon: <AlertCircle className="w-3 h-3" />, label: "Nouveau" },
      read: { variant: "secondary", icon: <Eye className="w-3 h-3" />, label: "Lu" },
      processed: { variant: "outline", icon: <Check className="w-3 h-3" />, label: "Traité" },
      replied: { variant: "default", icon: <CheckCircle className="w-3 h-3" />, label: "Répondu" }
    };
    const badge = badges[status] || badges.new;
    return (
      <Badge variant={badge.variant} className="flex items-center gap-1">
        {badge.icon}
        {badge.label}
      </Badge>
    );
  };

  const filteredMessages = messages.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.subject?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    read: messages.filter(m => m.status === 'read').length,
    replied: messages.filter(m => m.status === 'replied').length
  };

  if (isLoading) {
    return (
      <AdminLayout title="Messages de Contact">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Messages de Contact">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-destructive" />
                <div>
                  <p className="text-2xl font-bold">{stats.new}</p>
                  <p className="text-sm text-muted-foreground">Nouveaux</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Eye className="w-8 h-8 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.read}</p>
                  <p className="text-sm text-muted-foreground">Lus</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.replied}</p>
                  <p className="text-sm text-muted-foreground">Répondus</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, email, sujet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-md border border-input bg-background"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="new">Nouveaux</option>
                  <option value="read">Lus</option>
                  <option value="processed">Traités</option>
                  <option value="replied">Répondus</option>
                </select>
                <Button variant="outline" onClick={fetchMessages}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={exportToCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1 space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground mb-2">
              {filteredMessages.length} message(s)
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredMessages.map((message) => (
                <Card 
                  key={message.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedMessage?.id === message.id ? 'ring-2 ring-primary' : ''
                  } ${message.status === 'new' ? 'border-l-4 border-l-destructive' : ''}`}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (message.status === 'new') markAsRead(message.id);
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{message.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{message.email}</p>
                        <p className="text-sm mt-1 line-clamp-2">{message.subject || message.message}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge(message.status)}
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredMessages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun message trouvé</p>
                </div>
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedMessage.name}</CardTitle>
                      <a 
                        href={`mailto:${selectedMessage.email}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {selectedMessage.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedMessage.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4" />
                      {new Date(selectedMessage.created_at).toLocaleString('fr-FR')}
                    </p>
                    {selectedMessage.subject && (
                      <p className="font-medium mb-2">
                        Sujet: {selectedMessage.subject}
                      </p>
                    )}
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <Button onClick={() => openReplyDialog(selectedMessage)}>
                      <Reply className="w-4 h-4 mr-2" />
                      Répondre
                    </Button>
                    {selectedMessage.status !== 'processed' && (
                      <Button 
                        variant="outline" 
                        onClick={() => markAsProcessed(selectedMessage.id)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Marquer traité
                      </Button>
                    )}
                    <Button 
                      variant="destructive" 
                      onClick={() => deleteMessage(selectedMessage.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <Mail className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    Sélectionnez un message pour voir les détails
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Répondre à {selectedMessage?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Destinataire</Label>
              <Input value={selectedMessage?.email || ''} disabled />
            </div>
            <div>
              <Label>Sujet</Label>
              <Input 
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea 
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={10}
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={sendReply} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Reply className="w-4 h-4 mr-2" />
                  Envoyer la réponse
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminContactMessages;
