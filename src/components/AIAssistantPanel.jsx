import { useState, useEffect } from "react";
import { Bot, X, Send } from "lucide-react";
import {
  Box,
  Fab,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Typography,
  Button,
  Stack,
  useMediaQuery,
  useTheme
} from "@mui/material";
const AIAssistantPanel = ({
  projects = [],
  currentProjectId,
  onProjectSelect,
  showCompare = false,
  variant = "default"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(currentProjectId || "");
  const [compareProjectId, setCompareProjectId] = useState("");
  const [compareOpen, setCompareOpen] = useState(false);
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hello! I'm your AI assistant. Please select an RFP document to start chatting about it."
  }]);

  // Allow other components to programmatically open the panel and target a project
  useEffect(() => {
    const handleOpen = (e) => {
      const targetProjectId = e?.detail?.projectId;
      if (targetProjectId) {
        setSelectedProjectId(targetProjectId);
        const project = projects.find(p => p.id === targetProjectId);
        if (project) {
          setMessages([{
            role: "assistant",
            content: `Hello! I'm your AI assistant. You're currently viewing "${project.rfpTitle}". How can I help you today?`
          }]);
        }
      }
      setIsOpen(true);
    };
    window.addEventListener('open-ai-assistant', handleOpen);
    return () => window.removeEventListener('open-ai-assistant', handleOpen);
  }, [projects]);

  // Small onboarding nudge near the floating button
  const [showNudge, setShowNudge] = useState(false);
  useEffect(() => {
    setShowNudge(true);
    const t = setTimeout(() => setShowNudge(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // Initialize messages based on props
  useEffect(() => {
    if (currentProjectId && projects.length > 0) {
      const project = projects.find(p => p.id === currentProjectId);
      if (project) {
        setSelectedProjectId(currentProjectId);
        setMessages([{
          role: "assistant",
          content: `Hello! I'm your AI assistant. You're currently viewing "${project.rfpTitle}". How can I help you today?`
        }]);
      }
    } else if (!selectedProjectId && projects.length > 0) {
      setMessages([{
        role: "assistant",
        content: "Hello! I'm your AI assistant. Please select an RFP document to start chatting about it."
      }]);
    }
  }, [currentProjectId, projects.length]);
  const handleProjectChange = value => {
    setSelectedProjectId(value);
    if (onProjectSelect) {
      onProjectSelect(value);
    }
    const selectedProject = projects.find(p => p.id === value);
    setMessages([{
      role: "assistant",
      content: selectedProject ? `I've switched to "${selectedProject.rfpTitle}". What would you like to know about this RFP?` : "Please select an RFP document to continue."
    }]);
  };
  const handleSend = () => {
    if (!message.trim()) return;
    if (!selectedProjectId) {
      setMessages([...messages, {
        role: "assistant",
        content: "Please select an RFP document first to start chatting."
      }]);
      return;
    }
    const userMessage = {
      role: "user",
      content: message
    };
    setMessages([...messages, userMessage]);
    setMessage("");

    // Simulate AI response
    setTimeout(() => {
      const selectedProject = projects.find(p => p.id === selectedProjectId);
      const compareProject = compareProjectId ? projects.find(p => p.id === compareProjectId) : null;
      let responseContent = "";
      if (showCompare && compareProject && selectedProject) {
        responseContent = `I can help you compare "${selectedProject.rfpTitle}" with "${compareProject.rfpTitle}". Both RFPs have been analyzed and I can provide insights on their differences in scope, timeline, complexity, and budget. What specific aspect would you like to compare?`;
      } else if (selectedProject) {
        responseContent = `Based on the analysis of "${selectedProject.rfpTitle}", I can provide detailed insights. The RFP shows significant complexity across technical, functional, and operational dimensions. What specific aspect would you like to explore?`;
      } else {
        responseContent = "Based on the RFP analysis, I can provide detailed insights. What specific aspect would you like to explore?";
      }
      setMessages(prev => [...prev, {
        role: "assistant",
        content: responseContent
      }]);
    }, 1000);
  };
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <>
      {/* Floating FAB */}
      <Fab
        color="success"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 950,
          boxShadow:
            variant === "detail"
              ? "0 0 20px rgba(34, 197, 94, 0.5), 0 4px 12px rgba(0,0,0,0.15)"
              : "0 4px 12px rgba(34, 197, 94, 0.4)",
        }}
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
      >
        {isOpen ? <X size={20} /> : <Bot size={20} />}
      </Fab>

      {/* Slide-in panel */}
      {isOpen && (
        <>
          {/* Mobile overlay */}
          {isMobile && (
            <Box
              sx={{
                position: "fixed",
                inset: 0,
                bgcolor: "rgba(0,0,0,0.5)",
                zIndex: 900,
              }}
              onClick={() => setIsOpen(false)}
            />
          )}

          <Paper
            elevation={6}
            sx={{
              position: "fixed",
              right: isMobile ? 16 : 88,
              top: isMobile ? 16 : 96,
              bottom: isMobile ? 16 : 32,
              width: isMobile ? "calc(100% - 32px)" : 380,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              zIndex: 999,
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: `1px solid ${
                  variant === "detail"
                    ? theme.palette.success.light
                    : theme.palette.divider
                }`,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: theme.palette.success.light + "33",
                  }}
                >
                  <Bot
                    size={18}
                    color={theme.palette.success.main}
                  />
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    AI Assistant
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Always here to help
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close"
                >
                  <X size={16} />
                </IconButton>
              </Stack>

              {/* Document selection */}
              <Box mt={2}>
                <Typography variant="caption" display="block" gutterBottom>
                  Choose RFP Document
                </Typography>
                <FormControl fullWidth size="small">
                  <InputLabel id="ai-rfp-select-label">
                    Select an RFP to chat about
                  </InputLabel>
                  <Select
                    labelId="ai-rfp-select-label"
                    label="Select an RFP to chat about"
                    value={selectedProjectId}
                    onChange={e => handleProjectChange(e.target.value)}
                  >
                    {projects.map(project => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.rfpTitle}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Compare option */}
              {showCompare && projects.length > 1 && (
                <Box mt={2}>
                  {!compareOpen ? (
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      color="success"
                      onClick={() => setCompareOpen(true)}
                    >
                      Enable comparison
                    </Button>
                  ) : (
                    <>
                      <Typography
                        variant="caption"
                        display="block"
                        gutterBottom
                      >
                        Compare with another RFP (Optional)
                      </Typography>
                      <FormControl fullWidth size="small">
                        <InputLabel id="ai-compare-select-label">
                          Select RFP to compare
                        </InputLabel>
                        <Select
                          labelId="ai-compare-select-label"
                          label="Select RFP to compare"
                          value={compareProjectId || "none"}
                          onChange={e =>
                            setCompareProjectId(
                              e.target.value === "none" ? "" : e.target.value
                            )
                          }
                        >
                          <MenuItem value="none">None</MenuItem>
                          {projects
                            .filter(p => p.id !== selectedProjectId)
                            .map(project => (
                              <MenuItem key={project.id} value={project.id}>
                                {project.rfpTitle}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </>
                  )}
                </Box>
              )}
            </Box>

            {/* Messages */}
            <Box
              sx={{
                flex: 1,
                p: 2,
                overflowY: "auto",
                bgcolor: "background.default",
              }}
            >
              <Stack spacing={1.5}>
                {messages.map((msg, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    justifyContent={
                      msg.role === "user" ? "flex-end" : "flex-start"
                    }
                  >
                    <Box
                      sx={{
                        maxWidth: "85%",
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        bgcolor:
                          msg.role === "user"
                            ? theme.palette.success.main
                            : theme.palette.grey[100],
                        color:
                          msg.role === "user"
                            ? "#fff"
                            : theme.palette.text.primary,
                      }}
                    >
                      <Typography variant="body2">{msg.content}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Box>

            {/* Input */}
            <Box
              sx={{
                p: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
                bgcolor: "background.paper",
              }}
            >
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ask me anything..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <IconButton
                  color="success"
                  onClick={handleSend}
                  sx={{
                    bgcolor: theme.palette.success.main,
                    color: "#fff",
                    "&:hover": { bgcolor: theme.palette.success.dark },
                  }}
                >
                  <Send size={18} />
                </IconButton>
              </Stack>
            </Box>
          </Paper>
        </>
      )}

      {/* Nudge tooltip when closed */}
      {!isOpen && showNudge && (
        <Box
          sx={{
            position: "fixed",
            bottom: 32,
            right: 120,
            zIndex: 945,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              px: 1.5,
              py: 1,
              borderRadius: 2,
            }}
          >
            <Typography variant="caption">Hi! Ask about this RFP</Typography>
          </Paper>
        </Box>
      )}
    </>
  );
};
export default AIAssistantPanel;