import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Sparkles, Clock, Film, ExternalLink, X, BookOpen, User, CheckCircle2, Heart, Star, Share2, MessageSquare, Send, Award, IdCard, Loader2 } from "lucide-react";
import { useAuth, formatRole } from "@/lib/auth-context";
import { DigitalIdCardModal, type ProfileCardData } from "@/components/digital-id-card-modal";
import { ShareLessonModal } from "@/components/share-lesson-modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  tutorId: number;
  tutorName: string;
  likes?: number;
  rating?: number;
  ratingCount?: number;
  createdAt: string;
  subReferences: SubReferenceClip[];
}

interface VideoCommentItem {
  id: number;
  userName: string;
  userRole: string;
  content: string;
  createdAt: string;
}

interface VideoPlayerModalProps {
  video: LessonVideoData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVideoUpdated?: () => void;
}

export function VideoPlayerModal({ video, open, onOpenChange, onVideoUpdated }: VideoPlayerModalProps) {
  const { user, fetchWithAuth, isAuthenticated } = useAuth();
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const [activeClip, setActiveClip] = useState<SubReferenceClip | null>(null);

  // Social states
  const [likes, setLikes] = useState(video?.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [rating, setRating] = useState(video?.rating || 5.0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Comments
  const [comments, setComments] = useState<VideoCommentItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Modals
  const [idCardOpen, setIdCardOpen] = useState(false);
  const [tutorProfile, setTutorProfile] = useState<ProfileCardData | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    if (video) {
      setLikes(video.likes || 0);
      setRating(video.rating || 5.0);
      setActiveClip(null);
      loadComments(video.id);
    }
  }, [video?.id]);

  const loadComments = async (videoId: number) => {
    try {
      const res = await fetch(`http://localhost:8081/api/videos/${videoId}/comments`);
      if (res.ok) {
        setComments(await res.json());
      }
    } catch (e) {
      // ignore
    }
  };

  if (!video) return null;

  const seekToTimestamp = (timestampStr: string) => {
    if (!mainVideoRef.current) return;
    const parts = timestampStr.split(":").map(Number);
    let seconds = 0;
    if (parts.length === 2) {
      const [m = 0, s = 0] = parts;
      seconds = m * 60 + s;
    } else if (parts.length === 3) {
      const [h = 0, m = 0, s = 0] = parts;
      seconds = h * 3600 + m * 60 + s;
    }
    mainVideoRef.current.currentTime = seconds;
    mainVideoRef.current.play().catch(() => {});
  };

  const handleLike = async () => {
    setHasLiked((v) => !v);
    setLikes((l) => (hasLiked ? l - 1 : l + 1));
    try {
      const res = await fetch(`http://localhost:8081/api/videos/${video.id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
        toast.success("Liked lesson!");
      }
    } catch (e) {}
  };

  const handleRate = async (stars: number) => {
    setUserRating(stars);
    try {
      const res = await fetchWithAuth(`/videos/${video.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: stars }),
      });
      if (res.ok) {
        const data = await res.json();
        setRating(data.rating);
        toast.success(`You rated this lesson ${stars} stars!`);
      }
    } catch (e) {}
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsPostingComment(true);
    try {
      const res = await fetchWithAuth(`/videos/${video.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (!res.ok) throw new Error("Failed to post comment");
      const created = await res.json();
      setComments((prev) => [created, ...prev]);
      setNewComment("");
      toast.success("Comment posted!");
    } catch (err: any) {
      toast.error(err.message || "Failed to post comment");
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleOpenTutorIdCard = async () => {
    try {
      const tutorId = video.tutorId || 2;
      const res = await fetch(`http://localhost:8081/api/profile/${tutorId}`);
      if (res.ok) {
        setTutorProfile(await res.json());
        setIdCardOpen(true);
      }
    } catch (e) {
      toast.error("Could not load tutor profile");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[880px] max-h-[92vh] overflow-y-auto bg-background/95 backdrop-blur-2xl border-border shadow-2xl p-6">
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

              {/* TUTOR INFO & ID CARD BUTTON */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenTutorIdCard}
                  className="h-8 gap-1.5 text-xs rounded-full border-sky-500/40 text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 shadow-sm"
                  title="View Official Tutor ID Card"
                >
                  <Award className="size-3.5" />
                  <span>Tutor ID Card</span>
                </Button>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
                  <Clock className="size-3.5" />
                  <span>{video.duration}</span>
                </div>
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

            {/* STUDENT SOCIAL ACTION BAR: LIKE, RATE, SHARE */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border/70 shadow-sm">
              <div className="flex items-center gap-3">
                {/* LIKE */}
                <Button
                  variant={hasLiked ? "hero" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  className="rounded-full gap-1.5 text-xs h-8"
                >
                  <Heart className={cn("size-3.5", hasLiked && "fill-current text-destructive")} />
                  <span>{likes} Likes</span>
                </Button>

                {/* 1-5 STAR RATING */}
                <div className="flex items-center gap-1.5 bg-background px-3 py-1 rounded-full border border-border/80">
                  <span className="text-[11px] text-muted-foreground font-medium mr-1">Rate:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => handleRate(star)}
                      className="transition-transform hover:scale-125"
                      title={`Rate ${star} star`}
                    >
                      <Star
                        className={cn(
                          "size-3.5",
                          (hoverRating || userRating || Math.round(rating)) >= star
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/40"
                        )}
                      />
                    </button>
                  ))}
                  <span className="text-[11px] font-bold text-foreground ml-1">★ {rating}</span>
                </div>
              </div>

              {/* SHARE WITH FRIENDS (WHATSAPP + IN-APP) */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShareModalOpen(true)}
                className="rounded-full gap-1.5 text-xs h-8 border-primary/40 text-primary hover:bg-primary/10 shadow-sm"
              >
                <Share2 className="size-3.5" />
                <span>Share with Friends</span>
              </Button>
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

            {/* STUDENT COMMENTS SECTION */}
            <div className="border-t border-border/60 pt-5 space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">
                  Student Discussion & Questions ({comments.length})
                </h4>
              </div>

              {/* POST COMMENT FORM */}
              <form onSubmit={handlePostComment} className="flex gap-2">
                <Textarea
                  placeholder={
                    isAuthenticated
                      ? "Ask a question about the formula or lesson..."
                      : "Sign in to post a question or comment..."
                  }
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  disabled={!isAuthenticated || isPostingComment}
                  className="text-xs bg-card"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!isAuthenticated || isPostingComment || !newComment.trim()}
                  className="h-auto px-4 self-stretch rounded-xl gap-1 text-xs shrink-0"
                >
                  {isPostingComment ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-3.5" />}
                  <span>Post</span>
                </Button>
              </form>

              {/* COMMENTS LIST */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No comments yet. Be the first student to ask a question!
                  </p>
                ) : (
                  comments.map((comm) => (
                    <div key={comm.id} className="p-3 rounded-xl border border-border/60 bg-card/60 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">{comm.userName}</span>
                          <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                            {formatRole(comm.userRole)}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed pt-0.5">{comm.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* TUTOR DIGITAL ID CARD MODAL */}
      <DigitalIdCardModal
        profile={tutorProfile}
        open={idCardOpen}
        onOpenChange={setIdCardOpen}
      />

      {/* SHARE LESSON MODAL */}
      <ShareLessonModal
        videoId={video.id}
        videoTitle={video.title}
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
      />
    </>
  );
}
