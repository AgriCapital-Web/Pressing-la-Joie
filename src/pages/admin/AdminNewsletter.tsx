import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Loader2, Send, Download, Mail, Sparkles, Users, UserCheck, Handshake, TrendingUp, Eye, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type AudienceType = 'all' | 'investors' | 'partners' | 'clients' | 'subscribers';

const AdminNewsletter = () => {
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [targetAudience, setTargetAudience] = useState<AudienceType>('all');
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch subscribers
  const { data: subscribers = [], isLoading: loadingSubs, refetch: refetchSubs } = useQuery({
    queryKey: ["newsletter-subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch testimonial emails
  const { data: testimonialEmails = [] } = useQuery({
    queryKey: ["testimonial-emails"],
    queryFn: async () => {
      const { data } = await supabase.from('testimonials').select('email, first_name, last_name').not('email', 'is', null);
      return data?.filter(t => t.email) || [];
    }
  });

  // Fetch partnership request emails
  const { data: partnerEmails = [] } = useQuery({
    queryKey: ["partner-emails"],
    queryFn: async () => {
      const { data } = await supabase.from('partnership_requests').select('email, first_name, last_name, partner_type, request_type');
      return data || [];
    }
  });

  // Fetch visitor contacts
  const { data: visitorEmails = [] } = useQuery({
    queryKey: ["visitor-emails"],
    queryFn: async () => {
      const { data } = await supabase.from('visitor_contacts').select('email, first_name, last_name').not('email', 'is', null);
      return data?.filter(v => v.email) || [];
    }
  });

  // Smart recipient selection
  const getRecipients = () => {
    const allEmails = new Set<string>();
    
    if (targetAudience === 'all' || targetAudience === 'subscribers') {
      subscribers.filter(s => s.is_active).forEach(s => allEmails.add(s.email));
    }
    if (targetAudience === 'all' || targetAudience === 'investors') {
      partnerEmails.filter(p => p.request_type === 'investment' || p.partner_type === 'investor').forEach(p => allEmails.add(p.email));
    }
    if (targetAudience === 'all' || targetAudience === 'partners') {
      partnerEmails.filter(p => p.partner_type === 'technical' || p.partner_type === 'institutional').forEach(p => allEmails.add(p.email));
    }
    if (targetAudience === 'all' || targetAudience === 'clients') {
      partnerEmails.filter(p => p.partner_type === 'farmer' || p.partner_type === 'producer').forEach(p => allEmails.add(p.email));
      testimonialEmails.forEach(t => allEmails.add(t.email!));
      visitorEmails.forEach(v => allEmails.add(v.email!));
    }
    
    // Fallback: if specific audience is empty, add subscribers
    if (allEmails.size === 0) {
      subscribers.filter(s => s.is_active).forEach(s => allEmails.add(s.email));
    }
    
    return Array.from(allEmails);
  };

  // AI Newsletter Generation
  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Entrez un sujet ou une phrase pour générer la newsletter");
      return;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-newsletter', {
        body: { prompt: aiPrompt, targetAudience }
      });
      if (error) throw error;
      if (data) {
        setSubject(data.subject || "");
        setHtmlContent(data.html || "");
        toast.success("Newsletter générée ! Vérifiez et envoyez.");
      }
    } catch (error: any) {
      console.error("AI generation error:", error);
      toast.error(error?.message || "Erreur de génération");
    } finally {
      setIsGenerating(false);
    }
  };

  // Send newsletter
  const handleSend = async () => {
    if (!subject || !htmlContent) {
      toast.error("Générez d'abord la newsletter avec l'IA");
      return;
    }
    const recipients = getRecipients();
    if (recipients.length === 0) {
      toast.error("Aucun destinataire trouvé");
      return;
    }
    if (!confirm(`Envoyer à ${recipients.length} destinataires ?`)) return;

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-newsletter-batch', {
        body: { subject, html: htmlContent, includeTestimonials: targetAudience === 'all' || targetAudience === 'clients' }
      });
      if (error) throw error;
      
      // Save send record
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('newsletter_sends').insert({
        subject,
        html_preview: htmlContent.substring(0, 500),
        html_content: htmlContent,
        total_recipients: data?.totalRecipients || recipients.length,
        total_sent: data?.totalSent || 0,
        total_failed: data?.totalFailed || 0,
        failed_recipients: data?.failedRecipients || [],
        audience_type: targetAudience,
        sent_by: user?.id,
      } as any);

      const failedList = data?.failedRecipients as { email: string; error: string }[] | undefined;
      if (failedList && failedList.length > 0) {
        toast.warning(`Newsletter envoyée : ${data?.totalSent || 0} succès, ${data?.totalFailed || 0} échecs`, {
          description: `Échecs : ${failedList.map(f => f.email).join(', ')}`,
          duration: 10000,
        });
      } else {
        toast.success(`Newsletter envoyée avec succès à ${data?.totalSent || 0} destinataires !`);
      }
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de l'envoi");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet abonné ?")) return;
    await supabase.from('newsletter_subscribers').delete().eq('id', id);
    refetchSubs();
    toast.success("Abonné supprimé");
  };

  const handleExport = () => {
    const csv = subscribers.map(s => `${s.email},${s.subscribed_at},${s.is_active}`).join('\n');
    const blob = new Blob([`Email,Date,Actif\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export téléchargé");
  };

  const audienceOptions = [
    { value: 'all' as const, label: 'Tous', icon: Users, count: getRecipients().length },
    { value: 'investors' as const, label: 'Investisseurs', icon: TrendingUp, count: partnerEmails.filter(p => p.request_type === 'investment').length },
    { value: 'partners' as const, label: 'Partenaires', icon: Handshake, count: partnerEmails.filter(p => p.partner_type === 'technical' || p.partner_type === 'institutional').length },
    { value: 'clients' as const, label: 'Clients & Planteurs', icon: UserCheck, count: testimonialEmails.length + visitorEmails.length },
    { value: 'subscribers' as const, label: 'Abonnés newsletter', icon: Mail, count: subscribers.filter(s => s.is_active).length },
  ];

  return (
    <AdminLayout title="Newsletter IA">
      <Tabs defaultValue="compose" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose">
            <Sparkles className="w-4 h-4 mr-2" />
            Composer avec IA
          </TabsTrigger>
          <TabsTrigger value="subscribers">
            <Users className="w-4 h-4 mr-2" />
            Abonnés ({subscribers.length})
          </TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
        </TabsList>

        {/* AI Compose Tab */}
        <TabsContent value="compose" className="space-y-6">
          {/* Audience Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Audience cible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {audienceOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setTargetAudience(opt.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      targetAudience === opt.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <opt.icon className={`w-5 h-5 mb-1 ${targetAudience === opt.value ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.count} contacts</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Génération IA
                <Badge variant="secondary" className="text-[10px]">Gemini</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Sujet ou phrase clé</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ex: Lancement d'une nouvelle pépinière"
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && generateWithAI()}
                  />
                  <Button
                    onClick={generateWithAI}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isGenerating ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Génération...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" />Générer</>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  L'IA génère automatiquement l'objet, le contenu structuré, le CTA et la signature professionnelle AgriCapital.
                </p>
              </div>

              {subject && (
                <div className="space-y-3 pt-4 border-t">
                  <div>
                    <Label>Objet du mail</Label>
                    <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 font-medium" />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
                      <Eye className="w-4 h-4 mr-1" />
                      {previewMode ? 'Code HTML' : 'Aperçu'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={generateWithAI} disabled={isGenerating}>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Régénérer
                    </Button>
                  </div>

                  {previewMode ? (
                    <div className="border rounded-lg overflow-hidden bg-white" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                      <iframe
                        srcDoc={htmlContent}
                        className="w-full border-0"
                        style={{ height: '500px' }}
                        title="Aperçu newsletter"
                      />
                    </div>
                  ) : (
                    <Textarea
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      rows={12}
                      className="font-mono text-xs"
                    />
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      onClick={handleSend}
                      disabled={isSending || !subject || !htmlContent}
                      className="bg-primary hover:bg-primary/90 flex-1"
                    >
                      {isSending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Envoi en cours...</>
                      ) : (
                        <><Send className="w-4 h-4 mr-2" />Envoyer à {getRecipients().length} destinataires</>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Abonnés newsletter</h2>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              {loadingSubs ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
              ) : subscribers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucun abonné</p>
              ) : (
                <div className="divide-y">
                  {subscribers.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                      <div>
                        <p className="font-medium text-sm">{sub.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sub.subscribed_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={sub.is_active ? "default" : "secondary"} className="text-xs">
                          {sub.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(sub.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">{subscribers.length}</p>
                <p className="text-sm text-muted-foreground">Abonnés newsletter</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">{subscribers.filter(s => s.is_active).length}</p>
                <p className="text-sm text-muted-foreground">Actifs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">{partnerEmails.length}</p>
                <p className="text-sm text-muted-foreground">Partenaires</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">{visitorEmails.length + testimonialEmails.length}</p>
                <p className="text-sm text-muted-foreground">Contacts visiteurs</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminNewsletter;
