import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Send, ArrowLeft, Plus, Bot, User, Copy, Check, ThumbsUp, ThumbsDown, 
  Download, Trash2, MessageSquare, Sparkles, Loader2, Upload, FileText, X, AlertCircle, Users, Globe,
  ExternalLink, ChevronUp, ChevronDown, BookOpen, Link2, Eye, EyeOff, Edit2, Menu, History
} from "lucide-react";
import { MOCK_RFP_PROJECTS } from "@/lib/mockData";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  getChatSessions, createChatSession, updateChatSession, 
  deleteChatSession, getChatSession, addMessageToSession 
} from "@/lib/chatSessions";

const RFPChat = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const project = useMemo(() => MOCK_RFP_PROJECTS.find(p => p.id === id), [id]);
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Chat sessions state - ensure it's always an array
  const [chatSessions, setChatSessions] = useState(() => {
    if (!id) return [];
    const sessions = getChatSessions(id);
    return Array.isArray(sessions) ? sessions : [];
  });
  const [activeSessionId, setActiveSessionId] = useState(() => {
    if (!id) return null;
    const sessions = getChatSessions(id);
    return Array.isArray(sessions) && sessions.length > 0 ? sessions[0].id : null;
  });
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [showGroupKB, setShowGroupKB] = useState(false);

  // Topic state
  const [topics, setTopics] = useState([
    { key: "transition", name: "Transition", source: "personal" },
    { key: "governance", name: "Governance", source: "personal" },
    { key: "continuity", name: "Business Continuity", source: "personal" },
  ]);
  const defaultTopic = searchParams.get("topic") || "transition";
  const [activeTopic, setActiveTopic] = useState(defaultTopic);

  // Load groups
  useEffect(() => {
    try {
      const stored = localStorage.getItem('rfp-groups');
      if (stored) {
        const loadedGroups = JSON.parse(stored);
        setGroups(loadedGroups);
      }
    } catch (error) {
      console.error("Error loading groups:", error);
    }
  }, []);

  // Load group knowledge base topics when group is selected
  useEffect(() => {
    if (!selectedGroup || !showGroupKB) {
      setTopics(prev => {
        const personalTopics = prev.filter(t => t.source === "personal");
        // If no personal topics exist, keep the default ones
        if (personalTopics.length === 0) {
          return [
            { key: "transition", name: "Transition", source: "personal" },
            { key: "governance", name: "Governance", source: "personal" },
            { key: "continuity", name: "Business Continuity", source: "personal" }
          ];
        }
        return personalTopics;
      });
      return;
    }

    if (groups.length === 0) return;

    const group = groups.find(g => g.id === selectedGroup);
    if (group && group.knowledgeBase) {
      const groupTopics = (group.knowledgeBase.topics || []).map(t => ({
        key: t.key,
        name: t.name,
        source: "group",
        groupId: group.id,
        groupName: group.name,
        files: t.files || []
      }));
      setTopics(prev => {
        const personalTopics = prev.filter(t => t.source === "personal");
        return [...personalTopics, ...groupTopics];
      });
    }
  }, [selectedGroup, showGroupKB, groups]);

  // Update URL when topic changes and switch/create session for that topic
  useEffect(() => {
    if (!id) return;
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set("topic", activeTopic);
      return next;
    });

    // When topic changes, find or create a session for that topic
    const sessions = getChatSessions(id);
    const safeSessions = Array.isArray(sessions) ? sessions : [];
    const topicName = topics.find(t => t.key === activeTopic)?.name || activeTopic;
    
    // Look for existing session with this topic
    const existingSession = safeSessions.find(s => s.topic === topicName);
    
    if (existingSession) {
      setActiveSessionId(existingSession.id);
    } else if (safeSessions.length === 0) {
      // No sessions exist, create one for current topic
      const topicMessages = {
        transition: "Let's craft the Transition section for your proposal. What angle should we emphasize?",
        governance: "Ready to outline Governance. Any specific committees or KPIs to include?",
        continuity: "Let's detail Business Continuity. Do you have RTO/RPO targets?"
      };
      const initialMessage = topicMessages[activeTopic] || `Let's discuss ${topicName}. How can I help you today?`;
      const newSession = createChatSession(id, topicName);
      updateChatSession(id, newSession.id, {
        messages: [{
          role: "assistant",
          content: initialMessage,
          timestamp: new Date().toISOString(),
          id: Date.now().toString()
        }]
      });
      setChatSessions(getChatSessions(id));
      setActiveSessionId(newSession.id);
    }
  }, [activeTopic, setSearchParams, id, topics]);


  // Initialize with a default chat session if none exist
  useEffect(() => {
    if (!id) return;
    const sessions = getChatSessions(id);
    const safeSessions = Array.isArray(sessions) ? sessions : [];
    if (safeSessions.length === 0) {
      const topicName = topics.find(t => t.key === activeTopic)?.name || activeTopic;
      const newSession = createChatSession(id, topicName);
      // Set initial message based on topic
      const topicMessages = {
        transition: "Let's craft the Transition section for your proposal. What angle should we emphasize?",
        governance: "Ready to outline Governance. Any specific committees or KPIs to include?",
        continuity: "Let's detail Business Continuity. Do you have RTO/RPO targets?"
      };
      const initialMessage = topicMessages[activeTopic] || `Let's discuss ${topicName}. How can I help you today?`;
      updateChatSession(id, newSession.id, {
        messages: [{
          role: "assistant",
          content: initialMessage,
          timestamp: new Date().toISOString(),
          id: Date.now().toString()
        }]
      });
      setChatSessions([newSession]);
      setActiveSessionId(newSession.id);
    } else if (!activeSessionId) {
      setActiveSessionId(safeSessions[0].id);
    }
  }, [id]);

  // Refresh sessions when they change
  useEffect(() => {
    if (!id) return;
    const sessions = getChatSessions(id);
    setChatSessions(Array.isArray(sessions) ? sessions : []);
  }, [id, activeSessionId]);
  const [draft, setDraft] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});
  const [hiddenSources, setHiddenSources] = useState(new Set());
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  const [attachedFiles, setAttachedFiles] = useState([]);
  const chatFileInputRef = useRef(null);

  // Get current session messages
  const currentSession = useMemo(() => {
    if (!activeSessionId) return null;
    return getChatSession(id, activeSessionId);
  }, [id, activeSessionId]);

  const currentMessages = currentSession?.messages || [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const handleChatFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachedFiles(prev => [...prev, ...files]);
      toast.success(`${files.length} file(s) attached`);
    }
    if (chatFileInputRef.current) {
      chatFileInputRef.current.value = "";
    }
  };

  const removeAttachedFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Create new chat session
  const handleNewChat = () => {
    if (!id) return;
    const topicName = topics.find(t => t.key === activeTopic)?.name || activeTopic;
    const newSession = createChatSession(id, topicName);
    const sessions = getChatSessions(id);
    setChatSessions(Array.isArray(sessions) ? sessions : []);
    setActiveSessionId(newSession.id);
    toast.success("New chat created");
  };

  // Switch to a different chat session
  const handleSwitchSession = (sessionId) => {
    setActiveSessionId(sessionId);
  };

  // Delete a chat session
  const handleDeleteSession = (sessionId, e) => {
    e.stopPropagation();
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
      const remainingSessions = deleteChatSession(id, sessionId);
      const safeSessions = Array.isArray(remainingSessions) ? remainingSessions : [];
      setChatSessions(safeSessions);
      if (activeSessionId === sessionId) {
        setActiveSessionId(safeSessions.length > 0 ? safeSessions[0].id : null);
      }
      toast.success("Chat deleted");
    }
  };

  // Start editing session title
  const handleStartEditTitle = (sessionId, currentTitle, e) => {
    e.stopPropagation();
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
  };

  // Save edited title
  const handleSaveTitle = (sessionId) => {
    if (!id) return;
    if (editingTitle.trim()) {
      updateChatSession(id, sessionId, { title: editingTitle.trim() });
      const sessions = getChatSessions(id);
      setChatSessions(Array.isArray(sessions) ? sessions : []);
      setEditingSessionId(null);
      setEditingTitle("");
      toast.success("Chat title updated");
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditingTitle("");
  };

  // Create Topic Dialog state
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicFiles, setNewTopicFiles] = useState([]);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [fileError, setFileError] = useState("");
  const [nameError, setNameError] = useState("");
  const fileInputRef = useRef(null);

  const handleNewTopicFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewTopicFiles(files);
      setFileError("");
    } else {
      setNewTopicFiles([]);
    }
  };

  const removeNewTopicFile = (index) => {
    const updatedFiles = newTopicFiles.filter((_, i) => i !== index);
    setNewTopicFiles(updatedFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreateTopicClick = () => {
    // Reset errors and open dialog
    setNewTopicName("");
    setNewTopicFiles([]);
    setFileError("");
    setNameError("");
    setFileDialogOpen(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addTopic = () => {
    const name = newTopicName.trim();
    
    // Validate topic name
    if (!name) {
      setNameError("Please enter a topic name");
      return;
    }
    
    // Validate files
    if (newTopicFiles.length === 0) {
      setFileError("Please select at least one file for your knowledge base");
      toast.error("File selection is required. Please choose files for your knowledge base.", {
        duration: 4000,
      });
      return;
    }

    const key = name.toLowerCase().replace(/\s+/g, "-");
    if (topics.some(t => t.key === key)) {
      setActiveTopic(key);
      setNewTopicName("");
      setNewTopicFiles([]);
      setFileDialogOpen(false);
      setFileError("");
      setNameError("");
      toast.info(`Switched to existing topic "${name}"`);
      return;
    }
    
    const fileNames = newTopicFiles.map(f => f.name);
    const newTopic = {
      key,
      name,
      files: fileNames,
      source: selectedGroup ? "group" : "personal",
      groupId: selectedGroup || undefined,
      groupName: selectedGroup ? groups.find(g => g.id === selectedGroup)?.name : undefined
    };
    
    setTopics(prev => [...prev, newTopic]);
    
    // Save to group if selected
    if (selectedGroup) {
      const updatedGroups = groups.map(g => {
        if (g.id === selectedGroup) {
          const existingTopics = g.knowledgeBase?.topics || [];
          return {
            ...g,
            knowledgeBase: {
              ...g.knowledgeBase,
              topics: [...existingTopics, {
                key,
                name,
                files: fileNames,
                content: `Created topic "${name}" with ${fileNames.length} file(s). Share details to begin drafting.`,
                createdAt: new Date().toISOString()
              }],
              files: [...(g.knowledgeBase?.files || []), ...fileNames]
            }
          };
        }
        return g;
      });
      localStorage.setItem('rfp-groups', JSON.stringify(updatedGroups));
      setGroups(updatedGroups);
    }
    
    setActiveTopic(key);
    setNewTopicName("");
    setNewTopicFiles([]);
    setFileDialogOpen(false);
    setFileError("");
    setNameError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success(`Topic "${name}" created successfully with ${fileNames.length} file(s)${selectedGroup ? ' and shared with group' : ''}`);
  };

  const handleFileDialogConfirm = () => {
    addTopic();
  };

  const handleSend = () => {
    if (!activeSessionId) {
      handleNewChat();
      return;
    }

    const content = draft.trim();
    if (!content && attachedFiles.length === 0) return;

    const fileInfo = attachedFiles.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type
    }));

    const userMessage = {
      role: "user",
      content: content || (attachedFiles.length > 0 ? `[Attached ${attachedFiles.length} file(s)]` : ''),
      files: fileInfo.length > 0 ? fileInfo : undefined,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    };

    if (!id || !activeSessionId) return;
    addMessageToSession(id, activeSessionId, userMessage);
    const sessions = getChatSessions(id);
    setChatSessions(Array.isArray(sessions) ? sessions : []);
    setDraft("");
    setAttachedFiles([]);
    setIsLoading(true);

    // Simulate assistant reply with sources
    setTimeout(() => {
      const fileContext = fileInfo.length > 0 
        ? ` I've reviewed the ${fileInfo.length} attached file(s) and ` 
        : ' I\'ll ';
      const assistantMessage = {
        role: "assistant",
        content: `Acknowledged.${fileContext}help you with your RFP. Based on your input${fileInfo.length > 0 ? ' and the documents provided' : ''}, here's a comprehensive approach:\n\n1. **Key Focus Areas**: ${content ? content.substring(0, 50) + '...' : 'Based on the attached documents'}\n\n2. **Implementation Strategy**: We'll align this with best practices and ensure compliance.\n\n3. **Next Steps**: Would you like me to elaborate on any specific aspect?`,
        timestamp: new Date().toISOString(),
        id: (Date.now() + 1).toString(),
        sources: [
          { type: "faq", title: "RFP FAQ", url: "#rfp-faq", icon: "book" },
          { type: "document", title: "RFP Documentation", url: "#rfp-docs", icon: "link" }
        ]
      };
      
      if (id && activeSessionId) {
        addMessageToSession(id, activeSessionId, assistantMessage);
        const sessions = getChatSessions(id);
        setChatSessions(Array.isArray(sessions) ? sessions : []);
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleCopy = async (messageId, content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      toast.success("Message copied to clipboard");
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      toast.error("Failed to copy message");
    }
  };

  const handleReaction = (messageId, reaction) => {
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: prev[messageId] === reaction ? null : reaction
    }));
    toast.success(reaction === "like" ? "Thanks for your feedback!" : "Feedback noted");
  };

  const toggleSources = (messageId) => {
    setHiddenSources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const toggleExpand = (messageId) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const handleDownloadChat = () => {
    if (!currentSession) return;
    
    let chatContent = `RFP Chat Export\n`;
    chatContent += `Project: ${project?.rfpTitle || 'N/A'}\n`;
    chatContent += `Chat: ${currentSession.title}\n`;
    chatContent += `Date: ${new Date().toLocaleString()}\n`;
    chatContent += `\n${'='.repeat(50)}\n\n`;

    currentMessages.forEach((msg, idx) => {
      const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '';
      chatContent += `[${msg.role.toUpperCase()}] ${timestamp}\n`;
      chatContent += `${msg.content}\n\n`;
      chatContent += `${'-'.repeat(50)}\n\n`;
    });

    const blob = new Blob([chatContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeTitle = currentSession.title.replace(/[^a-z0-9]+/gi, "_").toLowerCase();
    a.download = `rfp-chat-${safeTitle}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Chat downloaded successfully");
  };

  const handleClearChat = () => {
    if (!activeSessionId) return;
    if (window.confirm("Are you sure you want to clear this chat? This action cannot be undone.")) {
      if (id && activeSessionId) {
        updateChatSession(id, activeSessionId, { 
          messages: [{
            role: "assistant",
            content: "Chat cleared. How can I help you?",
            timestamp: new Date().toISOString(),
            id: Date.now().toString()
          }]
        });
        const sessions = getChatSessions(id);
        setChatSessions(Array.isArray(sessions) ? sessions : []);
      }
      setMessageReactions({});
      toast.success("Chat cleared");
    }
  };


  if (!project) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Project not found</p>
            <Button onClick={() => navigate("/rfp-lifecycle")}>Back to RFP Lifecycle</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-primary/20 bg-card/50 backdrop-blur-sm flex flex-col`}>
        <div className="p-4 border-b border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Chat History
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            onClick={handleNewChat} 
            className="w-full gap-2 bg-primary hover:bg-primary/90"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {Array.isArray(chatSessions) && chatSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => handleSwitchSession(session.id)}
              className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                activeSessionId === session.id
                  ? 'bg-primary/20 border-2 border-primary/40'
                  : 'bg-card/50 border-2 border-transparent hover:bg-primary/10 hover:border-primary/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                {editingSessionId === session.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveTitle(session.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      className="h-7 text-xs"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveTitle(session.id);
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelEdit();
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{session.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => handleStartEditTitle(session.id, session.title, e)}
                        title="Rename"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSidebarOpen(true)}
                  className="hover:bg-accent/50"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => navigate(`/rfp-lifecycle/${project.id}/response-writeup`)} className="hover:bg-accent/50">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
                    AI Chat Assistant
                    <Sparkles className="h-5 w-5 text-primary" />
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">{project.rfpTitle}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadChat}
                className="gap-2"
                disabled={currentMessages.length === 0}
              >
                <Download className="h-4 w-4" />
                Download Chat
              </Button>
              {currentMessages.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearChat}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

        {/* Group Knowledge Base Selector */}
        <Card className="p-4 border-2 border-primary/20 bg-card/50 backdrop-blur-sm mb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">Group Knowledge Base:</span>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedGroup || "personal"} onValueChange={(value) => {
                if (value === "personal") {
                  setSelectedGroup(null);
                  setShowGroupKB(false);
                } else {
                  setSelectedGroup(value);
                  setShowGroupKB(true);
                }
              }}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a group (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal Knowledge Base</SelectItem>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name} ({group.members.length} members)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/groups")}
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                Manage Groups
              </Button>
            </div>
          </div>
          {selectedGroup && (
            <Alert className="mt-3 bg-primary/5 border-primary/20">
              <Globe className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                Viewing shared knowledge base from <strong>{groups.find(g => g.id === selectedGroup)?.name}</strong>. 
                Your chats remain private and are not shared with the group.
              </AlertDescription>
            </Alert>
          )}
        </Card>

        {/* Topic Tabs + Create Topic */}
        <Card className="p-4 border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Tabs value={activeTopic} onValueChange={setActiveTopic} className="flex-1">
              <TabsList className="flex flex-wrap">
                {topics.map(t => (
                  <TabsTrigger key={t.key} value={t.key} className="gap-2">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {t.name}
                    {t.source === "group" && (
                      <Badge variant="outline" className="ml-1 text-xs bg-primary/20 text-primary border-primary/30">
                        <Users className="h-2.5 w-2.5 mr-0.5" />
                        {t.groupName}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleCreateTopicClick} 
                size="sm" 
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> 
                Create Topic
              </Button>
            </div>
          </div>
        </Card>


        {/* Enhanced Chat Window */}
        <Card className="p-0 overflow-hidden h-[75vh] flex flex-col border-2 border-primary/20 shadow-2xl rounded-2xl bg-white dark:bg-card">
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-background via-background to-muted/10" style={{ backgroundColor: 'hsl(var(--background))' }}>
            {/* Welcome Message Banner */}
            {currentMessages.length > 0 && (
              <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-2 border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/20 flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs font-semibold">
                        Currently you are in {topics.find(t => t.key === activeTopic)?.name.toLowerCase() || activeTopic}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      Welcome, You're now engaging with our intelligent assistant focused on <span className="font-semibold text-primary">{topics.find(t => t.key === activeTopic)?.name || activeTopic}</span> — let's get started.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                  <Bot className="h-12 w-12 text-primary" />
                </div>
                <div className="mb-4">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs font-semibold mb-3">
                    Currently you are in {topics.find(t => t.key === activeTopic)?.name.toLowerCase() || activeTopic}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-4">
                  Welcome, You're now engaging with our intelligent assistant focused on <span className="font-semibold text-primary">{topics.find(t => t.key === activeTopic)?.name || activeTopic}</span> — let's get started.
                </p>
                <p className="text-xs text-muted-foreground max-w-md">
                  Ask me anything about {topics.find(t => t.key === activeTopic)?.name || 'this topic'}. I'm here to help you craft the perfect response.
                </p>
              </div>
            ) : (
              currentMessages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                const messageId = msg.id || `${idx}-${msg.role}`;
                const isCopied = copiedMessageId === messageId;
                const reaction = messageReactions[messageId];
                const sourcesHidden = hiddenSources.has(messageId);
                const hasSources = !isUser && msg.sources && msg.sources.length > 0;

                return (
                  <div key={messageId} className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'} items-start`}>
                    {!isUser && (
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center border-2 border-primary/30 shadow-md">
                          <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className={`flex flex-col gap-2 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                      <div className={`group relative p-5 rounded-2xl shadow-md transition-all ${
                        isUser 
                          ? 'bg-gradient-to-br from-primary to-primary/90 text-white rounded-tr-sm' 
                          : 'bg-white dark:bg-card border-2 border-primary/20 text-foreground rounded-tl-sm hover:border-primary/30 hover:shadow-lg'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        
                        {/* Display attached files in user messages */}
                        {isUser && msg.files && msg.files.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/20 space-y-2">
                            <p className="text-xs font-semibold mb-2 opacity-90">Attached Files:</p>
                            {msg.files.map((file, fileIdx) => (
                              <div key={fileIdx} className="flex items-center gap-2 p-2 rounded-md bg-white/10">
                                <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="text-xs truncate flex-1">{file.name}</span>
                                <span className="text-xs opacity-75">({(file.size / 1024).toFixed(1)} KB)</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Action buttons for assistant messages */}
                        {!isUser && (
                          <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/50">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-2 text-xs hover:bg-primary/5"
                              onClick={() => handleCopy(messageId, msg.content)}
                            >
                              {isCopied ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-green-600" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  Copy answer
                                </>
                              )}
                            </Button>
                            {hasSources && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-2 text-xs hover:bg-primary/5"
                                onClick={() => toggleSources(messageId)}
                              >
                                {sourcesHidden ? (
                                  <>
                                    <Eye className="h-3.5 w-3.5" />
                                    Show Sources
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="h-3.5 w-3.5" />
                                    Hide Sources
                                  </>
                                )}
                              </Button>
                            )}
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 ${reaction === 'like' ? 'text-green-600 bg-green-500/10' : ''}`}
                                onClick={() => handleReaction(messageId, 'like')}
                                title="Like"
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 ${reaction === 'dislike' ? 'text-red-600 bg-red-500/10' : ''}`}
                                onClick={() => handleReaction(messageId, 'dislike')}
                                title="Dislike"
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Sources/Related Resources */}
                        {!isUser && hasSources && !sourcesHidden && (
                          <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">Related Resources:</p>
                            {msg.sources.map((source, sourceIdx) => (
                              <a
                                key={sourceIdx}
                                href={source.url}
                                onClick={(e) => {
                                  e.preventDefault();
                                  toast.info(`Opening ${source.title}`);
                                }}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/5 transition-colors group"
                              >
                                {source.icon === "book" ? (
                                  <BookOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                ) : (
                                  <Link2 className="h-4 w-4 text-primary group-hover:text-primary/80" />
                                )}
                                <span className="text-xs text-foreground group-hover:text-primary transition-colors">
                                  {source.title}
                                </span>
                                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Timestamp and reactions */}
                      <div className={`flex items-center gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
                        {msg.timestamp && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        {!isUser && reaction && (
                          <div className="flex items-center gap-1">
                            {reaction === "like" && (
                              <ThumbsUp className="h-3 w-3 text-primary" />
                            )}
                            {reaction === "dislike" && (
                              <ThumbsDown className="h-3 w-3 text-destructive" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {isUser && (
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-primary/30 flex items-center justify-center border-2 border-primary/50 shadow-md">
                          <User className="h-5 w-5 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/30">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-2 p-4 rounded-2xl bg-card border-2 border-primary/20">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Input Area */}
          <div className="p-4 border-t-2 border-primary/20 bg-white dark:bg-card/95 backdrop-blur-sm">
            {/* Attached Files Preview */}
            {attachedFiles.length > 0 && (
              <div className="mb-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-primary">Attached Files ({attachedFiles.length})</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAttachedFiles([])}
                    className="h-6 text-xs"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {attachedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-md bg-card border border-border">
                      <FileText className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span className="text-xs text-foreground truncate max-w-[150px]">{file.name}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 flex-shrink-0"
                        onClick={() => removeAttachedFile(idx)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 items-end">
              {/* File Upload Button */}
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                title="Upload files"
                onClick={() => chatFileInputRef.current?.click()}
              >
                <Upload className="h-5 w-5 text-primary" />
              </Button>
              <input
                ref={chatFileInputRef}
                type="file"
                multiple
                onChange={handleChatFileChange}
                className="hidden"
              />

              <div className="flex-1 relative">
                <Input 
                  placeholder="Add details here..." 
                  value={draft} 
                  onChange={e => setDraft(e.target.value)} 
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="bg-background min-h-[48px] pr-12 rounded-xl border-2 border-primary/20 focus:border-primary/40 transition-colors"
                  disabled={isLoading}
                />
              </div>
              <Button 
                onClick={handleSend} 
                size="icon"
                className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={(!draft.trim() && attachedFiles.length === 0) || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Chat history is automatically saved</span>
              <span>{currentMessages.length} message{currentMessages.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </Card>

        {/* Create Topic Dialog with Name and File Upload */}
        <Dialog open={fileDialogOpen} onOpenChange={setFileDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Create New Topic
              </DialogTitle>
              <DialogDescription>
                Enter a topic name and upload files to create a new knowledge base topic. This will help improve AI assistance.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Topic Name Input */}
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Topic Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Enter your new topic name"
                  value={newTopicName}
                  onChange={e => {
                    setNewTopicName(e.target.value);
                    setNameError("");
                  }}
                  className="w-full"
                />
                {nameError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">{nameError}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* File Upload Section */}
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Upload Files <span className="text-destructive">*</span>
                </label>
                <label className="cursor-pointer block">
                  <div className={`flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed transition-all ${
                    fileError 
                      ? 'border-destructive/50 bg-destructive/5' 
                      : newTopicFiles.length > 0 
                        ? 'border-primary/50 bg-primary/5' 
                        : 'border-primary/30 hover:border-primary/50 hover:bg-primary/5'
                  }`}>
                    <Upload className={`h-10 w-10 mb-3 ${fileError ? 'text-destructive' : 'text-primary'}`} />
                    <span className={`text-sm font-medium mb-1 ${fileError ? 'text-destructive' : 'text-primary'}`}>
                      {newTopicFiles.length > 0 ? `${newTopicFiles.length} file(s) selected` : 'Choose Files'}
                    </span>
                    <span className="text-xs text-muted-foreground text-center">
                      {newTopicFiles.length > 0 ? 'Click to change files' : 'Select files for your knowledge base'}
                    </span>
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    multiple 
                    onChange={handleNewTopicFileChange}
                    className="hidden"
                  />
                </label>
                
                {fileError && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">{fileError}</AlertDescription>
                  </Alert>
                )}
                
                {newTopicFiles.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                    {newTopicFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-card border border-border">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-xs text-foreground truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={(e) => {
                            e.preventDefault();
                            removeNewTopicFile(idx);
                          }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setFileDialogOpen(false);
                setFileError("");
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleFileDialogConfirm}
                disabled={newTopicFiles.length === 0}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Create Topic with Files
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
};

export default RFPChat;

