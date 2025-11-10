import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Plus, CheckSquare, RefreshCw, FileText, Upload, X, AlertCircle, Bot, Sparkles, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RFPFlowTimeline from "@/components/RFPFlowTimeline";
import { MOCK_RFP_PROJECTS } from "@/lib/mockData";
import { toast } from "sonner";
import { useState, useRef, useEffect, useMemo } from "react";
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
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Project not found</p>
            <Button onClick={() => navigate("/rfp-lifecycle")}>Back to RFP Lifecycle</Button>
          </Card>
        </div>
      </div>
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
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/rfp-lifecycle/${id}`)} className="hover:bg-accent/50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Response Writeup</h1>
              <p className="text-sm text-muted-foreground mt-1">{project.rfpTitle}</p>
            </div>
          </div>
        </div>

        {/* Journey Flow */}
        <Card className="p-6 border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
          <RFPFlowTimeline blocks={journeyBlocks} projectId={id} />
        </Card>

        {/* Response Write-up Content */}
        <Card className="p-6 border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
          {/* Group Knowledge Base Selector */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-2 border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h4 className="font-bold text-primary">Group Knowledge Base</h4>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedGroup || "personal"} onValueChange={(value) => {
                  if (value === "personal") {
                    setSelectedGroup(null);
                    setShowGroupKB(false);
                  } else {
                    setSelectedGroup(value);
                    setShowGroupKB(true);
                  }
                }}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select a group (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal Knowledge Base</SelectItem>
                    {groups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} ({group.members.length} members)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/groups")}
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  Manage Groups
                </Button>
              </div>
            </div>
            {selectedGroup && (
              <Alert className="bg-primary/5 border-primary/20">
                <Globe className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm">
                  You're viewing the shared knowledge base from <strong>{groups.find(g => g.id === selectedGroup)?.name}</strong>. 
                  Topics and files added here will be shared with all group members. Your chats remain private.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Knowledge Base Builder */}
          <div className="mb-6 p-4 rounded-xl bg-card border-2 border-primary/20">
            <h4 className="font-bold mb-2 text-primary">Build Knowledge Base</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedGroup 
                ? "Enter a new topic and upload supporting documents. These will be shared with all group members."
                : "Enter a new topic and upload supporting documents to improve AI assistance."}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground mb-2">Existing Topics</p>
                {kbTopics.map(t => (
                  <div key={t.key} className={`p-4 rounded-lg border-2 transition-colors ${
                    t.source === "group" 
                      ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 hover:border-primary/50" 
                      : "bg-gradient-to-br from-muted/50 to-muted/30 border-border hover:border-primary/30"
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">{t.name}</span>
                        {t.source === "group" && (
                          <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30">
                            <Users className="h-3 w-3 mr-1" />
                            {t.groupName}
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {t.files.length} {t.files.length === 1 ? 'file' : 'files'}
                      </Badge>
                    </div>
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2 p-2 rounded-md border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-colors">
                        <Upload className="h-4 w-4 text-primary" />
                        <span className="text-xs text-primary font-medium">Choose Files</span>
                      </div>
                      <input 
                        type="file" 
                        multiple 
                        onChange={e => onUploadFiles(t.key, e.target.files)} 
                        className="hidden"
                      />
                    </label>
                    {t.files.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {t.files.map((fileName, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span className="truncate">{fileName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground mb-2">Create New Topic</p>
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
                  <div className="mb-3">
                    <label className="text-sm font-semibold mb-1.5 block">
                      Topic Name <span className="text-destructive">*</span>
                    </label>
                    <Input 
                      placeholder="Enter your New Topic" 
                      value={newTopicName} 
                      onChange={e => {
                        setNewTopicName(e.target.value);
                        setFileError("");
                      }}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="text-sm font-semibold mb-1.5 block">
                      Upload Files <span className="text-destructive">*</span>
                    </label>
                    <label className="cursor-pointer block">
                      <div className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed transition-all ${
                        fileError 
                          ? 'border-destructive/50 bg-destructive/5' 
                          : newTopicFiles.length > 0 
                            ? 'border-primary/50 bg-primary/5' 
                            : 'border-primary/30 hover:border-primary/50 hover:bg-primary/5'
                      }`}>
                        <Upload className={`h-8 w-8 mb-2 ${fileError ? 'text-destructive' : 'text-primary'}`} />
                        <span className={`text-sm font-medium mb-1 ${fileError ? 'text-destructive' : 'text-primary'}`}>
                          {newTopicFiles.length > 0 ? `${newTopicFiles.length} file(s) selected` : 'Choose Files'}
                        </span>
                        <span className="text-xs text-muted-foreground text-center">
                          {newTopicFiles.length > 0 ? 'Click to change files' : 'Select files for your knowledge base'}
                        </span>
                      </div>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        multiple 
                        onChange={handleNewTopicFileChange}
                        className="hidden"
                      />
                    </label>
                    
                    {fileError && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">{fileError}</AlertDescription>
                      </Alert>
                    )}
                    
                    {newTopicFiles.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {newTopicFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-card border border-border">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                              <span className="text-xs text-foreground truncate">{file.name}</span>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 flex-shrink-0"
                              onClick={(e) => {
                                e.preventDefault();
                                removeNewTopicFile(idx);
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    size="sm" 
                    onClick={onAddNewTopic}
                    className="w-full"
                    disabled={!newTopicName.trim() || newTopicFiles.length === 0}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Topic
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Topic Tabs and Generated Content */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                Not Reviewed
              </Badge>
            </div>

            <div className="p-4 rounded-xl border-2 border-primary/25 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-full bg-primary/15 text-primary shadow-inner">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm sm:text-base text-foreground">
                        AI Response Co-Pilot
                      </p>
                      <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                      Launch the contextual AI workspace to fine-tune drafts, clarify requirements, and generate client-ready responses instantly.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                  <Button
                    size="lg"
                    onClick={goToChat}
                    className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground shadow-lg hover:shadow-primary/40 hover:scale-[1.01] transition-all"
                  >
                    Launch AI Chat
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportAll}
                    className="w-full sm:w-auto border-primary/40 text-primary hover:bg-primary/10"
                  >
                    Export All Topics
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Tabs value={activeTopic} onValueChange={setActiveTopic} className="w-full">
            <TabsList>
              {kbTopics.map(topic => (
                <TabsTrigger key={topic.key} value={topic.key}>{topic.name}</TabsTrigger>
              ))}
            </TabsList>

            {kbTopics.map(topic => {
              const content = topicContents[topic.key] || "";
              return (
                <TabsContent key={topic.key} value={topic.key}>
                  <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-l-4 border-primary/30">
                    <h4 className="font-semibold mb-2 text-primary capitalize">{topic.key.replace(/-/g, ' ')} Overview :</h4>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Button size="sm" onClick={() => regenerateTopic(topic.key)}>Regenerate Response</Button>
                    <Button size="sm" variant="outline" onClick={() => exportTopic(topic.key)}>Export Topic</Button>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default ResponseWriteup;

