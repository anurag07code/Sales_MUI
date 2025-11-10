import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Plus, Search, UserPlus, X, Settings, FileText, 
  ArrowLeft, Copy, Check, Trash2, Mail, Shield
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Groups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteEmails, setInviteEmails] = useState([]);

  // Load groups from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('rfp-groups');
    if (stored) {
      try {
        setGroups(JSON.parse(stored));
      } catch (error) {
        console.error("Error loading groups:", error);
      }
    }
  }, []);

  // Save groups to localStorage
  const saveGroups = (updatedGroups) => {
    localStorage.setItem('rfp-groups', JSON.stringify(updatedGroups));
    setGroups(updatedGroups);
  };

  const handleCreateGroup = () => {
    const name = newGroupName.trim();
    if (!name) {
      toast.error("Please enter a group name");
      return;
    }

    const newGroup = {
      id: `group-${Date.now()}`,
      name,
      description: newGroupDescription.trim(),
      createdBy: "Current User", // In real app, get from auth
      createdAt: new Date().toISOString(),
      members: [
        {
          id: "current-user",
          email: "current@user.com",
          name: "Current User",
          role: "admin",
          joinedAt: new Date().toISOString()
        }
      ],
      knowledgeBase: {
        topics: [],
        files: []
      }
    };

    const updated = [...groups, newGroup];
    saveGroups(updated);
    setCreateDialogOpen(false);
    setNewGroupName("");
    setNewGroupDescription("");
    toast.success(`Group "${name}" created successfully`);
  };

  const handleInviteMembers = () => {
    if (inviteEmails.length === 0) {
      toast.error("Please add at least one email address");
      return;
    }

    const newMembers = inviteEmails.map(email => ({
      id: `member-${Date.now()}-${Math.random()}`,
      email: email.trim(),
      name: email.split('@')[0],
      role: "member",
      status: "pending",
      invitedAt: new Date().toISOString()
    }));

    const updated = groups.map(g => {
      if (g.id === selectedGroup.id) {
        return {
          ...g,
          members: [...g.members, ...newMembers]
        };
      }
      return g;
    });

    saveGroups(updated);
    setInviteDialogOpen(false);
    setInviteEmails([]);
    setInviteEmail("");
    toast.success(`${inviteEmails.length} member(s) invited successfully`);
  };

  const addInviteEmail = () => {
    const email = inviteEmail.trim();
    if (!email) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (inviteEmails.includes(email)) {
      toast.error("Email already added");
      return;
    }

    setInviteEmails([...inviteEmails, email]);
    setInviteEmail("");
  };

  const removeInviteEmail = (email) => {
    setInviteEmails(inviteEmails.filter(e => e !== email));
  };

  const handleDeleteGroup = (groupId) => {
    if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      const updated = groups.filter(g => g.id !== groupId);
      saveGroups(updated);
      toast.success("Group deleted successfully");
    }
  };

  const handleRemoveMember = (groupId, memberId) => {
    const updated = groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          members: g.members.filter(m => m.id !== memberId)
        };
      }
      return g;
    });
    saveGroups(updated);
    toast.success("Member removed successfully");
  };

  const copyGroupLink = (groupId) => {
    const link = `${window.location.origin}/groups/${groupId}`;
    navigator.clipboard.writeText(link);
    toast.success("Group link copied to clipboard");
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/rfp-lifecycle")} className="hover:bg-accent/50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">Knowledge Base Groups</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Share knowledge bases with team members. Chats remain private.
                </p>
              </div>
            </div>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Group
          </Button>
        </div>

        {/* Search */}
        <Card className="p-4 border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Groups List */}
        {filteredGroups.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {groups.length === 0 ? "No groups yet" : "No groups found"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {groups.length === 0 
                ? "Create a group to start sharing knowledge bases with your team"
                : "Try adjusting your search query"}
            </p>
            {groups.length === 0 && (
              <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Group
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map(group => (
              <Card key={group.id} className="p-6 border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{group.name}</h3>
                      {group.description && (
                        <p className="text-xs text-muted-foreground mt-1">{group.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyGroupLink(group.id)}
                      title="Copy group link"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteGroup(group.id)}
                      title="Delete group"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Members</span>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Knowledge Base Topics</span>
                    <Badge variant="outline">
                      {group.knowledgeBase?.topics?.length || 0} topics
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Files</span>
                    <Badge variant="outline">
                      {group.knowledgeBase?.files?.length || 0} files
                    </Badge>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-muted-foreground">Recent Members:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.members.slice(0, 3).map(member => (
                        <Badge key={member.id} variant="outline" className="text-xs">
                          {member.name || member.email.split('@')[0]}
                          {member.role === 'admin' && <Shield className="h-3 w-3 ml-1" />}
                        </Badge>
                      ))}
                      {group.members.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{group.members.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => {
                        setSelectedGroup(group);
                        setInviteDialogOpen(true);
                      }}
                    >
                      <UserPlus className="h-4 w-4" />
                      Invite
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => {
                        setSelectedGroup(group);
                        // Navigate to group details or open manage dialog
                        toast.info("Group management coming soon");
                      }}
                    >
                      <Settings className="h-4 w-4" />
                      Manage
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Group Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Create New Group
              </DialogTitle>
              <DialogDescription>
                Create a group to share knowledge bases with your team. Chats will remain private to each member.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Group Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Enter group name"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Description (Optional)
                </label>
                <Input
                  placeholder="Enter group description"
                  value={newGroupDescription}
                  onChange={e => setNewGroupDescription(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setCreateDialogOpen(false);
                setNewGroupName("");
                setNewGroupDescription("");
              }}>
                Cancel
              </Button>
              <Button onClick={handleCreateGroup} className="gap-2">
                <Check className="h-4 w-4" />
                Create Group
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invite Members Dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Invite Members to {selectedGroup?.name}
              </DialogTitle>
              <DialogDescription>
                Add email addresses to invite members. They will have access to the shared knowledge base.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Email Addresses
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addInviteEmail()}
                    className="flex-1"
                  />
                  <Button onClick={addInviteEmail} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {inviteEmails.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Invited Members:</p>
                  <div className="flex flex-wrap gap-2">
                    {inviteEmails.map((email, idx) => (
                      <Badge key={idx} variant="outline" className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {email}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1"
                          onClick={() => removeInviteEmail(email)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setInviteDialogOpen(false);
                setInviteEmails([]);
                setInviteEmail("");
              }}>
                Cancel
              </Button>
              <Button onClick={handleInviteMembers} disabled={inviteEmails.length === 0} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invite {inviteEmails.length} Member{inviteEmails.length !== 1 ? 's' : ''}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Groups;

