import { GuidanceEngine } from '../utils/guidance-engine';

export class ResearchPatternsResource {
  private guidanceEngine: GuidanceEngine;

  constructor(guidanceEngine: GuidanceEngine) {
    this.guidanceEngine = guidanceEngine;
  }

  getDefinition() {
    return {
      uri: '3gpp://knowledge/research-patterns',
      name: 'Research Methodology Patterns',
      description: 'Common research methodologies and patterns for effective 3GPP specification study',
      mimeType: 'text/markdown'
    };
  }

  async getContent() {
    const patterns = this.guidanceEngine['knowledgeBase'].getAllPatterns();

    let content = `# 3GPP Research Methodology Patterns

## Research Approach Philosophy
Effective 3GPP research follows systematic patterns that build understanding progressively from architecture to implementation.

`;

    for (const [name, pattern] of patterns) {
      content += `## ${pattern.name}\n\n`;
      content += `**Description**: ${pattern.description}\n\n`;
      content += `**When to Use**: ${pattern.applicableFor.join(', ')}\n\n`;
      content += `**Time Estimate**: ${pattern.timeEstimate}\n\n`;

      content += `### Methodology Steps:\n`;
      pattern.steps.forEach(step => {
        content += `#### ${step.phase}\n`;
        content += `**Tasks**: ${step.tasks.join(', ')}\n`;
        content += `**Deliverables**: ${step.deliverables.join(', ')}\n`;
        content += `**Tips**: ${step.tips.join(', ')}\n\n`;
      });

      content += `**Expected Outputs**: ${pattern.expectedOutputs.join(', ')}\n\n`;
      content += `**Common Pitfalls**: ${pattern.commonPitfalls.join(', ')}\n\n`;
      content += `---\n\n`;
    }

    return {
      contents: [
        {
          uri: '3gpp://knowledge/research-patterns',
          mimeType: 'text/markdown',
          text: content
        }
      ]
    };
  }
}