import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth, formatRole } from "@/lib/auth-context";
import { toast } from "sonner";
import { Shield, GraduationCap, BookOpen, Trash2, UserPlus, Search, Loader2, Database, RefreshCw, ArrowLeftRight, CheckCircle2, XCircle, Plus, BookCheck, Film, Pencil, Sparkles } from "lucide-react";
import { TutorUploadModal } from "@/components/tutor-upload-modal";
import { TutorNoteModal } from "@/components/tutor-note-modal";
import { API_BASE } from "@/lib/api-config";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "ROLE_STUDENT" | "ROLE_TUTOR" | "ROLE_ADMIN";
  createdAt: string;
}

interface SubjectItem {
  id: number;
  name: string;
  description: string;
  status: string;
}

interface SubjectRequestItem {
  id: number;
  subjectName: string;
  description: string;
  tutorId: number;
  tutorName: string;
  status: string;
  adminFeedback?: string;
  createdAt: string;
}

interface AdminUserManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminUserManagementModal({ open, onOpenChange }: AdminUserManagementModalProps) {
  const { fetchWithAuth } = useAuth();
  const [activeTab, setActiveTab] = useState("users");

  // Users state
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

  // Subjects & Requests state
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [subjectRequests, setSubjectRequests] = useState<SubjectRequestItem[]>([]);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectDesc, setNewSubjectDesc] = useState("");
  const [isAddingSubject, setIsAddingSubject] = useState(false);

  // Content (Videos & Notes) state
  const [contentVideos, setContentVideos] = useState<any[]>([]);
  const [contentNotes, setContentNotes] = useState<any[]>([]);
  const [adminEditVideo, setAdminEditVideo] = useState<any | null>(null);
  const [adminEditVideoOpen, setAdminEditVideoOpen] = useState(false);
  const [adminEditNote, setAdminEditNote] = useState<any | null>(null);
  const [adminEditNoteOpen, setAdminEditNoteOpen] = useState(false);

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

  const fetchSubjectsAndRequests = async () => {
    if (!open) return;
    try {
      const [subjRes, reqRes] = await Promise.all([
        fetch(`${API_BASE}/subjects`),
        fetchWithAuth("/admin/subject-requests"),
      ]);
      if (subjRes.ok) setSubjects(await subjRes.json());
      if (reqRes.ok) setSubjectRequests(await reqRes.json());
    } catch (e) {}
  };

  const fetchContent = async () => {
    if (!open) return;
    try {
      const [vRes, nRes] = await Promise.all([
        fetch(`${API_BASE}/videos`),
        fetch(`${API_BASE}/notes`),
      ]);
      if (vRes.ok) setContentVideos(await vRes.json());
      if (nRes.ok) setContentNotes(await nRes.json());
    } catch (e) {}
  };

  useEffect(() => {
    fetchUsers();
    fetchSubjectsAndRequests();
    fetchContent();
  }, [open]);

  const handleAdminDeleteVideo = async (id: number, title: string) => {
    if (!confirm(`Admin: Permanently delete lesson "${title}" from H2 database?`)) return;
    try {
      const res = await fetchWithAuth(`/admin/videos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success(`Video "${title}" deleted by Admin.`);
      fetchContent();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete video");
    }
  };

  const handleAdminDeleteNote = async (id: number, title: string) => {
    if (!confirm(`Admin: Permanently delete smart note "${title}" from H2 database?`)) return;
    try {
      const res = await fetchWithAuth(`/admin/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success(`Smart note "${title}" deleted by Admin.`);
      fetchContent();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete note");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) return;

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

  // SUBJECT ACTIONS
  const handleApproveSubjectRequest = async (id: number, name: string) => {
    try {
      const res = await fetchWithAuth(`/admin/subject-requests/${id}/approve`, { method: "PUT" });
      if (!res.ok) throw new Error("Approval failed");
      toast.success(`Approved "${name}"! Added to active curriculum.`);
      fetchSubjectsAndRequests();
    } catch (err: any) {
      toast.error(err.message || "Approval failed");
    }
  };

  const handleRejectSubjectRequest = async (id: number) => {
    try {
      const res = await fetchWithAuth(`/admin/subject-requests/${id}/reject`, { method: "PUT" });
      if (!res.ok) throw new Error("Rejection failed");
      toast.info("Subject suggestion marked as rejected.");
      fetchSubjectsAndRequests();
    } catch (err: any) {
      toast.error(err.message || "Rejection failed");
    }
  };

  const handleCreateSubjectDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    setIsAddingSubject(true);
    try {
      const res = await fetchWithAuth("/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSubjectName.trim(), description: newSubjectDesc.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to add subject");
      }
      toast.success(`Subject "${newSubjectName}" added directly to H2 database!`);
      setNewSubjectName("");
      setNewSubjectDesc("");
      fetchSubjectsAndRequests();
    } catch (err: any) {
      toast.error(err.message || "Failed to add subject");
    } finally {
      setIsAddingSubject(false);
    }
  };

  const handleDeleteSubject = async (id: number, name: string) => {
    if (!confirm(`Delete subject "${name}" from curriculum?`)) return;
    try {
      const res = await fetchWithAuth(`/admin/subjects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete subject");
      toast.success(`Deleted subject "${name}".`);
      fetchSubjectsAndRequests();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete subject");
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

  const pendingRequests = subjectRequests.filter((r) => r.status === "PENDING");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[820px] max-h-[92vh] overflow-y-auto bg-background/95 backdrop-blur-2xl border-border shadow-2xl p-6">
        <DialogHeader className="border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <div className="grid size-10 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
              <Shield className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-display font-semibold">
                Admin Control Center
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Maintain Students, Tutors & Curriculum Subjects in H2 Database
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full pt-1">
          <TabsList className="grid w-full grid-cols-3 mb-4 bg-muted/60">
            <TabsTrigger value="users" className="gap-1.5 text-xs">
              <GraduationCap className="size-3.5" />
              <span>Users ({users.length})</span>
            </TabsTrigger>
            <TabsTrigger value="subjects" className="gap-1.5 text-xs">
              <BookCheck className="size-3.5" />
              <span>Subjects & Requests</span>
              {pendingRequests.length > 0 && (
                <Badge className="size-4 p-0 grid place-items-center rounded-full bg-amber-500 text-white text-[10px]">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-1.5 text-xs">
              <Film className="size-3.5" />
              <span>Lessons & Notes ({contentVideos.length + contentNotes.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: USERS MAINTENANCE */}
          <TabsContent value="users" className="space-y-4">
            {/* METRICS BAR */}
            <div className="grid grid-cols-3 gap-3">
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

            {/* ADD USER BUTTON & FORM */}
            <div className="flex justify-end">
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

            {showAddForm && (
              <form
                onSubmit={handleCreateUser}
                className="p-4 rounded-2xl border border-primary/30 bg-primary/5 space-y-3 animate-in fade-in"
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

            {/* SEARCH & FILTERS */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="relative w-72">
                <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 text-xs h-8"
                />
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
                <Button variant="ghost" size="icon" onClick={fetchUsers} className="size-8">
                  <RefreshCw className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* USERS LIST */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg grid place-items-center font-semibold bg-primary/10">
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
                        <span className="font-semibold text-foreground">{u.name}</span>
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
              ))}
            </div>
          </TabsContent>

          {/* TAB 2: SUBJECTS & TUTOR REQUESTS */}
          <TabsContent value="subjects" className="space-y-5">
            {/* 1. REVIEW TUTOR SUBJECT SUGGESTIONS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Tutor Subject Suggestions Pending Verification
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Tutors submit requests for curriculum expansion. Admins verify & approve into H2 DB.
                  </p>
                </div>

                <Badge variant="outline" className="text-xs font-mono">
                  {pendingRequests.length} Pending
                </Badge>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-border/80 text-center text-xs text-muted-foreground">
                  No pending subject suggestions from tutors right now.
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">{req.subjectName}</span>
                            <Badge variant="outline" className="text-[10px] border-sky-500/40 text-sky-400">
                              Suggested by: {req.tutorName}
                            </Badge>
                          </div>
                          {req.description && (
                            <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                              {req.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            onClick={() => handleApproveSubjectRequest(req.id, req.subjectName)}
                            className="h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white gap-1"
                          >
                            <CheckCircle2 className="size-3.5" />
                            <span>Verify & Approve</span>
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectSubjectRequest(req.id)}
                            className="h-8 text-xs gap-1"
                          >
                            <XCircle className="size-3.5" />
                            <span>Reject</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. DIRECT SUBJECT CREATION */}
            <form
              onSubmit={handleCreateSubjectDirect}
              className="p-3.5 rounded-xl border border-border/70 bg-card/60 flex items-end gap-2"
            >
              <div className="space-y-1 flex-1">
                <Label className="text-[11px]">Add New Subject Directly</Label>
                <Input
                  placeholder="Subject name (e.g. Statistics, Astronomy)..."
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="text-xs h-8"
                  required
                />
              </div>

              <div className="space-y-1 flex-1">
                <Label className="text-[11px]">Description (Optional)</Label>
                <Input
                  placeholder="Overview of subject topics..."
                  value={newSubjectDesc}
                  onChange={(e) => setNewSubjectDesc(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <Button type="submit" size="sm" disabled={isAddingSubject} className="h-8 text-xs gap-1">
                <Plus className="size-3.5" />
                <span>Add Subject</span>
              </Button>
            </form>

            {/* 3. ACTIVE SUBJECTS LIST IN H2 DATABASE */}
            <div>
              <span className="text-[11px] uppercase font-mono font-semibold text-muted-foreground block mb-2">
                Active Curriculum Subjects in H2 Database ({subjects.length})
              </span>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {subjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 bg-card text-xs"
                  >
                    <div>
                      <span className="font-semibold text-foreground">{sub.name}</span>
                      {sub.description && (
                        <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">{sub.description}</p>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSubject(sub.id, sub.name)}
                      className="size-7 text-muted-foreground hover:text-destructive"
                      title="Delete subject"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: ADMIN CONTENT MANAGEMENT (VIDEOS & NOTES) */}
          <TabsContent value="content" className="space-y-5">
            {/* 1. VIDEO LESSONS SECTION */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-mono font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Film className="size-3.5 text-primary" />
                  Video Lessons in H2 Database ({contentVideos.length})
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAdminEditVideo(null);
                    setAdminEditVideoOpen(true);
                  }}
                  className="h-7 text-xs gap-1 border-primary/30 text-primary"
                >
                  <Plus className="size-3" />
                  <span>Add Lesson</span>
                </Button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {contentVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card text-xs hover:border-primary/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground truncate">{video.title}</span>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                          {video.subject}
                        </Badge>
                        {video.subReferences && video.subReferences.length > 0 && (
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5 text-primary">
                            {video.subReferences.length} formula clips
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Tutor: <span className="text-foreground/80 font-medium">{video.tutorName}</span> • Duration: {video.duration}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAdminEditVideo(video);
                          setAdminEditVideoOpen(true);
                        }}
                        className="h-7 px-2 text-primary hover:bg-primary/10 gap-1"
                        title="Admin Edit Video & Attached Clips"
                      >
                        <Pencil className="size-3" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAdminDeleteVideo(video.id, video.title)}
                        className="h-7 px-2 text-destructive hover:bg-destructive/10 gap-1"
                        title="Admin Delete Video from H2 DB"
                      >
                        <Trash2 className="size-3" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. SMART FORMULA NOTES SECTION */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-mono font-semibold text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="size-3.5 text-primary" />
                  Interactive Smart Notes in H2 Database ({contentNotes.length})
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAdminEditNote(null);
                    setAdminEditNoteOpen(true);
                  }}
                  className="h-7 text-xs gap-1 border-primary/30 text-primary"
                >
                  <Plus className="size-3" />
                  <span>Add Note</span>
                </Button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {contentNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card text-xs hover:border-primary/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground truncate">{note.title}</span>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                          {note.subject}
                        </Badge>
                        {note.subExplanations && note.subExplanations.length > 0 && (
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5 text-primary">
                            {note.subExplanations.length} interactive buttons
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] font-math text-foreground/80 mt-0.5 truncate">
                        {note.formula}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Tutor: {note.tutorName} • {note.chapter}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAdminEditNote(note);
                          setAdminEditNoteOpen(true);
                        }}
                        className="h-7 px-2 text-primary hover:bg-primary/10 gap-1"
                        title="Admin Edit Smart Note & Word/Line Buttons"
                      >
                        <Pencil className="size-3" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAdminDeleteNote(note.id, note.title)}
                        className="h-7 px-2 text-destructive hover:bg-destructive/10 gap-1"
                        title="Admin Delete Smart Note from H2 DB"
                      >
                        <Trash2 className="size-3" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* ADMIN EDIT VIDEO MODAL */}
        <TutorUploadModal
          open={adminEditVideoOpen}
          onOpenChange={setAdminEditVideoOpen}
          onSuccess={fetchContent}
          editVideo={adminEditVideo}
        />

        {/* ADMIN EDIT NOTE MODAL */}
        <TutorNoteModal
          open={adminEditNoteOpen}
          onOpenChange={setAdminEditNoteOpen}
          onSuccess={fetchContent}
          editNote={adminEditNote}
        />

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
