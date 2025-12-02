import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as icons from "lucide-react";
import {
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Typography,
  Box,
  Chip,
  useTheme,
  alpha
} from "@mui/material";
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
  const theme = useTheme();
  
  const getStatusBg = status => {
    switch (status) {
      case "completed":
        return alpha(theme.palette.primary.main, 0.2);
      case "in-progress":
        return theme.palette.primary.main;
      case "pending":
        return theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200];
      default:
        return theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200];
    }
  };
  const getIconColor = status => {
    switch (status) {
      case "completed":
        return theme.palette.primary.main;
      case "in-progress":
        return theme.palette.primary.contrastText;
      default:
        return theme.palette.text.primary;
    }
  };
  const getRingColor = status => {
    if (status === "pending") {
      return theme.palette.divider;
    }
    if (status === "completed" || status === "in-progress") {
      return alpha(theme.palette.primary.main, 0.4);
    }
    return "transparent";
  };
  const getConnectorColor = status => {
    switch (status) {
      case "completed":
        return alpha(theme.palette.primary.main, 0.4);
      case "in-progress":
        return theme.palette.primary.main;
      default:
        return theme.palette.divider;
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
  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
          RFP Journey Flow
        </Typography>
        
        {/* Horizontal Container - No Scroll, All Steps Visible */}
        <Box sx={{ width: '100%', position: 'relative' }}>
          {/* Responsive grid: compact on mobile, expanded on md+ */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(5, 1fr)', md: 'repeat(10, 1fr)' },
              gap: 1,
              position: 'relative'
            }}
          >
            {displayBlocks.map((block, index) => {
              const IconComponent = icons[getIconName(block)];
              const isLast = index === displayBlocks.length - 1;
              const displayName = block.name === "Summary Estimation" ? "Understanding RFP Document" : block.name;
              const statusLabel = useAvailableLabels 
                ? (block.name === "Summary Estimation" || block.name === "Response Writeup" 
                    ? "Available" 
                    : "Coming soon")
                : block.status.replace("-", " ");
              const isAvailable = statusLabel === "Available";
              const isComingSoon = statusLabel === "Coming soon";
              const borderColor = block.status === "completed" 
                ? alpha(theme.palette.primary.main, 0.6)
                : block.status === "in-progress"
                ? theme.palette.primary.main
                : theme.palette.divider;
              
              return (
                <Box key={index} sx={{ position: 'relative' }}>
                  {/* Main Block */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      width: '100%',
                      '&:hover .icon-circle': {
                        transform: 'scale(1.1)'
                      }
                    }}
                    onClick={() => handleBlockClick(block)}
                  >
                    {/* Icon Circle */}
                    <Box
                      className="icon-circle"
                      sx={{
                        position: 'relative',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: { xs: 40, sm: 48 },
                        height: { xs: 40, sm: 48 },
                        borderRadius: '50%',
                        bgcolor: getStatusBg(block.status),
                        border: `2px solid ${getRingColor(block.status)}`,
                        transition: 'all 0.3s',
                        boxShadow: theme.shadows[4],
                        mx: 'auto'
                      }}
                    >
                      {IconComponent && (
                        <IconComponent
                          size={theme.breakpoints.down('sm') ? 16 : 20}
                          style={{ color: getIconColor(block.status) }}
                        />
                      )}
                    </Box>
                    
                    {/* Optional horizontal connector line to next block */}
                    {!hideConnectors && !isLast && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: { xs: 20, sm: 24 },
                          zIndex: 0,
                          left: 'calc(50% + 1.25rem)',
                          width: 'calc(100% - 2.5rem)',
                          height: 2,
                          bgcolor: getConnectorColor(block.status),
                          transition: 'all 0.3s'
                        }}
                      />
                    )}
                    
                    {/* Card with Name and Status */}
                    <Card
                      sx={{
                        mt: { xs: 1.5, sm: 2 },
                        p: { xs: 1, sm: 1.5 },
                        width: '100%',
                        textAlign: 'center',
                        borderTop: `2px solid ${borderColor}`,
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: theme.shadows[6]
                        }
                      }}
                    >
                      <CardContent sx={{ p: '8px !important' }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 500,
                            fontSize: { xs: '10px', sm: '12px' },
                            mb: 0.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.2
                          }}
                        >
                          {displayName}
                        </Typography>
                        <Box>
                          <Chip
                            label={statusLabel}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: { xs: '9px', sm: '10px' },
                              bgcolor: isAvailable
                                ? alpha(theme.palette.success.main, 0.1)
                                : isComingSoon
                                ? alpha(theme.palette.warning.main, 0.1)
                                : theme.palette.mode === 'dark' 
                                  ? theme.palette.grey[800] 
                                  : theme.palette.grey[200],
                              color: isAvailable
                                ? theme.palette.success.dark
                                : isComingSoon
                                ? theme.palette.warning.dark
                                : theme.palette.text.secondary,
                              '& .MuiChip-label': {
                                px: 1,
                                py: 0.25
                              }
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Block Details Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedBlock && (
          <>
            <DialogTitle>{getBlockDetails(selectedBlock).title}</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 2 }}>
                {getBlockDetails(selectedBlock).description}
              </DialogContentText>
              <Typography variant="body2" sx={{ lineHeight: 1.75 }}>
                {getBlockDetails(selectedBlock).content}
              </Typography>
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
};
export default RFPFlowTimeline;