import { Link, useLocation } from "react-router-dom";
import {
  BarChart3, MessageSquare, Users, Handshake,
  Mail, Settings, Bell, Database,
  Bot, UserCircle, Newspaper, Home, Shield, History, Image,
} from "lucide-react";
import logoUrl from "@/assets/logo-agricapital-v2.png";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdminSidebarProps {
  onNavigate?: () => void;
}

type MenuItem =
  | { divider: true; label: string }
  | { icon: any; label: string; path: string };

const menuItems: MenuItem[] = [
  { icon: BarChart3, label: "Tableau de bord", path: "/admin/dashboard" },
  { icon: BarChart3, label: "Analytiques", path: "/admin/analytics" },

  { divider: true, label: "Contenu" },
  { icon: Newspaper, label: "Actualités", path: "/admin/news" },
  { icon: Image, label: "Galerie photo", path: "/admin/gallery" },
  { icon: MessageSquare, label: "Témoignages", path: "/admin/testimonials" },

  { divider: true, label: "Communication" },
  { icon: Mail, label: "Messages contact", path: "/admin/contact-messages" },
  { icon: Users, label: "Newsletter", path: "/admin/newsletter" },
  { icon: History, label: "Historique envois", path: "/admin/newsletter-history" },
  { icon: Handshake, label: "Demandes partenariat", path: "/admin/partnership-requests" },
  { icon: Bot, label: "Conversations IA", path: "/admin/ai-conversations" },
  { icon: UserCircle, label: "Contacts visiteurs", path: "/admin/visitor-contacts" },
  { icon: Bell, label: "Notifications push", path: "/admin/push-notifications" },

  { divider: true, label: "Configuration" },
  { icon: Shield, label: "Utilisateurs & Rôles", path: "/admin/users" },
  { icon: Database, label: "Base de données", path: "/admin/database" },
  { icon: Settings, label: "Paramètres", path: "/admin/settings" },
];

const AdminSidebar = ({ onNavigate }: AdminSidebarProps) => {
  const location = useLocation();
  const handleClick = () => onNavigate?.();

  return (
    <aside className="w-64 bg-card border-r border-border h-[100dvh] lg:fixed left-0 top-0 z-40 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center gap-3" onClick={handleClick}>
          <img src={logoUrl} alt="AgriCapital" className="h-10 w-auto" />
          <div>
            <h1 className="font-bold text-foreground">AgriCapital</h1>
            <p className="text-xs text-muted-foreground">Administration</p>
          </div>
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-3">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              if ("divider" in item) {
                return (
                  <li key={`divider-${index}`} className="pt-4 pb-2">
                    <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {item.label}
                    </span>
                  </li>
                );
              }
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={handleClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </ScrollArea>

      <div className="p-3 border-t border-border">
        <Link
          to="/"
          onClick={handleClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm"
        >
          <Home className="w-4 h-4 flex-shrink-0" />
          <span>Retour au site</span>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
