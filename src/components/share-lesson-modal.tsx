import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Share2, MessageCircle, Search, Send, UserPlus, CheckCircle2, Clock, Users, Loader2 } from "lucide-react";

interface ShareLessonModalProps {
  videoId: number;
  videoTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FriendItem {
  id: number;
  friendId?: number;
  friendName?: string;
  friendEmail?: string;
  name?: string;
  email?: string;
  isFriend?: boolean;
}

export function ShareLessonModal({ videoId, videoTitle, open, onOpenChange }: ShareLessonModalProps) {
  const { user, fetchWithAuth } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [recentFriends, setRecentFriends] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [customMessage, setCustomMessage] = useState("Check out this tutor lesson with formula explanation clips!");

  // Load friends and recent sent
  useEffect(() => {
    if (!open || !user) return;

    const loadSocial = async () => {
      try {
        const [friendsRes, recentRes] = await Promise.all([
          fetchWithAuth("/friends"),
          fetchWithAuth("/social/recent-sent"),
        ]);
        if (friendsRes.ok) setFriends(await friendsRes.json());
        if (recentRes.ok) setRecentFriends(await recentRes.json());
      } catch (e) {
        // ignore
      }
    };

    loadSocial();
  }, [open, user]);

  // Search students when typing
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetchWithAuth(`/friends/search?name=${encodeURIComponent(searchTerm)}`);
        if (res.ok) {
          setSearchResults(await res.json());
        }
      } catch (e) {
        // ignore
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`🎓 Hey! Check out "${videoTitle}" on LearnSpace Tutor Haven: ${window.location.origin}/library`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    toast.success("Opening WhatsApp to share lesson!");
  };

  const handleSendToFriend = async (friendId: number, friendName: string) => {
    setIsSending(true);
    try {
      const res = await fetchWithAuth(`/videos/${videoId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: friendId,
          message: customMessage,
        }),
      });

      if (!res.ok) throw new Error("Failed to share lesson");

      toast.success(`Shared lesson with ${friendName}!`);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Share failed");
    } finally {
      setIsSending(false);
    }
  };

  const handleAddFriend = async (targetId: number, targetName: string) => {
    try {
      const res = await fetchWithAuth(`/friends/add/${targetId}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add friend");
      toast.success(data.message || `Added ${targetName} as friend!`);

      // Refresh search results
      setSearchResults((prev) =>
        prev.map((s) => (s.id === targetId ? { ...s, isFriend: true } : s))
      );
    } catch (err: any) {
      toast.error(err.message || "Add friend failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[85vh] overflow-y-auto bg-background/95 backdrop-blur-2xl border-border shadow-2xl p-6">
        <DialogHeader className="border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Share2 className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-display font-semibold">
                Share Lesson with Friends
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground truncate max-w-sm">
                "{videoTitle}"
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* 1. WHATSAPP ONE-CLICK SHARING */}
          <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-full bg-emerald-500 text-white shadow">
                <MessageCircle className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-400">Share via WhatsApp</p>
                <p className="text-[11px] text-muted-foreground">Send direct lesson link to WhatsApp chats & groups</p>
              </div>
            </div>

            <Button
              onClick={handleShareWhatsApp}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-xs h-8 px-4 gap-1.5"
            >
              <span>Share WhatsApp</span>
            </Button>
          </div>

          {/* 2. RECENT SENT FRIENDS QUICK-PICK */}
          {recentFriends && recentFriends.length > 0 && (
            <div>
              <span className="text-[11px] uppercase font-mono font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
                <Clock className="size-3 text-primary" />
                Recently Sent Friends
              </span>
              <div className="flex flex-wrap gap-2">
                {recentFriends.map((rec, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendToFriend(rec.friendId, rec.friendName)}
                    className="text-xs rounded-full h-8 gap-1.5 border-border/80 hover:border-primary/50"
                  >
                    <Send className="size-3 text-primary" />
                    <span>Send to {rec.friendName}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* 3. IN-APP FRIEND SEARCH & SEND */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-mono font-semibold text-muted-foreground flex items-center gap-1.5">
                <Users className="size-3 text-primary" />
                Find Student by Name to Send or Add Friend
              </span>
            </div>

            <div className="relative">
              <Search className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Type student name (e.g. Sarah, Alex)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs h-9 bg-background"
              />
            </div>

            {/* SEARCH RESULTS */}
            {isSearching ? (
              <div className="py-4 flex justify-center items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span>Searching students in H2 database...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {searchResults.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-card hover:bg-accent/30 text-xs transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{st.name}</p>
                      <p className="text-[11px] text-muted-foreground">{st.email} • {st.grade}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSendToFriend(st.id, st.name)}
                        disabled={isSending}
                        className="h-7 text-xs rounded-lg gap-1"
                      >
                        <Send className="size-3" />
                        <span>Send</span>
                      </Button>

                      {!st.isFriend && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddFriend(st.id, st.name)}
                          className="h-7 text-xs rounded-lg gap-1 border-primary/30 text-primary"
                        >
                          <UserPlus className="size-3" />
                          <span>Add Friend</span>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm ? (
              <p className="text-xs text-muted-foreground text-center py-2">No students found matching "{searchTerm}"</p>
            ) : null}
          </div>

          {/* 4. CURRENT FRIENDS LIST */}
          <div>
            <span className="text-[11px] uppercase font-mono font-semibold text-muted-foreground block mb-2">
              Your Connected Friends ({friends.length})
            </span>
            {friends.length === 0 ? (
              <p className="text-xs text-muted-foreground p-3 rounded-xl border border-border/60 bg-card/40 text-center">
                No friends added yet. Type a student name above to find and add friends!
              </p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {friends.map((fr) => (
                  <div
                    key={fr.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-card text-xs"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{fr.friendName}</p>
                      <p className="text-[11px] text-muted-foreground">{fr.friendEmail}</p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleSendToFriend(fr.friendId || fr.id, fr.friendName || "")}
                      disabled={isSending}
                      className="h-7 text-xs rounded-lg gap-1"
                    >
                      <Send className="size-3" />
                      <span>Send Lesson</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
