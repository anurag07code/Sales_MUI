import { useState, useEffect } from "react";
import { Bot, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const AIAssistantPanel = ({
  projects = [],
  currentProjectId,
  onProjectSelect,
  showCompare = false,
  variant = "default"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(currentProjectId || "");
  const [compareProjectId, setCompareProjectId] = useState("");
  const [compareOpen, setCompareOpen] = useState(false);
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hello! I'm your AI assistant. Please select an RFP document to start chatting about it."
  }]);

  // Allow other components to programmatically open the panel and target a project
  useEffect(() => {
    const handleOpen = (e) => {
      const targetProjectId = e?.detail?.projectId;
      if (targetProjectId) {
        setSelectedProjectId(targetProjectId);
        const project = projects.find(p => p.id === targetProjectId);
        if (project) {
          setMessages([{
            role: "assistant",
            content: `Hello! I'm your AI assistant. You're currently viewing "${project.rfpTitle}". How can I help you today?`
          }]);
        }
      }
      setIsOpen(true);
    };
    window.addEventListener('open-ai-assistant', handleOpen);
    return () => window.removeEventListener('open-ai-assistant', handleOpen);
  }, [projects]);

  // Small onboarding nudge near the floating button
  const [showNudge, setShowNudge] = useState(false);
  useEffect(() => {
    setShowNudge(true);
    const t = setTimeout(() => setShowNudge(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // Initialize messages based on props
  useEffect(() => {
    if (currentProjectId && projects.length > 0) {
      const project = projects.find(p => p.id === currentProjectId);
      if (project) {
        setSelectedProjectId(currentProjectId);
        setMessages([{
          role: "assistant",
          content: `Hello! I'm your AI assistant. You're currently viewing "${project.rfpTitle}". How can I help you today?`
        }]);
      }
    } else if (!selectedProjectId && projects.length > 0) {
      setMessages([{
        role: "assistant",
        content: "Hello! I'm your AI assistant. Please select an RFP document to start chatting about it."
      }]);
    }
  }, [currentProjectId, projects.length]);
  const handleProjectChange = value => {
    setSelectedProjectId(value);
    if (onProjectSelect) {
      onProjectSelect(value);
    }
    const selectedProject = projects.find(p => p.id === value);
    setMessages([{
      role: "assistant",
      content: selectedProject ? `I've switched to "${selectedProject.rfpTitle}". What would you like to know about this RFP?` : "Please select an RFP document to continue."
    }]);
  };
  const handleSend = () => {
    if (!message.trim()) return;
    if (!selectedProjectId) {
      setMessages([...messages, {
        role: "assistant",
        content: "Please select an RFP document first to start chatting."
      }]);
      return;
    }
    const userMessage = {
      role: "user",
      content: message
    };
    setMessages([...messages, userMessage]);
    setMessage("");

    // Simulate AI response
    setTimeout(() => {
      const selectedProject = projects.find(p => p.id === selectedProjectId);
      const compareProject = compareProjectId ? projects.find(p => p.id === compareProjectId) : null;
      let responseContent = "";
      if (showCompare && compareProject && selectedProject) {
        responseContent = `I can help you compare "${selectedProject.rfpTitle}" with "${compareProject.rfpTitle}". Both RFPs have been analyzed and I can provide insights on their differences in scope, timeline, complexity, and budget. What specific aspect would you like to compare?`;
      } else if (selectedProject) {
        responseContent = `Based on the analysis of "${selectedProject.rfpTitle}", I can provide detailed insights. The RFP shows significant complexity across technical, functional, and operational dimensions. What specific aspect would you like to explore?`;
      } else {
        responseContent = "Based on the RFP analysis, I can provide detailed insights. What specific aspect would you like to explore?";
      }
      setMessages(prev => [...prev, {
        role: "assistant",
        content: responseContent
      }]);
    }, 1000);
  };
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  return <>
      {/* Floating Button with Pulse Animation - Green Theme */}
      <Button size="icon" className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-elegant z-[950] transition-all ${variant === "detail" ? "bg-green-500 hover:bg-green-600 text-white border-2 border-green-400" : "bg-green-500 hover:bg-green-600 text-white"} ${!isOpen ? "animate-pulse" : ""}`} style={{
      boxShadow: variant === "detail" ? "0 0 20px rgba(34, 197, 94, 0.5), 0 4px 12px rgba(0, 0, 0, 0.15)" : "0 4px 12px rgba(34, 197, 94, 0.4)"
    }} onClick={() => setIsOpen(!isOpen)} title={isOpen ? "Close AI Assistant" : "Open AI Assistant"}>
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </Button>

      {/* Slide-in Panel */}
      {isOpen && <>
          {/* Overlay for mobile only - hidden on desktop (md and up) */}
          <div className="fixed inset-0 bg-black/50 z-[900] block md:hidden" onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <div className="fixed right-4 md:right-[88px] top-6 md:top-24 bottom-4 md:bottom-6 w-[calc(100%-2rem)] md:w-96 rounded-2xl border border-border z-[999] flex flex-col shadow-2xl overflow-hidden" style={{
        backgroundColor: 'hsl(var(--card))'
      }}>
            {/* Header */}
            <div className={`p-4 border-b border-border sticky top-0 z-10 ${variant === "detail" ? "border-green-200" : "border-border"}`} style={{
          backgroundColor: 'hsl(var(--card))'
        }}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${variant === "detail" ? "bg-green-100 dark:bg-green-900/30" : "bg-green-100 dark:bg-green-900/30"}`}>
                  <Bot className={`h-5 w-5 ${variant === "detail" ? "text-green-600 dark:text-green-400" : "text-green-600 dark:text-green-400"}`} />
                </div>
                <div>
                  <h3 className="font-bold text-base">AI Assistant</h3>
                  <p className="text-xs text-muted-foreground">Always here to help</p>
                </div>
                <button aria-label="Close" className="ml-auto h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Document Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Choose RFP Document</label>
                <Select value={selectedProjectId} onValueChange={handleProjectChange}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Select an RFP to chat about">
                      {selectedProject ? selectedProject.rfpTitle : "Select an RFP to chat about"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => <SelectItem key={project.id} value={project.id}>
                        {project.rfpTitle}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
            </div>

              {/* Compare Option (revealed by button) */}
              {showCompare && projects.length > 1 && <div className="space-y-2 mt-3">
                  {!compareOpen ? <Button size="sm" variant="outline" className="w-full border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" onClick={() => setCompareOpen(true)}>
                      Enable comparison
              </Button> : <>
                      <label className="text-sm font-medium text-foreground">Compare with another RFP (Optional)</label>
                      <Select value={compareProjectId || "none"} onValueChange={value => setCompareProjectId(value === "none" ? "" : value)}>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select RFP to compare">
                            {compareProjectId ? projects.find(p => p.id === compareProjectId)?.rfpTitle : "Select RFP to compare"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {projects.filter(p => p.id !== selectedProjectId).map(project => <SelectItem key={project.id} value={project.id}>
                                {project.rfpTitle}
                              </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </>}
                </div>}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{
          backgroundColor: 'hsl(var(--background))'
        }}>
              {messages.map((msg, index) => <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-3 rounded-lg ${msg.role === "user" ? variant === "detail" ? "bg-green-500 text-white" : "bg-green-500 text-white" : "bg-muted/50 text-foreground"}`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>)}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border" style={{
          backgroundColor: 'hsl(var(--card))'
        }}>
              <div className="flex gap-2">
                <Input placeholder="Ask me anything..." value={message} onChange={e => setMessage(e.target.value)} onKeyPress={e => e.key === "Enter" && handleSend()} className="bg-background" />
                <Button onClick={handleSend} size="icon" className={`${variant === "detail" ? "bg-green-500 hover:bg-green-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"}`}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </>}

      {/* Nudge tooltip when closed */}
      {!isOpen && showNudge && <div className="fixed bottom-8 right-24 z-[945]">
          <div className="relative px-3 py-2 rounded-lg bg-card border border-border shadow-md text-sm">
            <span className="text-foreground">Hi! Ask about this RFP</span>
            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-card border border-border rotate-45" />
          </div>
        </div>}
    </>;
};
export default AIAssistantPanel;