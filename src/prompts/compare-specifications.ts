export class CompareSpecificationsPrompt {

  getDefinition() {
    return {
      name: 'compare_specifications',
      description: 'Template for comparing two specifications with structured analysis of differences and relationships',
      arguments: [
        {
          name: 'spec_a',
          description: 'First specification to compare',
          required: true
        },
        {
          name: 'spec_b',
          description: 'Second specification to compare',
          required: true
        },
        {
          name: 'comparison_aspects',
          description: 'Specific aspects to compare (e.g., functionality, architecture, evolution)',
          required: false
        }
      ]
    };
  }

  async generate(args: any) {
    const specA = args?.spec_a || '[SPECIFICATION_A]';
    const specB = args?.spec_b || '[SPECIFICATION_B]';
    const aspects = args?.comparison_aspects || 'functionality, architecture, evolution';

    const prompt = `Compare 3GPP specifications ${specA} and ${specB}, focusing on: ${aspects}

Structure your comparison as follows:

## Specification Comparison: ${specA} vs ${specB}

### Overview
- Brief description of each specification's purpose
- Target use cases and scope

### Key Differences
- **Functional Scope**: What each specification covers
- **Technical Approach**: Different implementation strategies
- **Architecture Impact**: How each affects system design
- **Evolution Context**: How they relate to previous/future versions

### Detailed Analysis
For each comparison aspect (${aspects}):
- **${specA} Approach**: [Describe approach]
- **${specB} Approach**: [Describe approach]
- **Trade-offs**: [Analyze advantages/disadvantages]

### Implementation Guidance
- When to use each specification
- Migration considerations
- Interoperability requirements
- Best practices for implementation

### Conclusion
- Summary of key insights
- Recommendations for different use cases

Focus on practical insights that help with implementation decisions.`;

    return {
      description: `Template for comparing ${specA} and ${specB}`,
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: prompt
          }
        }
      ]
    };
  }
}