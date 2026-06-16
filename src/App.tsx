import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { usePageTracking } from "@/hooks/usePageTracking";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminResetPassword from "./pages/AdminResetPassword";
import AdminSetup from "./pages/AdminSetup";

// Lazy-loaded public pages
const FAQ = lazy(() => import("./pages/FAQ"));
const Evolution = lazy(() => import("./pages/Evolution"));
const PartnershipRequest = lazy(() => import("./pages/PartnershipRequest"));
const News = lazy(() => import("./pages/News"));
const NewsArticle = lazy(() => import("./pages/NewsArticle"));
const TestimonialsPage = lazy(() => import("./pages/TestimonialsPage"));
const Solutions = lazy(() => import("./pages/Solutions"));
const OfferingDetail = lazy(() => import("./pages/OfferingDetail"));
const Partenariats = lazy(() => import("./pages/Partenariats"));

// Lazy-loaded admin pages — vitrine: minimal & focused
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminNews = lazy(() => import("./pages/admin/AdminNews"));
const AdminGallery = lazy(() => import("./pages/admin/AdminGallery"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminNewsletter = lazy(() => import("./pages/admin/AdminNewsletter"));
const AdminNewsletterHistory = lazy(() => import("./pages/admin/AdminNewsletterHistory"));
const AdminPartnershipRequests = lazy(() => import("./pages/admin/AdminPartnershipRequests"));
const AdminContactMessages = lazy(() => import("./pages/admin/AdminContactMessages"));
const AdminAIConversations = lazy(() => import("./pages/admin/AdminAIConversations"));
const AdminVisitorContacts = lazy(() => import("./pages/admin/AdminVisitorContacts"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminAuditLog = lazy(() => import("./pages/admin/AdminAuditLog"));
const AdminBackup = lazy(() => import("./pages/admin/AdminBackup"));
const AdminDatabase = lazy(() => import("./pages/admin/AdminDatabase"));
const AdminPushNotificationsPage = lazy(() => import("./pages/admin/AdminPushNotificationsPage"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const AppContent = () => {
  usePageTracking();
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/accueil" element={<HomePage />} />
        <Route path="/a-propos" element={<HomePage />} />
        <Route path="/apropos" element={<HomePage />} />
        <Route path="/notre-approche" element={<HomePage />} />
        <Route path="/approche" element={<HomePage />} />
        <Route path="/impact" element={<HomePage />} />
        <Route path="/jalons" element={<HomePage />} />
        <Route path="/fondateur" element={<HomePage />} />
        <Route path="/partenariat" element={<HomePage />} />
        <Route path="/temoignages" element={<TestimonialsPage />} />
        <Route path="/contact" element={<HomePage />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/evolution" element={<Evolution />} />
        <Route path="/evolution-projet" element={<Evolution />} />
        <Route path="/partenariat-demande" element={<PartnershipRequest />} />
        <Route path="/partnership-request" element={<PartnershipRequest />} />
        <Route path="/actualites" element={<News />} />
        <Route path="/actualites/:slug" element={<NewsArticle />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:slug" element={<NewsArticle />} />

        {/* Solutions / Services / Partenariats */}
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/services" element={<Solutions />} />
        <Route path="/solutions/:slug" element={<OfferingDetail type="solution" />} />
        <Route path="/services/:slug" element={<OfferingDetail type="service" />} />
        <Route path="/partenariats" element={<Partenariats />} />
        <Route path="/partnerships" element={<Partenariats />} />

        {/* English aliases */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/about" element={<HomePage />} />
        <Route path="/approach" element={<HomePage />} />
        <Route path="/milestones" element={<HomePage />} />
        <Route path="/founder" element={<HomePage />} />
        <Route path="/partnership" element={<HomePage />} />
        <Route path="/testimonials" element={<HomePage />} />

        {/* Language roots */}
        <Route path="/fr" element={<HomePage />} />
        <Route path="/en" element={<HomePage />} />
        <Route path="/ar" element={<HomePage />} />
        <Route path="/es" element={<HomePage />} />
        <Route path="/de" element={<HomePage />} />
        <Route path="/zh" element={<HomePage />} />
        <Route path="/:lang/:section" element={<HomePage />} />

        {/* Admin — vitrine focused */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/setup" element={<AdminSetup />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />

        {/* Content */}
        <Route path="/admin/news" element={<AdminNews />} />
        <Route path="/admin/gallery" element={<AdminGallery />} />
        <Route path="/admin/testimonials" element={<AdminTestimonials />} />

        {/* Communication */}
        <Route path="/admin/contact-messages" element={<AdminContactMessages />} />
        <Route path="/admin/newsletter" element={<AdminNewsletter />} />
        <Route path="/admin/newsletter-history" element={<AdminNewsletterHistory />} />
        <Route path="/admin/partnership-requests" element={<AdminPartnershipRequests />} />
        <Route path="/admin/ai-conversations" element={<AdminAIConversations />} />
        <Route path="/admin/visitor-contacts" element={<AdminVisitorContacts />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/push-notifications" element={<AdminPushNotificationsPage />} />

        {/* Configuration */}
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/audit-log" element={<AdminAuditLog />} />
        <Route path="/admin/backup" element={<AdminBackup />} />
        <Route path="/admin/database" element={<AdminDatabase />} />
        <Route path="/admin/settings" element={<AdminSettings />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
