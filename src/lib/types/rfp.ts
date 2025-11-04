export interface RFPResult {
  file_name: string;
  rfp_id: string;
  user_id: string;
  rfp_estimation: RFPEstimation;
}

export interface RFPEstimation {
  applicationArchitecture?: ApplicationArchitecture;
  budget?: string;
  buildingBlocks?: BuildingBlocks;
  businessArchitecture?: BusinessArchitecture;
  contactInformation?: string;
  disengagement?: string;
  endToEndFlow?: EndToEndFlow;
  estimation?: Estimation;
  evaluationCriteria?: string;
  functionalComplexity?: FunctionalComplexity;
  keyRequirements?: string;
  operationalComplexity?: OperationalComplexity;
  ownershipOfDeliverables?: string;
  paymentTerms?: string;
  proposalSubmissionGuidelines?: string;
  purpose?: string;
  rfpCategory?: string;
  scopeOfWork?: string;
  softwareAndTools?: Record<string, string>;
  solutionTimeline?: SolutionTimeline;
  technicalArchitecture?: TechnicalArchitecture;
  technicalComplexity?: TechnicalComplexity;
  timeLine?: TimeLine;
  topKeyWords?: string[];
  vendorEvaluavtionCriteria?: string;
}

export interface ApplicationArchitecture {
  applicationArchitectureOverview?: string;
  conclusion?: string;
  implementationPlan?: Record<string, string>;
  keyComponentsoftheApplicationArchitecture?: Record<string, string>;
  keyConsiderations?: Record<string, string>;
}

export interface BuildingBlocks {
  conclusion?: string;
  solutionBuildingBlocks?: string;
  [key: string]: any;
}

export interface BusinessArchitecture {
  businessArchitectureOverview?: string;
  conclusion?: string;
  implementationPlan?: Record<string, string>;
  keyComponentsoftheBusinessArchitecture?: Record<string, string>;
  keyConsiderations?: Record<string, string>;
}

export interface EndToEndFlow {
  conclusion?: string;
  endToEndTechnicalFlow?: string;
  [key: string]: any;
}

export interface Estimation {
  build?: number;
  projectManagement?: number;
  rolesAndEfforts?: Record<string, number>;
  support?: number;
  totalEfforts?: number;
}

export interface FunctionalComplexity {
  customizationRequirements?: string;
  functionalComplexityScore?: number;
  modules?: string;
  userRoles?: string;
}

export interface OperationalComplexity {
  concurrencyRequirements?: string;
  dataVolume?: string;
  operationalComplexityScore?: number;
  securityStandards?: string;
}

export interface SolutionTimeline {
  conclusion?: string;
  timelineOverview?: string;
  timelines?: Array<Record<string, Record<string, string>>>;
}

export interface TechnicalArchitecture {
  conclusion?: string;
  implementationPlan?: Record<string, string>;
  keyComponentsoftheTechnicalArchitecture?: Record<string, string>;
  keyConsiderations?: Record<string, string>;
  technicalArchitectureOverview?: string;
}

export interface TechnicalComplexity {
  architectureRequirements?: string;
  numberOfIntegrations?: string;
  scalability?: string;
  technicalComplexityScore?: number;
  technologyStack?: string;
}

export interface TimeLine {
  clarification_deadline?: string;
  pre_bid_meeting_date?: string;
  rfp_available_end?: string;
  rfp_available_start?: string;
  rfp_issued_date?: string;
  submission_deadline?: string;
}



