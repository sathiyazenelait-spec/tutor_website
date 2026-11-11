import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Sparkles, LogIn, LogOut, LayoutDashboard, Shield, GraduationCap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth, formatRole } from "@/lib/auth-context";
import { AuthModal } from "@/components/auth-modal";
import { DashboardModal } from "@/components/dashboard-modal";

const nav = [
  { to: "/", label: "Home" },
  { to: "/library", label: "Video Library" },
  { to: "/notes", label: "Smart Notes" },
  { to: "/tutors", label: "Tutors" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getRoleIcon = (role?: string) => {
    if (role === "ROLE_ADMIN") return <Shield className="size-3.5 text-amber-500" />;
    if (role === "ROLE_TUTOR") return <BookOpen className="size-3.5 text-sky-500" />;
    return <GraduationCap className="size-3.5 text-emerald-500" />;
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled ? "border-b border-border bg-background/80 py-3 backdrop-blur-xl" : "py-5",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <Link to="/" className="group flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lamp transition-transform duration-500 group-hover:rotate-12">
              <Sparkles className="size-5" />
            </span>
            <span className="font-display text-xl font-semibold">
              Tutor<span className="text-primary">Sphere</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="relative rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground"
                activeProps={{ className: "bg-foreground/5" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDashboardOpen(true)}
                  className="rounded-full gap-2 border-border/80 hover:border-primary/50"
                >
                  {getRoleIcon(user.role)}
                  <span className="font-medium">{user.name}</span>
                  <Badge variant="secondary" className="text-[10px] uppercase font-mono px-1.5 py-0">
                    {formatRole(user.role)}
                  </Badge>
                  <LayoutDashboard className="size-3.5 text-muted-foreground ml-1" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  title="Sign Out"
                  className="rounded-full text-muted-foreground hover:text-destructive size-9"
                >
                  <LogOut className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAuthModalOpen(true)}
                  className="rounded-full gap-1.5 px-4"
                >
                  <LogIn className="size-4" />
                  <span>Sign In</span>
                </Button>

                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => setAuthModalOpen(true)}
                  className="px-5 rounded-full"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          <button
            className="md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {open && (
          <div className="animate-in fade-in slide-in-from-top-2 mx-4 mt-3 rounded-2xl glass-card p-4 space-y-3 md:hidden">
            <div className="space-y-1">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm hover:bg-foreground/5"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-border/60 pt-3">
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-sm font-semibold">{user.name}</span>
                    <Badge variant="outline" className="text-xs">{formatRole(user.role)}</Badge>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      setDashboardOpen(true);
                      setOpen(false);
                    }}
                  >
                    <LayoutDashboard className="size-4" />
                    Open Dashboard
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                  >
                    <LogOut className="size-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full gap-2"
                  onClick={() => {
                    setAuthModalOpen(true);
                    setOpen(false);
                  }}
                >
                  <LogIn className="size-4" />
                  Sign In / Register
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

      {/* Role Authorized Dashboard Modal */}
      <DashboardModal open={dashboardOpen} onOpenChange={setDashboardOpen} />
    </>
  );
}
