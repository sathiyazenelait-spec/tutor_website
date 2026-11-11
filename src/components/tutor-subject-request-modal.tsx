import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { BookOpen, Send, Loader2, Sparkles, CheckCircle2, Clock, XCircle, Database } from "lucide-react";

interface SubjectRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TutorSubjectRequestModal({ open, onOpenChange, onSuccess }: SubjectRequestModalProps) {
  const { fetchWithAuth } = useAuth();
  const [subjectName, setSubjectName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState<any[]>([]);

  const loadRequests = async () => {
    if (!open) return;
    try {
      const res = await fetchWithAuth("/tutor/subject-requests");
      if (res.ok) setMyRequests(await res.json());
    } catch (e) {}
  };

  useEffect(() => {
    loadRequests();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetchWithAuth("/tutor/subject-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectName: subjectName.trim(),
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit request");

      toast.success("Subject suggestion submitted! Admin will verify and approve it.");
      setSubjectName("");
      setDescription("");
      loadRequests();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[85vh] overflow-y-auto bg-background/95 backdrop-blur-2xl border-border shadow-2xl p-6">
        <DialogHeader className="border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-display font-semibold">
                Suggest New Subject to Admin
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Tutors can request additions to the platform curriculum. Admins verify & approve.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <form onSubmit={handleSubmit} className="space-y-3.5 p-4 rounded-2xl border border-primary/20 bg-primary/5">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Proposed Subject Name</Label>
              <Input
                placeholder="e.g. Artificial Intelligence, Data Science, Astronomy..."
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                required
                className="text-xs h-9 bg-background"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Curriculum Justification / Description</Label>
              <Textarea
                placeholder="Explain the chapters, formulas, and target grade levels for this subject..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="text-xs bg-background"
              />
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !subjectName.trim()}
              className="w-full text-xs h-9 rounded-xl gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Submitting Request...
                </>
              ) : (
                <>
                  <Send className="size-3.5" /> Submit to Admin for Approval
                </>
              )}
            </Button>
          </form>

          {/* PREVIOUS SUBMITTED REQUESTS LIST */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center justify-between">
              <span>Your Subject Suggestions Status</span>
              <Badge variant="outline" className="text-[10px] font-mono">H2 Database</Badge>
            </h4>

            {myRequests.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4 rounded-xl border border-border/60 bg-card/40">
                You haven't submitted any subject suggestions yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {myRequests.map((req) => (
                  <div key={req.id} className="p-3 rounded-xl border border-border/70 bg-card text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{req.subjectName}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono ${
                          req.status === "APPROVED"
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                            : req.status === "REJECTED"
                            ? "border-destructive/40 bg-destructive/10 text-destructive"
                            : "border-amber-500/40 bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {req.status}
                      </Badge>
                    </div>
                    {req.description && (
                      <p className="text-muted-foreground text-[11px] line-clamp-1">{req.description}</p>
                    )}
                    {req.adminFeedback && (
                      <p className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded font-mono">
                        Admin Note: {req.adminFeedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

