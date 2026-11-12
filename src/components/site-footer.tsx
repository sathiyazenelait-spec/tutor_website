import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-ink">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <span className="font-display text-lg font-semibold">TutorSphere</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Video lessons and interactive smart notes where every formula can explain itself.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Crafted by</span>
            <a
              href="https://zenelaitinfotech.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hover:opacity-85 transition-opacity"
              title="Visit Zenelait Infotech"
            >
              <img
                src="/zenelait-logo.png"
                alt="Zenelait Infotech"
                className="h-8 w-auto object-contain brightness-105"
              />
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Learn</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/library" className="hover:text-foreground">Video Library</Link></li>
            <li><Link to="/notes" className="hover:text-foreground">Smart Notes</Link></li>
            <li><Link to="/tutors" className="hover:text-foreground">Find a Tutor</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Subjects</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Mathematics</li>
            <li>Physics</li>
            <li>Chemistry</li>
            <li>Biology</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div>
          © {new Date().getFullYear()} TutorSphere. Smart learning, one formula at a time.
        </div>
        <div className="flex items-center gap-2">
          <span>Powered by</span>
          <a
            href="https://zenelaitinfotech.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-85 transition-opacity inline-flex items-center"
            title="Zenelait Infotech"
          >
            <img
              src="/zenelait-logo.png"
              alt="Zenelait Infotech"
              className="h-6 w-auto object-contain brightness-105"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
