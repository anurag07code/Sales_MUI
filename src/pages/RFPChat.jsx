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
  ExternalLink, ChevronUp, ChevronDown, BookOpen, Link2, Eye, EyeOff
} from "lucide-react";
import { MOCK_RFP_PROJECTS } from "@/lib/mockData";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const RFPChat = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const project = useMemo(() => MOCK_RFP_PROJECTS.find(p => p.id === id), [id]);
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // Storage key for chat history
  const storageKey = `rfp-chat-${id}`;

  // Topic state
  const [topics, setTopics] = useState([
    { key: "transition", name: "Transition", source: "personal" },
    { key: "governance", name: "Governance", source: "personal" },
    { key: "continuity", name: "Business Continuity", source: "personal" },
  ]);
  const defaultTopic = searchParams.get("topic") || "transition";
  const [activeTopic, setActiveTopic] = useState(defaultTopic);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [showGroupKB, setShowGroupKB] = useState(false);

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

  // Load chat history from localStorage
  const loadChatHistory = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.threads || {};
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
    return null;
  };

  // Save chat history to localStorage
  const saveChatHistory = (threads) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        threads,
        lastUpdated: new Date().toISOString(),
        projectId: id,
        projectTitle: project?.rfpTitle
      }));
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  };

  // Initialize threads with default or loaded history
  const getInitialThreads = () => {
    const loaded = loadChatHistory();
    if (loaded && Object.keys(loaded).length > 0) {
      return loaded;
    }
    return {
      transition: [{ 
        role: "assistant", 
        content: "Let's craft the Transition section for your proposal. What angle should we emphasize?",
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      }],
      governance: [{ 
        role: "assistant", 
        content: "Ready to outline Governance. Any specific committees or KPIs to include?",
        timestamp: new Date().toISOString(),
        id: (Date.now() + 1).toString()
      }],
      continuity: [{ 
        role: "assistant", 
        content: "Let's detail Business Continuity. Do you have RTO/RPO targets?",
        timestamp: new Date().toISOString(),
        id: (Date.now() + 2).toString()
      }],
    };
  };

  const [threads, setThreads] = useState(getInitialThreads);
  const [draft, setDraft] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});
  const [hiddenSources, setHiddenSources] = useState(new Set());
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  const [attachedFiles, setAttachedFiles] = useState([]);
  const chatFileInputRef = useRef(null);

  // Save to localStorage whenever threads change
  useEffect(() => {
    saveChatHistory(threads);
  }, [threads, storageKey]);

  useEffect(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set("topic", activeTopic);
      return next;
    });
  }, [activeTopic, setSearchParams]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threads[activeTopic]]);

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

  const handleSend = () => {
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

    setThreads(prev => {
      const current = prev[activeTopic] || [];
      return { ...prev, [activeTopic]: [...current, userMessage] };
    });
    setDraft("");
    setAttachedFiles([]);
    setIsLoading(true);

    // Simulate assistant reply with sources
    setTimeout(() => {
      const fileContext = fileInfo.length > 0 
        ? ` I've reviewed the ${fileInfo.length} attached file(s) and ` 
        : ' I\'ll ';
      const topicName = topics.find(t => t.key === activeTopic)?.name || activeTopic;
      const assistantMessage = {
        role: "assistant",
        content: `Acknowledged.${fileContext}refine the ${topicName} section accordingly. Based on your input${fileInfo.length > 0 ? ' and the documents provided' : ''}, here's a comprehensive approach:\n\n1. **Key Focus Areas**: ${content ? content.substring(0, 50) + '...' : 'Based on the attached documents'}\n\n2. **Implementation Strategy**: We'll align this with best practices and ensure compliance.\n\n3. **Next Steps**: Would you like me to elaborate on any specific aspect?`,
        timestamp: new Date().toISOString(),
        id: (Date.now() + 1).toString(),
        sources: [
          { type: "faq", title: `${topicName} FAQ`, url: `#${activeTopic}-faq`, icon: "book" },
          { type: "document", title: `${topicName} Documentation`, url: `#${activeTopic}-docs`, icon: "link" }
        ]
      };
      
      setThreads(prev => {
        const current = prev[activeTopic] || [];
        return { ...prev, [activeTopic]: [...current, assistantMessage] };
      });
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
    const currentMessages = threads[activeTopic] || [];
    const topicName = topics.find(t => t.key === activeTopic)?.name || activeTopic;
    
    let chatContent = `RFP Chat Export\n`;
    chatContent += `Project: ${project?.rfpTitle || 'N/A'}\n`;
    chatContent += `Topic: ${topicName}\n`;
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
    a.download = `rfp-chat-${topicName}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Chat downloaded successfully");
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear this chat? This action cannot be undone.")) {
      setThreads(prev => ({
        ...prev,
        [activeTopic]: []
      }));
      setMessageReactions({});
      toast.success("Chat cleared");
    }
  };

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
    setThreads(prev => ({ 
      ...prev, 
      [key]: [{ 
        role: "assistant", 
        content: `Created topic "${name}" with ${fileNames.length} file(s). Share details to begin drafting.`,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      }] 
    }));
    
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

  const currentMessages = threads[activeTopic] || [];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/rfp-lifecycle/${project.id}`)} className="hover:bg-accent/50">
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
  );
};

export default RFPChat;

