import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Trash2, FileText, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import RFPFlowTimeline from "@/components/RFPFlowTimeline";
import RFPAnalysisDisplay from "@/components/RFPAnalysisDisplay";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import { MOCK_RFP_PROJECTS } from "@/lib/mockData";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
const RFPDetail = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const project = MOCK_RFP_PROJECTS.find(p => p.id === id);
  if (!project) {
    return <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Project not found</p>
            <Button onClick={() => navigate("/rfp-lifecycle")}>Back to RFP Lifecycle</Button>
          </Card>
        </div>
      </div>;
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
  return <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Back Button and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/rfp-lifecycle")} className="hover:bg-accent/50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">{project.rfpTitle}</h1>
              <p className="text-sm text-muted-foreground mt-1">{project.uploadedFileName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Journey Flow - Top Section */}
        <Card className="p-6 border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
          <RFPFlowTimeline blocks={project.journeyBlocks} />
        </Card>

        {/* RFP Analysis Details - Below Journey Flow */}
        <div className="mt-6">
          {project.rfpEstimation ? <RFPAnalysisDisplay data={project.rfpEstimation} fileName={project.uploadedFileName} projectId={project.id} /> : <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">RFP analysis not available yet</p>
              <p className="text-sm text-muted-foreground">
                The analysis is being processed. Please check back later.
              </p>
            </Card>}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Floating AI Assistant with Comparison - Detail Variant */}
      <AIAssistantPanel projects={MOCK_RFP_PROJECTS.map(p => ({
      id: p.id,
      rfpTitle: p.rfpTitle,
      uploadedFileName: p.uploadedFileName
    }))} currentProjectId={project.id} showCompare={true} variant="detail" />

      {/* Floating Download Icon (top-right) with options */}
      <div className="fixed bottom-24 right-6 z-[940]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button aria-label="Download summary" title="Download Summary" className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:brightness-110 transition-all border border-primary/30 flex items-center justify-center">
              <Download className="h-6 w-6" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="mr-2">
            <DropdownMenuItem onClick={() => downloadSummary("pdf")} className="gap-2 cursor-pointer">
              <File className="h-4 w-4 text-red-500" />
              <span>PDF (.pdf)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => downloadSummary("doc")} className="gap-2 cursor-pointer">
              <FileText className="h-4 w-4 text-blue-600" />
              <span>DOC (.doc)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>;
};
export default RFPDetail;