import {
  UserQuery,
  QueryAnalysis,
  GuidanceResponse,
  ExpertiseLevel,
  QueryIntent,
  GuidanceSection,
  SpecificationSuggestion,
  SearchStrategy,
  ResearchStep,
  UserContext
} from '../types/guidance';
import { KnowledgeBase } from './knowledge-base';
import { TemplateGenerator } from './template-generator';

export class GuidanceEngine {
  private knowledgeBase: KnowledgeBase;
  private templateGenerator: TemplateGenerator;

  constructor() {
    this.knowledgeBase = new KnowledgeBase();
    this.templateGenerator = new TemplateGenerator(this.knowledgeBase);
  }

  async initialize(): Promise<void> {
    await this.knowledgeBase.initialize();
    await this.templateGenerator.initialize();
    console.log('Guidance Engine initialized');
  }

  async analyzeQuery(query: UserQuery): Promise<QueryAnalysis> {
    const text = query.text.toLowerCase();

    // Analyze intent
    const intent = this.determineIntent(text);

    // Determine domain
    const domain = this.determineDomain(text);

    // Extract concepts
    const concepts = this.extractConcepts(text);

    // Assess complexity
    const complexity = this.assessComplexity(text, concepts);

    // Determine or use provided user level
    const userLevel = query.userLevel || this.inferUserLevel(text, complexity);

    return {
      intent,
      domain,
      concepts,
      complexity,
      userLevel
    };
  }

  async generateGuidance(query: UserQuery, analysis: QueryAnalysis): Promise<GuidanceResponse> {
    const sections: GuidanceSection[] = [];
    let confidence = 0.8; // Base confidence

    // Generate intent-specific guidance
    switch (analysis.intent) {
      case 'discovery':
        sections.push(...await this.generateDiscoveryGuidance(query, analysis));
        break;

      case 'learning':
        sections.push(...await this.generateLearningGuidance(query, analysis));
        break;

      case 'comparison':
        sections.push(...await this.generateComparisonGuidance(query, analysis));
        break;

      case 'implementation':
        sections.push(...await this.generateImplementationGuidance(query, analysis));
        break;

      case 'troubleshooting':
        sections.push(...await this.generateTroubleshootingGuidance(query, analysis));
        break;

      case 'evolution':
        sections.push(...await this.generateEvolutionGuidance(query, analysis));
        break;

      default:
        sections.push(...await this.generateGenericGuidance(query, analysis));
        confidence = 0.6; // Lower confidence for generic guidance
    }

    // Generate summary
    const summary = this.generateSummary(sections, analysis);

    // Generate next steps
    const nextSteps = await this.generateNextSteps(analysis);

    // Generate related topics
    const relatedTopics = await this.generateRelatedTopics(analysis);

    return {
      type: 'guidance',
      summary,
      sections,
      nextSteps,
      relatedTopics,
      confidence
    };
  }

  private determineIntent(text: string): QueryIntent {
    const intentKeywords = {
      discovery: ['find', 'search', 'locate', 'discover', 'identify', 'which spec', 'what specification'],
      learning: ['learn', 'understand', 'explain', 'how does', 'what is', 'tutorial', 'guide me'],
      comparison: ['compare', 'difference', 'vs', 'versus', 'better', 'choose between', 'contrast'],
      implementation: ['implement', 'build', 'develop', 'code', 'create', 'deploy', 'how to build'],
      troubleshooting: ['debug', 'fix', 'problem', 'issue', 'error', 'troubleshoot', 'not working'],
      evolution: ['change', 'evolution', 'history', 'migration', 'upgrade', 'from rel', 'new in']
    };

    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return intent as QueryIntent;
      }
    }

    // Default to discovery if no specific intent detected
    return 'discovery';
  }

  private determineDomain(text: string): string {
    const domainKeywords = {
      'authentication': ['auth', 'aka', 'suci', 'supi', 'identity', 'privacy', 'login'],
      'mobility': ['handover', 'mobility', 'roaming', 'cell', 'tracking area'],
      'session_management': ['session', 'bearer', 'pdu', 'data', 'connectivity', 'qos'],
      'security': ['security', 'encryption', 'key', 'cipher', 'protect', 'crypto'],
      'radio': ['radio', 'rf', 'antenna', 'beam', 'mimo', 'physical layer'],
      'protocol': ['protocol', 'message', 'signaling', 'procedure', 'nas', 'rrc'],
      'architecture': ['architecture', 'system', 'network function', 'sba', 'core network'],
      'ue': ['ue', 'device', 'terminal', 'phone', 'equipment'],
      'network': ['network', 'operator', 'infrastructure', 'deployment']
    };

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return domain;
      }
    }

    return 'general';
  }

  private extractConcepts(text: string): string[] {
    const concepts: string[] = [];

    // 3GPP-specific terms
    const conceptPatterns = [
      /\b(nas|rrc|pdcp|rlc|mac|phy)\b/gi,
      /\b(5g|lte|4g|3g|nr|eps|5gs)\b/gi,
      /\b(suci|supi|imsi|guti|tmsi)\b/gi,
      /\b(aka|ausf|amf|smf|upf|udm)\b/gi,
      /\b(authentication|authorization|security)\b/gi,
      /\b(handover|mobility|roaming)\b/gi,
      /\b(bearer|session|pdu|qos)\b/gi,
      /\bts\s*\d{2}\.\d{3}\b/gi // Specification IDs
    ];

    for (const pattern of conceptPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        concepts.push(...matches.map(m => m.toUpperCase()));
      }
    }

    return [...new Set(concepts)]; // Remove duplicates
  }

  private assessComplexity(text: string, concepts: string[]): number {
    let complexity = 0.3; // Base complexity

    // More concepts = higher complexity
    complexity += Math.min(concepts.length * 0.1, 0.4);

    // Technical terms indicate complexity
    const technicalTerms = ['implementation', 'algorithm', 'cryptography', 'optimization', 'performance'];
    if (technicalTerms.some(term => text.includes(term))) {
      complexity += 0.2;
    }

    // Multiple specifications mentioned
    const specMatches = text.match(/\bts\s*\d{2}\.\d{3}\b/gi);
    if (specMatches && specMatches.length > 1) {
      complexity += 0.2;
    }

    return Math.min(complexity, 1.0);
  }

  private inferUserLevel(text: string, complexity: number): ExpertiseLevel {
    // Beginner indicators
    const beginnerIndicators = ['what is', 'explain', 'basic', 'introduction', 'getting started'];
    if (beginnerIndicators.some(indicator => text.includes(indicator))) {
      return 'beginner';
    }

    // Expert indicators
    const expertIndicators = ['implementation', 'optimization', 'performance', 'algorithm', 'detailed'];
    if (expertIndicators.some(indicator => text.includes(indicator)) || complexity > 0.7) {
      return 'expert';
    }

    // Default to intermediate
    return 'intermediate';
  }

  private async generateDiscoveryGuidance(query: UserQuery, analysis: QueryAnalysis): Promise<GuidanceSection[]> {
    const sections: GuidanceSection[] = [];

    // Find relevant specifications
    const suggestedSpecs = await this.knowledgeBase.suggestSpecificationsForTopic(analysis.domain);

    if (suggestedSpecs.length > 0) {
      const specSection = await this.templateGenerator.formatSpecificationSuggestions(
        suggestedSpecs.slice(0, 5),
        analysis.domain,
        analysis.userLevel
      );
      sections.push({
        title: 'Relevant Specifications',
        content: specSection,
        type: 'specifications'
      });
    }

    // Generate search strategy
    const searchPattern = await this.knowledgeBase.getSearchPatternForDomain(analysis.domain);
    if (searchPattern) {
      const strategySection = await this.templateGenerator.formatSearchStrategy(
        searchPattern,
        analysis.userLevel
      );
      sections.push({
        title: 'Search Strategy',
        content: strategySection,
        type: 'strategy'
      });
    }

    return sections;
  }

  private async generateLearningGuidance(query: UserQuery, analysis: QueryAnalysis): Promise<GuidanceSection[]> {
    const sections: GuidanceSection[] = [];

    // Generate learning path
    const learningSection = await this.templateGenerator.formatLearningPath(
      analysis.domain,
      analysis.concepts,
      analysis.userLevel
    );
    sections.push({
      title: 'Learning Path',
      content: learningSection,
      type: 'overview'
    });

    // Find relevant specifications for learning
    const suggestedSpecs = await this.knowledgeBase.suggestSpecificationsForTopic(analysis.domain);

    if (suggestedSpecs.length > 0) {
      const specSection = await this.templateGenerator.formatLearningSpecifications(
        suggestedSpecs.slice(0, 3),
        analysis.userLevel
      );
      sections.push({
        title: 'Key Specifications to Study',
        content: specSection,
        type: 'specifications'
      });
    }

    return sections;
  }

  private async generateComparisonGuidance(query: UserQuery, analysis: QueryAnalysis): Promise<GuidanceSection[]> {
    const sections: GuidanceSection[] = [];

    // Extract what's being compared
    const comparisonTargets = this.extractComparisonTargets(query.text);

    if (comparisonTargets.length >= 2) {
      const comparisonSection = await this.templateGenerator.formatComparison(
        comparisonTargets,
        analysis.domain,
        analysis.userLevel
      );
      sections.push({
        title: 'Comparison Approach',
        content: comparisonSection,
        type: 'overview'
      });
    }

    return sections;
  }

  private async generateImplementationGuidance(query: UserQuery, analysis: QueryAnalysis): Promise<GuidanceSection[]> {
    const sections: GuidanceSection[] = [];

    // Find implementation-focused specifications
    const implementationSpecs = await this.knowledgeBase.getImplementationGuidanceForTopic(analysis.domain);

    if (implementationSpecs.length > 0) {
      const implementationSection = await this.templateGenerator.formatImplementationGuidance(
        implementationSpecs.slice(0, 3),
        analysis.domain,
        analysis.userLevel
      );
      sections.push({
        title: 'Implementation Approach',
        content: implementationSection,
        type: 'implementation'
      });
    }

    return sections;
  }

  private async generateTroubleshootingGuidance(query: UserQuery, analysis: QueryAnalysis): Promise<GuidanceSection[]> {
    const sections: GuidanceSection[] = [];

    // Generate troubleshooting approach
    const troubleshootingSection = await this.templateGenerator.formatTroubleshootingGuidance(
      analysis.domain,
      analysis.concepts,
      analysis.userLevel
    );
    sections.push({
      title: 'Troubleshooting Approach',
      content: troubleshootingSection,
      type: 'tips'
    });

    return sections;
  }

  private async generateEvolutionGuidance(query: UserQuery, analysis: QueryAnalysis): Promise<GuidanceSection[]> {
    const sections: GuidanceSection[] = [];

    // Generate evolution analysis
    const evolutionSection = await this.templateGenerator.formatEvolutionGuidance(
      analysis.domain,
      analysis.concepts,
      analysis.userLevel
    );
    sections.push({
      title: 'Evolution Analysis',
      content: evolutionSection,
      type: 'overview'
    });

    return sections;
  }

  private async generateGenericGuidance(query: UserQuery, analysis: QueryAnalysis): Promise<GuidanceSection[]> {
    const sections: GuidanceSection[] = [];

    // Provide general guidance
    const generalSection = await this.templateGenerator.formatGeneralGuidance(
      query.text,
      analysis.domain,
      analysis.userLevel
    );
    sections.push({
      title: 'Research Guidance',
      content: generalSection,
      type: 'overview'
    });

    return sections;
  }

  private generateSummary(sections: GuidanceSection[], analysis: QueryAnalysis): string {
    const sectionTitles = sections.map(s => s.title.toLowerCase());

    let summary = `Research guidance for ${analysis.domain}`;

    if (sectionTitles.includes('relevant specifications')) {
      summary += ' with specific specification recommendations';
    }

    if (sectionTitles.includes('search strategy')) {
      summary += ' and targeted search strategy';
    }

    if (sectionTitles.includes('learning path')) {
      summary += ' including structured learning approach';
    }

    summary += `. Guidance adapted for ${analysis.userLevel} level understanding.`;

    return summary;
  }

  private async generateNextSteps(analysis: QueryAnalysis): Promise<string[]> {
    const nextSteps: string[] = [];

    switch (analysis.intent) {
      case 'discovery':
        nextSteps.push('Review suggested specifications in the recommended order');
        nextSteps.push('Search 3GPP.org using the provided keywords');
        nextSteps.push('Start with architectural overview documents');
        break;

      case 'learning':
        nextSteps.push('Begin with the foundational concepts identified');
        nextSteps.push('Progress through specifications in suggested sequence');
        nextSteps.push('Create your own summary notes and diagrams');
        break;

      case 'implementation':
        nextSteps.push('Study implementation requirements in detail');
        nextSteps.push('Create technical design based on specification guidance');
        nextSteps.push('Plan testing strategy for implementation validation');
        break;

      default:
        nextSteps.push('Follow the provided research strategy');
        nextSteps.push('Dive deeper into the most relevant specifications');
        nextSteps.push('Consider asking more specific follow-up questions');
    }

    return nextSteps;
  }

  private async generateRelatedTopics(analysis: QueryAnalysis): Promise<string[]> {
    const relatedTopics: string[] = [];

    // Domain-specific related topics
    const topicMap = {
      'authentication': ['Identity management', 'Key derivation', 'Privacy protection', 'Security architecture'],
      'mobility': ['Handover optimization', 'Load balancing', 'Network selection', 'Roaming procedures'],
      'session_management': ['QoS management', 'Bearer control', 'Data routing', 'Service continuity'],
      'security': ['Encryption algorithms', 'Key management', 'Attack mitigation', 'Privacy mechanisms'],
      'protocol': ['Message flows', 'State machines', 'Error handling', 'Interoperability'],
      'architecture': ['Network functions', 'Interface design', 'Deployment strategies', 'Scalability']
    };

    const domainTopics = topicMap[analysis.domain as keyof typeof topicMap];
    if (domainTopics) {
      relatedTopics.push(...domainTopics);
    }

    // Add general 3GPP topics if no specific domain topics found
    if (relatedTopics.length === 0) {
      relatedTopics.push('3GPP release evolution', 'Implementation best practices', 'Testing methodologies', 'Compliance requirements');
    }

    return relatedTopics.slice(0, 4); // Limit to 4 related topics
  }

  private extractComparisonTargets(text: string): string[] {
    const targets: string[] = [];

    // Extract specification IDs
    const specMatches = text.match(/\bts\s*\d{2}\.\d{3}\b/gi);
    if (specMatches) {
      targets.push(...specMatches);
    }

    // Extract technology names
    const techMatches = text.match(/\b(4g|5g|lte|nr|eps|5gs)\b/gi);
    if (techMatches) {
      targets.push(...techMatches);
    }

    // Extract release names
    const relMatches = text.match(/\brel-?\d{2}\b/gi);
    if (relMatches) {
      targets.push(...relMatches);
    }

    return [...new Set(targets.map(t => t.toUpperCase()))];
  }
}