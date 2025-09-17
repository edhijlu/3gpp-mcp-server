import {
  SpecificationMetadata,
  ExpertiseLevel,
  SearchPattern,
  ProtocolMetadata
} from '../types/guidance';
import { KnowledgeBase } from './knowledge-base';

export class TemplateGenerator {
  private knowledgeBase: KnowledgeBase;

  constructor(knowledgeBase: KnowledgeBase) {
    this.knowledgeBase = knowledgeBase;
  }

  async initialize(): Promise<void> {
    console.log('Template Generator initialized');
  }

  async formatSpecificationSuggestions(
    specs: SpecificationMetadata[],
    domain: string,
    userLevel: ExpertiseLevel
  ): Promise<string> {
    let output = `Based on your interest in **${domain}**, I recommend these specifications:\n\n`;

    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i];
      const priority = i === 0 ? 'PRIMARY' : i === 1 ? 'IMPORTANT' : 'REFERENCE';

      output += `### ${priority}: ${spec.id} - ${spec.title}\n`;
      output += `**Series:** ${spec.series} | **Release:** ${spec.release} | **Working Group:** ${spec.workingGroup}\n\n`;
      output += `**Purpose:** ${spec.purpose}\n\n`;

      if (spec.keyTopics.length > 0) {
        output += `**Key Topics:** ${spec.keyTopics.join(', ')}\n\n`;
      }

      if (userLevel === 'beginner' && spec.commonQuestions.length > 0) {
        output += `**Common Questions This Spec Answers:**\n`;
        spec.commonQuestions.slice(0, 2).forEach(q => {
          output += `- ${q}\n`;
        });
        output += '\n';
      }

      if (userLevel !== 'beginner' && spec.implementationNotes.length > 0) {
        output += `**Implementation Considerations:**\n`;
        spec.implementationNotes.slice(0, 2).forEach(note => {
          output += `- ${note}\n`;
        });
        output += '\n';
      }

      output += `**Why This Spec:** ${this.generateRelevanceExplanation(spec, domain)}\n\n`;
      output += '---\n\n';
    }

    // Add search guidance
    output += `### How to Access These Specifications:\n`;
    output += `1. Visit [3GPP.org](https://www.3gpp.org/ftp/Specs/latest/)\n`;
    output += `2. Navigate to the appropriate series (${[...new Set(specs.map(s => s.series))].join(', ')})\n`;
    output += `3. Look for the latest version of each specification\n\n`;

    return output;
  }

  async formatSearchStrategy(pattern: SearchPattern, userLevel: ExpertiseLevel): Promise<string> {
    let output = `## Strategic Approach to ${pattern.domain} Research\n\n`;

    output += `### Recommended Search Terms:\n`;
    pattern.keywords.forEach(keyword => {
      output += `- **"${keyword}"** - Use in 3GPP document searches\n`;
    });
    output += '\n';

    output += `### Focus Areas (Specification Series):\n`;
    const seriesDescriptions = {
      '21': 'Requirements and service descriptions',
      '22': 'Service aspects and requirements',
      '23': 'Technical realization and architecture',
      '24': 'Core network protocols and procedures',
      '25': 'Radio access network protocols',
      '33': 'Security architecture and algorithms',
      '36': 'LTE radio access technology',
      '38': '5G NR radio access technology'
    };

    pattern.series.forEach(series => {
      const description = seriesDescriptions[series as keyof typeof seriesDescriptions] || 'Various technical aspects';
      output += `- **Series ${series}**: ${description}\n`;
    });
    output += '\n';

    output += `### Recommended Reading Order:\n`;
    pattern.readingOrder.forEach((phase, index) => {
      output += `${index + 1}. **${phase.charAt(0).toUpperCase() + phase.slice(1)}**: `;
      output += this.getPhaseDescription(phase);
      output += '\n';
    });
    output += '\n';

    if (userLevel !== 'expert') {
      output += `### Common Mistakes to Avoid:\n`;
      pattern.commonMistakes.forEach(mistake => {
        output += `- ${mistake}\n`;
      });
      output += '\n';
    }

    output += `### Pro Tips for Effective Research:\n`;
    pattern.tips.forEach(tip => {
      output += `- ${tip}\n`;
    });
    output += '\n';

    return output;
  }

  async formatLearningPath(
    domain: string,
    concepts: string[],
    userLevel: ExpertiseLevel
  ): Promise<string> {
    let output = `## Learning Path for ${domain.charAt(0).toUpperCase() + domain.slice(1)}\n\n`;

    // Customize based on user level
    switch (userLevel) {
      case 'beginner':
        output += `### Foundation Level Approach:\n\n`;
        output += `**Start Here:**\n`;
        output += `1. **Understand the Basics** - Learn 3GPP organization and specification structure\n`;
        output += `2. **Get Context** - Understand where ${domain} fits in the overall system\n`;
        output += `3. **Study Architecture** - Learn the high-level design before diving into details\n`;
        output += `4. **Focus on Use Cases** - Understand practical applications\n\n`;
        break;

      case 'intermediate':
        output += `### Intermediate Level Approach:\n\n`;
        output += `**Building on Your Knowledge:**\n`;
        output += `1. **Review Prerequisites** - Ensure solid foundation in related areas\n`;
        output += `2. **Deep Dive into Procedures** - Study detailed protocol flows\n`;
        output += `3. **Understand Interactions** - Learn how ${domain} integrates with other systems\n`;
        output += `4. **Consider Implementation** - Think about practical deployment challenges\n\n`;
        break;

      case 'expert':
        output += `### Expert Level Approach:\n\n`;
        output += `**Advanced Analysis:**\n`;
        output += `1. **Latest Developments** - Focus on recent changes and enhancements\n`;
        output += `2. **Optimization Opportunities** - Identify areas for improvement\n`;
        output += `3. **Cross-System Impact** - Understand broader implications\n`;
        output += `4. **Future Evolution** - Consider upcoming changes and trends\n\n`;
        break;
    }

    // Add concept-specific guidance
    if (concepts.length > 0) {
      output += `### Key Concepts to Master:\n`;
      concepts.slice(0, 5).forEach(concept => {
        output += `- **${concept}**: ${this.getConceptDescription(concept)}\n`;
      });
      output += '\n';
    }

    // Add study methodology
    output += `### Effective Study Methodology:\n`;
    output += `1. **Create Visual Diagrams** - Draw your understanding of processes and relationships\n`;
    output += `2. **Build Glossaries** - Maintain a list of terms and their definitions\n`;
    output += `3. **Practice with Scenarios** - Work through realistic examples\n`;
    output += `4. **Connect the Dots** - Always understand how pieces fit together\n\n`;

    return output;
  }

  async formatLearningSpecifications(
    specs: SpecificationMetadata[],
    userLevel: ExpertiseLevel
  ): Promise<string> {
    let output = `### Learning-Focused Specifications:\n\n`;

    specs.forEach((spec, index) => {
      const studyOrder = ['First', 'Second', 'Third'][index] || 'Additional';

      output += `#### ${studyOrder} Priority: ${spec.id}\n`;
      output += `**${spec.title}**\n\n`;

      output += `**Learning Focus:** ${this.generateLearningFocus(spec, userLevel)}\n\n`;

      if (spec.keyTopics.length > 0) {
        output += `**Essential Topics:** ${spec.keyTopics.slice(0, 3).join(', ')}\n\n`;
      }

      // Add study tips
      output += `**Study Tips:**\n`;
      if (index === 0) {
        output += `- Start with the overview sections to understand scope and purpose\n`;
        output += `- Create a mind map of main concepts before diving into details\n`;
      } else {
        output += `- Connect concepts back to your understanding from previous specifications\n`;
        output += `- Focus on how this specification interacts with others you've studied\n`;
      }
      output += '\n---\n\n';
    });

    return output;
  }

  async formatComparison(
    targets: string[],
    domain: string,
    userLevel: ExpertiseLevel
  ): Promise<string> {
    let output = `## Comparison Approach: ${targets.join(' vs ')}\n\n`;

    output += `### Systematic Comparison Strategy:\n\n`;

    output += `**1. Preparation Phase:**\n`;
    output += `- Gather specifications for each target: ${targets.join(', ')}\n`;
    output += `- Identify the specific aspects you want to compare\n`;
    output += `- Create a comparison framework with key criteria\n\n`;

    output += `**2. Analysis Framework:**\n`;
    output += `- **Functional Differences**: What each does differently\n`;
    output += `- **Technical Approach**: Different implementation strategies\n`;
    output += `- **Performance Implications**: Speed, efficiency, resource usage\n`;
    output += `- **Deployment Considerations**: Real-world implementation differences\n`;

    if (userLevel !== 'beginner') {
      output += `- **Evolution Path**: How one relates to or replaces the other\n`;
      output += `- **Backward Compatibility**: Migration and coexistence considerations\n`;
    }
    output += '\n';

    output += `**3. Key Areas to Compare:**\n`;
    output += this.generateComparisonAreas(targets, domain);

    output += `\n**4. Documentation Strategy:**\n`;
    output += `- Create side-by-side comparison tables\n`;
    output += `- Note advantages and disadvantages of each approach\n`;
    output += `- Identify use cases where one is preferred over others\n\n`;

    return output;
  }

  async formatImplementationGuidance(
    specs: SpecificationMetadata[],
    domain: string,
    userLevel: ExpertiseLevel
  ): Promise<string> {
    let output = `## Implementation Strategy for ${domain}\n\n`;

    output += `### Implementation-Critical Specifications:\n\n`;

    specs.forEach(spec => {
      output += `#### ${spec.id} - ${spec.title}\n`;
      if (spec.implementationNotes.length > 0) {
        output += `**Implementation Focus:**\n`;
        spec.implementationNotes.forEach(note => {
          output += `- ${note}\n`;
        });
        output += '\n';
      }
    });

    output += `### Recommended Implementation Phases:\n\n`;
    output += `**Phase 1: Architecture & Design**\n`;
    output += `- Study architectural requirements from relevant specifications\n`;
    output += `- Design high-level system architecture\n`;
    output += `- Identify external interfaces and dependencies\n`;
    output += `- Plan for scalability and performance requirements\n\n`;

    output += `**Phase 2: Core Implementation**\n`;
    output += `- Implement fundamental procedures and protocols\n`;
    output += `- Focus on must-have features from specifications\n`;
    output += `- Build comprehensive error handling\n`;
    output += `- Create thorough unit tests\n\n`;

    output += `**Phase 3: Integration & Testing**\n`;
    output += `- Integrate with external systems and interfaces\n`;
    output += `- Perform interoperability testing\n`;
    output += `- Conduct performance and stress testing\n`;
    output += `- Validate against specification requirements\n\n`;

    if (userLevel !== 'beginner') {
      output += `**Phase 4: Optimization & Compliance**\n`;
      output += `- Optimize performance based on real-world usage\n`;
      output += `- Ensure full specification compliance\n`;
      output += `- Implement advanced features and edge cases\n`;
      output += `- Prepare for certification and testing\n\n`;
    }

    return output;
  }

  async formatTroubleshootingGuidance(
    domain: string,
    concepts: string[],
    userLevel: ExpertiseLevel
  ): Promise<string> {
    let output = `## Troubleshooting Approach for ${domain}\n\n`;

    output += `### Systematic Diagnosis Strategy:\n\n`;

    output += `**1. Problem Identification:**\n`;
    output += `- Clearly define the symptoms you're observing\n`;
    output += `- Identify which ${domain} components are affected\n`;
    output += `- Determine if the issue is consistent or intermittent\n`;
    output += `- Gather relevant logs and trace information\n\n`;

    output += `**2. Specification Research:**\n`;
    output += `- Identify which specifications govern the problematic behavior\n`;
    output += `- Look for error handling sections in relevant specs\n`;
    output += `- Check for known limitations or implementation guidelines\n`;
    output += `- Review conformance testing requirements\n\n`;

    output += `**3. Common ${domain} Issues:**\n`;
    output += this.generateCommonIssues(domain, concepts);

    output += `**4. Debug Methodology:**\n`;
    output += `- Start with the simplest possible explanation\n`;
    output += `- Use protocol traces to understand message flows\n`;
    output += `- Verify configuration against specification requirements\n`;
    output += `- Test with different scenarios to isolate the problem\n\n`;

    if (userLevel !== 'beginner') {
      output += `**5. Advanced Diagnostics:**\n`;
      output += `- Analyze timing and sequence issues\n`;
      output += `- Check for race conditions and edge cases\n`;
      output += `- Verify interoperability with different implementations\n`;
      output += `- Consider performance and resource constraints\n\n`;
    }

    return output;
  }

  async formatEvolutionGuidance(
    domain: string,
    concepts: string[],
    userLevel: ExpertiseLevel
  ): Promise<string> {
    let output = `## Evolution Analysis: ${domain}\n\n`;

    output += `### Understanding 3GPP Evolution Patterns:\n\n`;

    output += `**Evolution Methodology:**\n`;
    output += `1. **Release Timeline Analysis** - Track when features were introduced\n`;
    output += `2. **Backward Compatibility** - Understand migration requirements\n`;
    output += `3. **Deprecation Patterns** - Identify what gets replaced\n`;
    output += `4. **Future Roadmap** - Anticipate upcoming changes\n\n`;

    output += `### Key Evolution Aspects in ${domain}:\n\n`;

    // Generate domain-specific evolution guidance
    const evolutionAspects = this.generateEvolutionAspects(domain);
    evolutionAspects.forEach(aspect => {
      output += `**${aspect.title}:**\n`;
      output += `${aspect.description}\n\n`;
    });

    output += `### Research Strategy for Evolution Analysis:\n`;
    output += `1. **Compare Consecutive Releases** - Study Rel-N vs Rel-N+1 changes\n`;
    output += `2. **Identify Driver Technologies** - Understand what motivated changes\n`;
    output += `3. **Map Implementation Impact** - Consider deployment implications\n`;
    output += `4. **Study Migration Guides** - Look for official migration documentation\n\n`;

    if (userLevel !== 'beginner') {
      output += `### Advanced Evolution Analysis:\n`;
      output += `- **Cross-Working Group Impact** - How changes affect multiple areas\n`;
      output += `- **Market Driver Analysis** - Understanding commercial motivations\n`;
      output += `- **Technology Convergence** - How different tech trends merge\n`;
      output += `- **Standards Competition** - How 3GPP competes with other standards\n\n`;
    }

    return output;
  }

  async formatGeneralGuidance(
    query: string,
    domain: string,
    userLevel: ExpertiseLevel
  ): Promise<string> {
    let output = `## Research Guidance for: "${query}"\n\n`;

    output += `### Recommended Approach:\n\n`;

    output += `**1. Clarify Your Objective:**\n`;
    output += `- Are you looking to understand concepts or implement solutions?\n`;
    output += `- Do you need comprehensive coverage or specific details?\n`;
    output += `- What's your timeline and depth requirements?\n\n`;

    output += `**2. Start with Architecture:**\n`;
    output += `- Begin with high-level system architecture documents\n`;
    output += `- Understand how ${domain} fits into the bigger picture\n`;
    output += `- Identify key interfaces and relationships\n\n`;

    output += `**3. Progressive Deep Dive:**\n`;
    output += `- Move from general concepts to specific procedures\n`;
    output += `- Study message flows and protocol interactions\n`;
    output += `- Focus on implementation-relevant details\n\n`;

    output += `### Effective 3GPP Research Tips:\n`;
    output += `- **Use Multiple Sources**: Don't rely on a single specification\n`;
    output += `- **Create Visual Aids**: Draw diagrams to understand relationships\n`;
    output += `- **Track Dependencies**: Understand prerequisite knowledge\n`;
    output += `- **Stay Current**: Check for latest specification versions\n\n`;

    return output;
  }

  private generateRelevanceExplanation(spec: SpecificationMetadata, domain: string): string {
    if (spec.keyTopics.some(topic => topic.toLowerCase().includes(domain.toLowerCase()))) {
      return `Directly addresses ${domain} with comprehensive coverage of key concepts and procedures.`;
    }

    if (spec.purpose.toLowerCase().includes(domain.toLowerCase())) {
      return `Essential specification that defines fundamental ${domain} architecture and requirements.`;
    }

    return `Provides important context and related functionality for ${domain} implementations.`;
  }

  private getPhaseDescription(phase: string): string {
    const descriptions = {
      'architecture': 'High-level system design and overall structure',
      'procedures': 'Detailed protocol flows and message sequences',
      'implementation': 'Practical coding and deployment guidance',
      'optimization': 'Performance tuning and advanced features',
      'validation': 'Testing strategies and compliance verification'
    };

    return descriptions[phase as keyof typeof descriptions] || 'Study this area thoroughly';
  }

  private getConceptDescription(concept: string): string {
    const descriptions = {
      'NAS': 'Non-Access Stratum - Core network signaling protocol',
      'RRC': 'Radio Resource Control - Radio access network control protocol',
      'SUCI': 'Subscription Concealed Identifier - Privacy-protected subscriber ID',
      'SUPI': 'Subscription Permanent Identifier - Permanent subscriber identity',
      '5G-AKA': '5G Authentication and Key Agreement - Primary 5G auth method',
      'PDU': 'Protocol Data Unit - Data packet structure in network protocols',
      'QOS': 'Quality of Service - Network performance guarantees',
      'HANDOVER': 'Process of transferring connections between cells',
      'AUTHENTICATION': 'Process of verifying user or device identity'
    };

    return descriptions[concept.toUpperCase() as keyof typeof descriptions] || 'Important 3GPP concept';
  }

  private generateLearningFocus(spec: SpecificationMetadata, userLevel: ExpertiseLevel): string {
    if (userLevel === 'beginner') {
      return `Understand the basic purpose and main concepts. Focus on "what" and "why" before "how".`;
    }

    if (userLevel === 'intermediate') {
      return `Study detailed procedures and message flows. Understand implementation requirements.`;
    }

    return `Analyze optimization opportunities, edge cases, and advanced features. Consider integration challenges.`;
  }

  private generateComparisonAreas(targets: string[], domain: string): string {
    let output = '';

    // Technology comparison
    if (targets.some(t => ['4G', 'LTE', '5G', 'NR'].includes(t.toUpperCase()))) {
      output += `- **Technology Generation**: Architecture and capability differences\n`;
      output += `- **Performance Characteristics**: Speed, latency, efficiency\n`;
      output += `- **Deployment Requirements**: Infrastructure and migration needs\n`;
    }

    // Specification comparison
    if (targets.some(t => t.match(/TS\s*\d{2}\.\d{3}/i))) {
      output += `- **Functional Scope**: What each specification covers\n`;
      output += `- **Technical Approach**: Different implementation strategies\n`;
      output += `- **Dependency Relationships**: How specifications relate to each other\n`;
    }

    // Release comparison
    if (targets.some(t => t.match(/Rel-?\d{2}/i))) {
      output += `- **Feature Evolution**: New capabilities introduced\n`;
      output += `- **Backward Compatibility**: Migration and coexistence\n`;
      output += `- **Implementation Impact**: Changes to existing systems\n`;
    }

    return output || `- **Functional Differences**: Core capability variations\n- **Technical Approach**: Implementation strategies\n- **Use Case Suitability**: Best application scenarios\n`;
  }

  private generateCommonIssues(domain: string, concepts: string[]): string {
    const issueMap = {
      'authentication': [
        'Authentication vector mismatches',
        'Key derivation failures',
        'Identity privacy violations',
        'Timing synchronization problems'
      ],
      'mobility': [
        'Handover failures and dropped calls',
        'Cell selection/reselection issues',
        'Tracking area update problems',
        'Load balancing inefficiencies'
      ],
      'session_management': [
        'PDU session establishment failures',
        'QoS flow configuration errors',
        'Bearer context mismatches',
        'Service continuity problems'
      ],
      'security': [
        'Encryption/decryption failures',
        'Key management errors',
        'Algorithm negotiation issues',
        'Security context corruption'
      ]
    };

    const issues = issueMap[domain as keyof typeof issueMap] || [
      'Configuration mismatches',
      'Protocol version incompatibilities',
      'Resource exhaustion problems',
      'Timing and sequence errors'
    ];

    let output = '';
    issues.forEach(issue => {
      output += `- **${issue}**: Check specification requirements and implementation details\n`;
    });

    return output;
  }

  private generateEvolutionAspects(domain: string): Array<{title: string, description: string}> {
    const aspectMap = {
      'authentication': [
        {
          title: 'Privacy Enhancement',
          description: 'Evolution from clear-text IMSI to encrypted SUCI for identity protection'
        },
        {
          title: 'Algorithm Modernization',
          description: 'Migration from EPS-AKA to 5G-AKA with enhanced security features'
        }
      ],
      'mobility': [
        {
          title: 'Handover Optimization',
          description: 'Enhanced handover procedures with beam management and dual connectivity'
        },
        {
          title: 'Network Selection',
          description: 'Evolution from cell-based to network slice-aware mobility'
        }
      ],
      'session_management': [
        {
          title: 'Bearer to PDU Session',
          description: 'Fundamental shift from bearer concept to more flexible PDU sessions'
        },
        {
          title: 'QoS Evolution',
          description: 'Enhanced QoS framework with flow-based management'
        }
      ]
    };

    return aspectMap[domain as keyof typeof aspectMap] || [
      {
        title: 'Architectural Evolution',
        description: 'General evolution from previous generation technologies'
      },
      {
        title: 'Performance Enhancement',
        description: 'Improvements in efficiency, speed, and resource utilization'
      }
    ];
  }
}