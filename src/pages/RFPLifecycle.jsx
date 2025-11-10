import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Upload, Trash2, Loader2, ArrowRight, HardDrive, Cloud, Folder } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import { MOCK_RFP_PROJECTS } from "@/lib/mockData";
import { RFP_RESULT_DATA } from "@/lib/data/rfpResult";
import { updateJourneyBlocks } from "@/lib/journeyBlocks";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
  return <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">RFP Lifecycle</h1>
          <p className="text-muted-foreground">
            AI-powered analysis and estimation for your proposals
          </p>
        </div>

        <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFileChange} />

        {/* Project Cards List */}
        <div className="flex flex-col gap-4">
          {/* Upload New RFP Card - First in List */}
          <Card className="gradient-card p-6 cursor-pointer transition-all hover:border-foreground/20 hover:shadow-elegant border-dashed border-2" onClick={handleUploadClick}>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold mb-1">Upload New RFP</h2>
                <p className="text-sm text-muted-foreground">
                  Click to upload from Google Drive, SharePoint, or Local Drive
                </p>
              </div>
            </div>
          </Card>

          {/* Existing Projects */}
          {projects.map(project => <Card key={project.id} className="gradient-card p-6 cursor-pointer transition-all hover:border-foreground/20 hover:shadow-elegant group" onClick={() => handleProjectClick(project.id)}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-bold truncate">{project.rfpTitle}</h2>
                    {project.rfpEstimation && <Badge className="bg-primary/10 text-primary border-primary/20">
                        Analysis Ready
                      </Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mb-2">
                    Uploaded: {project.uploadedFileName}
                  </p>
                  {processingProjects.has(project.id) ? <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing analysis...</span>
                    </div> : <div className="flex items-center gap-2 text-sm text-primary group-hover:gap-3 transition-all">
                      <span className="font-medium">View Details</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>}
                </div>
                <Button variant="ghost" size="icon" className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => {
              e.stopPropagation();
              handleDeleteClick(e, project.id);
            }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>)}
        </div>

        {/* Empty State - When no projects exist */}
        {projects.length === 0 && <Card className="gradient-card p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No projects uploaded yet</p>
            <Button className="gap-2" onClick={handleUploadClick}>
              <Upload className="h-4 w-4" />
              Upload New RFP
            </Button>
          </Card>}
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
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upload Source Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload RFP Document</DialogTitle>
            <DialogDescription>
              Choose your file upload source to upload an RFP document for analysis
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 mt-4">
            {/* Local Drive */}
            <Card className="p-4 cursor-pointer transition-all hover:border-primary/50 hover:shadow-md border-2" onClick={handleLocalDriveUpload}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <HardDrive className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Local Drive</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload from your computer
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>

            {/* Google Drive */}
            <Card className="p-4 cursor-pointer transition-all hover:border-primary/50 hover:shadow-md border-2" onClick={handleGoogleDriveUpload}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Cloud className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Google Drive</h3>
                  <p className="text-sm text-muted-foreground">
                    Import from your Google Drive
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>

            {/* MS SharePoint */}
            <Card className="p-4 cursor-pointer transition-all hover:border-primary/50 hover:shadow-md border-2" onClick={handleSharePointUpload}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Folder className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Microsoft SharePoint</h3>
                  <p className="text-sm text-muted-foreground">
                    Import from SharePoint
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* RFP Context Dialog */}
      <Dialog open={contextDialogOpen} onOpenChange={setContextDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>RFP Context</DialogTitle>
            <DialogDescription>
              Provide contextual details so the LLM can better understand your RFP.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {/* RFP Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">RFP Type</label>
              <Select value={rfpType} onValueChange={setRfpType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="renewal">Existing - Renewal</SelectItem>
                  <SelectItem value="extension">Existing - Extension</SelectItem>
                  <SelectItem value="change">Existing - Change Request</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Confidentiality */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Confidentiality</label>
              <Select value={confidentiality} onValueChange={setConfidentiality}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select confidentiality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="confidential">Confidential</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Industry (Top-level)</label>
              <Input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g., Banking" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sub‑industry</label>
              <Input value={subIndustry} onChange={e => setSubIndustry(e.target.value)} placeholder="e.g., Retail Banking" />
            </div>

            {/* Buyer Context */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization Type</label>
              <Select value={orgType} onValueChange={setOrgType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select organization type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gov">Gov</SelectItem>
                  <SelectItem value="PSU">PSU</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Input value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g., IT, Procurement" />
            </div>

            {/* Dates */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Issue Date</label>
              <Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Submission Deadline</label>
              <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setContextDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveContext}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating AI Assistant - Default Variant */}
      <AIAssistantPanel projects={projects.map(p => ({
      id: p.id,
      rfpTitle: p.rfpTitle,
      uploadedFileName: p.uploadedFileName
    }))} variant="default" />
    </div>;
};
export default RFPLifecycle;