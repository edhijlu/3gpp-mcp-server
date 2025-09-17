import { GuidanceEngine } from '../utils/guidance-engine';

export class ProtocolMappingResource {
  private guidanceEngine: GuidanceEngine;

  constructor(guidanceEngine: GuidanceEngine) {
    this.guidanceEngine = guidanceEngine;
  }

  getDefinition() {
    return {
      uri: '3gpp://knowledge/protocols',
      name: 'Protocol Relationship Mapping',
      description: 'Protocol relationship mapping and guidance for NAS, RRC, PDCP, and other 3GPP protocols',
      mimeType: 'text/markdown'
    };
  }

  async getContent() {
    const protocols = this.guidanceEngine['knowledgeBase'].getAllProtocols();

    let content = `# 3GPP Protocol Relationship Mapping

## Protocol Stack Overview

### Non-Access Stratum (NAS)
- **Purpose**: Communication between UE and core network
- **Key Protocols**: 5G NAS (TS 24.501), EPS NAS (TS 24.301)
- **Main Functions**: Authentication, session management, mobility

### Radio Resource Control (RRC)
- **Purpose**: Control of radio resources and UE connections
- **Key Protocols**: 5G RRC (TS 38.331), LTE RRC (TS 36.331)
- **Main Functions**: Connection management, mobility, measurements

## Protocol Relationships

`;

    for (const [name, protocol] of protocols) {
      content += `### ${protocol.fullName} (${name})\n`;
      content += `- **Layer**: ${protocol.layer}\n`;
      content += `- **Purpose**: ${protocol.purpose}\n`;
      content += `- **Defining Specs**: ${protocol.definingSpecs.join(', ')}\n`;
      content += `- **Related Protocols**: ${protocol.relatedProtocols.join(', ')}\n`;
      content += `- **Common Use Cases**: ${protocol.commonUseCases.join(', ')}\n\n`;
    }

    return {
      contents: [
        {
          uri: '3gpp://knowledge/protocols',
          mimeType: 'text/markdown',
          text: content
        }
      ]
    };
  }
}