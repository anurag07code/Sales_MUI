// Helper functions to manage chat sessions with localStorage persistence

const STORAGE_KEY_PREFIX = 'rfp-chat-sessions-';

/**
 * Get all chat sessions for a project
 */
export const getChatSessions = (projectId) => {
  if (!projectId) return [];
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${projectId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure we always return an array
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error('Error loading chat sessions:', error);
  }
  return [];
};

/**
 * Save chat sessions for a project
 */
export const saveChatSessions = (projectId, sessions) => {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${projectId}`, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving chat sessions:', error);
  }
};

/**
 * Create a new chat session
 */
export const createChatSession = (projectId, topic = null) => {
  const sessions = getChatSessions(projectId);
  const newSession = {
    id: `session-${Date.now()}`,
    title: topic ? `Chat about ${topic}` : `New Chat ${sessions.length + 1}`,
    topic: topic,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [{
      role: "assistant",
      content: topic 
        ? `Let's discuss ${topic}. How can I help you today?`
        : "Hello! How can I assist you with your RFP today?",
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    }]
  };
  
  const updatedSessions = [newSession, ...sessions];
  saveChatSessions(projectId, updatedSessions);
  return newSession;
};

/**
 * Update a chat session
 */
export const updateChatSession = (projectId, sessionId, updates) => {
  const sessions = getChatSessions(projectId);
  const updatedSessions = sessions.map(session => {
    if (session.id === sessionId) {
      return {
        ...session,
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }
    return session;
  });
  saveChatSessions(projectId, updatedSessions);
  return updatedSessions.find(s => s.id === sessionId);
};

/**
 * Delete a chat session
 */
export const deleteChatSession = (projectId, sessionId) => {
  const sessions = getChatSessions(projectId);
  const updatedSessions = sessions.filter(s => s.id !== sessionId);
  saveChatSessions(projectId, updatedSessions);
  return updatedSessions;
};

/**
 * Get a specific chat session
 */
export const getChatSession = (projectId, sessionId) => {
  const sessions = getChatSessions(projectId);
  return sessions.find(s => s.id === sessionId);
};

/**
 * Add a message to a chat session
 */
export const addMessageToSession = (projectId, sessionId, message) => {
  const session = getChatSession(projectId, sessionId);
  if (!session) return null;
  
  const updatedMessages = [...(session.messages || []), message];
  return updateChatSession(projectId, sessionId, {
    messages: updatedMessages
  });
};

