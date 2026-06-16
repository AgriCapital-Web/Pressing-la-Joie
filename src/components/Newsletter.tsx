import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, User, Loader2, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Newsletter = () => {
  const { t } = useLanguage();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !lastName) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers" as any)
        .insert({ email } as any);

      if (error) {
        if (error.code === "23505") {
          toast.info(t.newsletter.alreadySubscribed);
        } else {
          throw error;
        }
      } else {
        // Send welcome email
        try {
          await supabase.functions.invoke('send-newsletter-welcome', {
            body: { firstName, lastName, email }
          });
        } catch (emailError) {
          console.log("Welcome email could not be sent:", emailError);
        }
        
        setIsSubscribed(true);
        toast.success(t.newsletter.success);
        setFirstName("");
        setLastName("");
        setEmail("");
      }
    } catch (error) {
      console.error("Newsletter error:", error);
      toast.error(t.newsletter.error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className="flex items-center gap-2 text-agri-orange">
        <CheckCircle2 className="w-5 h-5" />
        <span className="text-sm">{t.newsletter.subscribed}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* First Name */}
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-agri-orange" />
        <Input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder={t.newsletter.firstNamePlaceholder}
          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
          required
        />
      </div>
      
      {/* Last Name */}
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-agri-orange" />
        <Input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder={t.newsletter.lastNamePlaceholder}
          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
          required
        />
      </div>
      
      {/* Email */}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-agri-orange" />
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.newsletter.placeholder}
          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
          required
        />
      </div>
      
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-agri-orange hover:bg-agri-orange/90 text-white"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          t.newsletter.submit
        )}
      </Button>
      
      <p className="text-xs text-white/60">
        {t.newsletter.privacy}
      </p>
    </form>
  );
};

export default Newsletter;
