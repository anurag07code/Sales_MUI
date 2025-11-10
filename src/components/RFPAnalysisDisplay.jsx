import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, DollarSign, Calendar, Users, Code, FileText, Shield, Target, CheckCircle2, Clock, BarChart3, Briefcase, ArrowRight, ListChecks, Sparkles, Zap, Layers, CheckSquare, RefreshCw, Network, Server, Database, Lock, Cpu, Pencil, Check, X, Plus, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { moveToNextStep } from "@/lib/journeyBlocks";
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
  return <div className="space-y-6">
      {/* Header */}
      {fileName && <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">{fileName}</h2>
          </div>
          <p className="text-muted-foreground">RFP Analysis & Estimation Results</p>
        </div>}

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.estimation && <>
            <Card className="p-4 border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Efforts</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatEffort(data.estimation.totalEfforts || 0)} hrs
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary/40" />
              </div>
            </Card>
            <Card className="p-4 border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Build Efforts</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatEffort(data.estimation.build || 0)} hrs
                  </p>
                </div>
                <Code className="h-8 w-8 text-primary/40" />
              </div>
            </Card>
            <Card className="p-4 border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Project Management</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatEffort(data.estimation.projectManagement || 0)} hrs
                  </p>
                </div>
                <Briefcase className="h-8 w-8 text-primary/40" />
              </div>
            </Card>
            <Card className="p-4 border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Support</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatEffort(data.estimation.support || 0)} hrs
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary/40" />
              </div>
            </Card>
          </>}
      </div>

      {/* Complexity Scores section removed per request */}

      {/* Timeline */}
      {data.timeLine && <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Timeline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(data.timeLine).map(([key, value]) => <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm font-medium text-muted-foreground capitalize">
                  {key.replace(/_/g, " ")}
                </span>
                <Badge variant="outline" className="font-semibold">
                  {value}
                </Badge>
              </div>)}
          </div>
        </Card>}

      {/* Main Accordion Sections */}
      <Accordion type="multiple" className="space-y-3">
        {/* Purpose */}
        {localData.purpose && <AccordionItem value="purpose" className="border-none">
            <Card className="gradient-card overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-bold text-left text-lg">Purpose</span>
                  <div className="ml-auto">
                    <Button variant="ghost" size="sm" onClick={e => {
                  e.stopPropagation();
                  openSectionEditor("purpose");
                }} className="gap-1 text-xs">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                {editingSection === "purpose" && <div className="mb-4 p-3 rounded-md border border-primary/20 bg-card">
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
                    return <div key={idx} className="flex items-center gap-2 mb-3 mt-4 first:mt-0">
                            <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
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
                        return <div key={itemIdx} className="flex items-start gap-3 group">
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
                  // First paragraph gets special treatment with box and shadow - different color (not blue)
                  if (idx === firstParagraphIdx) {
                    return <div key={idx} className="p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border shadow-md">
                            <p className="text-sm font-semibold text-foreground leading-relaxed">
                              {section.content}
                            </p>
                          </div>;
                  }
                  return <div key={idx} className="p-4 rounded-lg bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-l-4 border-primary/30">
                          <p className="text-sm text-foreground leading-relaxed">
                            {section.content.replace(/^\.\s*/, "")}
                          </p>
                        </div>;
                });
              })()}
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>}

        {/* Scope of Work */}
        {localData.scopeOfWork && <AccordionItem value="scope" className="border-none">
            <Card className="gradient-card overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-bold text-left text-lg">Scope of Work</span>
                  <div className="ml-auto">
                    <Button variant="ghost" size="sm" onClick={e => {
                  e.stopPropagation();
                  openSectionEditor("scopeOfWork");
                }} className="gap-1 text-xs">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                {editingSection === "scopeOfWork" && <div className="mb-4 p-3 rounded-md border border-primary/20 bg-card">
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
                  {formatTextContent(localData.scopeOfWork)?.map((section, idx) => {
                if (section.type === 'heading') {
                  return <div key={idx} className="flex items-center gap-2 mb-3 mt-4 first:mt-0">
                          <Zap className="h-4 w-4 text-primary flex-shrink-0" />
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
                      return <div key={itemIdx} className="flex items-start gap-3 group">
                                <div className="mt-1.5 p-1 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                  <ListChecks className="h-3 w-3 text-primary flex-shrink-0" />
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

        {/* Estimation & Roles */}
        {localData.estimation?.rolesAndEfforts && <AccordionItem value="estimation" className="border-none">
            <Card className="gradient-card overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-bold text-left text-lg">Estimation & Roles</span>
                  <span className="ml-auto text-xs text-primary font-semibold bg-primary/10 px-2 py-1 rounded-full">
                    {Object.keys(data.estimation.rolesAndEfforts).length} roles
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
                  {Object.entries(localData.estimation.rolesAndEfforts).sort(([, a], [, b]) => (b || 0) - (a || 0)).map(([role, hours], idx) => <div key={role} className="flex flex-col p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all group cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-primary group-hover:bg-primary/40 transition-colors flex-shrink-0">
                            {idx + 1}
                          </div>
                          <InlineHoursEditor value={Number(hours) || 0} onChange={newHours => setLocalData(prev => ({
                    ...prev,
                    estimation: {
                      ...prev.estimation,
                      rolesAndEfforts: {
                        ...prev.estimation.rolesAndEfforts,
                        [role]: newHours
                      }
                    }
                  }))} />
                        </div>
                        <p className="font-semibold text-sm text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                          {role}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">hours</p>
                      </div>)}
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>}

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
      </Accordion>

      {/* Submit Button to Move to Response Writeup */}
      <div className="mt-6 flex justify-end">
        <Button 
          size="lg" 
          className="gap-2"
          onClick={() => {
            if (projectId) {
              // Update journey blocks: mark Summary Estimation as completed and Response Writeup as in-progress
              // We need to get the default blocks from the project, but since we don't have access here,
              // we'll use a helper that will handle it
              const defaultBlocks = [
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
        >
          Submit & Continue to Response Writeup
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>;
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