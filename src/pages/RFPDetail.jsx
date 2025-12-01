import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Fab,
  Stack,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DownloadIcon from "@mui/icons-material/Download";
import DescriptionIcon from "@mui/icons-material/Description";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArticleIcon from "@mui/icons-material/Article";
import RFPFlowTimeline from "@/components/RFPFlowTimeline";
import RFPAnalysisDisplay from "@/components/RFPAnalysisDisplay";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import { MOCK_RFP_PROJECTS } from "@/lib/mockData";
import { toast } from "sonner";
import { getJourneyBlocks, updateJourneyBlocks } from "@/lib/journeyBlocks";
const RFPDetail = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState(null);
  const project = MOCK_RFP_PROJECTS.find(p => p.id === id);
  
  // Get journey blocks from localStorage with fallback to project default
  const [journeyBlocks, setJourneyBlocks] = useState(() => {
    if (!project) return [];
    return getJourneyBlocks(id, project.journeyBlocks || []);
  });

  // Update journey blocks when component mounts or project changes
  // On Summary Estimation page, mark Summary Estimation as in-progress
  useEffect(() => {
    if (!project) return;
    let blocks = getJourneyBlocks(id, project.journeyBlocks || []);
    let needsUpdate = false;
    
    // Ensure Summary Estimation is marked as in-progress when on this page
    blocks = blocks.map(block => {
      if (block.name === "Summary Estimation" && block.status !== "in-progress") {
        needsUpdate = true;
        return { ...block, status: "in-progress" };
      }
      // Ensure Response Writeup is not in-progress when on Summary Estimation page
      if (block.name === "Response Writeup" && block.status === "in-progress") {
        needsUpdate = true;
        return { ...block, status: "pending" };
      }
      return block;
    });
    
    if (needsUpdate) {
      // Update in localStorage
      updateJourneyBlocks(id, blocks);
      setJourneyBlocks(blocks);
    } else {
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
  const handleDelete = () => {
    // In a real app, this would delete from state/API
    toast.success("Project deleted successfully");
    navigate("/rfp-lifecycle");
  };
  const buildSummaryHtml = () => {
    const estimation = project.rfpEstimation;
    const safe = s => s ? s : "";
    const parts = [];
    parts.push(`<h1 style="font-family: Arial;">${project.rfpTitle}</h1>`);
    parts.push(`<p><strong>File:</strong> ${project.uploadedFileName}</p>`);
    if (estimation) {
      parts.push(`<h2>Effort Summary</h2>`);
      parts.push(`<ul>`);
      const roles = estimation.estimation?.rolesAndEfforts || {};
      Object.keys(roles).forEach(r => {
        parts.push(`<li>${r}: ${roles[r]} hrs</li>`);
      });
      parts.push(`</ul>`);
      if (estimation.purpose) {
        parts.push(`<h2>Purpose</h2><p>${safe(estimation.purpose)}</p>`);
      }
      if (estimation.scopeOfWork) {
        parts.push(`<h2>Scope of Work</h2><p>${safe(estimation.scopeOfWork)}</p>`);
      }
      if (estimation.paymentTerms) {
        parts.push(`<h2>Payment Terms</h2><p>${safe(estimation.paymentTerms)}</p>`);
      }
      if (estimation.keyRequirements) {
        parts.push(`<h2>Key Requirements</h2><p>${safe(estimation.keyRequirements)}</p>`);
      }
    } else {
      parts.push(`<p>Analysis not available yet.</p>`);
    }
    return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${parts.join("\n")}</body></html>`;
  };
  const downloadSummary = format => {
    const html = buildSummaryHtml();
    const blob = new Blob([html], {
      type: format === "doc" ? "application/msword" : "text/html"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const base = project.rfpTitle.replace(/[^a-z0-9]+/gi, "_");
    a.href = url;
    a.download = `${base}.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Downloading ${format.toUpperCase()} summary...`);
  };
  return (
    <Box sx={{ minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          {/* Header with Back Button and Actions */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton
                size="small"
                onClick={() => navigate("/rfp-lifecycle")}
              >
                <ArrowBackIosNewIcon fontSize="small" />
              </IconButton>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {project.rfpTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {project.uploadedFileName}
                </Typography>
              </Box>
            </Stack>
            <IconButton
              color="error"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Stack>

          {/* Journey Flow - Top Section */}
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

          {/* RFP Analysis Details - Below Journey Flow */}
          {project.rfpEstimation ? (
            <RFPAnalysisDisplay
              data={project.rfpEstimation}
              fileName={project.uploadedFileName}
              projectId={project.id}
            />
          ) : (
            <Card sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                RFP analysis not available yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The analysis is being processed. Please check back later.
              </Typography>
            </Card>
          )}
        </Stack>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Project?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete this project? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating AI Assistant with Comparison - Detail Variant */}
      <AIAssistantPanel
        projects={MOCK_RFP_PROJECTS.map(p => ({
          id: p.id,
          rfpTitle: p.rfpTitle,
          uploadedFileName: p.uploadedFileName,
        }))}
        currentProjectId={project.id}
        showCompare={true}
        variant="detail"
      />

      {/* Floating Download FAB with menu */}
      <Box sx={{ position: "fixed", bottom: 96, right: 24, zIndex: 940 }}>
        <Fab
          color="primary"
          onClick={event => setDownloadMenuAnchor(event.currentTarget)}
          aria-label="Download summary"
        >
          <DownloadIcon />
        </Fab>
        <Menu
          anchorEl={downloadMenuAnchor}
          open={Boolean(downloadMenuAnchor)}
          onClose={() => setDownloadMenuAnchor(null)}
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
          transformOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <MenuItem
            onClick={() => {
              downloadSummary("pdf");
              setDownloadMenuAnchor(null);
            }}
          >
            <PictureAsPdfIcon sx={{ mr: 1, color: "error.main" }} fontSize="small" />
            PDF (.pdf)
          </MenuItem>
          <MenuItem
            onClick={() => {
              downloadSummary("doc");
              setDownloadMenuAnchor(null);
            }}
          >
            <ArticleIcon sx={{ mr: 1, color: "primary.main" }} fontSize="small" />
            DOC (.doc)
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};
export default RFPDetail;