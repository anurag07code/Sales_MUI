// Helper functions to manage journey blocks with localStorage persistence

const STORAGE_KEY = 'rfp-journey-blocks';

/**
 * Get journey blocks for a project, with fallback to mock data
 */
export const getJourneyBlocks = (projectId, defaultBlocks) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const allBlocks = JSON.parse(stored);
      if (allBlocks[projectId]) {
        return allBlocks[projectId];
      }
    }
  } catch (error) {
    console.error('Error reading journey blocks:', error);
  }
  return defaultBlocks;
};

/**
 * Update journey blocks for a project
 */
export const updateJourneyBlocks = (projectId, blocks) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allBlocks = stored ? JSON.parse(stored) : {};
    allBlocks[projectId] = blocks;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allBlocks));
  } catch (error) {
    console.error('Error updating journey blocks:', error);
  }
};

/**
 * Update a specific step in the journey
 */
export const updateJourneyStep = (projectId, stepName, newStatus, defaultBlocks) => {
  const currentBlocks = getJourneyBlocks(projectId, defaultBlocks);
  const updatedBlocks = currentBlocks.map(block => {
    if (block.name === stepName) {
      return { ...block, status: newStatus };
    }
    return block;
  });
  updateJourneyBlocks(projectId, updatedBlocks);
  return updatedBlocks;
};

/**
 * Move to the next step in the journey
 */
export const moveToNextStep = (projectId, currentStepName, defaultBlocks) => {
  const currentBlocks = getJourneyBlocks(projectId, defaultBlocks);
  let foundCurrent = false;
  
  const updatedBlocks = currentBlocks.map(block => {
    if (block.name === currentStepName && block.status === 'in-progress') {
      foundCurrent = true;
      return { ...block, status: 'completed' };
    }
    // Mark the next pending step as in-progress
    if (foundCurrent && block.status === 'pending') {
      foundCurrent = false; // Prevent marking multiple steps
      return { ...block, status: 'in-progress' };
    }
    return block;
  });
  
  updateJourneyBlocks(projectId, updatedBlocks);
  return updatedBlocks;
};

