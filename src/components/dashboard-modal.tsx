import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth, formatRole } from "@/lib/auth-context";
import { Shield, GraduationCap, BookOpen, Database, ExternalLink, Loader2, CheckCircle2, User, Users, UserCog } from "lucide-react";
import { AdminUserManagementModal } from "@/components/admin-user-management-modal";

interface DashboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DashboardModal({ open, onOpenChange }: DashboardModalProps) {
  const { user, fetchWithAuth, logout } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminUserMgmtOpen, setAdminUserMgmtOpen] = useState(false);

  useEffect(() => {
    if (!open || !user) return;

    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        let endpoint = "/student/dashboard";
        if (user.role === "ROLE_TUTOR") {
          endpoint = "/tutor/dashboard";
        } else if (user.role === "ROLE_ADMIN") {
          endpoint = "/admin/dashboard";
        }

        const res = await fetchWithAuth(endpoint);
        if (!res.ok) {
          throw new Error(`Authorization check failed with status: ${res.status}`);
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "Failed to load authorized dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [open, user]);

  if (!user) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto bg-background/95 backdrop-blur-2xl border-border shadow-2xl p-6">
          <DialogHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-primary/10 grid place-items-center text-primary">
                  {user.role === "ROLE_ADMIN" ? (
                    <Shield className="size-6 text-amber-500" />
                  ) : user.role === "ROLE_TUTOR" ? (
                    <BookOpen className="size-6 text-sky-500" />
                  ) : (
                    <GraduationCap className="size-6 text-emerald-500" />
                  )}
                </div>
                <div>
                  <DialogTitle className="text-xl font-display font-semibold flex items-center gap-2">
                    {user.name}
                    <Badge variant="outline" className="text-xs font-mono font-normal">
                      {user.role}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    {user.email} • Authenticated with Spring Security JWT
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-xs">Validating JWT & fetching authorized role data...</span>
            </div>
          ) : error ? (
            <div className="py-6 text-center text-destructive text-sm bg-destructive/10 rounded-xl p-4">
              <p className="font-semibold">Access Error</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          ) : data ? (
            <div className="space-y-5 py-2">
              {/* STUDENT VIEW */}
              {user.role === "ROLE_STUDENT" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl border border-border/60 bg-card/60">
                      <span className="text-xs text-muted-foreground">Active Courses</span>
                      <p className="text-2xl font-bold font-display text-primary mt-1">{data.enrolledSessions}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-border/60 bg-card/60">
                      <span className="text-xs text-muted-foreground">Completed Lessons</span>
                      <p className="text-2xl font-bold font-display text-emerald-500 mt-1">{data.completedLessons}</p>
                    </div>
                  </div>

                  {data.upcomingLesson && (
                    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-primary">Next Live Session</span>
                        <span className="text-muted-foreground">{data.upcomingLesson.time}</span>
                      </div>
                      <p className="font-semibold text-sm">{data.upcomingLesson.subject}</p>
                      <p className="text-xs text-muted-foreground">Tutor: {data.upcomingLesson.tutor}</p>
                    </div>
                  )}

                  {data.recentNotes && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Recent Smart Formula Notes
                      </h4>
                      <div className="space-y-1.5">
                        {data.recentNotes.map((note: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-card/40 border border-border/40">
                            <CheckCircle2 className="size-3.5 text-emerald-500" />
                            <span>{note}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TUTOR VIEW */}
              {user.role === "ROLE_TUTOR" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl border border-border/60 bg-card/60">
                      <span className="text-[11px] text-muted-foreground">Active Students</span>
                      <p className="text-2xl font-bold font-display text-primary mt-1">{data.activeStudents}</p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-border/60 bg-card/60">
                      <span className="text-[11px] text-muted-foreground">Classes Today</span>
                      <p className="text-2xl font-bold font-display text-sky-500 mt-1">{data.scheduledClassesToday}</p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-border/60 bg-card/60">
                      <span className="text-[11px] text-muted-foreground">Rating</span>
                      <p className="text-2xl font-bold font-display text-amber-500 mt-1">★ {data.rating}</p>
                    </div>
                  </div>

                  {data.pendingRequests && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Student Booking Requests
                      </h4>
                      <div className="space-y-2">
                        {data.pendingRequests.map((req: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-xs p-3 rounded-xl bg-card border border-border/50">
                            <div>
                              <span className="font-semibold text-foreground">{req.student}</span>
                              <span className="text-muted-foreground ml-2">({req.subject})</span>
                            </div>
                            <Badge variant="outline" className="text-[11px]">{req.requestedSlot}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ADMIN VIEW */}
              {user.role === "ROLE_ADMIN" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl border border-border/60 bg-card/60">
                      <span className="text-xs text-muted-foreground">Total Registered Users</span>
                      <p className="text-2xl font-bold font-display text-primary mt-1">{data.totalUsers}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-border/60 bg-card/60">
                      <span className="text-xs text-muted-foreground">H2 Database Health</span>
                      <p className="text-2xl font-bold font-display text-emerald-500 mt-1">{data.systemHealth}</p>
                    </div>
                  </div>

                  {/* ADMIN USER MAINTENANCE QUICK ACTION */}
                  <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
                        Maintain Students & Tutors
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Promote, create, edit roles, or remove students and tutors from H2 database
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setAdminUserMgmtOpen(true)}
                      className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5 text-xs rounded-full"
                    >
                      <UserCog className="size-4" />
                      <span>Manage Users</span>
                    </Button>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Recent Users in H2 Database
                    </h4>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {data.users?.map((u: any) => (
                        <div key={u.id} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-card border border-border/40">
                          <div className="flex items-center gap-2">
                            <User className="size-3.5 text-muted-foreground" />
                            <span className="font-medium">{u.name}</span>
                            <span className="text-muted-foreground">({u.email})</span>
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            {u.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* H2 DATABASE CONSOLE INFO CARD */}
              <div className="p-4 rounded-xl border border-border/80 bg-muted/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Database className="size-4 text-primary" />
                    <span>H2 Database Web Console</span>
                  </div>
                  <a
                    href="http://localhost:8081/h2-console"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                  >
                    Open /h2-console <ExternalLink className="size-3" />
                  </a>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  JDBC URL: <code className="text-foreground bg-background px-1 py-0.5 rounded font-mono">jdbc:h2:mem:tutorspacedb</code> | User: <code className="text-foreground bg-background px-1 py-0.5 rounded font-mono">sa</code> | Password: (empty)
                </p>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                logout();
                onOpenChange(false);
              }}
            >
              Sign Out
            </Button>

            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ADMIN USER MANAGEMENT MODAL */}
      <AdminUserManagementModal
        open={adminUserMgmtOpen}
        onOpenChange={setAdminUserMgmtOpen}
      />
    </>
  );
}
