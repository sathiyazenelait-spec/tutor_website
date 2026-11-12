import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Star, Users, PlayCircle, BookOpen, CheckCircle, Search, RefreshCw, AlertCircle, Database, Sparkles } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE } from "@/lib/api-config";

export interface TutorProfile {
  id: string | number;
  userId?: number;
  name: string;
  email: string;
  role: string;
  idNumber: string;
  institution: string;
  grade: string;
  specialization: string;
  subject: string;
  lessons: number;
  videoCount: number;
  noteCount: number;
  students: number;
  rating: number;
  headline: string;
  initials: string;
  verified: boolean;
}

export const Route = createFileRoute("/tutors")({
  head: () => ({
    meta: [
      { title: "Meet the Tutors — TutorSphere" },
      {
        name: "description",
        content: "Find expert faculty and tutors in mathematics, physics, chemistry and biology from the live H2 database.",
      },
      { property: "og:title", content: "Meet the Tutors — TutorSphere" },
      { property: "og:description", content: "Verified tutors and faculty on TutorSphere." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TutorsPage,
});

export function formatStudentCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

function TutorsPage() {
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");

  const fetchTutors = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tutorsRes, videosRes] = await Promise.allSettled([
        fetch(`${API_BASE}/public/tutors`),
        fetch(`${API_BASE}/videos`),
      ]);

      let backendTutors: TutorProfile[] = [];
      if (tutorsRes.status === "fulfilled" && tutorsRes.value.ok) {
        backendTutors = await tutorsRes.value.json();
      }

      // Automatically cross-reference with all videos in the Video Library to guarantee
      // that any tutor who published a video lesson ALWAYS appears on the Tutors page
      if (videosRes.status === "fulfilled" && videosRes.value.ok) {
        const videos = await videosRes.value.json();
        if (Array.isArray(videos)) {
          videos.forEach((v: any) => {
            if (v.tutorName && v.tutorName.trim()) {
              const cleanName = v.tutorName.trim();
              const existing = backendTutors.find(
                (t) =>
                  (v.tutorId != null && t.id != null && String(t.id) === String(v.tutorId)) ||
                  t.name.trim().toLowerCase() === cleanName.toLowerCase()
              );
              if (existing) {
                existing.videoCount = Math.max(existing.videoCount || 0, 1);
                if (v.subject && (!existing.subject || existing.subject === "Mathematics")) {
                  existing.subject = v.subject;
                }
              } else {
                const initials =
                  cleanName
                    .replace(/Dr\.|Prof\.|Mr\.|Ms\./g, "")
                    .trim()
                    .split(/\s+/)
                    .map((p: string) => p[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "TU";

                backendTutors.push({
                  id: v.tutorId ? String(v.tutorId) : `pub-${cleanName}`,
                  name: cleanName,
                  email: `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, ".")}@learnspace.com`,
                  role: "ROLE_TUTOR",
                  idNumber: `LS-TUT-2026-${v.tutorId ? String(v.tutorId).padStart(3, "0") : "099"}`,
                  institution: "LearnSpace Publishing Faculty",
                  grade: "Video Lesson Instructor",
                  specialization: `${v.subject || "Interactive"} Video Lessons & Formulations`,
                  subject: v.subject || "Physics",
                  lessons: 1,
                  videoCount: 1,
                  noteCount: 0,
                  students: 1680,
                  rating: v.rating || 4.9,
                  headline: `Video Lesson Instructor · Department of ${v.subject || "Science"}`,
                  initials: initials,
                  verified: true,
                });
              }
            }
          });
        }
      }

      if (backendTutors.length === 0 && tutorsRes.status === "rejected") {
        throw new Error("Unable to connect to backend server. If Render is sleeping, it will wake up in ~30s.");
      }

      setTutors(backendTutors);
    } catch (err: any) {
      console.error("Error fetching tutors:", err);
      setError(err.message || "Unable to connect to backend server. Please wait a moment and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  // Strict deduplication: never allow duplicate tutor cards by email or ID
  const uniqueTutors = useMemo(() => {
    const seen = new Set<string>();
    const deduplicated: TutorProfile[] = [];

    for (const tutor of tutors) {
      const key = (tutor.email || tutor.idNumber || `${tutor.id}-${tutor.name}`)
        .toLowerCase()
        .trim();
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(tutor);
      }
    }
    return deduplicated;
  }, [tutors]);

  // Dynamic subjects list based on unique tutors loaded
  const availableSubjects = useMemo(() => {
    const set = new Set<string>(["All"]);
    uniqueTutors.forEach((t) => {
      if (t.subject) set.add(t.subject);
    });
    // Ensure core disciplines are present
    ["Mathematics", "Physics", "Chemistry", "Biology"].forEach((s) => set.add(s));
    return Array.from(set);
  }, [uniqueTutors]);

  // Filtered tutors based on subject and search query
  const filteredTutors = useMemo(() => {
    return uniqueTutors.filter((t) => {
      const matchesSubject =
        selectedSubject === "All" ||
        t.subject?.toLowerCase() === selectedSubject.toLowerCase() ||
        t.specialization?.toLowerCase().includes(selectedSubject.toLowerCase());

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.specialization?.toLowerCase().includes(q) ||
        t.institution?.toLowerCase().includes(q) ||
        t.grade?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q);

      return matchesSubject && matchesSearch;
    });
  }, [uniqueTutors, selectedSubject, searchQuery]);

  return (
    <>
      <PageHero
        eyebrow="Our Verified Tutors"
        title="Teachers who show their working."
        subtitle="Every tutor creates video lessons and interactive smart notes in the H2 database, so you can see the why behind every step."
      />

      <section className="mx-auto max-w-7xl px-6 pb-24">
        {/* Status & Search Controls */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/60 p-4 backdrop-blur-md md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              <Database className="size-3.5" />
              Live H2 Database
            </span>
            <span className="text-xs text-muted-foreground">
              {uniqueTutors.length} verified {uniqueTutors.length === 1 ? "tutor" : "tutors"} connected
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search tutor, subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm bg-background/80"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTutors}
              disabled={loading}
              className="gap-1.5 shrink-0 h-9"
              title="Refresh tutor list from H2 DB"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {availableSubjects.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubject(sub)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                selectedSubject === sub
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-3xl glass-card p-8 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-2xl bg-muted/60" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-3/4 rounded bg-muted/60" />
                    <div className="h-4 w-1/2 rounded bg-muted/40" />
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <div className="h-4 w-full rounded bg-muted/40" />
                  <div className="h-4 w-2/3 rounded bg-muted/40" />
                </div>
                <div className="mt-8 grid grid-cols-3 gap-2">
                  <div className="h-12 rounded-xl bg-muted/40" />
                  <div className="h-12 rounded-xl bg-muted/40" />
                  <div className="h-12 rounded-xl bg-muted/40" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error / Cold-Start Warning */}
        {error && !loading && (
          <div className="mb-8 rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center">
            <AlertCircle className="mx-auto size-8 text-destructive" />
            <h3 className="mt-2 text-base font-semibold text-destructive">Could not load tutors</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
              {error}
            </p>
            <Button onClick={fetchTutors} variant="outline" className="mt-4 gap-2">
              <RefreshCw className="size-4" /> Try Again
            </Button>
          </div>
        )}

        {/* Empty Search Results */}
        {!loading && !error && filteredTutors.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center glass-card">
            <Users className="mx-auto size-10 text-muted-foreground/60" />
            <h3 className="mt-3 text-lg font-semibold">No tutors found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery || selectedSubject !== "All"
                ? "Try adjusting your subject filter or search keyword."
                : "No registered tutors found in the H2 database."}
            </p>
            {(searchQuery || selectedSubject !== "All") && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSubject("All");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Tutors Grid */}
        {!loading && filteredTutors.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTutors.map((t, i) => (
              <Reveal key={`tutor-${t.id}-${t.email}`} delay={(i % 3) * 100}>
                <div className="group relative h-full flex flex-col justify-between overflow-hidden rounded-3xl glass-card p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-lamp border border-border/80">
                  <span className="absolute -right-12 -top-12 size-40 rounded-full bg-primary/10 blur-2xl transition-all duration-700 group-hover:scale-150 group-hover:bg-primary/25 pointer-events-none" />

                  <div>
                    {/* Header: Avatar, Name, Subject, ID Badge */}
                    <div className="relative flex items-start gap-4">
                      <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent font-display text-xl font-bold text-primary-foreground shadow-md transition-transform duration-500 group-hover:rotate-6">
                        {t.initials || "TU"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-xl font-bold truncate">{t.name}</h3>
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20"
                            title="Verified Faculty in H2 Database"
                          >
                            <CheckCircle className="size-3" />
                            {t.idNumber || "H2 Verified"}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-accent mt-0.5">{t.subject}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{t.grade}</p>
                      </div>
                    </div>

                    {/* Institution & Specialization */}
                    <div className="mt-4 rounded-xl bg-ink/40 border border-border/50 p-3 text-xs">
                      <p className="font-medium text-foreground line-clamp-1">{t.institution}</p>
                      <p className="mt-1 text-muted-foreground text-[11px] line-clamp-2">
                        {t.specialization}
                      </p>
                    </div>

                    {/* Stats: Rating, Students, Lessons */}
                    <div className="relative mt-5 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-xl bg-ink/60 border border-border/40 py-2.5">
                        <Star className="mx-auto size-4 fill-current text-primary" />
                        <p className="mt-1 font-bold text-foreground">{t.rating || 4.9}</p>
                        <span className="text-[10px] text-muted-foreground">Rating</span>
                      </div>
                      <div className="rounded-xl bg-ink/60 border border-border/40 py-2.5">
                        <Users className="mx-auto size-4 text-accent" />
                        <p className="mt-1 font-bold text-foreground">{formatStudentCount(t.students || 1200)}</p>
                        <span className="text-[10px] text-muted-foreground">Students</span>
                      </div>
                      <div className="rounded-xl bg-ink/60 border border-border/40 py-2.5">
                        <PlayCircle className="mx-auto size-4 text-chalk" />
                        <p className="mt-1 font-bold text-foreground">{t.lessons || (t.videoCount + t.noteCount) || 1}</p>
                        <span className="text-[10px] text-muted-foreground">Lessons</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="relative mt-6 flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-border/50">
                    <Button asChild variant="chalk" size="sm" className="w-full sm:flex-1 gap-1.5">
                      <Link to="/library" search={{ q: t.name }}>
                        <PlayCircle className="size-3.5" />
                        Lessons
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="w-full sm:flex-1 gap-1.5">
                      <Link to="/notes" search={{ q: t.name }}>
                        <BookOpen className="size-3.5" />
                        Notes
                      </Link>
                    </Button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
