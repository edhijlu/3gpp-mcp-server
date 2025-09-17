export interface UserQuery {
  text: string;
  userLevel?: ExpertiseLevel;
  context?: string;
  domain?: string;
}

export type ExpertiseLevel = 'beginner' | 'intermediate' | 'expert';

export interface QueryAnalysis {
  intent: QueryIntent;
  domain: string;
  concepts: string[];
  complexity: number;
  userLevel: ExpertiseLevel;
}

export type QueryIntent =
  | 'discovery'      // Finding relevant specifications
  | 'learning'       // Understanding concepts
  | 'comparison'     // Comparing specifications/approaches
  | 'implementation' // Implementation guidance
  | 'troubleshooting' // Problem solving
  | 'evolution';     // Understanding changes over time

export interface GuidanceResponse {
  type: 'guidance';
  summary: string;
  sections: GuidanceSection[];
  nextSteps?: string[];
  relatedTopics?: string[];
  confidence: number;
}

export interface GuidanceSection {
  title: string;
  content: string;
  type: SectionType;
}

export type SectionType =
  | 'overview'
  | 'specifications'
  | 'strategy'
  | 'keywords'
  | 'implementation'
  | 'tips'
  | 'examples';

export interface SpecificationSuggestion {
  id: string;                    // "TS 24.501"
  title: string;                 // "5G NAS Protocol"
  relevance: number;             // 0-1
  reason: string;                // Why this spec is relevant
  priority: 'primary' | 'secondary' | 'reference';
  sections?: string[];           // Relevant sections
}

export interface SearchStrategy {
  approach: string;              // Overall strategy description
  steps: ResearchStep[];         // Ordered research steps
  keywords: string[];            // Recommended search terms
  sources: string[];             // Where to search
  timeline: string;              // Expected time investment
}

export interface ResearchStep {
  step: number;
  description: string;
  action: string;
  expectedOutcome: string;
  timeEstimate: string;
}

export interface SpecificationMetadata {
  id: string;                    // "TS 24.501"
  title: string;                 // Full specification title
  series: string;                // "24"
  release: string;               // "Rel-16"
  workingGroup: string;          // "CT1"
  purpose: string;               // What this specification defines
  keyTopics: string[];           // Main topics covered
  dependencies: string[];        // Prerequisite specifications
  relatedSpecs: string[];        // Related specifications
  searchKeywords: string[];      // Effective search terms
  commonQuestions: string[];     // Typical research questions
  implementationNotes: string[]; // Implementation considerations
  evolutionNotes?: string;       // How it evolved from previous versions
}

export interface ProtocolMetadata {
  name: string;                  // "NAS"
  fullName: string;              // "Non-Access Stratum"
  layer: string;                 // "L3"
  purpose: string;               // Protocol purpose
  definingSpecs: string[];       // Primary specifications
  relatedProtocols: string[];    // Related protocols
  procedures: ProcedureMetadata[];
  commonUseCases: string[];
  troubleshootingAreas: string[];
}

export interface ProcedureMetadata {
  name: string;                  // "Authentication"
  description: string;           // What the procedure does
  triggerConditions: string[];   // When it's used
  keySteps: string[];           // High-level steps
  relatedProcedures: string[];  // Related procedures
  commonIssues: string[];       // Typical problems
  debuggingTips: string[];      // Troubleshooting guidance
}

export interface ConceptMetadata {
  name: string;                  // "SUCI"
  fullName: string;             // "Subscription Concealed Identifier"
  category: string;             // "Security", "Identity", etc.
  description: string;          // Concept explanation
  purpose: string;              // Why it exists
  relatedConcepts: string[];    // Related concepts
  specifications: string[];     // Where it's defined
  evolutionFrom?: string;       // What it replaced/evolved from
  usageContext: string[];       // When/where it's used
}

export interface ResearchPattern {
  name: string;                  // "Protocol Analysis"
  description: string;           // Pattern description
  applicableFor: string[];       // When to use this pattern
  steps: PatternStep[];          // Research methodology steps
  expectedOutputs: string[];     // What you should learn
  commonPitfalls: string[];      // What to avoid
  timeEstimate: string;          // How long it typically takes
}

export interface PatternStep {
  phase: string;                 // "Preparation", "Analysis", "Validation"
  tasks: string[];              // Specific tasks in this phase
  deliverables: string[];       // Outputs from this phase
  tips: string[];               // Best practices for this phase
}

export interface KnowledgeGraph {
  specifications: Map<string, SpecificationMetadata>;
  protocols: Map<string, ProtocolMetadata>;
  concepts: Map<string, ConceptMetadata>;
  patterns: Map<string, ResearchPattern>;
  relationships: Map<string, Relationship[]>;
}

export interface Relationship {
  type: RelationshipType;
  target: string;               // ID of related entity
  strength: number;             // 0-1, strength of relationship
  description?: string;         // Optional explanation
}

export type RelationshipType =
  | 'defines'        // Spec A defines concept B
  | 'uses'          // Protocol A uses procedure B
  | 'extends'       // Spec A extends spec B
  | 'replaces'      // Spec A replaces spec B
  | 'references'    // Spec A references spec B
  | 'implements'    // Spec A implements concept B
  | 'depends_on';   // Spec A depends on spec B

export interface GuidanceTemplate {
  name: string;
  description: string;
  applicableIntents: QueryIntent[];
  template: string;             // Template with placeholders
  requiredData: string[];       // What data is needed to fill template
  outputFormat: 'markdown' | 'plain' | 'structured';
}

export interface SearchPattern {
  domain: string;               // "authentication", "mobility", etc.
  keywords: string[];           // Effective search terms
  series: string[];            // Relevant specification series
  startingSpecs: string[];     // Good entry points
  readingOrder: string[];      // Suggested sequence
  commonMistakes: string[];    // What to avoid
  tips: string[];              // Search optimization tips
}

export interface ImplementationGuidance {
  topic: string;                // "NAS authentication implementation"
  overview: string;             // High-level approach
  prerequisites: string[];      // What you need to know first
  specifications: string[];     // Required specifications
  phases: ImplementationPhase[];
  testingStrategy: string[];    // How to validate implementation
  commonIssues: string[];       // Typical implementation problems
  resources: string[];          // Additional helpful resources
}

export interface ImplementationPhase {
  name: string;                 // "Architecture Design"
  description: string;          // What happens in this phase
  deliverables: string[];       // Outputs from this phase
  specifications: string[];     // Specs needed for this phase
  duration: string;             // Time estimate
  dependencies: string[];       // Other phases that must complete first
}

export interface UserContext {
  level: ExpertiseLevel;
  domain?: string;              // Area of focus
  previousQueries?: string[];   // Query history for context
  preferences?: {
    detailLevel: 'concise' | 'detailed' | 'comprehensive';
    format: 'conversational' | 'structured' | 'checklist';
    examples: boolean;          // Include examples
    nextSteps: boolean;         // Suggest next steps
  };
}