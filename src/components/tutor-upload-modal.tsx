import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Plus, Trash2, Film, Sparkles, Loader2, Database, Upload, FolderOpen, CheckCircle2 } from "lucide-react";

interface SubRefDraft {
  timestamp: string;
  keypointTitle: string;
  formulaOrConcept: string;
  clipVideoUrl: string;
  explanation: string;
}

interface TutorUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TutorUploadModal({ open, onOpenChange, onSuccess }: TutorUploadModalProps) {
  const { user, fetchWithAuth } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [availableSubjects, setAvailableSubjects] = useState<string[]>(["Mathematics", "Physics", "Chemistry", "Biology"]);
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState("14:30");

  useEffect(() => {
    fetch("http://localhost:8081/api/subjects")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const names = data.map((d: any) => d.name);
          setAvailableSubjects(names);
          if (!names.includes(subject)) {
            setSubject(names[0]);
          }
        }
      })
      .catch(() => {});
  }, [open]);

  const [subRefs, setSubRefs] = useState<SubRefDraft[]>([
    {
      timestamp: "03:15",
      keypointTitle: "Expansion Formula Breakdown",
      formulaOrConcept: "(a + b)² = a² + 2ab + b²",
      clipVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      explanation: "Attached sub-reference video clip explaining the geometric meaning of 2ab and square areas.",
    },
  ]);

  const handleFileBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Unlimited size allowed - create an object URL for playback
    const objectUrl = URL.createObjectURL(file);
    setVideoUrl(objectUrl);
    setSelectedFileName(file.name);

    // Format size
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    setSelectedFileSize(`${sizeInMB} MB`);

    if (!title) {
      // Auto-populate title from filename
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    toast.success(`Video loaded: ${file.name} (${sizeInMB} MB)`);
  };

  const addSubRef = () => {
    setSubRefs((prev) => [
      ...prev,
      {
        timestamp: "06:00",
        keypointTitle: "Key Formula Application",
        formulaOrConcept: "",
        clipVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        explanation: "",
      },
    ]);
  };

  const removeSubRef = (index: number) => {
    setSubRefs((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSubRef = (index: number, field: keyof SubRefDraft, val: string) => {
    setSubRefs((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const quickFillSample = () => {
    setTitle("Trigonometric Identities & Pythagorean Trigonometry");
    setSubject("Mathematics");
    setDescription("Comprehensive lecture deriving sin²θ + cos²θ = 1 and reciprocal trigonometric ratios with unit circles.");
    setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4");
    setDuration("17:45");
    setSelectedFileName(null);
    setSelectedFileSize(null);
    setSubRefs([
      {
        timestamp: "04:10",
        keypointTitle: "Fundamental Pythagorean Identity",
        formulaOrConcept: "sin²θ + cos²θ = 1",
        clipVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
        explanation: "Derived directly from applying Pythagoras Theorem (x² + y² = r²) on the unit circle where r = 1.",
      },
      {
        timestamp: "09:25",
        keypointTitle: "Tangent Ratio Identity",
        formulaOrConcept: "tan θ = sin θ / cos θ",
        clipVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        explanation: "Slope of the radius vector expressed through opposite over adjacent side lengths.",
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !videoUrl || !subject) {
      toast.error("Please fill in the title, subject, and browse or enter a video URL.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        subject,
        description,
        videoUrl,
        duration,
        subReferences: subRefs.filter((r) => r.keypointTitle.trim() !== ""),
      };

      const res = await fetchWithAuth("/tutor/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save lesson video in H2 database");
      }

      toast.success("Lesson video and sub-reference formula clips saved to H2 Database!");
      onSuccess();
      onOpenChange(false);

      // Reset form
      setTitle("");
      setDescription("");
      setVideoUrl("");
      setSelectedFileName(null);
      setSelectedFileSize(null);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-2xl border-border shadow-2xl p-6">
        <DialogHeader className="border-b border-border/50 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <Film className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-display font-semibold">
                  Upload Lesson Video & Sub-Reference Clips
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Store new video lessons with unlimited file size or web URLs into H2 Database
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
              Fill Sample Math Lesson
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* TITLE & SUBJECT */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="video-title">Lesson Title</Label>
              <Input
                id="video-title"
                placeholder="e.g. Algebraic Expansions & Formulas"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="video-subject">Subject</Label>
              <select
                id="video-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {availableSubjects.map((subName) => (
                  <option key={subName} value={subName}>
                    {subName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1.5">
            <Label htmlFor="video-desc">Description</Label>
            <Textarea
              id="video-desc"
              placeholder="Overview of concepts taught in this lesson..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* VIDEO BROWSE & URL SECTION (UNLIMITED SIZE) */}
          <div className="space-y-2 p-3.5 rounded-xl border border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <Upload className="size-3.5" />
                Lesson Video Source (Browse Local File or Enter Web URL)
              </Label>
              <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                Unlimited Size Allowed
              </Badge>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="video/*"
              onChange={handleFileBrowse}
              className="hidden"
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 bg-background hover:bg-accent border-border/80 text-xs shrink-0"
              >
                <FolderOpen className="size-4 text-primary" />
                <span>Browse Video File...</span>
              </Button>

              <Input
                id="video-url"
                placeholder="Or paste video stream / direct MP4 / WebM URL..."
                value={videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value);
                  setSelectedFileName(null);
                  setSelectedFileSize(null);
                }}
                required
                className="text-xs h-9 bg-background"
              />
            </div>

            {selectedFileName && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="size-3.5" />
                <span className="font-medium truncate">Selected Local File: {selectedFileName}</span>
                {selectedFileSize && <Badge variant="secondary" className="text-[10px] ml-auto">{selectedFileSize}</Badge>}
              </div>
            )}
          </div>

          {/* DURATION */}
          <div className="w-48 space-y-1.5">
            <Label htmlFor="video-duration">Duration</Label>
            <Input
              id="video-duration"
              placeholder="14:30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          {/* SUB-REFERENCE CLIPS BUILDER */}
          <div className="border-t border-border/60 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                  <Sparkles className="size-4 text-primary" />
                  Attached Sub-Reference Keypoints & Formula Clips
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  When students encounter a formula like (a+b)², these clips explain that specific formula!
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSubRef}
                className="gap-1.5 text-xs rounded-full border-primary/40 text-primary hover:bg-primary/10"
              >
                <Plus className="size-3.5" />
                <span>Add Sub-Clip</span>
              </Button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {subRefs.map((ref, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-border/80 bg-card/60 space-y-2.5 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary">Sub-Reference #{idx + 1}</span>
                    {subRefs.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeSubRef(idx)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Timestamp</Label>
                      <Input
                        placeholder="02:15"
                        value={ref.timestamp}
                        onChange={(e) => updateSubRef(idx, "timestamp", e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>

                    <div className="col-span-3 space-y-1">
                      <Label className="text-[11px]">Keypoint Title</Label>
                      <Input
                        placeholder="e.g. Binomial Expansion Proof"
                        value={ref.keypointTitle}
                        onChange={(e) => updateSubRef(idx, "keypointTitle", e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Formula / Concept</Label>
                      <Input
                        placeholder="e.g. (a + b)² = a² + 2ab + b²"
                        value={ref.formulaOrConcept}
                        onChange={(e) => updateSubRef(idx, "formulaOrConcept", e.target.value)}
                        className="text-xs h-8 font-math"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px]">Sub-Reference Clip URL</Label>
                      <Input
                        placeholder="https://.../clip.mp4"
                        value={ref.clipVideoUrl}
                        onChange={(e) => updateSubRef(idx, "clipVideoUrl", e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px]">Explanation of Formula</Label>
                    <Input
                      placeholder="Explain how this formula works for students..."
                      value={ref.explanation}
                      onChange={(e) => updateSubRef(idx, "explanation", e.target.value)}
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
                ) : (
                  "Save Video Lesson"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
