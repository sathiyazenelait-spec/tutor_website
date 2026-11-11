import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Search, Plus, Film, Sparkles, Database, Play, Clock, User, Trash2, Loader2, Info } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { VideoPlayerModal, type LessonVideoData } from "@/components/video-player-modal";
import { TutorUploadModal } from "@/components/tutor-upload-modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  q: z.string().optional(),
  subject: z.enum(["All", "Mathematics", "Physics", "Chemistry", "Biology"]).optional(),
});

const subjectsList = ["All", "Mathematics", "Physics", "Chemistry", "Biology"] as const;

export const Route = createFileRoute("/library")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "H2 Video Library & Formula Clips — TutorSphere" },
      {
        name: "description",
        content: "Browse H2 database-stored tutor video lessons with attached formula reference clips.",
      },
      { property: "og:title", content: "H2 Video Library — TutorSphere" },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { q = "", subject = "All" } = Route.useSearch();
  const navigate = useNavigate({ from: "/library" });
  const [draft, setDraft] = useState(q);

  const { user, isAuthenticated, hasRole, fetchWithAuth } = useAuth();

  const [videos, setVideos] = useState<LessonVideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedVideo, setSelectedVideo] = useState<LessonVideoData | null>(null);
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const isTutorOrAdmin = hasRole("TUTOR") || hasRole("ADMIN");

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = "http://localhost:8081/api/videos";
      if (subject && subject !== "All") {
        url += `?subject=${encodeURIComponent(subject)}`;
      }
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to load videos from H2 database (Status: ${res.status})`);
      }
      const data: LessonVideoData[] = await res.json();
      setVideos(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch H2 database videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [subject]);

  const update = (next: { q?: string | undefined; subject?: (typeof subjectsList)[number] | undefined }) =>
    navigate({ search: (prev) => ({ ...prev, ...next }), replace: true });

  const filteredVideos = videos.filter((v) => {
    if (!q) return true;
    const term = q.toLowerCase();
    const matchesTitle = v.title.toLowerCase().includes(term);
    const matchesDesc = v.description?.toLowerCase().includes(term);
    const matchesSubRef = v.subReferences?.some(
      (r) =>
        r.keypointTitle.toLowerCase().includes(term) ||
        r.formulaOrConcept.toLowerCase().includes(term) ||
        r.explanation?.toLowerCase().includes(term)
    );
    return matchesTitle || matchesDesc || matchesSubRef;
  });

  const handleDeleteVideo = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this lesson video from H2 database?")) return;

    try {
      const res = await fetchWithAuth(`/tutor/videos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete video");
      toast.success("Video deleted from H2 database.");
      fetchVideos();
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  const openVideoPlayer = (video: LessonVideoData) => {
    setSelectedVideo(video);
    setPlayerModalOpen(true);
  };

  return (
    <>
      <PageHero
        eyebrow="H2 Database Video Library"
        title="Lessons with sub-reference formula clips."
        subtitle="Watch in-depth tutor lessons with attached formula keypoint clips like (a+b)² and step-by-step proofs."
      >
        <div className="flex flex-col items-center gap-4 w-full">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              update({ q: draft || undefined });
            }}
            className="flex w-full max-w-xl items-center gap-3 rounded-full glass-card px-5 py-3 shadow-lg"
          >
            <Search className="size-5 text-muted-foreground" />
            <input
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                update({ q: e.target.value || undefined });
              }}
              placeholder="Search lessons, formulas like (a+b)², Newton's laws…"
              aria-label="Search lessons"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </form>

          {/* TUTOR ACTION BAR */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background/50 border border-border/60 rounded-full px-3 py-1">
              <Database className="size-3.5 text-primary" />
              <span>Only Showing H2 Database Stored Videos</span>
            </div>

            {isTutorOrAdmin && (
              <Button
                variant="hero"
                size="sm"
                onClick={() => setUploadModalOpen(true)}
                className="rounded-full gap-2 px-4 shadow-lamp animate-pulse hover:animate-none"
              >
                <Plus className="size-4" />
                <span>Upload Lesson & Sub-Clips</span>
              </Button>
            )}
          </div>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        {/* SUBJECT TABS */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {subjectsList.map((s) => (
              <button
                key={s}
                onClick={() => update({ subject: s === "All" ? undefined : s })}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-all duration-300",
                  subject === s
                    ? "border-primary bg-primary text-primary-foreground shadow-lamp font-medium"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {isTutorOrAdmin ? (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
              <Sparkles className="size-3.5" />
              <span>Tutor Mode Active: You can upload lessons with unlimited size</span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Sign in as Tutor (`tutor@learnspace.com`) to add video lessons & formula clips.
            </div>
          )}
        </div>

        {/* RESULTS COUNT */}
        <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            {filteredVideos.length} {filteredVideos.length === 1 ? "lesson" : "lessons"} in H2 Database
            {q && (
              <>
                {" "}for <span className="font-math text-foreground">"{q}"</span>
              </>
            )}
          </p>
        </div>

        {/* LOADING & ERROR STATES */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm">Connecting to H2 Database on port 8081...</p>
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/10 p-8 text-center text-destructive">
            <Info className="mx-auto size-8 mb-2" />
            <p className="font-semibold text-base">Backend Connection Error</p>
            <p className="text-xs mt-1 text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchVideos} className="mt-4">
              Retry Connection
            </Button>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-border p-16 text-center">
            <p className="font-math text-5xl text-primary animate-float">?</p>
            <p className="mt-4 text-muted-foreground">
              No lessons found in H2 database.
            </p>
            {isTutorOrAdmin && (
              <Button onClick={() => setUploadModalOpen(true)} className="mt-4 gap-2">
                <Plus className="size-4" /> Add the First Video Lesson
              </Button>
            )}
          </div>
        ) : (
          /* VIDEO CARDS GRID */
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((video, i) => (
              <Reveal key={video.id} delay={(i % 3) * 80}>
                <article
                  onClick={() => openVideoPlayer(video)}
                  className="group cursor-pointer overflow-hidden rounded-2xl glass-card transition-all duration-500 hover:-translate-y-2 hover:shadow-lamp border border-border/80 flex flex-col h-full"
                >
                  {/* VIDEO PREVIEW THUMBNAIL */}
                  <div className="relative aspect-video overflow-hidden bg-ink/90">
                    <video
                      src={video.videoUrl}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-85 transition-opacity duration-300"
                    />

                    {/* OVERLAY PLAY BUTTON */}
                    <div className="absolute inset-0 grid place-items-center">
                      <span className="grid size-14 place-items-center rounded-full bg-primary/90 text-primary-foreground shadow-lamp group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                        <Play className="size-6 translate-x-0.5" />
                      </span>
                    </div>

                    <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-[11px] backdrop-blur font-medium">
                      {video.subject}
                    </span>

                    <span className="absolute bottom-3 right-3 rounded-md bg-background/80 px-2 py-0.5 text-[11px] tabular-nums backdrop-blur">
                      {video.duration}
                    </span>

                    {/* SUB-REFERENCE CHIPS COUNT BADGE */}
                    {video.subReferences && video.subReferences.length > 0 && (
                      <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-primary/90 text-primary-foreground px-2 py-0.5 text-[10px] font-semibold shadow">
                        <Sparkles className="size-3" />
                        <span>{video.subReferences.length} Formula Clips</span>
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-sans text-base font-semibold leading-snug tracking-normal text-foreground group-hover:text-primary transition-colors">
                        {video.title}
                      </h3>

                      {video.description && (
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {video.description}
                        </p>
                      )}

                      {/* SUB-REFERENCE FORMULA CHIPS PREVIEW */}
                      {video.subReferences && video.subReferences.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {video.subReferences.slice(0, 2).map((ref) => (
                            <span
                              key={ref.id}
                              className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] text-primary font-math font-medium"
                            >
                              <span>{ref.timestamp}</span>
                              <span>•</span>
                              <span>{ref.formulaOrConcept}</span>
                            </span>
                          ))}
                          {video.subReferences.length > 2 && (
                            <span className="text-[10px] text-muted-foreground self-center">
                              +{video.subReferences.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <User className="size-3.5 text-primary" />
                        <span className="font-medium text-foreground/80">{video.tutorName}</span>
                      </span>

                      {isTutorOrAdmin && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteVideo(e, video.id)}
                          className="size-7 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive grid place-items-center transition-colors"
                          title="Delete from H2 database"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* VIDEO PLAYER MODAL WITH SUB-REFERENCE CLIPS */}
      <VideoPlayerModal
        video={selectedVideo}
        open={playerModalOpen}
        onOpenChange={setPlayerModalOpen}
      />

      {/* TUTOR UPLOAD MODAL */}
      <TutorUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onSuccess={fetchVideos}
      />
    </>
  );
}
