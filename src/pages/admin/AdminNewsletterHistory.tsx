import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, RefreshCw, Send, AlertTriangle, CheckCircle2, XCircle, Mail } from "lucide-react";
import { toast } from "sonner";

interface FailedRecipient {
  email: string;
  error: string;
}

const AdminNewsletterHistory = () => {
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [selectedSend, setSelectedSend] = useState<any | null>(null);

  const { data: sends = [], isLoading, refetch } = useQuery({
    queryKey: ["newsletter-sends"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_sends")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const handleRetryFailed = async (send: any) => {
    const failed = send.failed_recipients as FailedRecipient[] | null;
    if (!failed || failed.length === 0) {
      toast.info("Aucun destinataire en échec à renvoyer");
      return;
    }
    if (!confirm(`Renvoyer à ${failed.length} destinataires en échec ?`)) return;

    setRetryingId(send.id);
    try {
      // Use stored original HTML content for exact resend
      const originalHtml = (send as any).html_content || send.html_preview || `<p>Renvoi de la newsletter : ${send.subject}</p>`;
      const { data, error } = await supabase.functions.invoke("send-newsletter-batch", {
        body: {
          subject: send.subject,
          html: originalHtml,
          retryEmails: failed.map((f: FailedRecipient) => f.email),
        },
      });
      if (error) throw error;

      // Update the send record
      const newFailed = data?.failedRecipients || [];
      await supabase
        .from("newsletter_sends")
        .update({
          total_sent: send.total_sent + (data?.totalSent || 0),
          total_failed: newFailed.length,
          failed_recipients: newFailed.length > 0 ? newFailed : [],
        })
        .eq("id", send.id);

      refetch();
      toast.success(`Renvoi terminé : ${data?.totalSent || 0} succès, ${newFailed.length} échecs`);
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors du renvoi");
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <AdminLayout title="Historique Newsletter">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">{sends.length}</p>
              <p className="text-sm text-muted-foreground">Envois total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{sends.reduce((s, r) => s + (r.total_sent || 0), 0)}</p>
              <p className="text-sm text-muted-foreground">Emails délivrés</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-destructive">{sends.reduce((s, r) => s + (r.total_failed || 0), 0)}</p>
              <p className="text-sm text-muted-foreground">Échecs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">{sends.reduce((s, r) => s + (r.total_recipients || 0), 0)}</p>
              <p className="text-sm text-muted-foreground">Destinataires total</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Historique des envois
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : sends.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucun envoi enregistré</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Sujet</TableHead>
                      <TableHead>Audience</TableHead>
                      <TableHead className="text-center">Envoyés</TableHead>
                      <TableHead className="text-center">Échecs</TableHead>
                      <TableHead className="text-center">Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sends.map((send) => {
                      const failed = (send.failed_recipients as unknown as FailedRecipient[] | null) || [];
                      const hasFailed = failed.length > 0;
                      return (
                        <TableRow key={send.id}>
                          <TableCell className="text-sm whitespace-nowrap">
                            {new Date(send.created_at).toLocaleDateString("fr-FR", {
                              day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate font-medium">{send.subject}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{send.audience_type || "all"}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-green-600 font-semibold">{send.total_sent}</span>
                            <span className="text-muted-foreground">/{send.total_recipients}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            {send.total_failed > 0 ? (
                              <span className="text-destructive font-semibold">{send.total_failed}</span>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {hasFailed ? (
                              <Badge variant="destructive" className="text-xs gap-1">
                                <AlertTriangle className="w-3 h-3" />Partiel
                              </Badge>
                            ) : (
                              <Badge className="text-xs gap-1 bg-green-600">
                                <CheckCircle2 className="w-3 h-3" />Complet
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {hasFailed && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRetryFailed(send)}
                                  disabled={retryingId === send.id}
                                  className="text-xs gap-1"
                                >
                                  {retryingId === send.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <RefreshCw className="w-3 h-3" />
                                  )}
                                  Renvoyer
                                </Button>
                              )}
                              {hasFailed && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setSelectedSend(send)}
                                  className="text-xs gap-1"
                                >
                                  <XCircle className="w-3 h-3" />
                                  Détails
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Failed recipients dialog */}
        <Dialog open={!!selectedSend} onOpenChange={() => setSelectedSend(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Destinataires en échec
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {((selectedSend?.failed_recipients as unknown as FailedRecipient[] | null) || []).map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{f.email}</p>
                    <p className="text-xs text-muted-foreground">{f.error}</p>
                  </div>
                </div>
              ))}
              {((selectedSend?.failed_recipients as unknown as FailedRecipient[] | null) || []).length === 0 && (
                <p className="text-center text-muted-foreground py-4">Aucun échec</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminNewsletterHistory;
