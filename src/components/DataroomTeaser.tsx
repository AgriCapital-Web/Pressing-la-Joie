import { Link } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";

const DataroomTeaser = () => (
  <section className="py-10 md:py-14 bg-gradient-to-br from-primary/5 to-accent/5">
    <div className="container mx-auto px-4 md:px-6">
      <div className="max-w-4xl mx-auto rounded-2xl border border-primary/20 bg-card p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Lock className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">
            AgriCapital Cloud — Espace Documentaire Confidentiel
          </h3>
          <p className="text-sm text-muted-foreground">
            Accédez à nos documents stratégiques, présentations et données de manière sécurisée. Signature NDA numérique requise.
          </p>
        </div>
        <Link
          to="/dataroom"
          className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Accéder au portail <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  </section>
);

export default DataroomTeaser;
