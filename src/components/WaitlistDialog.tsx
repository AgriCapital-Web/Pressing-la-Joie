import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import WaitlistForm from "@/components/WaitlistForm";

const WaitlistDialog = ({ children, sourcePage }: { children: React.ReactNode; sourcePage?: string }) => (
  <Dialog>
    <DialogTrigger asChild>{children}</DialogTrigger>
    <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Rejoindre la liste d'attente AgriCapital</DialogTitle>
      </DialogHeader>
      <WaitlistForm sourcePage={sourcePage} />
    </DialogContent>
  </Dialog>
);

export default WaitlistDialog;