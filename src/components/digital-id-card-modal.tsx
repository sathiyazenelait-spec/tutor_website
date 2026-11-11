import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, GraduationCap, BookOpen, QrCode, Sparkles, Building, Calendar, Award, Star, CheckCircle2 } from "lucide-react";

export interface ProfileCardData {
  id: number;
  name: string;
  email: string;
  role: string;
  idNumber: string;
  institution: string;
  grade?: string;
  specialization?: string;
  verified: boolean;
  totalUploadedLessons?: number;
  rating?: number;
  accreditation?: string;
  studentLevel?: string;
  createdAt?: string;
}

interface DigitalIdCardModalProps {
  profile: ProfileCardData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DigitalIdCardModal({ profile, open, onOpenChange }: DigitalIdCardModalProps) {
  if (!profile) return null;

  const isTutor = profile.role === "ROLE_TUTOR" || profile.role === "TUTOR";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-transparent border-0 shadow-2xl">
        {/* PHYSICAL ID CARD CONTAINER */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-card via-background to-card border-2 border-primary/40 shadow-2xl p-6 text-foreground">
          {/* HOLOGRAPHIC SHINE OVERLAY */}
          <div className="absolute -top-24 -left-24 size-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 size-48 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

          {/* CARD HEADER */}
          <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lamp">
                <Sparkles className="size-5" />
              </span>
              <div>
                <h3 className="font-display font-bold text-base tracking-tight leading-none">
                  LearnSpace<span className="text-primary">Haven</span>
                </h3>
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                  Official Academic ID Card
                </span>
              </div>
            </div>

            <Badge
              variant="outline"
              className={`text-xs px-2.5 py-0.5 gap-1 font-semibold ${
                isTutor
                  ? "border-sky-500/40 bg-sky-500/10 text-sky-400"
                  : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              }`}
            >
              <ShieldCheck className="size-3.5" />
              <span>{isTutor ? "Verified Faculty" : "Honors Student"}</span>
            </Badge>
          </div>

          {/* PHOTO & MAIN IDENTITY */}
          <div className="flex items-start gap-4">
            <div className="relative size-24 rounded-2xl overflow-hidden border-2 border-primary/50 bg-ink grid place-items-center shrink-0 shadow-lg">
              <div className="size-full bg-gradient-to-tr from-primary/30 to-accent/30 grid place-items-center text-primary-foreground font-display font-bold text-3xl">
                {profile.name.charAt(0)}
              </div>
              <span className="absolute bottom-1 right-1 grid size-5 place-items-center rounded-full bg-emerald-500 text-white shadow">
                <CheckCircle2 className="size-3.5" />
              </span>
            </div>

            <div className="flex-1 space-y-1">
              <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                ID: {profile.idNumber}
              </span>
              <h4 className="text-xl font-display font-bold text-foreground leading-tight pt-1">
                {profile.name}
              </h4>
              <p className="text-xs text-muted-foreground">{profile.email}</p>

              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
                <Building className="size-3 text-primary" />
                <span className="truncate max-w-[200px]">{profile.institution}</span>
              </div>
            </div>
          </div>

          {/* DETAILS & CREDENTIAL METRICS */}
          <div className="mt-5 grid grid-cols-2 gap-2.5 pt-4 border-t border-border/50 text-xs">
            <div className="p-2.5 rounded-xl bg-card border border-border/60">
              <span className="text-[10px] uppercase font-mono text-muted-foreground block mb-0.5">
                {isTutor ? "Specialization" : "Academic Focus"}
              </span>
              <p className="font-semibold text-foreground truncate">{profile.specialization}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-card border border-border/60">
              <span className="text-[10px] uppercase font-mono text-muted-foreground block mb-0.5">
                {isTutor ? "Faculty Status" : "Class / Grade"}
              </span>
              <p className="font-semibold text-foreground truncate">{profile.grade}</p>
            </div>

            {isTutor && (
              <div className="col-span-2 p-2.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Star className="size-3.5 text-amber-500 fill-current" />
                  <span className="font-semibold text-foreground">Rating: {profile.rating || 4.9} / 5.0</span>
                </div>
                <span className="text-[11px] text-primary font-medium">
                  {profile.totalUploadedLessons || 0} Lessons Uploaded
                </span>
              </div>
            )}
          </div>

          {/* CARD FOOTER WITH MOCK QR CODE & VALIDITY */}
          <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-10 rounded-lg bg-foreground text-background grid place-items-center p-1">
                <QrCode className="size-8" />
              </div>
              <div className="text-[10px] leading-tight text-muted-foreground font-mono">
                <span>SECURE CRYPTO CHIP</span>
                <br />
                <span>VALID: 2026 - 2027</span>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs rounded-full h-8 px-4"
            >
              Close Card
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
