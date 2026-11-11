import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Sparkles, Clock, Film, ExternalLink, X, BookOpen, User, CheckCircle2 } from "lucide-react";

export interface SubReferenceClip {
  id: number;
  timestamp: string;
  keypointTitle: string;
  formulaOrConcept: string;
  clipVideoUrl: string;
  explanation: string;
}

export interface LessonVideoData {
  id: number;
  title: string;
  subject: string;
  description: string;
  videoUrl: string;
  duration: string;
  tutorName: string;
  createdAt: string;
  subReferences: SubReferenceClip[];
}

interface VideoPlayerModalProps {
  video: LessonVideoData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VideoPlayerModal({ video, open, onOpenChange }: VideoPlayerModalProps) {
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const [activeClip, setActiveClip] = useState<SubReferenceClip | null>(null);

  if (!video) return null;

  const seekToTimestamp = (timestampStr: string) => {
    if (!mainVideoRef.current) return;
    const parts = timestampStr.split(":").map(Number);
    let seconds = 0;
    if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    mainVideoRef.current.currentTime = seconds;
    mainVideoRef.current.play().catch(() => {});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] max-h-[92vh] overflow-y-auto bg-background/95 backdrop-blur-2xl border-border shadow-2xl p-6">
        <DialogHeader className="border-b border-border/50 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-primary border-primary/30 text-xs">
                  {video.subject}
                </Badge>
                <Badge variant="secondary" className="text-[10px] text-muted-foreground font-mono">
                  H2 Database Stored
                </Badge>
              </div>
              <DialogTitle className="text-xl font-display font-semibold text-foreground">
                {video.title}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="size-3.5 text-primary" />
              <span>Tutor: {video.tutorName}</span>
              <span>•</span>
              <Clock className="size-3.5" />
              <span>{video.duration}</span>
            </div>
          </div>
          {video.description && (
            <DialogDescription className="text-xs text-muted-foreground mt-1 text-left">
              {video.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* MAIN VIDEO PLAYER */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/90 shadow-2xl border border-border/60">
            <video
              ref={mainVideoRef}
              src={video.videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          </div>

          {/* ACTIVE SUB-REFERENCE POPUP MINI-PLAYER */}
          {activeClip && (
            <div className="rounded-2xl border-2 border-primary/40 bg-card p-4 space-y-3 animate-in fade-in slide-in-from-top-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-lg bg-primary/20 text-primary">
                    <Sparkles className="size-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span>Sub-Reference Clip:</span>
                      <span className="font-math text-primary text-base">{activeClip.formulaOrConcept}</span>
                    </h4>
                    <p className="text-xs text-muted-foreground">{activeClip.keypointTitle} (At {activeClip.timestamp})</p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={() => setActiveClip(null)}
                >
                  <X className="size-4" />
                </Button>
              </div>

              {activeClip.clipVideoUrl && (
                <div className="relative aspect-video max-h-56 w-full rounded-xl overflow-hidden bg-black/80">
                  <video
                    src={activeClip.clipVideoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {activeClip.explanation && (
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-xs text-foreground/90 leading-relaxed">
                  <span className="font-semibold text-primary mr-1">Formula Insight:</span>
                  {activeClip.explanation}
                </div>
              )}
            </div>
          )}

          {/* SUB-REFERENCE ATTACHED FORMULA CLIPS SECTION */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Film className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Attached Sub-Reference Formula Clips & Keypoints
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {video.subReferences?.length || 0} reference clips in H2 DB
              </span>
            </div>

            {video.subReferences && video.subReferences.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {video.subReferences.map((clip) => (
                  <div
                    key={clip.id}
                    className={`rounded-xl border p-3.5 transition-all duration-300 text-left ${
                      activeClip?.id === clip.id
                        ? "border-primary bg-primary/10 shadow-lamp"
                        : "border-border/70 bg-card hover:border-primary/40 hover:bg-accent/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => seekToTimestamp(clip.timestamp)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 hover:bg-primary text-primary hover:text-primary-foreground px-2.5 py-0.5 text-xs font-mono font-semibold transition-colors"
                        title="Jump main video to this timestamp"
                      >
                        <Play className="size-3" />
                        <span>{clip.timestamp}</span>
                      </button>

                      <Badge variant="secondary" className="font-math text-xs bg-background/80 text-primary border border-primary/20">
                        {clip.formulaOrConcept}
                      </Badge>
                    </div>

                    <h4 className="text-xs font-semibold text-foreground mb-1">
                      {clip.keypointTitle}
                    </h4>

                    {clip.explanation && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                        {clip.explanation}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                      <Button
                        size="sm"
                        variant={activeClip?.id === clip.id ? "default" : "outline"}
                        className="w-full text-xs h-7 rounded-lg gap-1.5"
                        onClick={() => setActiveClip(activeClip?.id === clip.id ? null : clip)}
                      >
                        <Sparkles className="size-3" />
                        <span>{activeClip?.id === clip.id ? "Close Clip" : "Play Formula Reference Clip"}</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 p-6 text-center text-xs text-muted-foreground">
                No sub-reference clips attached yet for this lesson.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

