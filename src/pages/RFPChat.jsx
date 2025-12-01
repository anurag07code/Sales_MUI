import { useMemo, useState, useEffect, useRef, createRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  IconButton,
  TextField,
  Tabs,
  Tab,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Stack,
  Grid,
  useTheme,
} from "@mui/material";
import {
  Send,
  ArrowLeft,
  Plus,
  Bot,
  User,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Download,
  Trash2,
  MessageSquare,
  Sparkles,
  Loader2,
  Upload,
  FileText,
  X,
  AlertCircle,
  Users,
  Globe,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  BookOpen,
  Link2,
  Eye,
  EyeOff,
  Edit2,
  Menu,
  History,
} from "lucide-react";
import { MOCK_RFP_PROJECTS } from "@/lib/mockData";
import { toast } from "sonner";
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

    const sessions = getChatSessions(id);
    const safeSessions = Array.isArray(sessions) ? sessions : [];
    const topicName = topics.find(t => t.key === activeTopic)?.name || activeTopic;

    const existingSession = safeSessions.find(s => s.topic === topicName);
    if (existingSession) {
      setActiveSessionId(existingSession.id);
      return;
    }

    // Create a new session for this topic if it doesn't exist
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
    const updatedSessions = getChatSessions(id);
    setChatSessions(Array.isArray(updatedSessions) ? updatedSessions : []);
    setActiveSessionId(newSession.id);
  }, [activeTopic, setSearchParams, id, topics]);


  // Ensure sessions state stays in sync and set default session if missing
  useEffect(() => {
    if (!id) return;
    const sessions = getChatSessions(id);
    const safeSessions = Array.isArray(sessions) ? sessions : [];
    setChatSessions(safeSessions);
    if (!activeSessionId && safeSessions.length > 0) {
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
  }, [id, activeSessionId, chatSessions]);

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

  const uploadInputRefs = useRef({});

  const ensureUploadRef = key => {
    if (!uploadInputRefs.current[key]) {
      uploadInputRefs.current[key] = createRef();
    }
    return uploadInputRefs.current[key];
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
    let sessions = getChatSessions(id);
    setChatSessions(Array.isArray(sessions) ? sessions : []);

    // Auto-rename session to the user's first message snippet if it still has a default title
    const sessionNow = getChatSession(id, activeSessionId);
    const currentTitle = sessionNow?.title || "";
    const isDefaultTitle = /^\s*(New Chat|Chat about)/i.test(currentTitle);
    if (isDefaultTitle) {
      const base = content || (fileInfo.length > 0 ? `Files (${fileInfo.length})` : "");
      const snippet = base.replace(/\s+/g, " ").trim().slice(0, 60);
      if (snippet.length > 0) {
        updateChatSession(id, activeSessionId, { title: snippet });
        sessions = getChatSessions(id);
        setChatSessions(Array.isArray(sessions) ? sessions : []);
      }
    }
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

  const handleUploadQueries = async (topicKey, filesList) => {
    const files = Array.from(filesList || []);
    if (files.length === 0) return;
    try {
      const contents = await Promise.all(files.map(file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(`--- ${file.name} ---\n${reader.result}`);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      })));
      setTopicContents(prev => ({
        ...prev,
        [topicKey]: `${prev[topicKey] || ""}\n\n${contents.join("\n\n")}`.trim()
      }));
      toast.success(`Uploaded ${files.length} file(s) to ${topics.find(t => t.key === topicKey)?.name || topicKey}`);
    } catch (error) {
      console.error("Error reading files:", error);
      toast.error("Failed to read uploaded files. Please try again.");
    } finally {
      const ref = uploadInputRefs.current[topicKey];
      if (ref?.current) {
        ref.current.value = "";
      }
    }
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


  if (!project) {
    return (
      <Box sx={{ minHeight: "100vh", p: 4 }}>
        <Box sx={{ maxWidth: 960, mx: "auto" }}>
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Project not found
            </Typography>
            <Button variant="contained" onClick={() => navigate("/rfp-lifecycle")}>
              Back to RFP Lifecycle
            </Button>
          </Paper>
        </Box>
      </Box>
    );
  }

  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "background.default",
      }}
    >
      {/* Sidebar */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={sidebarOpen}
        sx={{
          width: 260,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 260,
            boxSizing: "border-box",
            borderRight: `1px solid ${theme.palette.primary.main}33`,
            backdropFilter: "blur(10px)",
            bgcolor: "background.paper",
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.primary.main}33` }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <History size={18} color={theme.palette.primary.main} />
              <Typography variant="subtitle1" fontWeight={600}>
                Chat History
              </Typography>
            </Stack>
            <IconButton size="small" onClick={() => setSidebarOpen(false)}>
              <X size={16} />
            </IconButton>
          </Stack>
          <Button
            fullWidth
            size="small"
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={handleNewChat}
          >
            New Chat
          </Button>
        </Box>
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <List dense>
            {Array.isArray(chatSessions) &&
              chatSessions.map(session => (
                <ListItemButton
                  key={session.id}
                  selected={activeSessionId === session.id}
                  onClick={() => handleSwitchSession(session.id)}
                  sx={{
                    alignItems: "flex-start",
                    py: 1,
                    px: 2,
                    "&.Mui-selected": {
                      bgcolor: theme.palette.primary.main + "22",
                    },
                  }}
                >
                  {editingSessionId === session.id ? (
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%", gap: 1 }}>
                      <TextField
                        size="small"
                        fullWidth
                        value={editingTitle}
                        onChange={e => setEditingTitle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") handleSaveTitle(session.id);
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        autoFocus
                      />
                      <IconButton
                        size="small"
                        onClick={e => {
                          e.stopPropagation();
                          handleSaveTitle(session.id);
                        }}
                      >
                        <Check size={14} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={e => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                      >
                        <X size={14} />
                      </IconButton>
                    </Box>
                  ) : (
                    <>
                      <ListItemText
                        primary={
                          <Typography variant="body2" noWrap fontWeight={500}>
                            {session.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {new Date(session.updatedAt).toLocaleDateString()}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          onClick={e => handleStartEditTitle(session.id, session.title, e)}
                        >
                          <Edit2 size={14} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={e => handleDeleteSession(session.id, e)}
                          sx={{ color: "error.main" }}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </>
                  )}
                </ListItemButton>
              ))}
          </List>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ p: { xs: 2, sm: 3, lg: 4 }, flex: 1 }}>
          <Stack spacing={3} sx={{ height: "100%" }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="center">
                {!sidebarOpen && (
                  <IconButton onClick={() => setSidebarOpen(true)}>
                    <Menu size={18} />
                  </IconButton>
                )}
                <IconButton
                  onClick={() =>
                    navigate(`/rfp-lifecycle/${project.id}/response-writeup`)
                  }
                >
                  <ArrowLeft size={18} />
                </IconButton>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: theme.palette.primary.main + "22",
                    }}
                  >
                    <MessageSquare size={20} color={theme.palette.primary.main} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      AI Chat Assistant
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {project.rfpTitle}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Download size={16} />}
                onClick={handleDownloadChat}
                disabled={currentMessages.length === 0}
              >
                Download Chat
              </Button>
            </Stack>

            {/* Group KB selector */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderColor: theme.palette.primary.main + "33",
                mb: 1,
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Users size={18} color={theme.palette.primary.main} />
                  <Typography variant="body2" fontWeight={600}>
                    Group Knowledge Base:
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Select
                    size="small"
                    value={selectedGroup || "personal"}
                    onChange={e => {
                      const value = e.target.value;
                      if (value === "personal") {
                        setSelectedGroup(null);
                        setShowGroupKB(false);
                      } else {
                        setSelectedGroup(value);
                        setShowGroupKB(true);
                      }
                    }}
                    sx={{ minWidth: 220 }}
                  >
                    <MenuItem value="personal">Personal Knowledge Base</MenuItem>
                    {groups.map(group => (
                      <MenuItem key={group.id} value={group.id}>
                        {group.name} ({group.members.length} members)
                      </MenuItem>
                    ))}
                  </Select>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Users size={16} />}
                    onClick={() => navigate("/groups")}
                  >
                    Manage Groups
                  </Button>
                </Stack>
              </Stack>
              {selectedGroup && (
                <Alert
                  severity="info"
                  icon={<Globe size={16} />}
                  sx={{ mt: 2 }}
                >
                  Viewing shared knowledge base from{" "}
                  <strong>
                    {groups.find(g => g.id === selectedGroup)?.name}
                  </strong>
                  . Your chats remain private and are not shared with the group.
                </Alert>
              )}
            </Paper>

            {/* Topic tabs + create topic */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderColor: theme.palette.primary.main + "33",
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "flex-start", md: "center" }}
                justifyContent="space-between"
              >
                <Tabs
                  value={activeTopic}
                  onChange={(_, value) => setActiveTopic(value)}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {topics.map(t => (
                    <Tab
                      key={t.key}
                      value={t.key}
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <MessageSquare size={14} />
                          <span>{t.name}</span>
                          {t.source === "group" && (
                            <Chip
                              size="small"
                              variant="outlined"
                              label={t.groupName}
                              icon={<Users size={12} />}
                            />
                          )}
                        </Stack>
                      }
                    />
                  ))}
                </Tabs>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Plus size={16} />}
                  onClick={handleCreateTopicClick}
                >
                  Create Topic
                </Button>
              </Stack>
            </Paper>

            {/* Chat window */}
            <Paper
              variant="outlined"
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                borderColor: theme.palette.primary.main + "33",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              {/* Messages area */}
              <Box
                sx={{
                  flex: 1,
                  p: 3,
                  overflowY: "auto",
                  bgcolor: "background.default",
                }}
              >
                {/* Welcome banner */}
                {currentMessages.length > 0 && (
                  <Paper
                    variant="outlined"
                    sx={{
                      mb: 2,
                      p: 2,
                      borderColor: theme.palette.primary.main + "33",
                      bgcolor: theme.palette.primary.main + "08",
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1.5,
                          bgcolor: theme.palette.primary.main + "22",
                        }}
                      >
                        <Sparkles size={18} color={theme.palette.primary.main} />
                      </Box>
                      <Box>
                        <Chip
                          size="small"
                          variant="outlined"
                          color="primary"
                          label={`Currently you are in ${
                            topics.find(t => t.key === activeTopic)?.name.toLowerCase() ||
                            activeTopic
                          }`}
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2">
                          Welcome, You're now engaging with our intelligent assistant focused
                          on{" "}
                          <strong>
                            {topics.find(t => t.key === activeTopic)?.name ||
                              activeTopic}
                          </strong>{" "}
                          — let's get started.
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                )}

                {currentMessages.length === 0 ? (
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: "50%",
                        bgcolor: theme.palette.primary.main + "22",
                        mb: 2,
                      }}
                    >
                      <Bot size={32} color={theme.palette.primary.main} />
                    </Box>
                    <Chip
                      size="small"
                      variant="outlined"
                      color="primary"
                      label={`Currently you are in ${
                        topics.find(t => t.key === activeTopic)?.name.toLowerCase() ||
                        activeTopic
                      }`}
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="subtitle1" gutterBottom>
                      Start a conversation
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ maxWidth: 460, mb: 1 }}
                    >
                      Welcome, You're now engaging with our intelligent assistant focused on{" "}
                      <strong>
                        {topics.find(t => t.key === activeTopic)?.name || activeTopic}
                      </strong>
                      — let's get started.
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ maxWidth: 460 }}
                    >
                      Ask anything about{" "}
                      {topics.find(t => t.key === activeTopic)?.name || "this topic"}.
                      I'm here to help you craft the perfect response.
                    </Typography>
                  </Box>
                ) : (
                  currentMessages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                const messageId = msg.id || `${idx}-${msg.role}`;
                const isCopied = copiedMessageId === messageId;
                const reaction = messageReactions[messageId];
                const sourcesHidden = hiddenSources.has(messageId);
                const hasSources = !isUser && msg.sources && msg.sources.length > 0;

                return (
                  <Stack
                    key={messageId}
                    direction="row"
                    spacing={2}
                    justifyContent={isUser ? "flex-end" : "flex-start"}
                    alignItems="flex-start"
                    sx={{ mb: 2 }}
                  >
                    {!isUser && (
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          bgcolor: theme.palette.primary.main,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: 2,
                        }}
                      >
                        <Sparkles size={18} color="#fff" />
                      </Box>
                    )}
                    <Box
                      sx={{
                        maxWidth: "75%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isUser ? "flex-end" : "flex-start",
                        gap: 0.5,
                      }}
                    >
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          borderTopLeftRadius: isUser ? 3 : 6,
                          borderTopRightRadius: isUser ? 6 : 3,
                          bgcolor: isUser
                            ? theme.palette.primary.main
                            : "background.paper",
                          color: isUser ? "#fff" : "text.primary",
                          border:
                            !isUser &&
                            `1px solid ${theme.palette.primary.main}33`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: "pre-wrap" }}
                        >
                          {msg.content}
                        </Typography>

                        {/* Attached files (user) */}
                        {isUser && msg.files && msg.files.length > 0 && (
                          <Box
                            sx={{
                              mt: 1.5,
                              pt: 1,
                              borderTop: "1px solid rgba(255,255,255,0.2)",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ mb: 0.5, display: "block", opacity: 0.9 }}
                            >
                              Attached Files:
                            </Typography>
                            {msg.files.map((file, fileIdx) => (
                              <Stack
                                key={fileIdx}
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{
                                  p: 0.5,
                                  borderRadius: 1,
                                  bgcolor: "rgba(255,255,255,0.1)",
                                }}
                              >
                                <FileText size={14} />
                                <Typography variant="caption" noWrap>
                                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                </Typography>
                              </Stack>
                            ))}
                          </Box>
                        )}

                        {/* Actions for assistant messages */}
                        {!isUser && (
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ mt: 1.5, pt: 1, borderTop: "1px solid rgba(0,0,0,0.08)" }}
                          >
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => handleCopy(messageId, msg.content)}
                              startIcon={
                                isCopied ? (
                                  <Check size={14} color="green" />
                                ) : (
                                  <Copy size={14} />
                                )
                              }
                            >
                              <Typography variant="caption">
                                {isCopied ? "Copied" : "Copy answer"}
                              </Typography>
                            </Button>
                            {hasSources && (
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => toggleSources(messageId)}
                                startIcon={
                                  sourcesHidden ? (
                                    <Eye size={14} />
                                  ) : (
                                    <EyeOff size={14} />
                                  )
                                }
                              >
                                <Typography variant="caption">
                                  {sourcesHidden ? "Show Sources" : "Hide Sources"}
                                </Typography>
                              </Button>
                            )}
                            <Stack direction="row" spacing={0.5}>
                              <IconButton
                                size="small"
                                onClick={() => handleReaction(messageId, "like")}
                                sx={{
                                  bgcolor:
                                    reaction === "like"
                                      ? "success.light"
                                      : "transparent",
                                }}
                              >
                                <ThumbsUp size={14} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleReaction(messageId, "dislike")}
                                sx={{
                                  bgcolor:
                                    reaction === "dislike"
                                      ? "error.light"
                                      : "transparent",
                                }}
                              >
                                <ThumbsDown size={14} />
                              </IconButton>
                            </Stack>
                          </Stack>
                        )}

                        {/* Sources */}
                        {!isUser && hasSources && !sourcesHidden && (
                          <Box
                            sx={{
                              mt: 1.5,
                              pt: 1.5,
                              borderTop: "1px solid rgba(0,0,0,0.08)",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mb: 0.5, display: "block" }}
                            >
                              Related Resources:
                            </Typography>
                            {msg.sources.map((source, sourceIdx) => (
                              <Box
                                key={sourceIdx}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  p: 0.75,
                                  borderRadius: 1,
                                  "&:hover": {
                                    bgcolor: theme.palette.primary.main + "08",
                                  },
                                  cursor: "pointer",
                                }}
                                onClick={e => {
                                  e.preventDefault();
                                  toast.info(`Opening ${source.title}`);
                                }}
                              >
                                {source.icon === "book" ? (
                                  <BookOpen
                                    size={14}
                                    color={theme.palette.text.secondary}
                                  />
                                ) : (
                                  <Link2
                                    size={14}
                                    color={theme.palette.primary.main}
                                  />
                                )}
                                <Typography
                                  variant="caption"
                                  sx={{ flex: 1 }}
                                >
                                  {source.title}
                                </Typography>
                                <ExternalLink
                                  size={12}
                                  color={theme.palette.text.disabled}
                                />
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Paper>

                      {/* Timestamp / reaction icon */}
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent={isUser ? "flex-end" : "flex-start"}
                        alignItems="center"
                      >
                        {msg.timestamp && (
                          <Typography variant="caption" color="text.secondary">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Typography>
                        )}
                        {!isUser && reaction && (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {reaction === "like" && (
                              <ThumbsUp size={12} color={theme.palette.primary.main} />
                            )}
                            {reaction === "dislike" && (
                              <ThumbsDown size={12} color={theme.palette.error.main} />
                            )}
                          </Box>
                        )}
                      </Stack>
                    </Box>

                    {isUser && (
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          bgcolor: theme.palette.primary.main + "33",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: `2px solid ${theme.palette.primary.main}66`,
                        }}
                      >
                        <User size={18} color={theme.palette.primary.main} />
                      </Box>
                    )}
                  </Stack>
                );
              })
                )}

                {isLoading && (
                  <Stack direction="row" spacing={2} alignItems="center" mt={2}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        bgcolor: theme.palette.primary.main + "22",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Bot size={16} color={theme.palette.primary.main} />
                    </Box>
                    <Paper
                      variant="outlined"
                      sx={{
                        px: 2,
                        py: 1,
                        borderColor: theme.palette.primary.main + "33",
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Loader2
                          size={16}
                          className="animate-spin"
                          color={theme.palette.primary.main}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Thinking...
                        </Typography>
                      </Stack>
                    </Paper>
                  </Stack>
                )}

                <div ref={messagesEndRef} />
              </Box>

              {/* Input area */}
              <Box
                sx={{
                  borderTop: `1px solid ${theme.palette.primary.main}33`,
                  p: 2,
                  bgcolor: "background.paper",
                }}
              >
                {/* Attached files */}
                {attachedFiles.length > 0 && (
                  <Paper
                    variant="outlined"
                    sx={{
                      mb: 2,
                      p: 1.5,
                      borderColor: theme.palette.primary.main + "33",
                      bgcolor: theme.palette.primary.main + "08",
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      mb={1}
                    >
                      <Typography
                        variant="caption"
                        color="primary"
                        fontWeight={600}
                      >
                        Attached Files ({attachedFiles.length})
                      </Typography>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => setAttachedFiles([])}
                      >
                        <Typography variant="caption">Clear All</Typography>
                      </Button>
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {attachedFiles.map((file, idx) => (
                        <Chip
                          key={idx}
                          size="small"
                          icon={<FileText size={14} />}
                          label={`${file.name} (${(file.size / 1024).toFixed(
                            1
                          )} KB)`}
                          onDelete={() => removeAttachedFile(idx)}
                        />
                      ))}
                    </Stack>
                  </Paper>
                )}

                <Stack direction="row" spacing={1.5} alignItems="flex-end">
                  <IconButton
                    onClick={() => chatFileInputRef.current?.click()}
                    sx={{
                      border: `1px solid ${theme.palette.primary.main}55`,
                    }}
                  >
                    <Upload size={18} color={theme.palette.primary.main} />
                  </IconButton>
                  <input
                    ref={chatFileInputRef}
                    type="file"
                    multiple
                    hidden
                    onChange={handleChatFileChange}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    maxRows={4}
                    placeholder="Add details here..."
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    disabled={isLoading}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSend}
                    disabled={
                      ( !draft.trim() && attachedFiles.length === 0 ) || isLoading
                    }
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: "primary.main",
                      color: "#fff",
                      "&:hover": { bgcolor: "primary.dark" },
                    }}
                  >
                    {isLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </IconButton>
                </Stack>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  mt={1}
                  sx={{ typography: "caption", color: "text.secondary" }}
                >
                  <span>Chat history is automatically saved</span>
                  <span>
                    {currentMessages.length} message
                    {currentMessages.length !== 1 ? "s" : ""}
                  </span>
                </Stack>
              </Box>
            </Paper>

            {/* Create Topic dialog */}
            <Dialog
              open={fileDialogOpen}
              onClose={() => {
                setFileDialogOpen(false);
                setFileError("");
              }}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Create New Topic</DialogTitle>
              <DialogContent dividers>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" display="block" gutterBottom>
                      Topic Name *
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enter your new topic name"
                      value={newTopicName}
                      onChange={e => {
                        setNewTopicName(e.target.value);
                        setNameError("");
                      }}
                    />
                    {nameError && (
                      <Alert
                        severity="error"
                        icon={<AlertCircle size={16} />}
                        sx={{ mt: 1 }}
                      >
                        <Typography variant="caption">{nameError}</Typography>
                      </Alert>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="caption" display="block" gutterBottom>
                      Upload Files *
                    </Typography>
                    <Button
                      variant={
                        fileError
                          ? "outlined"
                          : newTopicFiles.length > 0
                          ? "contained"
                          : "outlined"
                      }
                      color={fileError ? "error" : "primary"}
                      fullWidth
                      startIcon={<Upload size={16} />}
                      component="label"
                    >
                      {newTopicFiles.length > 0
                        ? `${newTopicFiles.length} file(s) selected`
                        : "Choose Files"}
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        hidden
                        onChange={handleNewTopicFileChange}
                      />
                    </Button>
                    {fileError && (
                      <Alert
                        severity="error"
                        icon={<AlertCircle size={16} />}
                        sx={{ mt: 1 }}
                      >
                        <Typography variant="caption">{fileError}</Typography>
                      </Alert>
                    )}

                    {newTopicFiles.length > 0 && (
                      <Box mt={1} sx={{ maxHeight: 160, overflowY: "auto" }}>
                        {newTopicFiles.map((file, idx) => (
                          <Stack
                            key={idx}
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{
                              p: 0.75,
                              borderRadius: 1,
                              border: "1px solid",
                              borderColor: "divider",
                              mb: 0.5,
                            }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center">
                              <FileText
                                size={16}
                                color={theme.palette.primary.main}
                              />
                              <Typography variant="caption" noWrap>
                                {file.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                ({(file.size / 1024).toFixed(1)} KB)
                              </Typography>
                            </Stack>
                            <IconButton
                              size="small"
                              onClick={e => {
                                e.preventDefault();
                                removeNewTopicFile(idx);
                              }}
                            >
                              <X size={14} />
                            </IconButton>
                          </Stack>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    setFileDialogOpen(false);
                    setFileError("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleFileDialogConfirm}
                  disabled={newTopicFiles.length === 0}
                  startIcon={<Check size={16} />}
                >
                  Create Topic with Files
                </Button>
              </DialogActions>
            </Dialog>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default RFPChat;

