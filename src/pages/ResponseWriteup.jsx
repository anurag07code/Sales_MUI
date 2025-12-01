import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useMemo, createRef } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Stack,
  Grid,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import PeopleIcon from "@mui/icons-material/People";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ArticleIcon from "@mui/icons-material/Article";
import RFPFlowTimeline from "@/components/RFPFlowTimeline";
import { MOCK_RFP_PROJECTS } from "@/lib/mockData";
import { toast } from "sonner";
import { getJourneyBlocks, updateJourneyBlocks } from "@/lib/journeyBlocks";

const ResponseWriteup = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = MOCK_RFP_PROJECTS.find(p => p.id === id);
  
  // Get journey blocks from localStorage with fallback to project default
  const [journeyBlocks, setJourneyBlocks] = useState(() => {
    if (!project) return [];
    return getJourneyBlocks(id, project.journeyBlocks || []);
  });

  // Update journey blocks when component mounts or project changes
  useEffect(() => {
    if (!project) return;
    let blocks = getJourneyBlocks(id, project.journeyBlocks || []);
    let needsUpdate = false;
    
    // Ensure Response Writeup is marked as in-progress when on this page
    blocks = blocks.map(block => {
      if (block.name === "Response Writeup" && block.status !== "in-progress") {
        needsUpdate = true;
        return { ...block, status: "in-progress" };
      }
      // Mark Summary Estimation as completed if it was in-progress
      if (block.name === "Summary Estimation" && block.status === "in-progress") {
        needsUpdate = true;
        return { ...block, status: "completed" };
      }
      return block;
    });
    
    if (needsUpdate) {
      // Update in localStorage
      updateJourneyBlocks(id, blocks);
      setJourneyBlocks(blocks);
    }
  }, [id, project]);

  if (!project) {
    return (
      <Box sx={{ minHeight: "100vh", py: 4 }}>
        <Container maxWidth="lg">
          <Card sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Project not found
            </Typography>
            <Button variant="contained" onClick={() => navigate("/rfp-lifecycle")}>
              Back to RFP Lifecycle
            </Button>
          </Card>
        </Container>
      </Box>
    );
  }

  // Response Write-up local state
  const [activeTopic, setActiveTopic] = useState("transition");
  const [topicContents, setTopicContents] = useState({
    transition: "Collaborative Model, Business Outcomes, Cost Efficiency, Future-Ready Operations. This approach ensures the provider assumes responsibility across build, operate, and transform phases while aligning with client KPIs.",
    governance: "Governance cadence, Steering Committee structure, KPIs and SLAs, risk and issue management, change control, and compliance oversight.",
    continuity: "Business Continuity and DR, RTO/RPO objectives, resourcing model, failover testing cadence, and incident playbooks."
  });
  const [kbTopics, setKbTopics] = useState([
    { key: "transition", name: "Transition", files: [], source: "personal" },
    { key: "governance", name: "Governance", files: [], source: "personal" },
    { key: "continuity", name: "Business Continuity", files: [], source: "personal" }
  ]);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicFiles, setNewTopicFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [showGroupKB, setShowGroupKB] = useState(false);
  const uploadQueryRefs = useRef({});

  // Load groups and group knowledge bases
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

  // Load group knowledge base when group is selected
  useEffect(() => {
    if (!selectedGroup || !showGroupKB) {
      // Show only personal topics
      setKbTopics(prev => {
        const personalTopics = prev.filter(t => t.source === "personal");
        // If no personal topics exist, keep the default ones
        if (personalTopics.length === 0) {
          return [
            { key: "transition", name: "Transition", files: [], source: "personal" },
            { key: "governance", name: "Governance", files: [], source: "personal" },
            { key: "continuity", name: "Business Continuity", files: [], source: "personal" }
          ];
        }
        return personalTopics;
      });
      return;
    }

    if (groups.length === 0) return;

    const group = groups.find(g => g.id === selectedGroup);
    if (group && group.knowledgeBase) {
      // Merge group topics with personal topics
      const groupTopics = (group.knowledgeBase.topics || []).map(t => ({
        ...t,
        source: "group",
        groupId: group.id,
        groupName: group.name
      }));
      setKbTopics(prev => {
        const personalTopics = prev.filter(t => t.source === "personal");
        return [...personalTopics, ...groupTopics];
      });
    }
  }, [selectedGroup, showGroupKB, groups]);

  const saveToGroupKB = (topicKey, topicData) => {
    if (!selectedGroup) return;
    
    const updatedGroups = groups.map(g => {
      if (g.id === selectedGroup) {
        const existingTopics = g.knowledgeBase?.topics || [];
        const topicIndex = existingTopics.findIndex(t => t.key === topicKey);
        
        const topicInfo = {
          key: topicData.key,
          name: topicData.name,
          files: topicData.files,
          content: topicData.content,
          updatedAt: new Date().toISOString()
        };

        const newTopics = topicIndex >= 0
          ? existingTopics.map((t, idx) => idx === topicIndex ? topicInfo : t)
          : [...existingTopics, topicInfo];

        return {
          ...g,
          knowledgeBase: {
            ...g.knowledgeBase,
            topics: newTopics,
            files: [...(g.knowledgeBase?.files || []), ...topicData.files]
          }
        };
      }
      return g;
    });

    localStorage.setItem('rfp-groups', JSON.stringify(updatedGroups));
    setGroups(updatedGroups);
    toast.success(`Knowledge base updated in group`);
  };

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

  const onAddNewTopic = () => {
    const name = newTopicName.trim();
    if (!name) {
      toast.error("Please enter a topic name");
      return;
    }
    
    if (newTopicFiles.length === 0) {
      setFileError("Please select at least one file for your knowledge base");
      toast.error("File selection is required. Please choose files for your knowledge base.", {
        duration: 4000,
      });
      return;
    }

    const key = name.toLowerCase().replace(/\s+/g, "-");
    const fileNames = newTopicFiles.map(f => f.name);
    const content = `${name} overview content will be generated here.`;
    
    const newTopic = {
      key,
      name,
      files: fileNames,
      source: selectedGroup ? "group" : "personal",
      groupId: selectedGroup || undefined,
      groupName: selectedGroup ? groups.find(g => g.id === selectedGroup)?.name : undefined
    };
    
    setKbTopics(prev => [...prev, newTopic]);
    setTopicContents(prev => ({ ...prev, [key]: content }));
    
    // Save to group if selected
    if (selectedGroup) {
      saveToGroupKB(key, {
        key,
        name,
        files: fileNames,
        content
      });
    }
    
    setNewTopicName("");
    setNewTopicFiles([]);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success(`Topic "${name}" added successfully with ${fileNames.length} file(s)${selectedGroup ? ' and shared with group' : ''}`);
  };

  const ensureUploadRef = (key) => {
    if (!uploadQueryRefs.current[key]) {
      uploadQueryRefs.current[key] = createRef();
    }
    return uploadQueryRefs.current[key];
  };

  const handleUploadQueries = async (key, filesList) => {
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
        [key]: `${prev[key] || ""}\n\n${contents.join("\n\n")}`.trim()
      }));
      toast.success(`Uploaded ${files.length} file(s) to ${kbTopics.find(t => t.key === key)?.name || key}`);
    } catch (error) {
      console.error("Error uploading queries:", error);
      toast.error("Failed to process the uploaded files. Please try again.");
    } finally {
      const ref = uploadQueryRefs.current[key];
      if (ref?.current) {
        ref.current.value = "";
      }
    }
  };

  const onUploadFiles = (key, filesList) => {
    const files = Array.from(filesList || []);
    if (files.length > 0) {
      const fileNames = files.map(f => f.name);
      setKbTopics(prev => prev.map(t => {
        if (t.key === key) {
          const updated = { ...t, files: [...t.files, ...fileNames] };
          
          // Save to group if it's a group topic
          if (t.source === "group" && t.groupId) {
            saveToGroupKB(key, {
              key: t.key,
              name: t.name,
              files: updated.files,
              content: topicContents[key] || ""
            });
          }
          
          return updated;
        }
        return t;
      }));
      toast.success(`${files.length} file(s) uploaded for ${kbTopics.find(t => t.key === key)?.name || 'topic'}`);
    }
  };

  const regenerateTopic = (key) => {
    const updatedContent = (topicContents[key] || "") + "\n\nRegenerated with refined focus based on supporting documents and RFP context.";
    setTopicContents(prev => ({
      ...prev,
      [key]: updatedContent
    }));
    
    // Save to group if it's a group topic
    const topic = kbTopics.find(t => t.key === key);
    if (topic && topic.source === "group" && topic.groupId) {
      saveToGroupKB(key, {
        key: topic.key,
        name: topic.name,
        files: topic.files,
        content: updatedContent
      });
    }
    
    toast.success("Regenerated response");
  };

  const exportTopic = (key) => {
    const blob = new Blob([topicContents[key] || ""], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(project.uploadedFileName || "response").replace(/[^a-z0-9]+/gi, "_").toLowerCase()}_${key}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Exported topic");
  };

  const exportAll = () => {
    const all = Object.entries(topicContents).map(([k, v]) => `# ${k}\n\n${v}`).join("\n\n---\n\n");
    const blob = new Blob([all], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(project.uploadedFileName || "response").replace(/[^a-z0-9]+/gi, "_").toLowerCase()}_all_topics.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Exported all topics");
  };

  const goToChat = () => {
    if (!id) return;
    const params = new URLSearchParams({ topic: activeTopic });
    navigate(`/rfp-chat/${id}?${params.toString()}`);
  };

  return (
    <Box sx={{ minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          {/* Header with Back Button */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton size="small" onClick={() => navigate(`/rfp-lifecycle/${id}`)}>
                <ArrowBackIosNewIcon fontSize="small" />
              </IconButton>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Response Writeup
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {project.rfpTitle}
                </Typography>
              </Box>
            </Stack>
          </Stack>

          {/* Journey Flow */}
          <Card variant="outlined">
            <CardContent sx={{ p: 3 }}>
              <RFPFlowTimeline
                blocks={journeyBlocks}
                projectId={id}
                startFromBlockName="Summary Estimation"
                hideConnectors={true}
                useAvailableLabels={true}
              />
            </CardContent>
          </Card>

          {/* Response Write-up Content */}
          <Card variant="outlined">
            <CardContent sx={{ p: 3 }}>
              {/* Group Knowledge Base Selector */}
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                  border: theme => `1px solid ${theme.palette.primary.main}33`,
                  background:
                    theme => `linear-gradient(90deg, ${theme.palette.primary.main}11, transparent)`,
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  justifyContent="space-between"
                  mb={2}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PeopleIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle1" color="primary">
                      Group Knowledge Base
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FormControl size="small">
                      <InputLabel id="group-select-label">
                        Knowledge Base
                      </InputLabel>
                      <Select
                        labelId="group-select-label"
                        label="Knowledge Base"
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
                        <MenuItem value="personal">
                          Personal Knowledge Base
                        </MenuItem>
                        {groups.map(group => (
                          <MenuItem key={group.id} value={group.id}>
                            {group.name} ({group.members.length} members)
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<GroupWorkIcon fontSize="small" />}
                      onClick={() => navigate("/groups")}
                    >
                      Manage Groups
                    </Button>
                  </Stack>
                </Stack>
                {selectedGroup && (
                  <Alert
                    severity="info"
                    icon={<CloudUploadIcon fontSize="small" />}
                    sx={{ mt: 1 }}
                  >
                    You're viewing the shared knowledge base from{" "}
                    <strong>
                      {groups.find(g => g.id === selectedGroup)?.name}
                    </strong>
                    . Topics and files added here will be shared with all group
                    members. Your chats remain private.
                  </Alert>
                )}
              </Box>

              {/* Knowledge Base Builder */}
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                  border: theme => `1px solid ${theme.palette.primary.main}33`,
                }}
              >
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Build Knowledge Base
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {selectedGroup
                    ? "Enter a new topic and upload supporting documents. These will be shared with all group members."
                    : "Enter a new topic and upload supporting documents to improve AI assistance."}
                </Typography>

                <Grid container spacing={2}>
                  {/* Existing topics */}
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      gutterBottom
                      display="block"
                    >
                      Existing Topics
                    </Typography>
                    <Stack spacing={1.5}>
                      {kbTopics.map(t => (
                        <Card
                          key={t.key}
                          variant="outlined"
                          sx={{
                            borderColor:
                              t.source === "group"
                                ? "primary.light"
                                : "divider",
                            backgroundColor:
                              t.source === "group"
                                ? "primary.lightest"
                                : "background.paper",
                          }}
                        >
                          <CardContent sx={{ p: 1.5 }}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              mb={1}
                            >
                              <Stack direction="row" spacing={1} alignItems="center">
                                <DescriptionIcon
                                  fontSize="small"
                                  color="primary"
                                />
                                <Typography variant="body2" fontWeight={600}>
                                  {t.name}
                                </Typography>
                                {t.source === "group" && (
                                  <Chip
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                    icon={<PeopleIcon fontSize="small" />}
                                    label={t.groupName}
                                  />
                                )}
                              </Stack>
                              <Chip
                                size="small"
                                variant="outlined"
                                label={`${t.files.length} ${
                                  t.files.length === 1 ? "file" : "files"
                                }`}
                              />
                            </Stack>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<UploadFileIcon fontSize="small" />}
                              component="label"
                            >
                              Choose Files
                              <input
                                type="file"
                                multiple
                                hidden
                                onChange={e =>
                                  onUploadFiles(t.key, e.target.files)
                                }
                              />
                            </Button>
                            {t.files.length > 0 && (
                              <Box mt={1}>
                                {t.files.map((fileName, idx) => (
                                  <Stack
                                    key={idx}
                                    direction="row"
                                    spacing={0.5}
                                    alignItems="center"
                                  >
                                    <DescriptionIcon
                                      fontSize="inherit"
                                      color="disabled"
                                    />
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      noWrap
                                    >
                                      {fileName}
                                    </Typography>
                                  </Stack>
                                ))}
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </Grid>

                  {/* New topic */}
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      gutterBottom
                      display="block"
                    >
                      Create New Topic
                    </Typography>
                    <Card
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderColor: "primary.light",
                      }}
                    >
                      <Stack spacing={2}>
                        <TextField
                          label="Topic Name"
                          required
                          size="small"
                          fullWidth
                          value={newTopicName}
                          onChange={e => {
                            setNewTopicName(e.target.value);
                            setFileError("");
                          }}
                          placeholder="Enter your new topic"
                        />

                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            gutterBottom
                            display="block"
                          >
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
                            startIcon={<CloudUploadIcon />}
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
                              sx={{ mt: 1 }}
                              icon={<ErrorOutlineIcon fontSize="small" />}
                            >
                              <Typography variant="caption">
                                {fileError}
                              </Typography>
                            </Alert>
                          )}

                          {newTopicFiles.length > 0 && (
                            <Box mt={1}>
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
                                  }}
                                >
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                  >
                                    <DescriptionIcon
                                      fontSize="small"
                                      color="primary"
                                    />
                                    <Typography
                                      variant="caption"
                                      noWrap
                                    >
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
                                    <CloseIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                              ))}
                            </Box>
                          )}
                        </Box>

                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={onAddNewTopic}
                          disabled={
                            !newTopicName.trim() || newTopicFiles.length === 0
                          }
                        >
                          Add Topic
                        </Button>
                      </Stack>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              {/* Topic Tabs and Generated Content */}
              <Box sx={{ mb: 3 }}>
                <Chip
                  label="Not Reviewed"
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{ mb: 2 }}
                />

                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderColor: "primary.light",
                    background:
                      theme => `linear-gradient(90deg, ${theme.palette.primary.main}0d, transparent)`,
                    mb: 2,
                  }}
                >
                  <Stack
                    direction={{ xs: "column", lg: "row" }}
                    spacing={2}
                    alignItems={{ xs: "flex-start", lg: "center" }}
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: "50%",
                          bgcolor: "primary.light",
                          color: "primary.main",
                        }}
                      >
                        <SmartToyIcon />
                      </Box>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle2">
                            AI Response Co-Pilot
                          </Typography>
                          <AutoAwesomeIcon
                            fontSize="small"
                            color="primary"
                          />
                        </Stack>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5, maxWidth: 520 }}
                        >
                          Launch the contextual AI workspace to fine-tune drafts,
                          clarify requirements, and generate client-ready
                          responses instantly.
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      width={{ xs: "100%", sm: "auto" }}
                    >
                      <Button
                        variant="contained"
                        onClick={goToChat}
                        fullWidth
                      >
                        Launch AI Chat
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ArticleIcon fontSize="small" />}
                        onClick={exportAll}
                        fullWidth
                      >
                        Export All Topics
                      </Button>
                    </Stack>
                  </Stack>
                </Card>

                {/* Tabs for topics */}
                <Tabs
                  value={activeTopic}
                  onChange={(_, value) => setActiveTopic(value)}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {kbTopics.map(topic => (
                    <Tab key={topic.key} label={topic.name} value={topic.key} />
                  ))}
                </Tabs>

                {kbTopics.map(topic => {
                  if (topic.key !== activeTopic) return null;
                  const content = topicContents[topic.key] || "";
                  const uploadRef = ensureUploadRef(topic.key);
                  return (
                    <Box key={topic.key} mt={2}>
                      <Card
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderLeft: theme =>
                            `4px solid ${theme.palette.primary.main}55`,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          color="primary"
                          gutterBottom
                        >
                          {topic.key.replace(/-/g, " ")} Overview:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: "pre-wrap" }}
                        >
                          {content}
                        </Typography>
                      </Card>
                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        mt={2}
                      >
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => regenerateTopic(topic.key)}
                        >
                          Regenerate Response
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => exportTopic(topic.key)}
                        >
                          Export Topic
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<UploadFileIcon fontSize="small" />}
                          onClick={() => uploadRef.current?.click()}
                        >
                          Upload Queries
                        </Button>
                        <input
                          ref={uploadRef}
                          type="file"
                          accept=".txt,.md,.csv"
                          multiple
                          hidden
                          onChange={e =>
                            handleUploadQueries(topic.key, e.target.files)
                          }
                        />
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
};

export default ResponseWriteup;

