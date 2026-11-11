import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { Sparkles, Shield, GraduationCap, BookOpen, Loader2 } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "register";
}

export function AuthModal({ open, onOpenChange, defaultTab = "login" }: AuthModalProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<string>(defaultTab);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("ROLE_STUDENT");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    setIsSubmitting(true);
    const success = await login(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (success) {
      onOpenChange(false);
      setLoginEmail("");
      setLoginPassword("");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) return;

    setIsSubmitting(true);
    const success = await register(regName, regEmail, regPassword, regRole);
    setIsSubmitting(false);

    if (success) {
      onOpenChange(false);
      setRegName("");
      setRegEmail("");
      setRegPassword("");
    }
  };

  const fillQuickLogin = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setTab("login");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] bg-background/95 backdrop-blur-2xl border-border shadow-2xl p-6">
        <DialogHeader className="text-center sm:text-center pb-2">
          <div className="mx-auto mb-2 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="size-6" />
          </div>
          <DialogTitle className="text-2xl font-display font-semibold">
            {tab === "login" ? "Welcome back" : "Join TutorSphere"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {tab === "login"
              ? "Sign in to access your notes, tutor sessions & dashboard"
              : "Create an account to start your interactive learning journey"}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/60">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          {/* LOGIN TAB */}
          <TabsContent value="login">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email Address</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Password</Label>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* QUICK DEMO USERS CHIPS */}
            <div className="mt-5 border-t border-border/60 pt-4">
              <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center justify-between">
                <span>Quick Fill Demo Credentials:</span>
                <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">H2 Database</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillQuickLogin("student@learnspace.com", "Student123!")}
                  className="flex flex-col items-center justify-center p-2 rounded-xl border border-border/50 bg-card hover:bg-accent/40 text-left transition-all text-xs group"
                >
                  <GraduationCap className="size-4 mb-1 text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-foreground text-[11px]">Student</span>
                  <span className="text-[10px] text-muted-foreground truncate w-full text-center">Alex</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillQuickLogin("tutor@learnspace.com", "Tutor123!")}
                  className="flex flex-col items-center justify-center p-2 rounded-xl border border-border/50 bg-card hover:bg-accent/40 text-left transition-all text-xs group"
                >
                  <BookOpen className="size-4 mb-1 text-sky-500 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-foreground text-[11px]">Tutor</span>
                  <span className="text-[10px] text-muted-foreground truncate w-full text-center">Elena</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillQuickLogin("admin@learnspace.com", "Admin123!")}
                  className="flex flex-col items-center justify-center p-2 rounded-xl border border-border/50 bg-card hover:bg-accent/40 text-left transition-all text-xs group"
                >
                  <Shield className="size-4 mb-1 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-foreground text-[11px]">Admin</span>
                  <span className="text-[10px] text-muted-foreground truncate w-full text-center">Master</span>
                </button>
              </div>
            </div>
          </TabsContent>

          {/* REGISTER TAB */}
          <TabsContent value="register">
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="reg-name">Full Name</Label>
                <Input
                  id="reg-name"
                  placeholder="e.g. John Doe"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-email">Email Address</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="john@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-password">Password (min 6 characters)</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Choose Your Role</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole("ROLE_STUDENT")}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      regRole === "ROLE_STUDENT"
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border/60 hover:bg-accent/30 text-muted-foreground"
                    }`}
                  >
                    <GraduationCap className="size-4 text-emerald-500" />
                    <span>Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole("ROLE_TUTOR")}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      regRole === "ROLE_TUTOR"
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border/60 hover:bg-accent/30 text-muted-foreground"
                    }`}
                  >
                    <BookOpen className="size-4 text-sky-500" />
                    <span>Tutor</span>
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full mt-2" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

