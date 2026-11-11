import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Plus, Trash2, BookOpen, Sparkles, Loader2, Database, HelpCircle } from "lucide-react";

interface SubExplanationDraft {
  termKey: string;
  termLabel: string;
  explanationTitle: string;
  explanationContent: string;
  clipUrl: string;
}

interface TutorNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editNote?: any | null;
}

export function TutorNoteModal({ open, onOpenChange, onSuccess, editNote }: TutorNoteModalProps) {
  const { fetchWithAuth } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [chapter, setChapter] = useState("Algebraic Identities");
  const [formula, setFormula] = useState("(a + b)² = a² + b² + 2ab");
  const [content, setContent] = useState("");

  const [subExplanations, setSubExplanations] = useState<SubExplanationDraft[]>([
    {
      termKey: "2ab",
      termLabel: "2ab",
      explanationTitle: "Why the cross-term 2ab appears",
      explanationContent: "Multiplying (a+b)(a+b) gives a·b + b·a. Commutativity makes them combine into 2ab, forming two symmetric rectangles.",
      clipUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    },
    {
      termKey: "a2",
      termLabel: "a²",
      explanationTitle: "First square area term a²",
      explanationContent: "The upper-left square created by the first term multiplied by itself: a × a = a².",
      clipUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    },
  ]);

  useEffect(() => {
    if (editNote) {
      setTitle(editNote.title || "");
      setSubject(editNote.subject || "Mathematics");
      setChapter(editNote.chapter || "Core Formulas");
      setFormula(editNote.formula || "");
      setContent(editNote.content || "");
      if (editNote.subExplanations && editNote.subExplanations.length > 0) {
        setSubExplanations(
          editNote.subExplanations.map((s: any) => ({
            termKey: s.termKey || s.termLabel || "term",
            termLabel: s.termLabel || "",
            explanationTitle: s.explanationTitle || "",
            explanationContent: s.explanationContent || "",
            clipUrl: s.clipUrl || "",
          }))
        );
      } else {
        setSubExplanations([]);
      }
    } else {
      setTitle("");
      setFormula("");
      setContent("");
      setSubExplanations([
        {
          termKey: "2ab",
          termLabel: "2ab",
          explanationTitle: "Why the cross-term 2ab appears",
          explanationContent: "Multiplying (a+b)(a+b) gives a·b + b·a. Commutativity makes them combine into 2ab, forming two symmetric rectangles.",
          clipUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
        },
        {
          termKey: "a2",
          termLabel: "a²",
          explanationTitle: "First square area term a²",
          explanationContent: "The upper-left square created by the first term multiplied by itself: a × a = a².",
          clipUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        },
      ]);
    }
  }, [open, editNote]);

  const addSubExplanation = () => {
    setSubExplanations((prev) => [
      ...prev,
      {
        termKey: "custom_term_" + (prev.length + 1),
        termLabel: "",
        explanationTitle: "",
        explanationContent: "",
        clipUrl: "",
      },
    ]);
  };

  const removeSubExplanation = (index: number) => {
    setSubExplanations((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSub = (index: number, field: keyof SubExplanationDraft, val: string) => {
    setSubExplanations((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  const quickFillSample = () => {
    setTitle("Derivation of Quadratic Roots & The Discriminant");
    setSubject("Mathematics");
    setChapter("Polynomial Functions");
    setFormula("x = (-b ± √(b² - 4ac)) / (2a)");
    setContent("To solve any quadratic equation ax² + bx + c = 0, we complete the square on the leading terms. Dividing by a yields x² + (b/a)x = -c/a. Adding the square of half the middle term allows us to factor into a perfect square. The discriminant determines whether the roots are real, distinct, or complex.");
    setSubExplanations([
      {
        termKey: "disc",
        termLabel: "b² - 4ac",
        explanationTitle: "The Discriminant (Δ)",
        explanationContent: "If b² - 4ac > 0, there are two distinct real roots. If = 0, exactly one repeating real root. If < 0, two complex conjugate roots.",
        clipUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      },
      {
        termKey: "2a",
        termLabel: "2a",
        explanationTitle: "The Denominator (2a)",
        explanationContent: "Arises from factoring (2ax + b)² during the completing-the-square step after scaling the equation by 4a.",
        clipUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !formula || !content) {
      toast.error("Please fill in the title, formula, and explanation content.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        subject,
        chapter,
        formula,
        content,
        subExplanations: subExplanations.filter((s) => s.termLabel.trim() !== ""),
      };

      const url = editNote ? `/tutor/notes/${editNote.id}` : "/tutor/notes";
      const method = editNote ? "PUT" : "POST";

      const res = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save smart note in H2 database");
      }

      toast.success(
        editNote
          ? "Smart Note updated successfully in H2 Database!"
          : "Smart Note with interactive sub-explanation buttons saved to H2 Database!"
      );
      onSuccess();
      onOpenChange(false);

      // Reset
      setTitle("");
      setContent("");
      setFormula("");
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-2xl border-border shadow-2xl p-6">
        <DialogHeader className="border-b border-border/50 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <BookOpen className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-display font-semibold">
                  {editNote ? "Edit Interactive Smart Note" : "Create Interactive Smart Note"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {editNote
                    ? "Update explanation text, formula, and attached word/line sub-explanation buttons in H2"
                    : "Add notes where students can click specific words & lines as buttons to see sub-explanations"}
                </DialogDescription>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={quickFillSample}
              className="text-xs text-primary border-primary/30"
            >
              Fill Quadratic Formula Sample
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* TITLE & SUBJECT & CHAPTER */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="note-title">Note Title</Label>
              <Input
                id="note-title"
                placeholder="e.g. Square of a Sum Explained"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note-subject">Subject</Label>
              <select
                id="note-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note-chapter">Chapter / Topic</Label>
              <Input
                id="note-chapter"
                placeholder="e.g. Algebraic Identities"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
              />
            </div>
          </div>

          {/* MAIN FORMULA */}
          <div className="space-y-1.5">
            <Label htmlFor="note-formula">
              Featured Formula (Appears prominent at top of note)
            </Label>
            <Input
              id="note-formula"
              placeholder="e.g. (a + b)² = a² + b² + 2ab"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              required
              className="font-math text-base"
            />
          </div>

          {/* CONTENT / BODY TEXT */}
          <div className="space-y-1.5">
            <Label htmlFor="note-content">Explanation Text</Label>
            <Textarea
              id="note-content"
              placeholder="Explain the formula step-by-step. The words or lines you designate below will automatically become interactive buttons for students!"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* SUB-EXPLANATION WORD/LINE BUTTON BUILDER */}
          <div className="border-t border-border/60 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                  <Sparkles className="size-4 text-primary" />
                  Interactive Sub-Explanation Word/Line Buttons
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Choose specific words, terms (e.g. 2ab, a²), or lines from your note to turn into clickable glowing buttons with sub-explanations!
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSubExplanation}
                className="gap-1.5 text-xs rounded-full border-primary/40 text-primary hover:bg-primary/10"
              >
                <Plus className="size-3.5" />
                <span>Add Word/Line Button</span>
              </Button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {subExplanations.map((sub, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-border/80 bg-card/60 space-y-2.5 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary">Interactive Button #{idx + 1}</span>
                    {subExplanations.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeSubExplanation(idx)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Word / Line / Term to Turn into Button</Label>
                      <Input
                        placeholder="e.g. 2ab or a² or difference of squares"
                        value={sub.termLabel}
                        onChange={(e) => updateSub(idx, "termLabel", e.target.value)}
                        className="text-xs h-8 font-math"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px]">Sub-Explanation Title</Label>
                      <Input
                        placeholder="e.g. Why does 2ab appear?"
                        value={sub.explanationTitle}
                        onChange={(e) => updateSub(idx, "explanationTitle", e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px]">Detailed Sub-Explanation (Shown when student clicks button)</Label>
                    <Textarea
                      placeholder="Explain this specific word or term in depth..."
                      value={sub.explanationContent}
                      onChange={(e) => updateSub(idx, "explanationContent", e.target.value)}
                      rows={2}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px]">Optional Attached Video Clip URL for this Button</Label>
                    <Input
                      placeholder="https://.../formula-clip.mp4"
                      value={sub.clipUrl}
                      onChange={(e) => updateSub(idx, "clipUrl", e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Database className="size-3.5 text-primary" />
              <span>Saves directly to H2 In-Memory DB</span>
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Saving to H2...
                  </>
                ) : editNote ? (
                  "Update Smart Note"
                ) : (
                  "Save Smart Note"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

