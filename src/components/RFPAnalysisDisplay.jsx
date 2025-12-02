import {
  Card,
  CardContent,
  Badge,
  TextField,
  Button,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Typography,
  Box,
  Grid,
  Chip,
  Stack,
  useTheme,
  alpha
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Building2, DollarSign, Calendar, Users, Code, FileText, Shield, Target, CheckCircle2, Clock, BarChart3, Briefcase, ArrowRight, ListChecks, Sparkles, Zap, Layers, CheckSquare, RefreshCw, Network, Server, Database, Lock, Cpu, Pencil, Check, X, Plus, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { moveToNextStep, getJourneyBlocks } from "@/lib/journeyBlocks";
import { MOCK_RFP_PROJECTS } from "@/lib/mockData";
const RFPAnalysisDisplay = ({
  data,
  fileName,
  projectId
}) => {
  // Local editable copy
  const [localData, setLocalData] = useState(data);
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Section edit state
  const [editingSection, setEditingSection] = useState(null);
  const [sectionDraft, setSectionDraft] = useState("");
  // Software & Tools inline edit state
  const [editingToolKey, setEditingToolKey] = useState(null);
  const [editToolName, setEditToolName] = useState("");
  const [editToolDesc, setEditToolDesc] = useState("");
  // Inline catalog
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogCloud, setCatalogCloud] = useState("all");
  const [catalogCats, setCatalogCats] = useState([]);
  // Suggested panel removed; only Add Tools is used
  const [regeneratedTick, setRegeneratedTick] = useState(0);
  const [chipsVisible, setChipsVisible] = useState(false);
  const panelsOpen = catalogOpen;
  const navigate = useNavigate();
  const openSectionEditor = section => {
    setEditingSection(section);
    setSectionDraft(localData[section] || "");
  };
  const saveSectionEditor = () => {
    if (!editingSection) return;
    setLocalData(prev => ({
      ...prev,
      [editingSection]: sectionDraft
    }));
    setEditingSection(null);
  };
  const formatEffort = hours => {
    if (hours >= 1000) return `${(hours / 1000).toFixed(1)}K`;
    return hours.toString();
  };

  // Helper function to format text content with enhanced structure
  const formatTextContent = text => {
    if (!text) return null;

    // Remove markdown bold
    const cleanText = text.replace(/\*\*/g, "");

    // Split by common patterns
    const sections = [];
    const lines = cleanText.split('\n').filter(line => line.trim());
    let currentSection = null;
    lines.forEach(line => {
      const trimmed = line.trim();

      // Detect headings (lines ending with : or specific patterns)
      if (trimmed.match(/^[A-Z][^:]*:$/)) {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          type: 'heading',
          content: trimmed.replace(':', '')
        };
      }
      // Detect numbered lists
      else if (trimmed.match(/^\d+[\.\)]\s/)) {
        if (currentSection && currentSection.type !== 'list') {
          sections.push(currentSection);
          currentSection = {
            type: 'list',
            content: trimmed
          };
        } else if (currentSection?.type === 'list') {
          currentSection.content += '\n' + trimmed;
        } else {
          currentSection = {
            type: 'list',
            content: trimmed
          };
        }
      }
      // Detect bullet points (allow common bullets and leading dot '. ')
      else if (trimmed.match(/^[•\-\*]\s/) || trimmed.match(/^\.\s/)) {
        if (currentSection && currentSection.type !== 'list') {
          sections.push(currentSection);
          currentSection = {
            type: 'list',
            content: trimmed
          };
        } else if (currentSection?.type === 'list') {
          currentSection.content += '\n' + trimmed;
        } else {
          currentSection = {
            type: 'list',
            content: trimmed
          };
        }
      }
      // Regular paragraph
      else {
        if (currentSection && currentSection.type === 'list') {
          sections.push(currentSection);
          currentSection = {
            type: 'paragraph',
            content: trimmed
          };
        } else if (currentSection?.type === 'paragraph') {
          currentSection.content += ' ' + trimmed;
        } else {
          currentSection = {
            type: 'paragraph',
            content: trimmed
          };
        }
      }
    });
    if (currentSection) sections.push(currentSection);
    return sections.length > 0 ? sections : [{
      type: 'paragraph',
      content: cleanText
    }];
  };
  const renderSelectedToolsBox = () => <Card className="p-4 mb-4 border-2 border-primary/20">
      <h4 className="font-bold mb-3 text-primary">Selected Tools</h4>
      {Object.keys(localData.softwareAndTools || {}).length === 0 ? <p className="text-sm text-muted-foreground">No tools selected yet.</p> : <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(localData.softwareAndTools).map(([tool, description]) => <div key={tool} className="p-3 rounded-lg bg-card border border-primary/20 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-sm text-primary">{tool}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => {
          setLocalData(prev => {
            const current = {
              ...prev.softwareAndTools
            };
            delete current[tool];
            return {
              ...prev,
              softwareAndTools: current
            };
          });
        }}>Remove</Button>
            </div>)}
        </div>}
    </Card>;
  const theme = useTheme();
  
  return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      {fileName && <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <FileText size={20} style={{ color: theme.palette.primary.main }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {fileName}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            RFP Analysis & Estimation Results
          </Typography>
        </Box>}

      {/* Quick Stats Cards */}
      <Grid container spacing={2}>
        {data.estimation && <>
            <Grid item xs={12} sm={6} lg={3}>
              <Card 
                sx={{ 
                  p: 2, 
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.4)
                  },
                  transition: 'border-color 0.3s'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Total Efforts
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {formatEffort(data.estimation.totalEfforts || 0)} hrs
                    </Typography>
                  </Box>
                  <BarChart3 size={32} style={{ color: alpha(theme.palette.primary.main, 0.4) }} />
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Card 
                sx={{ 
                  p: 2, 
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.4)
                  },
                  transition: 'border-color 0.3s'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Build Efforts
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {formatEffort(data.estimation.build || 0)} hrs
                    </Typography>
                  </Box>
                  <Code size={32} style={{ color: alpha(theme.palette.primary.main, 0.4) }} />
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Card 
                sx={{ 
                  p: 2, 
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.4)
                  },
                  transition: 'border-color 0.3s'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Project Management
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {formatEffort(data.estimation.projectManagement || 0)} hrs
                    </Typography>
                  </Box>
                  <Briefcase size={32} style={{ color: alpha(theme.palette.primary.main, 0.4) }} />
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Card 
                sx={{ 
                  p: 2, 
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.4)
                  },
                  transition: 'border-color 0.3s'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Support
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {formatEffort(data.estimation.support || 0)} hrs
                    </Typography>
                  </Box>
                  <Users size={32} style={{ color: alpha(theme.palette.primary.main, 0.4) }} />
                </Box>
              </Card>
            </Grid>
          </>}
      </Grid>

      {/* Complexity Scores section removed per request */}

      {/* Timeline */}
      {data.timeLine && (
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Calendar size={20} style={{ color: theme.palette.primary.main }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Timeline
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {Object.entries(data.timeLine).map(([key, value]) => (
              <Grid item xs={12} md={6} key={key}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.grey[800], 0.3)
                      : alpha(theme.palette.grey[200], 0.3)
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                    {key.replace(/_/g, " ")}
                  </Typography>
                  <Chip label={value} variant="outlined" sx={{ fontWeight: 'bold' }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>
      )}

      {/* Main Accordion Sections */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* Purpose */}
        {localData.purpose && (
          <Accordion
            sx={{
              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              '&:hover': {
                borderColor: alpha(theme.palette.primary.main, 0.4)
              },
              transition: 'border-color 0.3s',
              '&:before': { display: 'none' }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                px: 3,
                py: 2,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                },
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  gap: 1.5
                }
              }}
            >
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  background: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.primary.main, 0.1)})`,
                  boxShadow: 1
                }}
              >
                <Target size={20} style={{ color: theme.palette.primary.main }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
                Purpose
              </Typography>
              <Button
                variant="text"
                size="small"
                onClick={e => {
                  e.stopPropagation();
                  openSectionEditor("purpose");
                }}
                sx={{ gap: 0.5, fontSize: '0.75rem' }}
              >
                <Pencil size={14} /> Edit
              </Button>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pb: 3 }}>
              {editingSection === "purpose" && (
                <Box sx={{ mb: 2, p: 1.5, borderRadius: 1, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                  <TextField
                    multiline
                    rows={6}
                    value={sectionDraft}
                    onChange={e => setSectionDraft(e.target.value)}
                    fullWidth
                    variant="outlined"
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                    <Button variant="text" size="small" onClick={() => setEditingSection(null)}>
                      <X size={16} style={{ marginRight: 4 }} /> Cancel
                    </Button>
                    <Button size="small" onClick={saveSectionEditor}>
                      <Check size={16} style={{ marginRight: 4 }} /> Save
                    </Button>
                  </Box>
                </Box>
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                  {(() => {
                const sections = formatTextContent(localData.purpose) || [];
                // Filter out duplicate headings and track the first visible paragraph
                const filteredSections = sections.filter((section, idx) => {
                  if (section.type === 'heading') {
                    const lowerContent = section.content.toLowerCase();
                    // Skip headings containing "purpose" or short "rfp" headings
                    if (lowerContent.includes('purpose') || lowerContent.includes('rfp') && lowerContent.length < 30) {
                      return false; // Filter out
                    }
                  }
                  return true; // Keep
                });

                // Find index of first paragraph after filtering
                let firstParagraphIdx = -1;
                for (let i = 0; i < filteredSections.length; i++) {
                  if (filteredSections[i].type === 'paragraph' && filteredSections[i].content.length > 100) {
                    firstParagraphIdx = i;
                    break;
                  }
                }
                return filteredSections.map((section, idx) => {
                  if (section.type === 'heading') {
                    return (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: idx === 0 ? 0 : 2 }}>
                        <Sparkles size={16} style={{ color: theme.palette.primary.main, flexShrink: 0 }} />
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 'bold',
                            color: 'primary.main',
                            borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                            pb: 0.5,
                            flex: 1
                          }}
                        >
                          {section.content}
                        </Typography>
                      </Box>
                    );
                  }
                  if (section.type === 'list') {
                    const items = section.content.split('\n').filter(item => item.trim());
                    return (
                      <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, pl: 1 }}>
                        {items.map((item, itemIdx) => {
                          const cleanItem = item.replace(/^(?:\d+[\.)]\s*|[•\-\*]\s*|\.\s*|\)\s*)/, '').trim();
                          return (
                            <Box key={itemIdx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                              <Box
                                sx={{
                                  mt: 0.75,
                                  p: 0.5,
                                  borderRadius: '50%',
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.2)
                                  },
                                  transition: 'background-color 0.3s'
                                }}
                              >
                                <CheckCircle2 size={12} style={{ color: theme.palette.primary.main }} />
                              </Box>
                              <Typography variant="body2" sx={{ flex: 1, pt: 0.25, lineHeight: 1.75 }}>
                                {cleanItem}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    );
                  }
                  // First paragraph gets special treatment with box and shadow - different color (not blue)
                  if (idx === firstParagraphIdx) {
                    return (
                      <Box
                        key={idx}
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          background: theme.palette.mode === 'dark'
                            ? `linear-gradient(to bottom right, ${alpha(theme.palette.grey[800], 0.5)}, ${alpha(theme.palette.grey[800], 0.3)})`
                            : `linear-gradient(to bottom right, ${alpha(theme.palette.grey[200], 0.5)}, ${alpha(theme.palette.grey[200], 0.3)})`,
                          border: `2px solid ${theme.palette.divider}`,
                          boxShadow: 2
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.75 }}>
                          {section.content}
                        </Typography>
                      </Box>
                    );
                  }
                  return (
                    <Box
                      key={idx}
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.03)}, transparent)`,
                        borderLeft: `4px solid ${alpha(theme.palette.primary.main, 0.3)}`
                      }}
                    >
                      <Typography variant="body2" sx={{ lineHeight: 1.75 }}>
                        {section.content.replace(/^\.\s*/, "")}
                      </Typography>
                    </Box>
                  );
                });
              })()}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Scope of Work */}
        {localData.scopeOfWork && (
          <Accordion
            sx={{
              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              '&:hover': {
                borderColor: alpha(theme.palette.primary.main, 0.4)
              },
              transition: 'border-color 0.3s',
              '&:before': { display: 'none' }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                px: 3,
                py: 2,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                },
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  gap: 1.5
                }
              }}
            >
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  background: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.primary.main, 0.1)})`,
                  boxShadow: 1
                }}
              >
                <FileText size={20} style={{ color: theme.palette.primary.main }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
                Scope of Work
              </Typography>
              <Button
                variant="text"
                size="small"
                onClick={e => {
                  e.stopPropagation();
                  openSectionEditor("scopeOfWork");
                }}
                sx={{ gap: 0.5, fontSize: '0.75rem' }}
              >
                <Pencil size={14} /> Edit
              </Button>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pb: 3 }}>
              {editingSection === "scopeOfWork" && (
                <Box sx={{ mb: 2, p: 1.5, borderRadius: 1, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                  <TextField
                    multiline
                    rows={6}
                    value={sectionDraft}
                    onChange={e => setSectionDraft(e.target.value)}
                    fullWidth
                    variant="outlined"
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                    <Button variant="text" size="small" onClick={() => setEditingSection(null)}>
                      <X size={16} style={{ marginRight: 4 }} /> Cancel
                    </Button>
                    <Button size="small" onClick={saveSectionEditor}>
                      <Check size={16} style={{ marginRight: 4 }} /> Save
                    </Button>
                  </Box>
                </Box>
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                {formatTextContent(localData.scopeOfWork)?.map((section, idx) => {
                  if (section.type === 'heading') {
                    return (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: idx === 0 ? 0 : 2 }}>
                        <Zap size={16} style={{ color: theme.palette.primary.main, flexShrink: 0 }} />
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 'bold',
                            color: 'primary.main',
                            borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                            pb: 0.5,
                            flex: 1
                          }}
                        >
                          {section.content}
                        </Typography>
                      </Box>
                    );
                  }
                  if (section.type === 'list') {
                    const items = section.content.split('\n').filter(item => item.trim());
                    return (
                      <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, pl: 1 }}>
                        {items.map((item, itemIdx) => {
                          const cleanItem = item.replace(/^(?:\d+[\.)]\s*|[•\-\*]\s*|\.\s*|\)\s*)/, '').trim();
                          return (
                            <Box key={itemIdx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                              <Box
                                sx={{
                                  mt: 0.75,
                                  p: 0.5,
                                  borderRadius: '50%',
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.2)
                                  },
                                  transition: 'background-color 0.3s'
                                }}
                              >
                                <ListChecks size={12} style={{ color: theme.palette.primary.main }} />
                              </Box>
                              <Typography variant="body2" sx={{ flex: 1, pt: 0.25, lineHeight: 1.75 }}>
                                {cleanItem}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    );
                  }
                  return (
                    <Box
                      key={idx}
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.03)}, transparent)`,
                        borderLeft: `4px solid ${alpha(theme.palette.primary.main, 0.3)}`
                      }}
                    >
                      <Typography variant="body2" sx={{ lineHeight: 1.75 }}>
                        {section.content}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Estimation & Roles */}
        {localData.estimation?.rolesAndEfforts && (
          <Accordion
            sx={{
              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              '&:hover': {
                borderColor: alpha(theme.palette.primary.main, 0.4)
              },
              transition: 'border-color 0.3s',
              '&:before': { display: 'none' }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                px: 3,
                py: 2,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                },
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  gap: 1.5
                }
              }}
            >
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  background: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.primary.main, 0.1)})`,
                  boxShadow: 1
                }}
              >
                <Users size={20} style={{ color: theme.palette.primary.main }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
                Estimation & Roles
              </Typography>
              <Chip
                label={`${Object.keys(data.estimation.rolesAndEfforts).length} roles`}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pb: 3 }}>
              <Grid container spacing={1.5} sx={{ pt: 1 }}>
                {Object.entries(localData.estimation.rolesAndEfforts)
                  .sort(([, a], [, b]) => (b || 0) - (a || 0))
                  .map(([role, hours], idx) => (
                    <Grid item xs={6} sm={4} lg={3} key={role}>
                      <Card
                        sx={{
                          p: 1.5,
                          display: 'flex',
                          flexDirection: 'column',
                          background: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          '&:hover': {
                            borderColor: alpha(theme.palette.primary.main, 0.4),
                            boxShadow: 3
                          },
                          transition: 'all 0.3s',
                          cursor: 'pointer'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              bgcolor: alpha(theme.palette.primary.main, 0.3),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              color: 'primary.main',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.4)
                              },
                              transition: 'background-color 0.3s',
                              flexShrink: 0
                            }}
                          >
                            {idx + 1}
                          </Box>
                          <InlineHoursEditor
                            value={Number(hours) || 0}
                            onChange={newHours => setLocalData(prev => ({
                              ...prev,
                              estimation: {
                                ...prev.estimation,
                                rolesAndEfforts: {
                                  ...prev.estimation.rolesAndEfforts,
                                  [role]: newHours
                                }
                              }
                            }))}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            lineHeight: 1.2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            '&:hover': {
                              color: 'primary.main'
                            },
                            transition: 'color 0.3s'
                          }}
                        >
                          {role}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          hours
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Technical Architecture */}
        {localData.technicalArchitecture && <AccordionItem value="tech-arch" className="border-none">
            <Card className="gradient-card overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-bold text-left text-lg">Technical Architecture</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-5 pt-2">
                  {localData.technicalArchitecture.technicalArchitectureOverview && <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h4 className="font-bold text-base text-primary">Overview</h4>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {localData.technicalArchitecture.technicalArchitectureOverview}
                      </p>
                    </div>}
                  {localData.technicalArchitecture.keyComponentsoftheTechnicalArchitecture && <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <Zap className="h-4 w-4 text-primary" />
                        <h4 className="font-bold text-base text-primary">Key Components</h4>
                      </div>
                      {/* Visual Architecture Diagram */}
                      <div className="mb-4 p-4 rounded-lg bg-card/50 border border-primary/20">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(localData.technicalArchitecture.keyComponentsoftheTechnicalArchitecture).map(([key, value], idx) => {
                      const icons = {
                        'Hardware': Cpu,
                        'Software': Code,
                        'Security': Lock,
                        'Network': Network,
                        'Compliance': Shield,
                        'Support': Server,
                        'Database': Database,
                        'Default': Layers
                      };
                      const iconKey = Object.keys(icons).find(k => key.toLowerCase().includes(k.toLowerCase())) || 'Default';
                      const IconComponent = icons[iconKey] || Layers;
                      return <div key={key} className="relative group">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer">
                                  <div className="flex flex-col items-center text-center gap-2">
                                    <div className="p-3 rounded-full bg-primary/30 group-hover:bg-primary/40 transition-colors">
                                      <IconComponent className="h-6 w-6 text-primary" />
                                    </div>
                                    <p className="font-bold text-xs text-primary">{key}</p>
                                  </div>
                                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
                                </div>
                                {/* Tooltip on hover */}
                                <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 rounded-lg bg-popover border border-border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48">
                                  <p className="text-xs text-foreground leading-relaxed">{value}</p>
                                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover" />
                                </div>
                              </div>;
                    })}
                        </div>
                        {/* Connection lines visualization */}
                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                          <Network className="h-4 w-4" />
                          <span>Integrated Architecture Components</span>
                        </div>
                      </div>
                      {/* Detailed Component Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {Object.entries(localData.technicalArchitecture.keyComponentsoftheTechnicalArchitecture).map(([key, value]) => <div key={key} className="p-3 rounded-lg bg-card border-l-4 border-primary/40 hover:border-primary/60 transition-colors group">
                            <div className="flex items-start gap-2">
                              <div className="mt-1 p-1 rounded bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                <CheckCircle2 className="h-3 w-3 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-sm mb-1 text-primary">{key}</p>
                                <p className="text-xs text-foreground leading-relaxed">{value}</p>
                              </div>
                            </div>
                          </div>)}
                      </div>
                    </div>}
                  {localData.technicalArchitecture.implementationPlan && <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="h-4 w-4 text-primary" />
                        <h4 className="font-bold text-base text-primary">Implementation Plan</h4>
                      </div>
                      {/* Visual Timeline with Progress */}
                      <div className="relative mb-6">
                        {/* Progress Line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-primary/20" />
                        {/* Phase Steps */}
                        <div className="space-y-6 relative">
                          {Object.entries(localData.technicalArchitecture.implementationPlan).map(([phase, description], idx) => {
                      return <div key={phase} className="relative pl-12">
                                  {/* Phase Dot */}
                                  <div className="absolute left-0 top-1.5">
                                    <div className="w-6 h-6 rounded-full bg-primary border-4 border-background shadow-lg flex items-center justify-center">
                                      <div className="w-2 h-2 rounded-full bg-primary" />
                                    </div>
                                  </div>
                                  {/* Phase Card */}
                                  <div className="p-4 rounded-xl bg-card border-2 border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all group">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-bold text-primary group-hover:bg-primary/30 transition-colors">
                                          {idx + 1}
                                        </div>
                                        <p className="font-bold text-sm text-primary">{phase.replace(/^Phase \d+:\s*/, '')}</p>
                                      </div>
                                      <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                                        Phase {idx + 1}
                                      </Badge>
                                    </div>
                                    <InlinePlanEditor text={String(description)} onSave={v => setLocalData(prev => ({
                            ...prev,
                            technicalArchitecture: {
                              ...prev.technicalArchitecture,
                              implementationPlan: {
                                ...prev.technicalArchitecture.implementationPlan,
                                [phase]: v
                              }
                            }
                          }))} />
                                  </div>
                                </div>;
                    })}
                        </div>
                      </div>
                    </div>}
                  {localData.technicalArchitecture.conclusion && <div className="p-5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30 shadow-md">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-primary" />
                        <h4 className="font-bold text-sm text-primary uppercase tracking-wide">Conclusion</h4>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {localData.technicalArchitecture.conclusion}
                      </p>
                    </div>}
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>}

        {/* Business Architecture */}
        {localData.businessArchitecture && <AccordionItem value="business-arch" className="border-none">
            <Card className="gradient-card overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-bold text-left text-lg">Business Architecture</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-5 pt-2">
                  {localData.businessArchitecture.businessArchitectureOverview && <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h4 className="font-bold text-base text-primary">Overview</h4>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {localData.businessArchitecture.businessArchitectureOverview}
                      </p>
                    </div>}
                  {localData.businessArchitecture.implementationPlan && <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="h-4 w-4 text-primary" />
                        <h4 className="font-bold text-base text-primary">Implementation Plan</h4>
                      </div>
                      {/* Visual Roadmap */}
                      <div className="relative">
                        {/* Horizontal Progress Line */}
                        <div className="absolute top-6 left-0 right-0 h-0.5 bg-primary/20 hidden md:block" />
                        {/* Phase Steps in Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                          {Object.entries(localData.businessArchitecture.implementationPlan).map(([phase, description], idx) => {
                      return <div key={phase} className="relative">
                                  {/* Phase Card with Visual Indicator */}
                                  <div className="p-4 rounded-xl bg-gradient-to-br from-card to-card/80 border-2 border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all group relative overflow-hidden">
                                    {/* Background Pattern */}
                                    <div className="absolute inset-0 opacity-5">
                                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-3xl" />
                                    </div>
                                    <div className="relative z-10">
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                          <div className="relative">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-lg font-bold text-primary shadow-lg group-hover:scale-110 transition-transform">
                                              {idx + 1}
                                            </div>
                                            {/* Pulse animation */}
                                            <div className="absolute inset-0 rounded-xl bg-primary/20 animate-ping opacity-75" />
                                          </div>
                                          <ArrowRight className="h-4 w-4 text-primary/40 hidden md:block" />
                                        </div>
                                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                                          Step {idx + 1}
                                        </Badge>
                                      </div>
                                      <p className="font-bold text-sm mb-2 text-primary">{phase}</p>
                                      <InlinePlanEditor text={String(description)} onSave={v => setLocalData(prev => ({
                              ...prev,
                              businessArchitecture: {
                                ...prev.businessArchitecture,
                                implementationPlan: {
                                  ...prev.businessArchitecture.implementationPlan,
                                  [phase]: v
                                }
                              }
                            }))} />
                                    </div>
                                  </div>
                                </div>;
                    })}
                        </div>
                      </div>
                    </div>}
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>}

        {/* Solution Timeline */}
        {localData.solutionTimeline?.timelines && <AccordionItem value="timeline" className="border-none">
            <Card className="gradient-card overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-bold text-left text-lg">Solution Timeline</span>
                  <span className="ml-auto text-xs text-primary font-semibold bg-primary/10 px-2 py-1 rounded-full">
                    {data.solutionTimeline.timelines.length} phases
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-5 pt-2">
                  {localData.solutionTimeline.timelineOverview && <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-l-4 border-primary/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold text-sm text-primary">Overview</h4>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {localData.solutionTimeline.timelineOverview}
                      </p>
                    </div>}
                  {localData.solutionTimeline.timelines.map((timeline, index) => <div key={index} className="space-y-3">
                      {Object.entries(timeline).map(([phase, details]) => <div key={phase} className="p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 shadow-sm">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                              {index + 1}
                            </div>
                            <h4 className="font-bold text-base text-primary">{phase}</h4>
                          </div>
                          <div className="space-y-2.5 pl-2">
                            {Object.entries(details).map(([key, value]) => <InlineTimelineEditor key={key} label={key} text={String(value)} onSave={v => {
                      const timelines = [...(localData.solutionTimeline.timelines || [])];
                      const objIdx = timelines[index];
                      const entries = Object.entries(objIdx[phase] || {});
                      const updated = {};
                      entries.forEach(([k, val]) => {
                        updated[k] = k === key ? v : val;
                      });
                      const updatedPhaseObj = {
                        ...objIdx,
                        [phase]: updated
                      };
                      timelines[index] = updatedPhaseObj;
                      setLocalData(prev => ({
                        ...prev,
                        solutionTimeline: {
                          ...prev.solutionTimeline,
                          timelines
                        }
                      }));
                    }} />)}
                          </div>
                        </div>)}
                    </div>)}
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>}

        {/* Software & Tools */}
        {localData.softwareAndTools && Object.keys(localData.softwareAndTools).length > 0 && <AccordionItem value="tools" className="border-none">
            <Card className="gradient-card overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                    <Code className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-bold text-left text-lg">Software & Tools</span>
                  <span className="ml-auto text-xs text-primary font-semibold bg-primary/10 px-2 py-1 rounded-full">
                    {Object.keys(localData.softwareAndTools).length} tools
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                {/* Actions Row */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Button size="sm" variant="outline" className="gap-2 h-9 px-4" onClick={() => {
                setChipsVisible(false);
                setCatalogOpen(v => !v);
              }}>
                    <CheckSquare className="h-4 w-4" /> Add Tools
                  </Button>
                  <Button size="sm" variant="default" className="gap-2 h-9 px-4" onClick={() => {
                setChipsVisible(false);
                setCatalogOpen(false);
                setRegeneratedTick(Date.now());
                toast.success("Regenerated based on selected tools");
              }}>
                    <RefreshCw className="h-4 w-4" /> Regenerate
                  </Button>
                </div>

                {/* Partitioned layout: left selected placeholder, right add tools */}
                {catalogOpen ? <div className="grid md:grid-cols-2 gap-4">
                    <div>{renderSelectedToolsBox()}</div>
                    <div>
                      {/* Add Tools */}
                      {catalogOpen && <div className="mb-4 p-3 border border-primary/20 rounded-lg bg-card space-y-3">
                          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                            <div className="md:w-auto">
                              <Button variant="outline" size="sm" className="h-9 px-4 gap-2" onClick={() => {
                        const name = window.prompt("Add tool name");
                        if (!name) return;
                        const desc = window.prompt("Short description (optional)") || "";
                        setLocalData(prev => ({
                          ...prev,
                          softwareAndTools: {
                            ...(prev.softwareAndTools || {}),
                            [name]: desc
                          }
                        }));
                        toast.success("Tool added");
                      }}>
                                <Plus className="h-4 w-4" /> Add Tool
                              </Button>
                            </div>
                            <div className="relative md:w-1/2">
                              <Search className="h-4 w-4 absolute left-2 top-3 text-muted-foreground" />
                              <Input className="pl-8" placeholder="Search tools..." value={catalogQuery} onChange={e => setCatalogQuery(e.target.value)} />
                            </div>
                          </div>

                          {(() => {
                    const CATALOG = [{
                      id: "aws-kms",
                      name: "AWS KMS",
                      cloud: "AWS",
                      categories: ["Security"],
                      description: "Managed encryption key service."
                    }, {
                      id: "azure-keyvault",
                      name: "Azure Key Vault",
                      cloud: "Azure",
                      categories: ["Security"],
                      description: "Secrets and key management."
                    }, {
                      id: "gcp-kms",
                      name: "GCP KMS",
                      cloud: "GCP",
                      categories: ["Security"],
                      description: "Key management on GCP."
                    }, {
                      id: "elk",
                      name: "ELK Stack",
                      categories: ["Data", "Monitoring"],
                      description: "Elasticsearch, Logstash, Kibana."
                    }, {
                      id: "splunk",
                      name: "Splunk",
                      categories: ["Monitoring", "Security"],
                      description: "Observability & SIEM."
                    }, {
                      id: "docker",
                      name: "Docker",
                      categories: ["DevOps"],
                      description: "Container runtime."
                    }, {
                      id: "k8s",
                      name: "Kubernetes",
                      categories: ["DevOps"],
                      description: "Containers orchestration."
                    }, {
                      id: "prom",
                      name: "Prometheus",
                      categories: ["Monitoring"],
                      description: "Metrics monitoring."
                    }, {
                      id: "grafana",
                      name: "Grafana",
                      categories: ["Monitoring"],
                      description: "Dashboards & viz."
                    }, {
                      id: "selenium",
                      name: "Selenium",
                      categories: ["Testing"],
                      description: "Web UI testing."
                    }];
                    const term = catalogQuery.trim().toLowerCase();
                    const filtered = CATALOG.filter(t => {
                      if (catalogCloud !== "all" && t.cloud !== catalogCloud) return false;
                      if (catalogCats.length && !catalogCats.every(c => t.categories.includes(c))) return false;
                      if (term && !(t.name + " " + t.description).toLowerCase().includes(term)) return false;
                      return true;
                    });
                    const selectedSet = new Set(Object.keys(localData.softwareAndTools || {}));
                    if (filtered.length === 0) {
                      return <div className="p-6 border rounded-lg text-center bg-muted/20 text-sm text-muted-foreground">
                                  All matching tools are already added. Try different filters.
                                </div>;
                    }
                    return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {filtered.map(item => <div key={item.id} className={`p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all`}>
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          {item.cloud && <Badge variant="outline">{item.cloud}</Badge>}
                                          {item.categories.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                                        </div>
                                        <div className="font-semibold">{item.name}</div>
                                        <div className="text-xs text-muted-foreground">{item.description}</div>
                                      </div>
                                      {selectedSet.has(item.name) ? <Button size="sm" variant="secondary" disabled>Added</Button> : <Button size="sm" variant="outline" onClick={() => {
                            setLocalData(prev => ({
                              ...prev,
                              softwareAndTools: {
                                ...(prev.softwareAndTools || {}),
                                [item.name]: item.description
                              }
                            }));
                          }}>
                                          Add
                                        </Button>}
                                    </div>
                                  </div>)}
                              </div>;
                  })()}

                          <div className="flex justify-end">
                            <Button size="sm" onClick={() => setCatalogOpen(false)}>Done</Button>
                          </div>
                        </div>}
                    </div>
                  </div> : renderSelectedToolsBox()}

                {/* Removed old flat selected list per new partitioned design */}
              </AccordionContent>
            </Card>
          </AccordionItem>}

        {/* Key Requirements */}
        {localData.keyRequirements && <AccordionItem value="requirements" className="border-none">
            <Card className="gradient-card overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-bold text-left text-lg">Key Requirements</span>
                  <div className="ml-auto">
                    <Button variant="ghost" size="sm" onClick={e => {
                  e.stopPropagation();
                  openSectionEditor("keyRequirements");
                }} className="gap-1 text-xs">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                {editingSection === "keyRequirements" && <div className="mb-4 p-3 rounded-md border border-primary/20 bg-card">
                    <Textarea value={sectionDraft} onChange={e => setSectionDraft(e.target.value)} rows={6} />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingSection(null)}>
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                      <Button size="sm" onClick={saveSectionEditor}>
                        <Check className="h-4 w-4 mr-1" /> Save
                      </Button>
                    </div>
                  </div>}
                <div className="space-y-4 pt-2">
                  {formatTextContent(localData.keyRequirements)?.map((section, idx) => {
                if (section.type === 'heading') {
                  return <div key={idx} className="flex items-center gap-2 mb-3 mt-4 first:mt-0">
                          <Target className="h-4 w-4 text-primary flex-shrink-0" />
                          <h4 className="font-bold text-base text-primary border-b-2 border-primary/30 pb-1 flex-1">
                            {section.content}
                          </h4>
                        </div>;
                }
                if (section.type === 'list') {
                  const items = section.content.split('\n').filter(item => item.trim());
                  return <div key={idx} className="space-y-2.5 pl-2">
                          {items.map((item, itemIdx) => {
                      const cleanItem = item.replace(/^(?:\d+[\.)]\s*|[•\-\*]\s*|\.\s*|\)\s*)/, '').trim();
                      return <div key={itemIdx} className="flex items-start gap-3 group p-2 rounded-lg hover:bg-primary/5 transition-colors">
                                <div className="mt-1.5 p-1 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                  <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0" />
                                </div>
                                <p className="text-sm text-foreground leading-relaxed flex-1 pt-0.5">
                                  {cleanItem}
                                </p>
                              </div>;
                    })}
                        </div>;
                }
                return <div key={idx} className="p-4 rounded-lg bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-l-4 border-primary/30">
                        <p className="text-sm text-foreground leading-relaxed">
                          {section.content}
                        </p>
                      </div>;
              })}
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>}

        {/* Payment Terms */}
        {localData.paymentTerms && <AccordionItem value="payment" className="border-none">
            <Card className="gradient-card overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-bold text-left text-lg">Payment Terms</span>
                  <div className="ml-auto">
                    <Button variant="ghost" size="sm" onClick={e => {
                  e.stopPropagation();
                  openSectionEditor("paymentTerms");
                }} className="gap-1 text-xs">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                {editingSection === "paymentTerms" && <div className="mb-4 p-3 rounded-md border border-primary/20 bg-card">
                    <Textarea value={sectionDraft} onChange={e => setSectionDraft(e.target.value)} rows={6} />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingSection(null)}>
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                      <Button size="sm" onClick={saveSectionEditor}>
                        <Check className="h-4 w-4 mr-1" /> Save
                      </Button>
                    </div>
                  </div>}
                <div className="space-y-4 pt-2">
                  {formatTextContent(localData.paymentTerms)?.map((section, idx) => {
                if (section.type === 'heading') {
                  return <div key={idx} className="flex items-center gap-2 mb-3 mt-4 first:mt-0">
                          <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
                          <h4 className="font-bold text-base text-primary border-b-2 border-primary/30 pb-1 flex-1">
                            {section.content}
                          </h4>
                        </div>;
                }
                if (section.type === 'list') {
                  const items = section.content.split('\n').filter(item => item.trim());
                  return <div key={idx} className="space-y-2.5 pl-2">
                          {items.map((item, itemIdx) => {
                      const cleanItem = item.replace(/^(?:\d+[\.)]\s*|[•\-\*]\s*|\.\s*|\)\s*)/, '').trim();
                      return <div key={itemIdx} className="flex items-start gap-3 group p-2 rounded-lg hover:bg-primary/5 transition-colors">
                                <div className="mt-1.5 p-1 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                  <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0" />
                                </div>
                                <p className="text-sm text-foreground leading-relaxed flex-1 pt-0.5">
                                  {cleanItem}
                                </p>
                              </div>;
                    })}
                        </div>;
                }
                return <div key={idx} className="p-4 rounded-lg bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-l-4 border-primary/30">
                        <p className="text-sm text-foreground leading-relaxed">
                          {section.content}
                        </p>
                      </div>;
              })}
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>}

        {/* Top Keywords section removed per request */}
      </Box>

      {/* Submit Button to Move to Response Writeup */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          size="large" 
          onClick={() => {
            if (projectId) {
              // Update journey blocks: mark Summary Estimation as completed and Response Writeup as in-progress
              const project = MOCK_RFP_PROJECTS.find(p => p.id === projectId);
              const defaultBlocks = project?.journeyBlocks || [
                { name: "RFP Received", status: "completed", icon: "FileText" },
                { name: "Initial Analysis", status: "completed", icon: "Search" },
                { name: "Scope Definition", status: "completed", icon: "Target" },
                { name: "Cost Estimation", status: "completed", icon: "Calculator" },
                { name: "Resource Planning", status: "completed", icon: "Users" },
                { name: "Risk Assessment", status: "completed", icon: "AlertTriangle" },
                { name: "Summary Estimation", status: "in-progress", icon: "ListChecks" },
                { name: "Response Writeup", status: "pending", icon: "FileText" },
                { name: "Proposal Draft", status: "pending", icon: "FileEdit" },
                { name: "Final Approval", status: "pending", icon: "CheckCircle" },
                { name: "Submission", status: "pending", icon: "Send" }
              ];
              moveToNextStep(projectId, "Summary Estimation", defaultBlocks);
              navigate(`/rfp-lifecycle/${projectId}/response-writeup`);
            }
          }}
          sx={{ gap: 1 }}
        >
          Submit & Continue to Response Writeup
          <ArrowRight size={16} />
        </Button>
      </Box>
    </Box>;
};
export default RFPAnalysisDisplay;

// Inline editors

const InlineHoursEditor = ({
  value,
  onChange
}) => {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(String(value));
  const commit = () => {
    const n = Number(draft);
    if (!Number.isNaN(n)) onChange(n);
    setEditing(false);
  };
  if (!editing) {
    return <Button variant="secondary" size="sm" className="h-6 px-2 gap-1 bg-primary text-primary-foreground border-primary/30" onClick={e => {
      e.stopPropagation();
      setEditing(true);
    }}>
        {value}
        <span className="ml-1">hrs</span>
        <Pencil className="h-3 w-3 ml-1 opacity-80" />
      </Button>;
  }
  return <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
      <Input type="number" value={draft} onChange={e => setDraft(e.target.value)} className="h-7 w-20" onKeyDown={e => {
      if (e.key === "Enter") commit();
      if (e.key === "Escape") setEditing(false);
    }} />
      <Button size="icon" className="h-7 w-7" onClick={commit}>
        <Check className="h-3.5 w-3.5" />
      </Button>
      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(false)}>
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>;
};
const InlinePlanEditor = ({
  text,
  onSave
}) => {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(text);
  React.useEffect(() => setDraft(text), [text]);
  if (!editing) {
    return <div className="relative">
        <p className="text-xs text-foreground leading-relaxed mb-3 pr-8">{text}</p>
        <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-6 w-6" onClick={e => {
        e.stopPropagation();
        setEditing(true);
      }}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>;
  }
  return <div className="p-2 rounded-md border border-primary/20 bg-card" onClick={e => e.stopPropagation()}>
      <Textarea rows={3} value={draft} onChange={e => setDraft(e.target.value)} />
      <div className="flex justify-end gap-2 mt-2">
        <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
          <X className="h-4 w-4 mr-1" /> Cancel
        </Button>
        <Button size="sm" onClick={() => {
        onSave(draft);
        setEditing(false);
      }}>
          <Check className="h-4 w-4 mr-1" /> Save
        </Button>
      </div>
    </div>;
};
const InlineTimelineEditor = ({
  label,
  text,
  onSave
}) => {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(text);
  React.useEffect(() => setDraft(text), [text]);
  return <div className="flex items-start gap-3 p-2.5 rounded-lg bg-card border border-primary/10 hover:border-primary/30 transition-colors group">
      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-semibold">
        {label}
      </Badge>
      {!editing ? <div className="flex-1 flex items-start justify-between gap-2">
          <p className="text-sm text-foreground leading-relaxed flex-1 pt-1">{text}</p>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={e => {
        e.stopPropagation();
        setEditing(true);
      }}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div> : <div className="flex-1" onClick={e => e.stopPropagation()}>
          <Textarea rows={2} value={draft} onChange={e => setDraft(e.target.value)} />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={() => {
          onSave(draft);
          setEditing(false);
        }}>
              <Check className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        </div>}
    </div>;
};