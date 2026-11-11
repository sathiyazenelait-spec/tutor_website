import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth, formatRole } from "@/lib/auth-context";
import { toast } from "sonner";
import { Shield, GraduationCap, BookOpen, Trash2, UserPlus, Search, Loader2, Database, RefreshCw, ArrowLeftRight } from "lucide-react";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "ROLE_STUDENT" | "ROLE_TUTOR" | "ROLE_ADMIN";
  createdAt: string;
}

interface AdminUserManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminUserManagementModal({ open, onOpenChange }: AdminUserManagementModalProps) {
  const { fetchWithAuth, user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "STUDENT" | "TUTOR">("ALL");

  // New user form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("ROLE_STUDENT");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    if (!open) return;
    setLoading(true);
    try {
      const res = await fetchWithAuth("/admin/users");
      if (!res.ok) throw new Error("Failed to load users from H2 database");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load user management data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [open]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) {
      toast.error("Please fill in all user fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetchWithAuth("/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create user");
      }

      toast.success(`User created: ${newName} (${formatRole(newRole)}) in H2 Database!`);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setShowAddForm(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleRole = async (targetUser: AdminUser) => {
    const nextRole = targetUser.role === "ROLE_STUDENT" ? "ROLE_TUTOR" : "ROLE_STUDENT";
    try {
      const res = await fetchWithAuth(`/admin/users/${targetUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });

      if (!res.ok) throw new Error("Failed to update role");
      toast.success(`Updated ${targetUser.name}'s role to ${formatRole(nextRole)}!`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Role update failed");
    }
  };

  const handleDeleteUser = async (targetUser: AdminUser) => {
    if (!confirm(`Are you sure you want to delete ${targetUser.name} (${targetUser.email}) from H2 database?`)) return;

    try {
      const res = await fetchWithAuth(`/admin/users/${targetUser.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete user");
      }

      toast.success(`Deleted ${targetUser.name} from H2 Database.`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  const studentsCount = users.filter((u) => u.role === "ROLE_STUDENT").length;
  const tutorsCount = users.filter((u) => u.role === "ROLE_TUTOR").length;

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (roleFilter === "STUDENT") return matchesSearch && u.role === "ROLE_STUDENT";
    if (roleFilter === "TUTOR") return matchesSearch && u.role === "ROLE_TUTOR";
    return matchesSearch;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[780px] max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-2xl border-border shadow-2xl p-6">
        <DialogHeader className="border-b border-border/50 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="grid size-10 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
                <Shield className="size-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-display font-semibold">
                  Admin User Maintenance & Roles
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Maintain Students and Tutors in H2 Database • Promote, edit or remove accounts
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm((v) => !v)}
              className="text-xs gap-1.5 rounded-full border-primary/40 text-primary hover:bg-primary/10"
            >
              <UserPlus className="size-3.5" />
              <span>{showAddForm ? "Cancel Add User" : "Add Student / Tutor"}</span>
            </Button>
          </div>
        </DialogHeader>

        {/* METRICS BAR */}
        <div className="grid grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl border border-border/60 bg-card/60">
            <span className="text-[11px] text-muted-foreground">Total Users</span>
            <p className="text-xl font-bold font-display text-foreground mt-0.5">{users.length}</p>
          </div>
          <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <span className="text-[11px] text-emerald-500 font-medium">Students</span>
            <p className="text-xl font-bold font-display text-emerald-500 mt-0.5">{studentsCount}</p>
          </div>
          <div className="p-3 rounded-xl border border-sky-500/20 bg-sky-500/5">
            <span className="text-[11px] text-sky-500 font-medium">Tutors</span>
            <p className="text-xl font-bold font-display text-sky-500 mt-0.5">{tutorsCount}</p>
          </div>
        </div>

        {/* ADD NEW USER FORM */}
        {showAddForm && (
          <form
            onSubmit={handleCreateUser}
            className="p-4 rounded-2xl border border-primary/30 bg-primary/5 space-y-3 animate-in fade-in slide-in-from-top-2"
          >
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">
              Register New User into H2 Database
            </h4>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <Label className="text-[11px]">Full Name</Label>
                <Input
                  placeholder="e.g. Maya Patel"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="text-xs h-8 bg-background"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px]">Email</Label>
                <Input
                  type="email"
                  placeholder="maya@learnspace.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="text-xs h-8 bg-background"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px]">Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="text-xs h-8 bg-background"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Label className="text-[11px]">Role:</Label>
                <button
                  type="button"
                  onClick={() => setNewRole("ROLE_STUDENT")}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    newRole === "ROLE_STUDENT"
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-background text-muted-foreground border-border/80"
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setNewRole("ROLE_TUTOR")}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    newRole === "ROLE_TUTOR"
                      ? "bg-sky-500 text-white border-sky-500"
                      : "bg-background text-muted-foreground border-border/80"
                  }`}
                >
                  Tutor
                </button>
              </div>

              <Button type="submit" size="sm" disabled={isSubmitting} className="h-8 text-xs">
                {isSubmitting ? "Creating..." : "Save User to H2"}
              </Button>
            </div>
          </form>
        )}

        {/* SEARCH & FILTER CONTROLS */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setRoleFilter("ALL")}
              className={`px-2.5 py-1 rounded-full text-xs transition-colors border ${
                roleFilter === "ALL" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
              }`}
            >
              All ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter("STUDENT")}
              className={`px-2.5 py-1 rounded-full text-xs transition-colors border ${
                roleFilter === "STUDENT" ? "bg-emerald-500 text-white border-emerald-500" : "border-border text-muted-foreground"
              }`}
            >
              Students ({studentsCount})
            </button>
            <button
              onClick={() => setRoleFilter("TUTOR")}
              className={`px-2.5 py-1 rounded-full text-xs transition-colors border ${
                roleFilter === "TUTOR" ? "bg-sky-500 text-white border-sky-500" : "border-border text-muted-foreground"
              }`}
            >
              Tutors ({tutorsCount})
            </button>
            <Button variant="ghost" size="icon" onClick={fetchUsers} className="size-8" title="Refresh Users">
              <RefreshCw className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* USERS LIST */}
        <div className="space-y-2 pt-1 max-h-72 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="size-5 animate-spin text-primary" />
              <span className="text-xs">Fetching users from H2 Database...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching users found in H2 database.
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg grid place-items-center text-xs font-semibold bg-primary/10">
                    {u.role === "ROLE_ADMIN" ? (
                      <Shield className="size-4 text-amber-500" />
                    ) : u.role === "ROLE_TUTOR" ? (
                      <BookOpen className="size-4 text-sky-500" />
                    ) : (
                      <GraduationCap className="size-4 text-emerald-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{u.name}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] py-0 px-1.5 font-mono ${
                          u.role === "ROLE_ADMIN"
                            ? "text-amber-500 border-amber-500/30"
                            : u.role === "ROLE_TUTOR"
                            ? "text-sky-500 border-sky-500/30"
                            : "text-emerald-500 border-emerald-500/30"
                        }`}
                      >
                        {formatRole(u.role)}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {u.role !== "ROLE_ADMIN" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleRole(u)}
                        className="h-7 text-[11px] gap-1 px-2.5 text-muted-foreground hover:text-foreground"
                        title={`Switch role to ${u.role === "ROLE_STUDENT" ? "Tutor" : "Student"}`}
                      >
                        <ArrowLeftRight className="size-3" />
                        <span>Make {u.role === "ROLE_STUDENT" ? "Tutor" : "Student"}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(u)}
                        className="size-7 text-muted-foreground hover:text-destructive"
                        title="Delete user from H2 DB"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </>
                  )}
                  {u.role === "ROLE_ADMIN" && (
                    <span className="text-[10px] text-muted-foreground px-2">Root System Account</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Database className="size-3.5 text-primary" />
            <span>H2 Database Sync Active</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
