import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as icons from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
const RFPFlowTimeline = ({
  blocks,
  projectId,
  startFromBlockName,
  hideConnectors = false,
  useAvailableLabels = false
}) => {
  const navigate = useNavigate();
  const params = useParams();
  const actualProjectId = projectId || params?.id;
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const getStatusBg = status => {
    switch (status) {
      case "completed":
        return "bg-primary/20";
      // pale blue for completed
      case "in-progress":
        return "bg-primary glow-primary";
      // solid blue for processing
      case "pending":
        return "bg-muted";
      default:
        return "bg-muted";
    }
  };
  const getIconColor = status => {
    switch (status) {
      case "completed":
        return "text-primary";
      // blue icon on pale blue
      case "in-progress":
        return "text-white";
      // white on solid blue
      default:
        return "text-foreground";
      // solid contrast in both themes
    }
  };
  const getRingClass = status => {
    if (status === "pending") {
      return "ring-2 ring-border"; // subtle outline for visibility
    }
    if (status === "completed") {
      return "ring-2 ring-primary/40"; // soft blue outline on pale blue
    }
    if (status === "in-progress") {
      return "ring-2 ring-primary/40"; // soft blue outline
    }
    return "";
  };
  const getConnectorColor = status => {
    switch (status) {
      case "completed":
        return "bg-primary/40";
      // pale blue connector
      case "in-progress":
        return "bg-primary";
      // solid blue
      default:
        return "bg-border";
    }
  };
  const handleBlockClick = block => {
    // Navigate based on the block name
    if (!actualProjectId) {
      setSelectedBlock(block);
      setIsDialogOpen(true);
      return;
    }

    // Map block names to routes
    const routeMap = {
      "Summary Estimation": `/rfp-lifecycle/${actualProjectId}`,
      "Response Writeup": `/rfp-lifecycle/${actualProjectId}/response-writeup`,
      // Add more routes as needed
    };

    const route = routeMap[block.name];
    if (route) {
      navigate(route);
    } else {
      // For other blocks, show dialog
      setSelectedBlock(block);
      setIsDialogOpen(true);
    }
  };
  const getBlockDetails = block => {
    if (block.status === "completed") {
      return {
        title: `${block.name} - Completed`,
        description: "This stage has been successfully completed.",
        content: "Status: Approved. Score: 92/100. All requirements met and validated."
      };
    } else if (block.status === "pending") {
      return {
        title: `${block.name} - Next Steps`,
        description: "This stage is blocked. Here's what needs to be done:",
        content: "This step requires the previous stages to be completed first. Please ensure all dependencies are met before proceeding."
      };
    } else {
      return {
        title: `${block.name} - In Progress`,
        description: "This stage is currently being processed.",
        content: "AI is actively analyzing this component. Estimated completion: 5 minutes."
      };
    }
  };

  const getIconName = block => {
    switch (block.name) {
      case "RFP Identification":
        return "Search";
      case "RFP Qualification":
        return "CheckSquare";
      case "Understanding RFP Document":
      case "Summary Estimation":
        return "ListChecks";
      case "Legal Review & Contractual Review":
        return "FileText";
      case "Solution Story Boarding":
        return "Layers";
      case "Response Writeup":
        return "Pencil";
      case "Estimation & Team Loading":
        return "Users";
      case "Identification of References and Case Studies":
        return "Sparkles";
      case "Rating and Benchmarking Response and Improving":
        return "BarChart3";
      case "Customer Response Analysis":
        return "Network";
      case "RFP Received":
        return "FileText";
      case "Initial Analysis":
        return "Search";
      case "Scope Definition":
        return "Target";
      case "Cost Estimation":
        return "DollarSign";
      case "Resource Planning":
        return "Users";
      case "Risk Assessment":
        return "Shield";
      case "Proposal Draft":
        return "FileText";
      case "Final Approval":
        return "CheckCircle2";
      case "Submission":
        return "Send";
      default:
        return block.icon || "FileText";
    }
  };

  // Optionally trim the journey so that it starts from a specific block
  // and inject additional journey steps for UI-only purposes
  const displayBlocks = (() => {
    let result = blocks;

    if (startFromBlockName) {
      const startIndex = blocks.findIndex(block => block.name === startFromBlockName);
      if (startIndex !== -1) {
        result = blocks.slice(startIndex);
      }
    }

    // When using "Available / Coming soon" labels, prepend two conceptual steps
    // before "Understanding RFP Document", add two more after it,
    // and extend the flow with additional post–Response Writeup steps
    if (useAvailableLabels) {
      const preBlocks = [{
        name: "RFP Identification",
        status: "pending",
        icon: "FileText"
      }, {
        name: "RFP Qualification",
        status: "pending",
        icon: "Search"
      }];
      result = [...preBlocks, ...result];

      const summaryIndex = result.findIndex(block => block.name === "Summary Estimation");
      if (summaryIndex !== -1) {
        const postBlocks = [{
          name: "Legal Review & Contractual Review",
          status: "pending",
          icon: "FileText"
        }, {
          name: "Solution Story Boarding",
          status: "pending",
          icon: "Layers"
        }];
        result = [
          ...result.slice(0, summaryIndex + 1),
          ...postBlocks,
          ...result.slice(summaryIndex + 1)
        ];
      }

      // Keep everything only up to and including "Response Writeup"
      const responseIndex = result.findIndex(block => block.name === "Response Writeup");
      if (responseIndex !== -1) {
        result = result.slice(0, responseIndex + 1);

        const afterResponseBlocks = [{
          name: "Estimation & Team Loading",
          status: "pending",
          icon: "Users"
        }, {
          name: "Identification of References and Case Studies",
          status: "pending",
          icon: "Search"
        }, {
          name: "Rating and Benchmarking Response and Improving",
          status: "pending",
          icon: "BarChart3"
        }, {
          name: "Customer Response Analysis",
          status: "pending",
          icon: "FileText"
        }];

        result = [...result, ...afterResponseBlocks];
      }
    }

    return result;
  })();
  return <>
      <div className="w-full">
        <h2 className="text-xl font-bold mb-6">RFP Journey Flow</h2>
        
        {/* Horizontal Container - No Scroll, All Steps Visible */}
        <div className="w-full relative">
          {/* Responsive grid: compact on mobile, expanded on md+ */}
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2 relative">
            {displayBlocks.map((block, index) => {
            const IconComponent = icons[getIconName(block)];
            const isLast = index === displayBlocks.length - 1;
            const displayName = block.name === "Summary Estimation" ? "Understanding RFP Document" : block.name;
            const statusLabel = useAvailableLabels ? block.name === "Summary Estimation" || block.name === "Response Writeup" ? "Available" : "Coming soon" : block.status.replace("-", " ");
            const isAvailable = statusLabel === "Available";
            const isComingSoon = statusLabel === "Coming soon";
            return <div key={index} className="relative">
                  {/* Main Block */}
                  <div className="flex flex-col items-center cursor-pointer group w-full" onClick={() => handleBlockClick(block)}>
                    {/* Icon Circle */}
                    <div className={`relative z-10 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full ${getStatusBg(block.status)} ${getRingClass(block.status)} transition-all duration-300 group-hover:scale-110 shadow-lg mx-auto`}>
                      {IconComponent && <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 ${getIconColor(block.status)}`} />}
                    </div>
                    
                    {/* Optional horizontal connector line to next block */}
                    {!hideConnectors && !isLast && <div className="absolute top-5 sm:top-6 z-0" style={{
                  left: 'calc(50% + 1.25rem)',
                  // start after current circle radius (w-10 => 2.5rem => 1.25rem radius)
                  width: 'calc(100% - 2.5rem)'
                  // stop before the next circle radius to leave a gap
                }}>
                        <div className={`h-0.5 w-full ${getConnectorColor(block.status)} transition-all duration-300`} />
                      </div>}
                    
                    {/* Card with Name and Status */}
                    <Card className={`mt-3 sm:mt-4 p-2 sm:p-3 w-full text-center gradient-card border-t-2 transition-all group-hover:shadow-elegant ${block.status === "completed" ? "border-t-primary/60" : block.status === "in-progress" ? "border-t-primary" : "border-t-border"}`}>
                      <p className="font-medium text-[10px] sm:text-xs mb-1 line-clamp-2 leading-tight">
                        {displayName}
                      </p>
                      <p className="text-[9px] sm:text-[10px]">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full capitalize ${
                          isAvailable
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100"
                            : isComingSoon
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100"
                            : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </p>
                    </Card>
                  </div>
                </div>;
          })}
          </div>
        </div>
      </div>

      {/* Block Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          {selectedBlock && <>
              <DialogHeader>
                <DialogTitle>{getBlockDetails(selectedBlock).title}</DialogTitle>
                <DialogDescription>{getBlockDetails(selectedBlock).description}</DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <p className="text-sm leading-relaxed">{getBlockDetails(selectedBlock).content}</p>
              </div>
            </>}
        </DialogContent>
      </Dialog>
    </>;
};
export default RFPFlowTimeline;