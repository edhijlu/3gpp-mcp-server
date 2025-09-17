export class SeriesKnowledgeResource {

  getDefinition() {
    return {
      uri: '3gpp://knowledge/series',
      name: '3GPP Specification Series Guide',
      description: 'Comprehensive guide to 3GPP specification series (21-38) with descriptions and focus areas',
      mimeType: 'text/markdown'
    };
  }

  async getContent() {
    const content = `# 3GPP Specification Series Guide

## Overview
The 3rd Generation Partnership Project (3GPP) organizes its specifications into numbered series, each covering different aspects of mobile telecommunications systems.

## Specification Series

### Core Network and Protocols (20s)
- **Series 21**: Requirements
- **Series 22**: Service aspects
- **Series 23**: Technical realization and architecture
- **Series 24**: Core network protocols and procedures
- **Series 25**: Radio access network protocols
- **Series 26**: Codecs and media processing
- **Series 27**: Data and charging
- **Series 28**: Network management and orchestration
- **Series 29**: Core network and service interfaces

### Security and Testing (30s)
- **Series 31**: Subscriber Identity Module (SIM/USIM)
- **Series 32**: Telecommunication management and charging
- **Series 33**: Security architecture and procedures
- **Series 34**: Test specifications for UE conformance
- **Series 35**: Cryptographic algorithms and security features
- **Series 36**: LTE (Long Term Evolution) radio access
- **Series 37**: Multiple radio access technologies
- **Series 38**: 5G NR (New Radio) access technology

## How to Use This Guide
1. **Start with Architecture (23.xxx)** - Understand system overview
2. **Move to Protocols (24.xxx, 25.xxx)** - Learn detailed procedures
3. **Add Security (33.xxx)** - Understand protection mechanisms
4. **Validate with Testing (34.xxx)** - Ensure correct implementation

## Finding the Right Series
- **System Architecture**: Series 23
- **Core Network Protocols**: Series 24
- **Radio Protocols**: Series 25 (4G), Series 38 (5G)
- **Security**: Series 33
- **Testing**: Series 34
- **Interfaces**: Series 29`;

    return {
      contents: [
        {
          uri: '3gpp://knowledge/series',
          mimeType: 'text/markdown',
          text: content
        }
      ]
    };
  }
}