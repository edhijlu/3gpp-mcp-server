import {
  SpecificationMetadata,
  ProtocolMetadata,
  ConceptMetadata,
  ResearchPattern,
  SearchPattern,
  KnowledgeGraph,
  Relationship,
  RelationshipType
} from '../types/guidance';

export class KnowledgeBase {
  private knowledgeGraph: KnowledgeGraph;
  private initialized = false;

  constructor() {
    this.knowledgeGraph = {
      specifications: new Map(),
      protocols: new Map(),
      concepts: new Map(),
      patterns: new Map(),
      relationships: new Map()
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('Initializing 3GPP Knowledge Base...');

    await this.loadSpecifications();
    await this.loadProtocols();
    await this.loadConcepts();
    await this.loadResearchPatterns();
    await this.buildRelationships();

    this.initialized = true;
    console.log(`Knowledge Base initialized with ${this.knowledgeGraph.specifications.size} specifications`);
  }

  // Core retrieval methods
  getSpecification(id: string): SpecificationMetadata | undefined {
    return this.knowledgeGraph.specifications.get(id);
  }

  getProtocol(name: string): ProtocolMetadata | undefined {
    return this.knowledgeGraph.protocols.get(name.toUpperCase());
  }

  getConcept(name: string): ConceptMetadata | undefined {
    return this.knowledgeGraph.concepts.get(name.toUpperCase());
  }

  getPattern(name: string): ResearchPattern | undefined {
    return this.knowledgeGraph.patterns.get(name);
  }

  getAllProtocols(): Map<string, ProtocolMetadata> {
    return this.knowledgeGraph.protocols;
  }

  getAllPatterns(): Map<string, ResearchPattern> {
    return this.knowledgeGraph.patterns;
  }

  // Guidance-specific methods
  async suggestSpecificationsForTopic(topic: string): Promise<SpecificationMetadata[]> {
    const suggestions: SpecificationMetadata[] = [];
    const topicLower = topic.toLowerCase();

    for (const spec of this.knowledgeGraph.specifications.values()) {
      let relevance = 0;

      // Check title match
      if (spec.title.toLowerCase().includes(topicLower)) relevance += 0.8;

      // Check key topics
      for (const keyTopic of spec.keyTopics) {
        if (keyTopic.toLowerCase().includes(topicLower)) relevance += 0.6;
      }

      // Check search keywords
      for (const keyword of spec.searchKeywords) {
        if (keyword.toLowerCase().includes(topicLower)) relevance += 0.4;
      }

      // Check purpose
      if (spec.purpose.toLowerCase().includes(topicLower)) relevance += 0.5;

      if (relevance > 0.3) {
        suggestions.push(spec);
      }
    }

    return suggestions.sort((a, b) => this.calculateRelevance(b, topic) - this.calculateRelevance(a, topic));
  }

  async getRelatedSpecifications(specId: string): Promise<SpecificationMetadata[]> {
    const relationships = this.knowledgeGraph.relationships.get(specId) || [];
    const related: SpecificationMetadata[] = [];

    for (const rel of relationships) {
      const spec = this.knowledgeGraph.specifications.get(rel.target);
      if (spec) {
        related.push(spec);
      }
    }

    return related.sort((a, b) => {
      const relA = relationships.find(r => r.target === a.id)?.strength || 0;
      const relB = relationships.find(r => r.target === b.id)?.strength || 0;
      return relB - relA;
    });
  }

  async getSearchPatternForDomain(domain: string): Promise<SearchPattern | undefined> {
    const searchPatterns = this.getSearchPatterns();
    return searchPatterns.find(pattern =>
      pattern.domain.toLowerCase() === domain.toLowerCase() ||
      pattern.keywords.some(keyword => keyword.toLowerCase().includes(domain.toLowerCase()))
    );
  }

  async getImplementationGuidanceForTopic(topic: string): Promise<SpecificationMetadata[]> {
    const specs = await this.suggestSpecificationsForTopic(topic);
    return specs.filter(spec => spec.implementationNotes.length > 0);
  }

  // Private initialization methods
  private async loadSpecifications(): Promise<void> {
    const specifications: SpecificationMetadata[] = [
      // 5G NAS Protocols
      {
        id: 'TS 24.501',
        title: '5G System (5GS) Non-Access-Stratum (NAS) protocol',
        series: '24',
        release: 'Rel-16',
        workingGroup: 'CT1',
        purpose: 'Defines the NAS protocol for 5G systems including registration, session management, and mobility',
        keyTopics: ['5G NAS', 'Registration', 'Session Management', 'Authentication', 'Security Mode'],
        dependencies: ['TS 33.501', 'TS 23.501'],
        relatedSpecs: ['TS 24.301', 'TS 33.501', 'TS 29.518'],
        searchKeywords: ['5GS', 'NAS', '5G-AKA', 'SUCI', 'SUPI', 'Registration', 'PDU Session'],
        commonQuestions: [
          'How does 5G authentication work?',
          'What is SUCI and how is it different from IMSI?',
          'How do 5G registration procedures work?',
          'What are PDU sessions in 5G?'
        ],
        implementationNotes: [
          'Implement SUCI encryption for identity protection',
          'Support both 5G-AKA and EAP-AKA\' authentication',
          'Handle service-based architecture interactions',
          'Implement proper security context management'
        ],
        evolutionNotes: 'Major evolution from TS 24.301 with enhanced security, service-based architecture, and network slicing support'
      },

      // 4G NAS Protocols
      {
        id: 'TS 24.301',
        title: 'Non-Access-Stratum (NAS) protocol for Evolved Packet System (EPS)',
        series: '24',
        release: 'Rel-15',
        workingGroup: 'CT1',
        purpose: 'Defines the NAS protocol for 4G LTE systems including attach, authentication, and mobility',
        keyTopics: ['EPS NAS', 'Attach', 'Authentication', 'Tracking Area Update', 'Bearer Management'],
        dependencies: ['TS 33.401', 'TS 23.401'],
        relatedSpecs: ['TS 24.501', 'TS 33.401', 'TS 29.274'],
        searchKeywords: ['EPS', 'LTE', 'NAS', 'EPS-AKA', 'IMSI', 'Attach', 'Bearer'],
        commonQuestions: [
          'How does LTE attach procedure work?',
          'What is EPS-AKA authentication?',
          'How does bearer management work in LTE?',
          'What are the differences between EMM and ESM?'
        ],
        implementationNotes: [
          'Implement proper IMSI handling',
          'Support EPS-AKA authentication procedures',
          'Handle bearer activation and modification',
          'Implement tracking area procedures'
        ]
      },

      // 5G RRC Protocol
      {
        id: 'TS 38.331',
        title: 'NR Radio Resource Control (RRC) protocol specification',
        series: '38',
        release: 'Rel-16',
        workingGroup: 'RAN2',
        purpose: 'Defines the RRC protocol for 5G NR including connection management, mobility, and measurements',
        keyTopics: ['5G RRC', 'Connection Setup', 'Handover', 'Measurements', 'System Information'],
        dependencies: ['TS 38.300', 'TS 38.321'],
        relatedSpecs: ['TS 36.331', 'TS 38.321', 'TS 38.413'],
        searchKeywords: ['NR', '5G RRC', 'gNB', 'Handover', 'Connection Setup', 'SIB', 'Measurements'],
        commonQuestions: [
          'How does 5G RRC connection establishment work?',
          'What are the differences between 4G and 5G RRC?',
          'How do 5G handovers work?',
          'What is beam management in 5G?'
        ],
        implementationNotes: [
          'Implement beam management procedures',
          'Support dual connectivity scenarios',
          'Handle new 5G measurement events',
          'Implement proper RRC state machine'
        ],
        evolutionNotes: 'Evolution from TS 36.331 with beam management, dual connectivity, and enhanced mobility'
      },

      // 5G Security
      {
        id: 'TS 33.501',
        title: 'Security architecture and procedures for 5G System',
        series: '33',
        release: 'Rel-16',
        workingGroup: 'SA3',
        purpose: 'Defines the security architecture, procedures, and algorithms for 5G systems',
        keyTopics: ['5G Security', 'Authentication', 'Key Management', 'Privacy', 'Network Slicing Security'],
        dependencies: ['TS 23.501', 'TS 24.501'],
        relatedSpecs: ['TS 33.401', 'TS 29.518', 'TS 35.208'],
        searchKeywords: ['5G Security', 'SUCI', 'SUPI', '5G-AKA', 'AUSF', 'SEAF', 'Key Derivation'],
        commonQuestions: [
          'How does 5G security architecture work?',
          'What is SUCI and how does it protect privacy?',
          'How are keys derived in 5G?',
          'What security improvements does 5G offer over 4G?'
        ],
        implementationNotes: [
          'Implement SUCI/SUPI conversion',
          'Support enhanced security algorithms',
          'Handle network slicing security',
          'Implement proper key management'
        ],
        evolutionNotes: 'Major security enhancements over TS 33.401 with identity protection and enhanced algorithms'
      },

      // 5G System Architecture
      {
        id: 'TS 23.501',
        title: 'System architecture for the 5G System (5GS)',
        series: '23',
        release: 'Rel-16',
        workingGroup: 'SA2',
        purpose: 'Defines the overall 5G system architecture including network functions and interfaces',
        keyTopics: ['5G Architecture', 'Network Functions', 'Service Based Architecture', 'Network Slicing'],
        dependencies: [],
        relatedSpecs: ['TS 23.502', 'TS 29.500', 'TS 28.530'],
        searchKeywords: ['5GS', 'SBA', 'AMF', 'SMF', 'UPF', 'Network Slicing', 'Service Based'],
        commonQuestions: [
          'What is 5G service-based architecture?',
          'What are the main 5G network functions?',
          'How does network slicing work?',
          'What are the differences between 4G and 5G architecture?'
        ],
        implementationNotes: [
          'Implement service-based interfaces',
          'Support network slicing architecture',
          'Handle cloud-native deployment',
          'Implement proper service discovery'
        ]
      }
    ];

    specifications.forEach(spec => {
      this.knowledgeGraph.specifications.set(spec.id, spec);
    });
  }

  private async loadProtocols(): Promise<void> {
    const protocols: ProtocolMetadata[] = [
      {
        name: 'NAS',
        fullName: 'Non-Access Stratum',
        layer: 'L3',
        purpose: 'Handles communication between UE and core network for mobility and session management',
        definingSpecs: ['TS 24.301', 'TS 24.501'],
        relatedProtocols: ['RRC', 'HTTP/2'],
        procedures: [
          {
            name: 'Authentication',
            description: 'Mutual authentication between UE and network',
            triggerConditions: ['Initial attach', 'Security context update', 'Network request'],
            keySteps: ['Authentication challenge', 'Response computation', 'Verification', 'Key establishment'],
            relatedProcedures: ['Registration', 'Security Mode'],
            commonIssues: ['Authentication failures', 'Key synchronization', 'Identity privacy'],
            debuggingTips: ['Check authentication vectors', 'Verify key derivation', 'Analyze failure causes']
          },
          {
            name: 'Registration',
            description: 'UE registration with the network',
            triggerConditions: ['Power on', 'Area change', 'Periodic update'],
            keySteps: ['Registration request', 'Authentication', 'Security setup', 'Registration completion'],
            relatedProcedures: ['Authentication', 'Session Establishment'],
            commonIssues: ['Registration rejections', 'Timer expiry', 'Network congestion'],
            debuggingTips: ['Check registration cause', 'Verify network capability', 'Analyze reject causes']
          }
        ],
        commonUseCases: ['Device authentication', 'Network registration', 'Session management', 'Mobility management'],
        troubleshootingAreas: ['Authentication failures', 'Registration issues', 'Session problems', 'Security context errors']
      },
      {
        name: 'RRC',
        fullName: 'Radio Resource Control',
        layer: 'L3',
        purpose: 'Controls radio resources and manages UE connections with the radio access network',
        definingSpecs: ['TS 36.331', 'TS 38.331'],
        relatedProtocols: ['NAS', 'PDCP', 'RLC'],
        procedures: [
          {
            name: 'Connection Establishment',
            description: 'Establishes RRC connection between UE and base station',
            triggerConditions: ['Data transmission', 'Signaling need', 'Emergency call'],
            keySteps: ['Connection request', 'Connection setup', 'Connection complete'],
            relatedProcedures: ['Authentication', 'Security Mode'],
            commonIssues: ['Connection failures', 'Resource shortage', 'Random access problems'],
            debuggingTips: ['Check RACH procedures', 'Verify resource availability', 'Analyze failure reasons']
          }
        ],
        commonUseCases: ['Connection management', 'Mobility control', 'Resource allocation', 'Measurement control'],
        troubleshootingAreas: ['Connection failures', 'Handover issues', 'Measurement problems', 'Resource conflicts']
      }
    ];

    protocols.forEach(protocol => {
      this.knowledgeGraph.protocols.set(protocol.name, protocol);
    });
  }

  private async loadConcepts(): Promise<void> {
    const concepts: ConceptMetadata[] = [
      {
        name: 'SUCI',
        fullName: 'Subscription Concealed Identifier',
        category: 'Security',
        description: 'Privacy-preserving identifier that conceals the permanent identifier (SUPI)',
        purpose: 'Protect subscriber privacy by avoiding transmission of permanent identifiers in clear text',
        relatedConcepts: ['SUPI', 'IMSI', 'ECIES'],
        specifications: ['TS 33.501', 'TS 24.501'],
        evolutionFrom: 'IMSI',
        usageContext: ['Initial authentication', 'Identity verification', 'Privacy protection']
      },
      {
        name: 'SUPI',
        fullName: 'Subscription Permanent Identifier',
        category: 'Identity',
        description: 'Permanent subscriber identifier in 5G systems',
        purpose: 'Uniquely identify subscribers in 5G networks',
        relatedConcepts: ['SUCI', 'IMSI', 'NAI'],
        specifications: ['TS 23.501', 'TS 33.501'],
        evolutionFrom: 'IMSI',
        usageContext: ['Subscriber management', 'Authentication', 'Billing']
      },
      {
        name: '5G-AKA',
        fullName: '5G Authentication and Key Agreement',
        category: 'Security',
        description: 'Primary authentication method for 5G systems',
        purpose: 'Provide mutual authentication and establish security keys',
        relatedConcepts: ['EPS-AKA', 'AUSF', 'Authentication Vector'],
        specifications: ['TS 33.501', 'TS 24.501'],
        evolutionFrom: 'EPS-AKA',
        usageContext: ['Initial authentication', 'Re-authentication', 'Key establishment']
      }
    ];

    concepts.forEach(concept => {
      this.knowledgeGraph.concepts.set(concept.name, concept);
    });
  }

  private async loadResearchPatterns(): Promise<void> {
    const patterns: ResearchPattern[] = [
      {
        name: 'Protocol Analysis',
        description: 'Systematic approach to understanding a new 3GPP protocol',
        applicableFor: ['New protocol learning', 'Implementation planning', 'Troubleshooting'],
        steps: [
          {
            phase: 'Overview',
            tasks: ['Read protocol purpose', 'Understand layer position', 'Identify key procedures'],
            deliverables: ['Protocol summary', 'Context understanding'],
            tips: ['Start with architecture specs', 'Use visual diagrams when available']
          },
          {
            phase: 'Deep Dive',
            tasks: ['Study message formats', 'Understand state machines', 'Analyze error conditions'],
            deliverables: ['Detailed understanding', 'Implementation requirements'],
            tips: ['Focus on most common procedures first', 'Create your own diagrams']
          }
        ],
        expectedOutputs: ['Complete protocol understanding', 'Implementation roadmap', 'Testing strategy'],
        commonPitfalls: ['Skipping architectural context', 'Ignoring error conditions', 'Not understanding dependencies'],
        timeEstimate: '2-4 weeks for complex protocols'
      },
      {
        name: 'Security Analysis',
        description: 'Comprehensive approach to understanding 3GPP security features',
        applicableFor: ['Security implementation', 'Vulnerability assessment', 'Compliance checking'],
        steps: [
          {
            phase: 'Architecture',
            tasks: ['Understand security architecture', 'Identify security functions', 'Map trust boundaries'],
            deliverables: ['Security model', 'Threat analysis'],
            tips: ['Start with TS 33.501 for 5G', 'Use security sequence diagrams']
          },
          {
            phase: 'Implementation',
            tasks: ['Study key management', 'Understand algorithms', 'Analyze attack mitigations'],
            deliverables: ['Security requirements', 'Implementation guide'],
            tips: ['Focus on key derivation flows', 'Understand algorithm negotiation']
          }
        ],
        expectedOutputs: ['Security architecture understanding', 'Implementation requirements', 'Security test plan'],
        commonPitfalls: ['Ignoring key management', 'Not understanding algorithm choices', 'Missing privacy requirements'],
        timeEstimate: '3-6 weeks for comprehensive analysis'
      }
    ];

    patterns.forEach(pattern => {
      this.knowledgeGraph.patterns.set(pattern.name, pattern);
    });
  }

  private async buildRelationships(): Promise<void> {
    // Build relationships between specifications
    this.addRelationship('TS 24.501', 'TS 33.501', 'uses', 0.9, '5G NAS uses 5G security procedures');
    this.addRelationship('TS 24.501', 'TS 23.501', 'implements', 0.8, '5G NAS implements 5G architecture');
    this.addRelationship('TS 24.501', 'TS 24.301', 'extends', 0.7, '5G NAS extends 4G NAS concepts');
    this.addRelationship('TS 38.331', 'TS 36.331', 'extends', 0.8, '5G RRC extends 4G RRC');
    this.addRelationship('TS 33.501', 'TS 33.401', 'extends', 0.6, '5G security extends 4G security');
    this.addRelationship('TS 23.501', 'TS 23.401', 'replaces', 0.7, '5G architecture replaces 4G architecture');
  }

  private addRelationship(from: string, to: string, type: RelationshipType, strength: number, description?: string): void {
    if (!this.knowledgeGraph.relationships.has(from)) {
      this.knowledgeGraph.relationships.set(from, []);
    }

    this.knowledgeGraph.relationships.get(from)!.push({
      type,
      target: to,
      strength,
      description
    });

    // Add reverse relationship for bidirectional connections
    if (type === 'uses' || type === 'references') {
      if (!this.knowledgeGraph.relationships.has(to)) {
        this.knowledgeGraph.relationships.set(to, []);
      }

      const reverseType = type === 'uses' ? 'defines' : 'references';
      this.knowledgeGraph.relationships.get(to)!.push({
        type: reverseType as RelationshipType,
        target: from,
        strength: strength * 0.8, // Slightly lower strength for reverse relationships
        description: description ? `Reverse: ${description}` : undefined
      });
    }
  }

  private calculateRelevance(spec: SpecificationMetadata, topic: string): number {
    let relevance = 0;
    const topicLower = topic.toLowerCase();

    // Title relevance (highest weight)
    if (spec.title.toLowerCase().includes(topicLower)) relevance += 0.5;

    // Key topics relevance
    const keyTopicMatches = spec.keyTopics.filter(t => t.toLowerCase().includes(topicLower)).length;
    relevance += (keyTopicMatches / spec.keyTopics.length) * 0.3;

    // Search keywords relevance
    const keywordMatches = spec.searchKeywords.filter(k => k.toLowerCase().includes(topicLower)).length;
    relevance += (keywordMatches / spec.searchKeywords.length) * 0.2;

    return Math.min(relevance, 1.0);
  }

  private getSearchPatterns(): SearchPattern[] {
    return [
      {
        domain: 'authentication',
        keywords: ['authentication', 'AKA', 'SUCI', 'SUPI', 'identity', 'privacy', 'AUSF'],
        series: ['24', '33', '29'],
        startingSpecs: ['TS 33.501', 'TS 24.501'],
        readingOrder: ['architecture', 'procedures', 'implementation'],
        commonMistakes: ['Ignoring privacy requirements', 'Not understanding key derivation'],
        tips: ['Start with security architecture', 'Compare 4G vs 5G approaches', 'Focus on identity protection']
      },
      {
        domain: 'mobility',
        keywords: ['handover', 'mobility', 'tracking area', 'registration area', 'cell selection'],
        series: ['23', '24', '36', '38'],
        startingSpecs: ['TS 23.501', 'TS 38.331'],
        readingOrder: ['architecture', 'procedures', 'optimization'],
        commonMistakes: ['Not considering network slicing impact', 'Ignoring dual connectivity'],
        tips: ['Understand 5G mobility enhancements', 'Study beam management impact', 'Consider network slicing']
      },
      {
        domain: 'session_management',
        keywords: ['PDU session', 'bearer', 'QoS', 'session management', 'data connectivity'],
        series: ['23', '24', '29'],
        startingSpecs: ['TS 23.501', 'TS 24.501'],
        readingOrder: ['architecture', 'procedures', 'QoS_management'],
        commonMistakes: ['Confusing PDU sessions with bearers', 'Not understanding QoS flows'],
        tips: ['Compare with 4G bearer concept', 'Understand QoS flow mapping', 'Study session continuity']
      }
    ];
  }
}