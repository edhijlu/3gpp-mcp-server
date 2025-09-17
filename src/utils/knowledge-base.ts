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

    await this.loadSpecifications();
    await this.loadProtocols();
    await this.loadConcepts();
    await this.loadResearchPatterns();
    await this.buildRelationships();

    this.initialized = true;
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
      },

      // === CHARGING AND BILLING SPECIFICATIONS ===

      // Charging Architecture and Principles
      {
        id: 'TS 32.240',
        title: 'Charging architecture and principles',
        series: '32',
        release: 'Rel-17',
        workingGroup: 'SA5',
        purpose: 'Defines common principles and logical architecture for charging across all 3GPP domains and services',
        keyTopics: ['Charging Architecture', 'Online Charging', 'Offline Charging', 'Charging Principles', 'CTF', 'CDF'],
        dependencies: [],
        relatedSpecs: ['TS 32.251', 'TS 32.255', 'TS 32.290', 'TS 32.299'],
        searchKeywords: ['charging', 'billing', 'CTF', 'CDF', 'OCS', 'OFCS', 'charging architecture'],
        commonQuestions: [
          'What is the 3GPP charging architecture?',
          'What is the difference between online and offline charging?',
          'What is a CTF and CDF?',
          'How does charging work across different domains?'
        ],
        implementationNotes: [
          'Implement charging trigger functions (CTF)',
          'Support both online and offline charging',
          'Handle charging data collection',
          'Implement proper CDR generation'
        ],
        evolutionNotes: 'Foundation specification that defines charging principles used across all 3GPP generations'
      },

      // PS Domain Charging (4G)
      {
        id: 'TS 32.251',
        title: 'Packet Switched (PS) domain charging',
        series: '32',
        release: 'Rel-16',
        workingGroup: 'SA5',
        purpose: 'Defines offline and online charging for 4G/LTE packet switched services',
        keyTopics: ['PS Charging', 'LTE Charging', 'Bearer Charging', 'PCRF', 'PGW Charging', 'SGW Charging'],
        dependencies: ['TS 32.240', 'TS 23.401'],
        relatedSpecs: ['TS 32.299', 'TS 23.203', 'TS 29.212'],
        searchKeywords: ['PS charging', 'LTE charging', 'bearer charging', 'PGW', 'SGW', 'PCRF', 'Gx', 'Gy', 'Gz'],
        commonQuestions: [
          'How does 4G LTE charging work?',
          'What is bearer-based charging?',
          'How does policy control affect charging?',
          'What are Gy and Gz interfaces?'
        ],
        implementationNotes: [
          'Implement bearer-based charging',
          'Support policy control integration',
          'Handle volume and time-based charging',
          'Implement proper CDR correlation'
        ],
        evolutionNotes: 'Enhanced from 3G charging with bearer concept and policy control integration'
      },

      // 5G Data Connectivity Domain Charging
      {
        id: 'TS 32.255',
        title: '5G data connectivity domain charging',
        series: '32',
        release: 'Rel-17',
        workingGroup: 'SA5',
        purpose: 'Defines charging for 5G data connectivity including PDU sessions and QoS flows',
        keyTopics: ['5G Charging', 'PDU Session Charging', 'QoS Flow Charging', 'Network Slice Charging', 'SMF Charging'],
        dependencies: ['TS 32.240', 'TS 23.501', 'TS 32.290'],
        relatedSpecs: ['TS 32.290', 'TS 23.502', 'TS 29.512'],
        searchKeywords: ['5G charging', 'PDU session', 'QoS flow', 'network slice', 'SMF', 'UPF', 'Nchf'],
        commonQuestions: [
          'How does 5G charging differ from 4G?',
          'What is PDU session charging?',
          'How are QoS flows charged?',
          'How does network slicing affect charging?'
        ],
        implementationNotes: [
          'Implement PDU session-based charging',
          'Support QoS flow differentiation',
          'Handle network slice charging',
          'Implement service-based charging interfaces'
        ],
        evolutionNotes: 'Evolution from bearer-based to PDU session-based charging with enhanced granularity'
      },

      // 5G Service Based Interface Charging
      {
        id: 'TS 32.290',
        title: '5G system; Services, operations and procedures of charging using Service Based Interface (SBI)',
        series: '32',
        release: 'Rel-17',
        workingGroup: 'SA5',
        purpose: 'Defines converged charging system using 5G Service Based Interface architecture',
        keyTopics: ['Converged Charging', 'CHF', 'Service Based Charging', 'Nchf Interface', 'Charging Services'],
        dependencies: ['TS 32.240', 'TS 23.501'],
        relatedSpecs: ['TS 32.291', 'TS 29.594', 'TS 32.255'],
        searchKeywords: ['converged charging', 'CHF', 'Nchf', 'SBI charging', '5G charging', 'service based'],
        commonQuestions: [
          'What is converged charging in 5G?',
          'How does CHF work?',
          'What is the Nchf interface?',
          'How does service-based charging differ from traditional charging?'
        ],
        implementationNotes: [
          'Implement converged online/offline charging',
          'Support HTTP/2 based charging interfaces',
          'Handle service-based architecture patterns',
          'Implement RESTful charging APIs'
        ],
        evolutionNotes: 'Revolutionary change from Diameter-based to HTTP/2 REST-based charging architecture'
      },

      // 5G Charging using SBI
      {
        id: 'TS 32.291',
        title: '5G system; Charging service; Stage 3',
        series: '32',
        release: 'Rel-17',
        workingGroup: 'SA5',
        purpose: 'Defines detailed stage 3 specification for 5G charging service implementation',
        keyTopics: ['Charging Service Implementation', 'OpenAPI', 'HTTP/2 Charging', 'JSON Charging Records'],
        dependencies: ['TS 32.290', 'TS 29.500'],
        relatedSpecs: ['TS 32.290', 'TS 29.594'],
        searchKeywords: ['charging service', 'OpenAPI', 'HTTP/2', 'JSON CDR', 'stage 3', 'implementation'],
        commonQuestions: [
          'How to implement 5G charging service?',
          'What are the OpenAPI specifications for charging?',
          'How are JSON charging records structured?',
          'What are the HTTP/2 charging procedures?'
        ],
        implementationNotes: [
          'Follow OpenAPI specifications exactly',
          'Implement proper HTTP/2 handling',
          'Support JSON-based charging records',
          'Handle service discovery for charging'
        ]
      },

      // Diameter Charging Applications
      {
        id: 'TS 32.299',
        title: 'Diameter charging applications',
        series: '32',
        release: 'Rel-16',
        workingGroup: 'SA5',
        purpose: 'Defines Diameter-based online and offline charging applications for 3GPP networks',
        keyTopics: ['Diameter Charging', 'Ro Interface', 'Rf Interface', 'AVP', 'CCR', 'CCA'],
        dependencies: ['TS 32.240'],
        relatedSpecs: ['TS 32.251', 'TS 32.255', 'RFC 6733'],
        searchKeywords: ['Diameter', 'Ro', 'Rf', 'CCR', 'CCA', 'AVP', 'online charging', 'offline charging'],
        commonQuestions: [
          'How does Diameter charging work?',
          'What are Ro and Rf interfaces?',
          'What are CCR and CCA messages?',
          'How are AVPs structured in charging?'
        ],
        implementationNotes: [
          'Implement Diameter protocol stack',
          'Support Ro (online) and Rf (offline) applications',
          'Handle proper AVP encoding/decoding',
          'Implement credit control procedures'
        ],
        evolutionNotes: 'Evolution from RADIUS to Diameter with enhanced AVP structure and procedures'
      },

      // Policy and Charging Control Architecture (4G)
      {
        id: 'TS 23.203',
        title: 'Policy and charging control architecture',
        series: '23',
        release: 'Rel-15',
        workingGroup: 'SA2',
        purpose: 'Defines policy control and charging architecture for 4G EPS networks',
        keyTopics: ['Policy Control', 'PCRF', 'PCEF', 'OCS', 'SPR', 'Gx Interface', 'Gy Interface'],
        dependencies: ['TS 23.401'],
        relatedSpecs: ['TS 29.212', 'TS 29.214', 'TS 32.251'],
        searchKeywords: ['policy control', 'PCRF', 'PCEF', 'Gx', 'Gy', 'Rx', 'policy rules', 'charging control'],
        commonQuestions: [
          'How does policy control work in 4G?',
          'What is the role of PCRF?',
          'How does policy affect charging?',
          'What are Gx and Gy interfaces?'
        ],
        implementationNotes: [
          'Implement PCRF functionality',
          'Support dynamic policy rules',
          'Handle charging control integration',
          'Implement proper interface procedures'
        ]
      },

      // 5G Policy Control Function Interface
      {
        id: 'TS 29.513',
        title: '5G System; Policy and Charging Control signalling flows and QoS parameter mapping',
        series: '29',
        release: 'Rel-16',
        workingGroup: 'CT3',
        purpose: 'Defines policy and charging control signalling for 5G systems',
        keyTopics: ['5G Policy Control', 'PCF', 'Npcf Interface', 'QoS Control', 'Charging Control'],
        dependencies: ['TS 23.501', 'TS 29.500'],
        relatedSpecs: ['TS 29.514', 'TS 32.255'],
        searchKeywords: ['Npcf', 'PCF', '5G policy', 'QoS control', 'charging control', 'policy rules'],
        commonQuestions: [
          'How does 5G policy control work?',
          'What is the Npcf interface?',
          'How does PCF control charging?',
          'What are 5G policy rules?'
        ],
        implementationNotes: [
          'Implement service-based policy control',
          'Support HTTP/2 based Npcf interface',
          'Handle QoS and charging integration',
          'Implement RESTful policy APIs'
        ],
        evolutionNotes: 'Evolution from Diameter-based PCRF to HTTP/2-based PCF with enhanced capabilities'
      },

      // 5G Policy Control Function
      {
        id: 'TS 29.514',
        title: '5G System; Policy Authorization Service; Stage 3',
        series: '29',
        release: 'Rel-16',
        workingGroup: 'CT3',
        purpose: 'Defines detailed implementation of 5G Policy Control Function services',
        keyTopics: ['Policy Authorization', 'PCF Services', 'Session Management Policy', 'Access Mobility Policy'],
        dependencies: ['TS 29.513', 'TS 29.500'],
        relatedSpecs: ['TS 29.512', 'TS 32.290'],
        searchKeywords: ['policy authorization', 'PCF services', 'session policy', 'mobility policy', 'stage 3'],
        commonQuestions: [
          'How to implement PCF services?',
          'What are the PCF authorization procedures?',
          'How does session management policy work?',
          'What are access and mobility policies?'
        ],
        implementationNotes: [
          'Implement all PCF service operations',
          'Support policy decision algorithms',
          'Handle session and mobility policies',
          'Implement proper authorization procedures'
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
      },

      // === CHARGING AND BILLING PROTOCOLS ===

      {
        name: 'CHF',
        fullName: 'Charging Function',
        layer: 'Application',
        purpose: '5G converged charging system that unifies online and offline charging capabilities',
        definingSpecs: ['TS 32.290', 'TS 32.291'],
        relatedProtocols: ['PCF', 'SMF', 'AMF'],
        procedures: [
          {
            name: 'Charging Data Request',
            description: 'Request charging information for network events',
            triggerConditions: ['Session establishment', 'QoS change', 'Handover', 'Session termination'],
            keySteps: ['Charging request', 'Quota allocation', 'Usage monitoring', 'Charging response'],
            relatedProcedures: ['Session Management', 'Policy Control'],
            commonIssues: ['Quota exhaustion', 'Charging data inconsistency', 'Service interruption'],
            debuggingTips: ['Check CHF service status', 'Verify charging records', 'Monitor quota usage']
          },
          {
            name: 'Converged Charging',
            description: 'Unified online and offline charging process',
            triggerConditions: ['Any chargeable event', 'Service usage', 'Network resource consumption'],
            keySteps: ['Event detection', 'Charging data collection', 'Rating', 'Balance update', 'CDR generation'],
            relatedProcedures: ['Policy Control', 'QoS Management'],
            commonIssues: ['Rating failures', 'Balance synchronization', 'CDR correlation'],
            debuggingTips: ['Verify rating rules', 'Check balance updates', 'Analyze CDR sequences']
          }
        ],
        commonUseCases: ['Real-time charging', 'Postpaid billing', 'Quota management', 'Service monetization'],
        troubleshootingAreas: ['Charging failures', 'Quota issues', 'Rating problems', 'CDR generation errors']
      },

      {
        name: 'OCS',
        fullName: 'Online Charging System',
        layer: 'Application',
        purpose: 'Real-time charging system that controls service access based on account balance',
        definingSpecs: ['TS 32.240', 'TS 32.299'],
        relatedProtocols: ['PCRF', 'PCEF', 'PGW'],
        procedures: [
          {
            name: 'Credit Control',
            description: 'Real-time credit authorization and monitoring',
            triggerConditions: ['Service request', 'Quota threshold', 'Service termination'],
            keySteps: ['Credit request', 'Balance check', 'Quota grant', 'Usage monitoring', 'Final report'],
            relatedProcedures: ['Session Management', 'Service Control'],
            commonIssues: ['Credit exhaustion', 'Quota management', 'Service interruption'],
            debuggingTips: ['Check account balance', 'Monitor quota usage', 'Verify credit control messages']
          },
          {
            name: 'Balance Management',
            description: 'Account balance tracking and updates',
            triggerConditions: ['Service usage', 'Recharge', 'Billing cycle'],
            keySteps: ['Usage collection', 'Rating', 'Balance deduction', 'Threshold monitoring'],
            relatedProcedures: ['Credit Control', 'Billing'],
            commonIssues: ['Balance inconsistency', 'Rating errors', 'Synchronization problems'],
            debuggingTips: ['Audit balance changes', 'Verify rating calculations', 'Check synchronization logs']
          }
        ],
        commonUseCases: ['Prepaid services', 'Real-time billing', 'Service control', 'Fraud prevention'],
        troubleshootingAreas: ['Credit control failures', 'Balance issues', 'Service blocking', 'Rating problems']
      },

      {
        name: 'PCRF',
        fullName: 'Policy and Charging Rules Function',
        layer: 'Application',
        purpose: '4G policy control and charging rules management for EPC networks',
        definingSpecs: ['TS 23.203', 'TS 29.212'],
        relatedProtocols: ['PCEF', 'OCS', 'SPR'],
        procedures: [
          {
            name: 'Policy Control',
            description: 'Dynamic policy rule creation and enforcement',
            triggerConditions: ['Session establishment', 'Service request', 'Network conditions'],
            keySteps: ['Policy decision', 'Rule generation', 'Rule installation', 'Rule enforcement'],
            relatedProcedures: ['Charging Control', 'QoS Management'],
            commonIssues: ['Policy conflicts', 'Rule installation failures', 'Enforcement errors'],
            debuggingTips: ['Check policy rules', 'Verify rule installation', 'Monitor enforcement actions']
          },
          {
            name: 'Charging Control',
            description: 'Integration between policy and charging systems',
            triggerConditions: ['Policy rule activation', 'Service usage', 'Quota events'],
            keySteps: ['Charging rule creation', 'OCS interaction', 'Quota monitoring', 'Policy enforcement'],
            relatedProcedures: ['Policy Control', 'Credit Control'],
            commonIssues: ['Charging rule errors', 'OCS communication', 'Quota synchronization'],
            debuggingTips: ['Verify charging rules', 'Check OCS connectivity', 'Monitor quota status']
          }
        ],
        commonUseCases: ['Dynamic policy enforcement', 'Service differentiation', 'Charging control', 'QoS management'],
        troubleshootingAreas: ['Policy rule issues', 'Charging integration', 'Service quality problems', 'Rule conflicts']
      },

      {
        name: 'PCF',
        fullName: 'Policy Control Function',
        layer: 'Application',
        purpose: '5G policy control function that manages policies and charging for service-based architecture',
        definingSpecs: ['TS 29.513', 'TS 29.514'],
        relatedProtocols: ['CHF', 'SMF', 'AMF'],
        procedures: [
          {
            name: 'Policy Authorization',
            description: '5G policy decision and authorization process',
            triggerConditions: ['PDU session establishment', 'Policy change', 'Network slice selection'],
            keySteps: ['Policy request', 'Context analysis', 'Policy decision', 'Authorization response'],
            relatedProcedures: ['Session Management', 'Charging Control'],
            commonIssues: ['Authorization failures', 'Policy conflicts', 'Context errors'],
            debuggingTips: ['Check policy context', 'Verify authorization rules', 'Analyze decision logic']
          },
          {
            name: 'Session Management Policy',
            description: 'PDU session-specific policy control',
            triggerConditions: ['Session request', 'QoS change', 'Network conditions'],
            keySteps: ['Session analysis', 'Policy selection', 'Rule creation', 'Policy enforcement'],
            relatedProcedures: ['QoS Management', 'Charging Control'],
            commonIssues: ['Session policy errors', 'QoS conflicts', 'Rule enforcement'],
            debuggingTips: ['Verify session policies', 'Check QoS parameters', 'Monitor rule enforcement']
          }
        ],
        commonUseCases: ['5G policy control', 'Network slicing policies', 'Service-based charging', 'QoS management'],
        troubleshootingAreas: ['Policy authorization', 'Session management', 'Charging integration', 'Service quality']
      },

      {
        name: 'DIAMETER',
        fullName: 'Diameter Protocol',
        layer: 'Application',
        purpose: 'AAA protocol used for charging and policy control in 3GPP networks',
        definingSpecs: ['TS 32.299', 'RFC 6733'],
        relatedProtocols: ['PCRF', 'OCS', 'HSS'],
        procedures: [
          {
            name: 'Credit Control Request',
            description: 'Diameter-based credit control messaging for charging',
            triggerConditions: ['Service start', 'Interim update', 'Service end'],
            keySteps: ['CCR message creation', 'AVP population', 'Message transmission', 'CCA processing'],
            relatedProcedures: ['Session Management', 'Accounting'],
            commonIssues: ['Message format errors', 'AVP encoding issues', 'Session state conflicts'],
            debuggingTips: ['Validate message format', 'Check AVP values', 'Monitor session state']
          },
          {
            name: 'Accounting',
            description: 'Diameter accounting for offline charging',
            triggerConditions: ['Accounting start', 'Interim accounting', 'Accounting stop'],
            keySteps: ['ACR creation', 'Usage data collection', 'Message transmission', 'ACA processing'],
            relatedProcedures: ['Credit Control', 'Session Management'],
            commonIssues: ['Accounting record loss', 'Data inconsistency', 'Message correlation'],
            debuggingTips: ['Check accounting records', 'Verify data integrity', 'Trace message flow']
          }
        ],
        commonUseCases: ['Online charging', 'Offline charging', 'Policy control', 'Authentication'],
        troubleshootingAreas: ['Message format issues', 'Protocol state errors', 'Connection problems', 'AVP encoding']
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
      },

      // === CHARGING AND BILLING CONCEPTS ===

      {
        name: 'CHF',
        fullName: 'Charging Function',
        category: 'Network Function',
        description: '5G network function providing converged online and offline charging services',
        purpose: 'Unify charging operations in 5G service-based architecture with HTTP/2 REST APIs',
        relatedConcepts: ['Converged Charging', 'Nchf', 'CDR', 'Quota Management'],
        specifications: ['TS 32.290', 'TS 32.291'],
        evolutionFrom: 'OCS/OFCS',
        usageContext: ['5G charging', 'Service-based charging', 'Network slicing charging']
      },

      {
        name: 'Converged Charging',
        fullName: 'Converged Online and Offline Charging',
        category: 'Architecture',
        description: '5G charging approach that unifies online and offline charging in a single system',
        purpose: 'Simplify charging architecture and enable flexible charging models',
        relatedConcepts: ['CHF', 'Online Charging', 'Offline Charging', 'CDR'],
        specifications: ['TS 32.290', 'TS 32.240'],
        evolutionFrom: 'Separate Online/Offline Systems',
        usageContext: ['5G networks', 'Service monetization', 'Real-time billing']
      },

      {
        name: 'CDR',
        fullName: 'Call Detail Record',
        category: 'Billing',
        description: 'Structured record containing details of network service usage for billing purposes',
        purpose: 'Provide detailed usage information for billing, analytics, and regulatory compliance',
        relatedConcepts: ['Charging', 'Billing', 'Usage Monitoring', 'Rating'],
        specifications: ['TS 32.240', 'TS 32.251', 'TS 32.255'],
        usageContext: ['Offline charging', 'Billing systems', 'Revenue assurance', 'Analytics']
      },

      {
        name: 'Quota Management',
        fullName: 'Service Quota Management',
        category: 'Charging Control',
        description: 'Real-time monitoring and control of service usage against allocated quotas',
        purpose: 'Enable prepaid services and prevent service abuse through usage limits',
        relatedConcepts: ['Online Charging', 'Credit Control', 'Balance Management', 'Service Control'],
        specifications: ['TS 32.240', 'TS 32.299'],
        usageContext: ['Prepaid services', 'Service control', 'Fraud prevention', 'Resource management']
      },

      {
        name: 'Rating',
        fullName: 'Service Rating and Tariffing',
        category: 'Billing',
        description: 'Process of applying tariff rules to convert usage measurements into monetary charges',
        purpose: 'Transform technical usage data into billable amounts based on tariff plans',
        relatedConcepts: ['Tariff', 'Billing', 'Usage', 'Charging'],
        specifications: ['TS 32.240', 'TS 32.296'],
        usageContext: ['Billing systems', 'Revenue calculation', 'Price plan application']
      },

      {
        name: 'Ro Interface',
        fullName: 'Diameter Ro Interface',
        category: 'Interface',
        description: 'Diameter-based interface between network elements and Online Charging System',
        purpose: 'Enable real-time credit control and online charging for prepaid services',
        relatedConcepts: ['Online Charging', 'Diameter', 'Credit Control', 'OCS'],
        specifications: ['TS 32.299'],
        evolutionFrom: 'RADIUS interfaces',
        usageContext: ['Online charging', 'Prepaid services', 'Real-time billing']
      },

      {
        name: 'Rf Interface',
        fullName: 'Diameter Rf Interface',
        category: 'Interface',
        description: 'Diameter-based interface for offline charging data collection',
        purpose: 'Transport charging records from network elements to charging systems',
        relatedConcepts: ['Offline Charging', 'Diameter', 'CDR', 'Accounting'],
        specifications: ['TS 32.299'],
        evolutionFrom: 'GTP\' interfaces',
        usageContext: ['Offline charging', 'CDR collection', 'Postpaid billing']
      },

      {
        name: 'Nchf Interface',
        fullName: '5G Charging Function Interface',
        category: 'Interface',
        description: 'HTTP/2 REST-based interface for 5G converged charging services',
        purpose: 'Provide service-based charging interface in 5G networks',
        relatedConcepts: ['CHF', 'Service Based Interface', 'HTTP/2', 'REST API'],
        specifications: ['TS 32.290', 'TS 29.594'],
        evolutionFrom: 'Diameter Ro/Rf',
        usageContext: ['5G charging', 'Service-based architecture', 'Cloud-native charging']
      },

      {
        name: 'OCS',
        fullName: 'Online Charging System',
        category: 'System',
        description: 'Real-time charging system that authorizes service usage based on account balance',
        purpose: 'Enable prepaid services and real-time spending control',
        relatedConcepts: ['Credit Control', 'Balance Management', 'Quota Management', 'Ro Interface'],
        specifications: ['TS 32.240', 'TS 32.299'],
        usageContext: ['Prepaid services', 'Real-time billing', 'Service control']
      },

      {
        name: 'OFCS',
        fullName: 'Offline Charging System',
        category: 'System',
        description: 'Post-processing charging system that collects and processes usage records for billing',
        purpose: 'Generate bills for postpaid services based on collected usage data',
        relatedConcepts: ['CDR', 'Billing', 'Usage Collection', 'Rf Interface'],
        specifications: ['TS 32.240', 'TS 32.299'],
        usageContext: ['Postpaid services', 'Billing generation', 'Usage analytics']
      },

      {
        name: 'PCRF',
        fullName: 'Policy and Charging Rules Function',
        category: 'Network Function',
        description: '4G network function that manages policy rules and charging control',
        purpose: 'Provide dynamic policy control and integrate with charging systems',
        relatedConcepts: ['Policy Control', 'QoS', 'Charging Control', 'Gx Interface'],
        specifications: ['TS 23.203', 'TS 29.212'],
        evolutionFrom: 'Static policy systems',
        usageContext: ['4G networks', 'Policy enforcement', 'Dynamic QoS', 'Charging control']
      },

      {
        name: 'PCF',
        fullName: 'Policy Control Function',
        category: 'Network Function',
        description: '5G network function providing policy decisions and charging control',
        purpose: 'Enable dynamic policy control in service-based 5G architecture',
        relatedConcepts: ['Policy Control', 'Service Based Architecture', 'Npcf Interface', 'Charging Control'],
        specifications: ['TS 29.513', 'TS 29.514'],
        evolutionFrom: 'PCRF',
        usageContext: ['5G networks', 'Network slicing', 'Service-based policy', 'Dynamic charging']
      },

      {
        name: 'Session-Based Charging',
        fullName: 'Session-Based Charging Model',
        category: 'Charging Model',
        description: 'Charging approach where costs are associated with communication sessions',
        purpose: 'Enable charging based on session establishment, duration, and resource usage',
        relatedConcepts: ['PDU Session', 'Bearer', 'Session Management', 'Time-based Charging'],
        specifications: ['TS 32.240', 'TS 32.255'],
        usageContext: ['Voice calls', 'Data sessions', 'Application sessions']
      },

      {
        name: 'Event-Based Charging',
        fullName: 'Event-Based Charging Model',
        category: 'Charging Model',
        description: 'Charging approach where costs are associated with specific network events',
        purpose: 'Enable charging for discrete services and transactions',
        relatedConcepts: ['Charging Events', 'Transaction Charging', 'Service Events'],
        specifications: ['TS 32.240'],
        usageContext: ['SMS', 'Location services', 'Content downloads', 'API calls']
      },

      {
        name: 'Volume-Based Charging',
        fullName: 'Volume-Based Charging Model',
        category: 'Charging Model',
        description: 'Charging approach based on data volume consumption',
        purpose: 'Enable charging proportional to data usage',
        relatedConcepts: ['Data Usage', 'Quota Management', 'Usage Monitoring'],
        specifications: ['TS 32.251', 'TS 32.255'],
        usageContext: ['Data services', 'Internet access', 'Content streaming']
      },

      {
        name: 'Network Slice Charging',
        fullName: '5G Network Slice Charging',
        category: 'Charging Model',
        description: 'Specialized charging for 5G network slices with different service characteristics',
        purpose: 'Enable differentiated charging based on network slice properties and SLAs',
        relatedConcepts: ['Network Slicing', 'Service Differentiation', 'SLA Charging', 'Slice SLA'],
        specifications: ['TS 32.255', 'TS 28.530'],
        evolutionFrom: 'Service-based charging',
        usageContext: ['5G networks', 'Enterprise services', 'IoT services', 'Edge computing']
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
      },

      // === CHARGING AND BILLING RESEARCH PATTERNS ===

      {
        name: 'Charging Architecture Analysis',
        description: 'Comprehensive approach to understanding 3GPP charging systems and architectures',
        applicableFor: ['Charging system design', 'Billing implementation', 'Revenue assurance', 'System integration'],
        steps: [
          {
            phase: 'Foundation',
            tasks: ['Study TS 32.240 charging principles', 'Understand online vs offline charging', 'Learn charging data flow'],
            deliverables: ['Charging architecture overview', 'System component mapping'],
            tips: ['Start with charging principles', 'Focus on data flows', 'Understand business requirements']
          },
          {
            phase: 'Technology Deep-dive',
            tasks: ['Study generation-specific specs (4G: TS 32.251, 5G: TS 32.255)', 'Analyze interface specifications', 'Understand protocol details'],
            deliverables: ['Technical specifications understanding', 'Interface documentation'],
            tips: ['Compare 4G vs 5G charging', 'Focus on your target generation', 'Study interface message flows']
          },
          {
            phase: 'Implementation Planning',
            tasks: ['Design charging data collection', 'Plan rating and billing integration', 'Define CDR structures'],
            deliverables: ['Implementation architecture', 'Integration specifications'],
            tips: ['Consider scalability', 'Plan for regulatory compliance', 'Design for revenue assurance']
          }
        ],
        expectedOutputs: ['Complete charging system understanding', 'Implementation roadmap', 'Integration architecture'],
        commonPitfalls: ['Ignoring business requirements', 'Not understanding rating complexities', 'Missing regulatory requirements'],
        timeEstimate: '4-8 weeks for comprehensive analysis'
      },

      {
        name: 'Policy Control Integration',
        description: 'Systematic approach to understanding policy control and charging integration',
        applicableFor: ['Policy system implementation', 'Dynamic charging', 'QoS management', 'Service differentiation'],
        steps: [
          {
            phase: 'Policy Architecture',
            tasks: ['Study policy architecture (4G: TS 23.203, 5G: PCF)', 'Understand policy decision points', 'Learn charging integration'],
            deliverables: ['Policy architecture understanding', 'Integration points mapping'],
            tips: ['Focus on policy-charging integration', 'Understand dynamic rule creation', 'Study interface specifications']
          },
          {
            phase: 'Implementation Design',
            tasks: ['Design policy rules engine', 'Plan charging control integration', 'Define service differentiation'],
            deliverables: ['Policy engine design', 'Charging integration plan'],
            tips: ['Consider rule conflicts', 'Plan for real-time decisions', 'Design for scalability']
          }
        ],
        expectedOutputs: ['Policy control understanding', 'Charging integration design', 'Service differentiation plan'],
        commonPitfalls: ['Policy rule conflicts', 'Poor charging integration', 'Performance issues'],
        timeEstimate: '3-6 weeks for complete understanding'
      },

      {
        name: '5G Charging Migration',
        description: 'Structured approach to understanding and implementing 5G charging evolution',
        applicableFor: ['5G charging implementation', 'Legacy system migration', 'Converged charging', 'Service-based architecture'],
        steps: [
          {
            phase: 'Evolution Understanding',
            tasks: ['Compare 4G vs 5G charging models', 'Study converged charging concept', 'Understand CHF architecture'],
            deliverables: ['Evolution analysis', 'Migration requirements'],
            tips: ['Focus on key differences', 'Understand business benefits', 'Study service-based architecture impact']
          },
          {
            phase: 'Technical Analysis',
            tasks: ['Study TS 32.290 and TS 32.291', 'Understand HTTP/2 vs Diameter', 'Learn JSON vs AVP structures'],
            deliverables: ['Technical specification understanding', 'Protocol comparison'],
            tips: ['Compare interface protocols', 'Understand data format changes', 'Study OpenAPI specifications']
          },
          {
            phase: 'Migration Planning',
            tasks: ['Plan coexistence scenarios', 'Design migration phases', 'Define testing strategies'],
            deliverables: ['Migration roadmap', 'Coexistence architecture', 'Testing plan'],
            tips: ['Plan gradual migration', 'Ensure service continuity', 'Design comprehensive testing']
          }
        ],
        expectedOutputs: ['5G charging understanding', 'Migration strategy', 'Implementation roadmap'],
        commonPitfalls: ['Underestimating complexity', 'Poor migration planning', 'Inadequate testing'],
        timeEstimate: '6-10 weeks for complete migration planning'
      },

      {
        name: 'Billing System Integration',
        description: 'Comprehensive approach to integrating 3GPP charging with billing systems',
        applicableFor: ['Billing system design', 'CDR processing', 'Revenue assurance', 'Regulatory compliance'],
        steps: [
          {
            phase: 'Requirements Analysis',
            tasks: ['Define billing requirements', 'Study regulatory compliance', 'Understand revenue assurance needs'],
            deliverables: ['Business requirements', 'Compliance matrix'],
            tips: ['Engage business stakeholders', 'Study local regulations', 'Consider fraud prevention']
          },
          {
            phase: 'Data Flow Design',
            tasks: ['Design CDR collection', 'Plan data validation', 'Define rating integration'],
            deliverables: ['Data flow architecture', 'Validation rules', 'Rating integration'],
            tips: ['Ensure data integrity', 'Plan for high volumes', 'Design error handling']
          },
          {
            phase: 'System Integration',
            tasks: ['Implement CDR processing', 'Integrate rating systems', 'Build revenue assurance'],
            deliverables: ['Integrated billing system', 'Revenue assurance system'],
            tips: ['Test thoroughly', 'Monitor performance', 'Ensure scalability']
          }
        ],
        expectedOutputs: ['Integrated billing system', 'Revenue assurance capability', 'Compliance framework'],
        commonPitfalls: ['Data quality issues', 'Performance problems', 'Compliance gaps'],
        timeEstimate: '8-16 weeks depending on complexity'
      },

      {
        name: 'Charging Troubleshooting',
        description: 'Systematic approach to diagnosing and resolving charging system issues',
        applicableFor: ['System troubleshooting', 'Performance optimization', 'Issue resolution', 'System monitoring'],
        steps: [
          {
            phase: 'Issue Identification',
            tasks: ['Collect symptoms and logs', 'Identify affected systems', 'Categorize issue type'],
            deliverables: ['Issue description', 'Affected systems list'],
            tips: ['Gather complete information', 'Check multiple systems', 'Look for patterns']
          },
          {
            phase: 'Root Cause Analysis',
            tasks: ['Analyze charging data flows', 'Check interface connections', 'Verify configuration'],
            deliverables: ['Root cause identification', 'Impact analysis'],
            tips: ['Follow data flows', 'Check all integration points', 'Verify recent changes']
          },
          {
            phase: 'Resolution and Prevention',
            tasks: ['Implement fixes', 'Test resolution', 'Implement monitoring'],
            deliverables: ['Issue resolution', 'Prevention measures'],
            tips: ['Test thoroughly', 'Monitor for recurrence', 'Update procedures']
          }
        ],
        expectedOutputs: ['Resolved issues', 'Improved monitoring', 'Prevention procedures'],
        commonPitfalls: ['Incomplete diagnosis', 'Poor testing', 'Recurring issues'],
        timeEstimate: '1-4 weeks depending on issue complexity'
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

    // === CHARGING AND BILLING RELATIONSHIPS ===

    // Core charging architecture relationships
    this.addRelationship('TS 32.251', 'TS 32.240', 'uses', 0.9, '4G PS charging uses common charging principles');
    this.addRelationship('TS 32.255', 'TS 32.240', 'uses', 0.9, '5G charging uses common charging principles');
    this.addRelationship('TS 32.290', 'TS 32.240', 'uses', 0.9, '5G SBI charging uses common charging principles');
    this.addRelationship('TS 32.291', 'TS 32.290', 'implements', 0.95, 'Stage 3 implements SBI charging procedures');
    this.addRelationship('TS 32.299', 'TS 32.240', 'implements', 0.85, 'Diameter charging implements common principles');

    // Evolution relationships
    this.addRelationship('TS 32.255', 'TS 32.251', 'extends', 0.8, '5G charging extends 4G PS charging concepts');
    this.addRelationship('TS 32.290', 'TS 32.299', 'replaces', 0.7, '5G SBI charging replaces Diameter-based charging');

    // Policy control and charging integration
    this.addRelationship('TS 23.203', 'TS 32.251', 'uses', 0.8, '4G policy control integrates with PS charging');
    this.addRelationship('TS 29.513', 'TS 32.255', 'uses', 0.8, '5G policy control integrates with 5G charging');
    this.addRelationship('TS 29.514', 'TS 29.513', 'implements', 0.9, 'PCF stage 3 implements policy procedures');

    // Architecture dependencies
    this.addRelationship('TS 32.255', 'TS 23.501', 'depends_on', 0.9, '5G charging depends on 5G system architecture');
    this.addRelationship('TS 32.290', 'TS 23.501', 'depends_on', 0.9, '5G SBI charging depends on service-based architecture');
    this.addRelationship('TS 32.251', 'TS 23.401', 'depends_on', 0.9, '4G PS charging depends on EPS architecture');

    // Interface specifications
    this.addRelationship('TS 32.299', 'TS 32.251', 'defines', 0.8, 'Diameter charging defines PS domain interfaces');
    this.addRelationship('TS 32.291', 'TS 29.594', 'uses', 0.7, '5G charging uses common data types');

    // Cross-generation relationships
    this.addRelationship('TS 29.513', 'TS 23.203', 'extends', 0.7, '5G policy extends 4G policy concepts');
    this.addRelationship('TS 29.514', 'TS 29.212', 'extends', 0.6, '5G PCF extends 4G PCRF capabilities');
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
      },

      // === CHARGING AND BILLING SEARCH PATTERNS ===

      {
        domain: 'charging',
        keywords: ['charging', 'billing', 'CDR', 'rating', 'tariff', 'quota', 'balance', 'revenue'],
        series: ['32', '23', '29'],
        startingSpecs: ['TS 32.240', 'TS 32.299'],
        readingOrder: ['architecture', 'principles', 'interfaces', 'implementation'],
        commonMistakes: ['Ignoring business requirements', 'Not understanding rating complexity', 'Missing data integrity'],
        tips: ['Start with charging principles', 'Understand business models', 'Focus on data flow integrity', 'Consider scalability from start']
      },

      {
        domain: 'online_charging',
        keywords: ['online charging', 'OCS', 'credit control', 'prepaid', 'real-time', 'Ro', 'CCR', 'CCA', 'quota'],
        series: ['32'],
        startingSpecs: ['TS 32.240', 'TS 32.299'],
        readingOrder: ['charging_architecture', 'diameter_applications', 'credit_control_procedures'],
        commonMistakes: ['Poor quota management', 'Not handling credit exhaustion', 'Ignoring fraud scenarios'],
        tips: ['Focus on real-time aspects', 'Understand credit control flows', 'Study quota management', 'Plan for high availability']
      },

      {
        domain: 'offline_charging',
        keywords: ['offline charging', 'OFCS', 'CDR', 'billing', 'postpaid', 'Rf', 'accounting', 'usage records'],
        series: ['32'],
        startingSpecs: ['TS 32.240', 'TS 32.299', 'TS 32.251'],
        readingOrder: ['charging_architecture', 'cdr_formats', 'collection_procedures'],
        commonMistakes: ['CDR data loss', 'Poor correlation', 'Missing usage data', 'Inadequate validation'],
        tips: ['Ensure CDR integrity', 'Plan for high volumes', 'Design proper correlation', 'Implement data validation']
      },

      {
        domain: '5g_charging',
        keywords: ['5G charging', 'CHF', 'converged charging', 'Nchf', 'HTTP/2', 'JSON CDR', 'service-based'],
        series: ['32', '29'],
        startingSpecs: ['TS 32.290', 'TS 32.291'],
        readingOrder: ['5g_architecture', 'converged_charging', 'sbi_interfaces', 'implementation'],
        commonMistakes: ['Ignoring migration complexity', 'Not understanding HTTP/2', 'Poor JSON handling'],
        tips: ['Study service-based architecture', 'Understand converged charging benefits', 'Compare with 4G charging', 'Focus on cloud-native aspects']
      },

      {
        domain: 'policy_charging',
        keywords: ['policy control', 'PCRF', 'PCF', 'dynamic charging', 'QoS', 'service differentiation', 'Gx', 'Npcf'],
        series: ['23', '29'],
        startingSpecs: ['TS 23.203', 'TS 29.513'],
        readingOrder: ['policy_architecture', 'charging_integration', 'dynamic_procedures'],
        commonMistakes: ['Policy rule conflicts', 'Poor charging integration', 'Not considering real-time requirements'],
        tips: ['Understand policy-charging relationship', 'Study dynamic rule creation', 'Focus on integration points', 'Consider performance impacts']
      },

      {
        domain: 'diameter_charging',
        keywords: ['Diameter', 'AVP', 'CCR', 'CCA', 'ACR', 'ACA', 'Ro', 'Rf', 'credit control', 'accounting'],
        series: ['32'],
        startingSpecs: ['TS 32.299'],
        readingOrder: ['diameter_basics', 'charging_applications', 'message_flows'],
        commonMistakes: ['AVP encoding errors', 'Session state issues', 'Poor error handling'],
        tips: ['Master Diameter protocol basics', 'Understand AVP structure', 'Study session management', 'Focus on error scenarios']
      },

      {
        domain: 'network_slice_charging',
        keywords: ['network slice charging', 'slice differentiation', 'SLA charging', 'service-based charging', '5G slicing'],
        series: ['32', '28'],
        startingSpecs: ['TS 32.255', 'TS 28.530'],
        readingOrder: ['slicing_architecture', 'charging_differentiation', 'sla_management'],
        commonMistakes: ['Not understanding slice characteristics', 'Poor SLA mapping', 'Missing differentiation logic'],
        tips: ['Study network slicing basics', 'Understand service differentiation', 'Focus on SLA requirements', 'Design flexible charging models']
      },

      {
        domain: 'charging_integration',
        keywords: ['billing integration', 'BSS integration', 'revenue assurance', 'mediation', 'rating engine'],
        series: ['32'],
        startingSpecs: ['TS 32.240'],
        readingOrder: ['integration_architecture', 'data_flows', 'validation_procedures'],
        commonMistakes: ['Data quality issues', 'Poor error handling', 'Inadequate monitoring'],
        tips: ['Focus on data integrity', 'Design robust error handling', 'Plan comprehensive monitoring', 'Consider regulatory requirements']
      }
    ];
  }
}