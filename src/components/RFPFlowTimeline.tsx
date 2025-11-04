import { useState } from "react";
import * as icons from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface JourneyBlock {
  name: string;
  status: "completed" | "in-progress" | "pending";
  icon: string;
}

interface RFPFlowTimelineProps {
  blocks: JourneyBlock[];
}

const RFPFlowTimeline = ({ blocks }: RFPFlowTimelineProps) => {
  const [selectedBlock, setSelectedBlock] = useState<JourneyBlock | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getStatusBg = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-primary/20"; // pale blue for completed
      case "in-progress":
        return "bg-primary glow-primary"; // solid blue for processing
      case "pending":
        return "bg-muted";
      default:
        return "bg-muted";
    }
  };

  const getIconColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-primary"; // blue icon on pale blue
      case "in-progress":
        return "text-white"; // white on solid blue
      default:
        return "text-foreground"; // solid contrast in both themes
    }
  };

  const getRingClass = (status: string) => {
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

  const getConnectorColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-primary/40"; // pale blue connector
      case "in-progress":
        return "bg-primary"; // solid blue
      default:
        return "bg-border";
    }
  };

  const handleBlockClick = (block: JourneyBlock) => {
    setSelectedBlock(block);
    setIsDialogOpen(true);
  };

  const getBlockDetails = (block: JourneyBlock) => {
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

  return (
    <>
      <div className="w-full">
        <h2 className="text-xl font-bold mb-6">RFP Journey Flow</h2>
        
        {/* Horizontal Container - No Scroll, All Steps Visible */}
        <div className="w-full relative">
          {/* Responsive grid: compact on mobile, expanded on md+ */}
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2 relative">
            {blocks.map((block, index) => {
              const IconComponent = icons[block.icon as keyof typeof icons] as React.ComponentType<{ className?: string }>;
              const isLast = index === blocks.length - 1;

              return (
                <div key={index} className="relative">
                  {/* Main Block */}
                  <div 
                    className="flex flex-col items-center cursor-pointer group w-full"
                    onClick={() => handleBlockClick(block)}
                  >
                    {/* Icon Circle */}
                    <div className={`relative z-10 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full ${getStatusBg(block.status)} ${getRingClass(block.status)} transition-all duration-300 group-hover:scale-110 shadow-lg mx-auto`}>
                      {IconComponent && <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 ${getIconColor(block.status)}`} />}
                    </div>
                    
                    {/* Horizontal Connector Line to Next Block */}
                    {!isLast && (
                      <div 
                        className="absolute top-5 sm:top-6 left-1/2 z-0"
                        style={{ width: 'calc(100% + 0.5rem)' }}
                      >
                        <div
                          className={`h-0.5 w-full ${getConnectorColor(block.status)} transition-all duration-300`}
                        />
                      </div>
                    )}
                    
                    {/* Card with Name and Status */}
                    <Card className={`mt-3 sm:mt-4 p-2 sm:p-3 w-full text-center gradient-card border-t-2 transition-all group-hover:shadow-elegant ${
                      block.status === "completed"
                        ? "border-t-primary/60"
                        : block.status === "in-progress"
                        ? "border-t-primary"
                        : "border-t-border"
                    }`}>
                      <p className="font-medium text-[10px] sm:text-xs mb-1 line-clamp-2 leading-tight">{block.name}</p>
                      <p className={`text-[9px] sm:text-[10px] capitalize ${
                        block.status === "completed"
                          ? "text-primary"
                          : block.status === "in-progress"
                          ? "text-primary font-semibold"
                          : "text-muted-foreground"
                      }`}>
                        {block.status.replace("-", " ")}
                      </p>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Block Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          {selectedBlock && (
            <>
              <DialogHeader>
                <DialogTitle>{getBlockDetails(selectedBlock).title}</DialogTitle>
                <DialogDescription>{getBlockDetails(selectedBlock).description}</DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <p className="text-sm leading-relaxed">{getBlockDetails(selectedBlock).content}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RFPFlowTimeline;
