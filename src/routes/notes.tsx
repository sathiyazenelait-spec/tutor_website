import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Heart, Bookmark, Share2, Star, Sparkles, Plus, BookOpen, Trash2, Pencil, ShieldCheck, Database, Loader2, Play, User, Film } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { FormulaTerm, ExplanationPanel } from "@/components/smart-formula";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { TutorNoteModal } from "@/components/tutor-note-modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SubExplanation {
  id: number;
  termKey: string;
  termLabel: string;
  explanationTitle: string;
  explanationContent: string;
  clipUrl?: string;
}

interface SmartNoteData {
  id: number;
  title: string;
  subject: string;
  chapter: string;
  formula: string;
  content: string;
  tutorId: number;
  tutorName: string;
  likes: number;
  createdAt: string;
  subExplanations: SubExplanation[];
}

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "H2 Interactive Smart Notes — TutorSphere" },
      {
        name: "description",
        content: "Interactive tutor notes with clickable words & formulas revealing sub-explanations.",
      },
      { property: "og:title", content: "Interactive Smart Notes — TutorSphere" },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const { user, hasRole, fetchWithAuth } = useAuth();
  const isTutorOrAdmin = hasRole("TUTOR") || hasRole("ADMIN");
  const isAdmin = hasRole("ADMIN");

  const [notes, setNotes] = useState<SmartNoteData[]>([]);
  const [selectedNote, setSelectedNote] = useState<SmartNoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTermKey, setActiveTermKey] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editTargetNote, setEditTargetNote] = useState<SmartNoteData | null>(null);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8081/api/notes");
      if (!res.ok) throw new Error("Failed to fetch smart notes from H2 database");
      const data: SmartNoteData[] = await res.json();
      setNotes(data);
      if (data.length > 0) {
        const first = data[0] ?? null;
        setSelectedNote((prev) => (prev ? (data.find((n) => n.id === prev.id) ?? first) : first));
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // When note changes, select the first sub-explanation term by default
  useEffect(() => {
    if (selectedNote && selectedNote.subExplanations && selectedNote.subExplanations.length > 0) {
      const firstSub = selectedNote.subExplanations[0];
      setActiveTermKey(firstSub?.termKey ?? null);
    } else {
      setActiveTermKey(null);
    }
  }, [selectedNote?.id]);

  const handleLike = async () => {
    if (!selectedNote) return;
    setLiked((v) => !v);
    try {
      const res = await fetch(`http://localhost:8081/api/notes/${selectedNote.id}/like`, { method: "POST" });
      if (res.ok) {
        const updated = await res.json();
        setSelectedNote((prev) => (prev ? { ...prev, likes: updated.likes } : null));
        toast.success("Liked note!");
      }
    } catch (e) {
      // ignore
    }
  };

  const handleDeleteNote = async (id: number) => {
    if (!confirm("Are you sure you want to delete this smart note from H2 database?")) return;
    try {
      const res = await fetchWithAuth(`/tutor/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Smart note deleted from H2 database.");
      fetchNotes();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete note");
    }
  };

  // Find currently active sub-explanation
  const activeSubExplanation = selectedNote?.subExplanations?.find((s) => s.termKey === activeTermKey);

  // Helper to render text with highlighted interactive buttons
  const renderInteractiveText = (text: string, subExplanations: SubExplanation[]) => {
    if (!subExplanations || subExplanations.length === 0) return text;

    // Build regex to match any of the termLabels
    const escapedLabels = subExplanations
      .map((s) => s.termLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .filter(Boolean);

    if (escapedLabels.length === 0) return text;

    const regex = new RegExp(`(${escapedLabels.join("|")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const matchingSub = subExplanations.find(
        (s) => s.termLabel.toLowerCase() === part.toLowerCase()
      );

      if (matchingSub) {
        const isSelected = activeTermKey === matchingSub.termKey;
        return (
          <button
            key={index}
            type="button"
            onClick={() => setActiveTermKey(matchingSub.termKey)}
            className={cn(
              "inline-flex items-center gap-1 mx-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all duration-300 font-math",
              isSelected
                ? "bg-primary text-primary-foreground shadow-lamp ring-2 ring-primary/40 scale-105"
                : "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:scale-105"
            )}
            title="Click to view sub-explanation"
          >
            <span>{part}</span>
            <Sparkles className="size-3" />
          </button>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  return (
    <>
      <PageHero
        eyebrow="Interactive Smart Notes"
        title={
          <>
            Formulas & Notes with <span className="font-math text-accent">Clickable Sub-Explanations</span>.
          </>
        }
        subtitle="Tutors add notes where each key word or line becomes an interactive button revealing deep derivations."
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background/50 border border-border/60 rounded-full px-3 py-1">
            <Database className="size-3.5 text-primary" />
            <span>Stored in H2 In-Memory Database</span>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              <ShieldCheck className="size-3.5" />
              <span>Admin Controls: Edit & Delete All Notes</span>
            </div>
          )}

          {isTutorOrAdmin && (
            <Button
              variant="hero"
              size="sm"
              onClick={() => setUploadModalOpen(true)}
              className="rounded-full gap-2 px-4 shadow-lamp animate-pulse hover:animate-none"
            >
              <Plus className="size-4" />
              <span>Create New Smart Note</span>
            </Button>
          )}
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        {/* NOTES SELECTOR TABS */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="flex flex-wrap gap-2">
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs md:text-sm transition-all duration-300 flex items-center gap-2",
                  selectedNote?.id === note.id
                    ? "border-primary bg-primary text-primary-foreground shadow-lamp font-medium"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                <span>{note.title}</span>
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 opacity-80 font-mono">
                  {note.subject}
                </Badge>
              </button>
            ))}
          </div>

          {isTutorOrAdmin && selectedNote && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditTargetNote(selectedNote);
                  setUploadModalOpen(true);
                }}
                className="text-xs text-primary border-primary/30 hover:bg-primary/10 gap-1.5"
                title="Edit Smart Note & Sub-Explanations (Admin/Tutor)"
              >
                <Pencil className="size-3.5" />
                <span>Edit Note</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteNote(selectedNote.id)}
                className="text-xs text-destructive hover:bg-destructive/10 gap-1.5"
                title="Delete from H2 database (Admin/Tutor)"
              >
                <Trash2 className="size-3.5" />
                <span>Delete Note</span>
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm">Loading Smart Notes from H2 Database...</p>
          </div>
        ) : !selectedNote ? (
          <div className="rounded-3xl border border-dashed border-border p-16 text-center">
            <p className="font-math text-5xl text-primary animate-float">?</p>
            <p className="mt-4 text-muted-foreground">No notes in H2 database yet.</p>
            {isTutorOrAdmin && (
              <Button onClick={() => setUploadModalOpen(true)} className="mt-4 gap-2">
                <Plus className="size-4" /> Create First Note
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            {/* NOTE CONTENT & INTERACTIVE BUTTONS ARTICLE */}
            <article className="space-y-6">
              <div className="rounded-3xl glass-card p-8 md:p-10 border border-border/70 relative">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      {selectedNote.subject}
                    </Badge>
                    <span>{selectedNote.chapter}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="size-3.5 text-primary" />
                    <span>Tutor: {selectedNote.tutorName}</span>
                  </div>
                </div>

                <h2 className="text-2xl font-bold font-display text-foreground">
                  {selectedNote.title}
                </h2>

                {/* FEATURED FORMULA */}
                <div className="mt-6 p-6 rounded-2xl bg-card border border-primary/20 shadow-inner">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-2 block">
                    Featured Core Formula
                  </span>
                  <p className="font-math text-2xl sm:text-4xl text-foreground font-semibold leading-relaxed">
                    {renderInteractiveText(selectedNote.formula, selectedNote.subExplanations)}
                  </p>
                </div>

                {/* BODY TEXT WITH EMBEDDED INTERACTIVE BUTTONS */}
                <div className="mt-6 leading-relaxed text-muted-foreground text-sm space-y-4">
                  <p className="leading-relaxed">
                    {renderInteractiveText(selectedNote.content, selectedNote.subExplanations)}
                  </p>
                </div>

                {/* QUICK INTERACTIVE TERMS BAR */}
                {selectedNote.subExplanations && selectedNote.subExplanations.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-border/60">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-3">
                      <Sparkles className="size-3.5 text-primary" />
                      Tutor-Designated Sub-Explanation Buttons (Click to open explanation):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedNote.subExplanations.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setActiveTermKey(sub.termKey)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 font-math flex items-center gap-1.5",
                            activeTermKey === sub.termKey
                              ? "bg-primary text-primary-foreground shadow-lamp ring-2 ring-primary/40"
                              : "bg-card border border-border/80 text-foreground hover:border-primary/50 hover:bg-accent/40"
                          )}
                        >
                          <span>{sub.termLabel}</span>
                          <span className="text-[10px] opacity-70">({sub.explanationTitle})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* STUDENT INTERACTIONS */}
              <div className="flex flex-wrap items-center gap-3">
                <Button variant={liked ? "hero" : "outline"} onClick={handleLike} className="rounded-full gap-2">
                  <Heart className={cn("size-4", liked && "fill-current text-destructive")} />
                  <span>{liked ? "Liked" : "Like Note"}</span>
                  <span className="text-xs opacity-80">· {selectedNote.likes}</span>
                </Button>

                <Button
                  variant={saved ? "secondary" : "outline"}
                  onClick={() => {
                    setSaved((v) => !v);
                    toast.success(saved ? "Removed bookmark" : "Bookmarked to student notes!");
                  }}
                  className="rounded-full gap-2"
                >
                  <Bookmark className={cn("size-4", saved && "fill-current text-primary")} />
                  <span>{saved ? "Bookmarked" : "Save Note"}</span>
                </Button>
              </div>
            </article>

            {/* SIDE EXPLANATION PANEL */}
            <aside className="space-y-6">
              {activeSubExplanation ? (
                <div className="rounded-3xl glass-card p-6 md:p-8 border-2 border-primary/40 bg-card space-y-5 shadow-2xl animate-in fade-in slide-in-from-right-3">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <Badge variant="outline" className="border-primary/40 text-primary font-math text-xs">
                      {activeSubExplanation.termLabel}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Sparkles className="size-3 text-primary" /> Sub-Explanation
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-display font-semibold text-foreground">
                      {activeSubExplanation.explanationTitle}
                    </h3>
                    <p className="mt-3 text-sm text-foreground/90 leading-relaxed bg-primary/5 p-4 rounded-2xl border border-primary/20">
                      {activeSubExplanation.explanationContent}
                    </p>
                  </div>

                  {activeSubExplanation.clipUrl && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <Film className="size-4" />
                        <span>Attached Formula Explanation Clip</span>
                      </div>
                      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black/90 border border-border/60">
                        <video
                          src={activeSubExplanation.clipUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center text-muted-foreground space-y-2">
                  <Sparkles className="mx-auto size-8 text-primary/40" />
                  <p className="text-sm font-semibold text-foreground">No Word / Line Selected</p>
                  <p className="text-xs">
                    Click any highlighted term or button on the left to reveal its step-by-step sub-explanation and attached video clip!
                  </p>
                </div>
              )}
            </aside>
          </div>
        )}
      </section>

      {/* TUTOR / ADMIN CREATE & EDIT NOTE MODAL */}
      <TutorNoteModal
        open={uploadModalOpen}
        onOpenChange={(val) => {
          setUploadModalOpen(val);
          if (!val) setEditTargetNote(null);
        }}
        onSuccess={fetchNotes}
        editNote={editTargetNote}
      />
    </>
  );
}
