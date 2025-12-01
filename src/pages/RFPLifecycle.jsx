import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  CardActions,
  IconButton,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DescriptionIcon from "@mui/icons-material/Description";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FolderIcon from "@mui/icons-material/Folder";
import ComputerIcon from "@mui/icons-material/Computer";
import CircularProgress from "@mui/material/CircularProgress";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import { MOCK_RFP_PROJECTS } from "@/lib/mockData";
import { RFP_RESULT_DATA } from "@/lib/data/rfpResult";
import { updateJourneyBlocks } from "@/lib/journeyBlocks";
import { toast } from "sonner";
const RFPLifecycle = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(MOCK_RFP_PROJECTS);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [processingProjects, setProcessingProjects] = useState(new Set());
  const fileInputRef = useRef(null);

  // Metadata form state
  const [contextDialogOpen, setContextDialogOpen] = useState(false);
  const [contextProjectId, setContextProjectId] = useState(null);
  const [rfpType, setRfpType] = useState("new");
  const [industry, setIndustry] = useState("");
  const [subIndustry, setSubIndustry] = useState("");
  const [orgType, setOrgType] = useState("Gov");
  const [department, setDepartment] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [confidentiality, setConfidentiality] = useState("public");
  const handleProjectClick = projectId => {
    // Navigate to detail page
    navigate(`/rfp-lifecycle/${projectId}`);
  };
  const handleDeleteClick = (e, projectId) => {
    e.stopPropagation();
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      setProjects(projects.filter(p => p.id !== projectToDelete));
      toast.success("Project deleted successfully");
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };
  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };
  const handleLocalDriveUpload = () => {
    fileInputRef.current?.click();
    setUploadDialogOpen(false);
  };
  const handleGoogleDriveUpload = () => {
    // TODO: Implement Google Drive integration
    toast.info("Google Drive integration coming soon!");
    setUploadDialogOpen(false);
  };
  const handleSharePointUpload = () => {
    // TODO: Implement SharePoint integration
    toast.info("Microsoft SharePoint integration coming soon!");
    setUploadDialogOpen(false);
  };
  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate PDF file
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    // Generate a unique ID for the new project
    const newProjectId = `new-${Date.now()}`;

    // Create a title from filename (remove extension and format)
    const fileNameWithoutExt = file.name.replace(/\.pdf$/i, "");
    const formattedTitle = fileNameWithoutExt.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());

    // Create new project entry
    const newProject = {
      id: newProjectId,
      rfpTitle: formattedTitle,
      uploadedFileName: file.name,
      tabs: [],
      journeyBlocks: [{
        name: "RFP Received",
        status: "completed",
        icon: "FileText"
      }, {
        name: "Initial Analysis",
        status: "pending",
        icon: "Search"
      }, {
        name: "Scope Definition",
        status: "pending",
        icon: "Target"
      }, {
        name: "Cost Estimation",
        status: "pending",
        icon: "Calculator"
      }, {
        name: "Resource Planning",
        status: "pending",
        icon: "Users"
      }, {
        name: "Risk Assessment",
        status: "pending",
        icon: "AlertTriangle"
      }, {
        name: "Summary Estimation",
        status: "pending",
        icon: "ListChecks"
      }, {
        name: "Response Writeup",
        status: "pending",
        icon: "FileText"
      }, {
        name: "Proposal Draft",
        status: "pending",
        icon: "FileEdit"
      }, {
        name: "Final Approval",
        status: "pending",
        icon: "CheckCircle"
      }, {
        name: "Submission",
        status: "pending",
        icon: "Send"
      }]
    };

    // Add project to list
    setProjects(prev => [newProject, ...prev]);

    // Open metadata context dialog for the new project
    setContextProjectId(newProjectId);
    setContextDialogOpen(true);

    // Mark as processing
    setProcessingProjects(prev => new Set(prev).add(newProjectId));

    // Reset file input
    e.target.value = "";
    toast.success("RFP uploaded successfully");
  };
  const handleSaveContext = () => {
    if (!contextProjectId) return;
    setProjects(prev => prev.map(p => p.id === contextProjectId ? {
      ...p,
      context: {
        rfpType,
        industry,
        subIndustry,
        buyerContext: {
          organizationType: orgType,
          department
        },
        keyDates: {
          issueDate,
          submissionDeadline: deadline
        },
        confidentiality
      }
    } : p));
    setContextDialogOpen(false);
    toast.success("RFP context saved");
  };

  // Handle processing completion after 10 seconds - simulate analysis and add RFP estimation
  useEffect(() => {
    const timers = [];
    processingProjects.forEach(projectId => {
      const timer = setTimeout(() => {
        setProcessingProjects(prev => {
          const newSet = new Set(prev);
          newSet.delete(projectId);
          return newSet;
        });

        // Update project journey blocks and add RFP estimation data
        const updatedJourneyBlocks = [{
          name: "RFP Received",
          status: "completed",
          icon: "FileText"
        }, {
          name: "Initial Analysis",
          status: "completed",
          icon: "Search"
        }, {
          name: "Scope Definition",
          status: "completed",
          icon: "Target"
        }, {
          name: "Cost Estimation",
          status: "completed",
          icon: "Calculator"
        }, {
          name: "Resource Planning",
          status: "completed",
          icon: "Users"
        }, {
          name: "Risk Assessment",
          status: "completed",
          icon: "AlertTriangle"
        }, {
          name: "Summary Estimation",
          status: "in-progress",
          icon: "ListChecks"
        }, {
          name: "Response Writeup",
          status: "pending",
          icon: "FileText"
        }, {
          name: "Proposal Draft",
          status: "pending",
          icon: "FileEdit"
        }, {
          name: "Final Approval",
          status: "pending",
          icon: "CheckCircle"
        }, {
          name: "Submission",
          status: "pending",
          icon: "Send"
        }];
        
        // Save to localStorage
        updateJourneyBlocks(projectId, updatedJourneyBlocks);
        
        setProjects(prev => prev.map(project => {
          if (project.id === projectId) {
            return {
              ...project,
              journeyBlocks: updatedJourneyBlocks,
              // Add RFP estimation data from analysis
              rfpEstimation: RFP_RESULT_DATA.rfp_estimation
            };
          }
          return project;
        }));
        toast.success("RFP analysis completed successfully! Click the project to view details.");
      }, 10000); // 10 seconds

      timers.push(timer);
    });
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [processingProjects]);
  return <Box sx={{ minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              RFP Lifecycle
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI-powered analysis and estimation for your proposals
            </Typography>
          </Box>

          <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" style={{ display: "none" }} onChange={handleFileChange} />

          {/* Upload New RFP Card */}
          <Card variant="outlined" sx={{ borderStyle: "dashed" }}>
            <CardActionArea onClick={handleUploadClick} sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "primary.main", color: "primary.contrastText", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <UploadFileIcon />
                </Box>
                <Box flex={1}>
                  <Typography variant="h6">Upload New RFP</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click to upload from Google Drive, SharePoint, or Local Drive
                  </Typography>
                </Box>
              </Stack>
            </CardActionArea>
          </Card>

          {/* Existing Projects */}
          <Stack spacing={2}>
            {projects.map(project => <Card key={project.id} variant="outlined">
                <CardActionArea onClick={() => handleProjectClick(project.id)} sx={{ p: 2.5 }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "primary.main", color: "primary.contrastText", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <DescriptionIcon />
                    </Box>
                    <Box flex={1} minWidth={0}>
                      <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                        <Typography variant="subtitle1" noWrap>
                          {project.rfpTitle}
                        </Typography>
                        {project.rfpEstimation && <Chip label="Analysis Ready" color="success" size="small" variant="outlined" />}
                      </Stack>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        Uploaded: {project.uploadedFileName}
                      </Typography>
                      <Box mt={1}>
                        {processingProjects.has(project.id) ? <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                            <CircularProgress size={16} />
                            <Typography variant="body2">Processing analysis...</Typography>
                          </Stack> : <Stack direction="row" spacing={1} alignItems="center" color="primary.main">
                            <Typography variant="body2" fontWeight={600}>
                              View Details
                            </Typography>
                            <ArrowForwardIosIcon fontSize="small" />
                          </Stack>}
                      </Box>
                    </Box>
                    <CardActions sx={{ alignSelf: "center", p: 0 }}>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteClick(e, project.id);
                        }}
                      >
                        <DeleteOutlineIcon color="error" />
                      </IconButton>
                    </CardActions>
                  </Stack>
                </CardActionArea>
              </Card>)}

            {/* Empty State - When no projects exist */}
            {projects.length === 0 && <Card sx={{ p: 4, textAlign: "center" }}>
                <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
                  <DescriptionIcon fontSize="large" color="disabled" />
                </Box>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No projects uploaded yet
                </Typography>
                <Button variant="contained" startIcon={<UploadFileIcon />} onClick={handleUploadClick}>
                  Upload New RFP
                </Button>
              </Card>}
          </Stack>
        </Stack>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Project?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete this project? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Source Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload RFP Document</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Choose your file upload source to upload an RFP document for analysis.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardActionArea onClick={handleLocalDriveUpload} sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "primary.main", color: "primary.contrastText", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ComputerIcon />
                    </Box>
                    <Box flex={1}>
                      <Typography variant="subtitle1">Local Drive</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Upload from your computer
                      </Typography>
                    </Box>
                    <ArrowForwardIosIcon fontSize="small" color="action" />
                  </Stack>
                </CardActionArea>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardActionArea onClick={handleGoogleDriveUpload} sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "primary.main", color: "primary.contrastText", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CloudUploadIcon />
                    </Box>
                    <Box flex={1}>
                      <Typography variant="subtitle1">Google Drive</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Import from your Google Drive
                      </Typography>
                    </Box>
                    <ArrowForwardIosIcon fontSize="small" color="action" />
                  </Stack>
                </CardActionArea>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardActionArea onClick={handleSharePointUpload} sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "primary.main", color: "primary.contrastText", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FolderIcon />
                    </Box>
                    <Box flex={1}>
                      <Typography variant="subtitle1">Microsoft SharePoint</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Import from SharePoint
                      </Typography>
                    </Box>
                    <ArrowForwardIosIcon fontSize="small" color="action" />
                  </Stack>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* RFP Context Dialog */}
      <Dialog open={contextDialogOpen} onClose={() => setContextDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>RFP Context</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Provide contextual details so the LLM can better understand your RFP.
          </Typography>
          <Grid container spacing={2}>
            {/* RFP Type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="rfp-type-label">RFP Type</InputLabel>
                <Select
                  labelId="rfp-type-label"
                  label="RFP Type"
                  value={rfpType}
                  onChange={e => setRfpType(e.target.value)}
                >
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="renewal">Existing - Renewal</MenuItem>
                  <MenuItem value="extension">Existing - Extension</MenuItem>
                  <MenuItem value="change">Existing - Change Request</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Confidentiality */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="confidentiality-label">Confidentiality</InputLabel>
                <Select
                  labelId="confidentiality-label"
                  label="Confidentiality"
                  value={confidentiality}
                  onChange={e => setConfidentiality(e.target.value)}
                >
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="internal">Internal</MenuItem>
                  <MenuItem value="confidential">Confidential</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Industry */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Industry (Top-level)"
                fullWidth
                size="small"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                placeholder="e.g., Banking"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Sub‑industry"
                fullWidth
                size="small"
                value={subIndustry}
                onChange={e => setSubIndustry(e.target.value)}
                placeholder="e.g., Retail Banking"
              />
            </Grid>

            {/* Buyer Context */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="org-type-label">Organization Type</InputLabel>
                <Select
                  labelId="org-type-label"
                  label="Organization Type"
                  value={orgType}
                  onChange={e => setOrgType(e.target.value)}
                >
                  <MenuItem value="Gov">Gov</MenuItem>
                  <MenuItem value="PSU">PSU</MenuItem>
                  <MenuItem value="Private">Private</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Department"
                fullWidth
                size="small"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                placeholder="e.g., IT, Procurement"
              />
            </Grid>

            {/* Dates */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Issue Date"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Submission Deadline"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContextDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveContext}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating AI Assistant - Default Variant */}
      <AIAssistantPanel projects={projects.map(p => ({
      id: p.id,
      rfpTitle: p.rfpTitle,
      uploadedFileName: p.uploadedFileName
    }))} variant="default" />
    </Box>;
};
export default RFPLifecycle;