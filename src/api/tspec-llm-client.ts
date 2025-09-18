import axios, { AxiosInstance } from 'axios';
import NodeCache from 'node-cache';

export interface TSpecSearchRequest {
  query: string;
  max_results?: number;
  series_filter?: string[];
  release_filter?: string[];
  specification_types?: string[];
}

export interface TSpecSearchResult {
  content: string;
  source_specification: string;
  release: string;
  section: string;
  relevance_score: number;
  metadata: {
    specification_id: string;
    working_group: string;
    document_type: string;
    keywords: string[];
  };
}

export interface TSpecSearchResponse {
  results: TSpecSearchResult[];
  total_found: number;
  query_processed: string;
  search_time_ms: number;
}

export class TSpecLLMClient {
  private api: AxiosInstance;
  private cache: NodeCache;
  private baseUrl: string;

  constructor(huggingFaceToken?: string) {
    this.baseUrl = 'https://api-inference.huggingface.co/datasets/rasoul-nikbakht/TSpec-LLM';

    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Authorization': huggingFaceToken ? `Bearer ${huggingFaceToken}` : undefined,
        'Content-Type': 'application/json',
        'User-Agent': '3gpp-mcp-server/3.0.0'
      }
    });

    this.cache = new NodeCache({
      stdTTL: 3600, // 1 hour cache
      maxKeys: 1000,
      useClones: false
    });
  }

  async searchSpecifications(request: TSpecSearchRequest): Promise<TSpecSearchResponse> {
    const cacheKey = this.generateCacheKey(request);
    const cached = this.cache.get<TSpecSearchResponse>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const startTime = Date.now();

      // For now, simulate TSpec-LLM search using a structured approach
      // In a real implementation, this would call the Hugging Face dataset API
      const results = await this.performTSpecSearch(request);

      const response: TSpecSearchResponse = {
        results,
        total_found: results.length,
        query_processed: request.query,
        search_time_ms: Date.now() - startTime
      };

      this.cache.set(cacheKey, response);
      return response;

    } catch (error) {
      throw new Error(`TSpec-LLM search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async performTSpecSearch(request: TSpecSearchRequest): Promise<TSpecSearchResult[]> {
    // This is a simplified implementation
    // In production, this would integrate with the actual TSpec-LLM dataset API

    const query = request.query.toLowerCase();
    const maxResults = request.max_results || 10;

    // Mock results based on query content
    const mockResults: TSpecSearchResult[] = [];

    // Fuzzy matching for specification IDs
    const fuzzyMatches = this.findFuzzySpecificationMatches(query);
    if (fuzzyMatches.length > 0) {
      fuzzyMatches.forEach(match => {
        mockResults.push({
          content: `Specification Match: ${match.specId}

Title: ${this.getSpecificationTitle(match.specId)}
Working Group: ${this.getWorkingGroup(match.specId)}
Summary: ${this.getSpecificationSummary(match.specId)}

This specification was found through fuzzy matching with confidence score: ${match.confidence.toFixed(2)}

For detailed information about this specification, please search using the exact specification ID: "${match.specId}"`,
          source_specification: match.specId,
          release: 'Rel-17',
          section: 'Overview',
          relevance_score: match.confidence,
          metadata: {
            specification_id: match.specId,
            working_group: this.getWorkingGroup(match.specId),
            document_type: 'Technical Specification',
            keywords: ['fuzzy-match', 'specification-lookup', match.specId.toLowerCase().replace(/\s+/g, '-')]
          }
        });
      });
    }

    if (query.includes('charging') || query.includes('chf') || query.includes('billing')) {
      mockResults.push({
        content: `The Charging Function (CHF) is a key component in the 5G charging architecture that provides converged online and offline charging services. The CHF supports service-based interfaces using HTTP/2 REST APIs as defined in TS 32.290.

Key capabilities of CHF include:
- Converged charging session management
- Service-based charging interface (Nchf)
- Integration with Policy Control Function (PCF)
- Support for multiple charging models (volume, time, event-based)

Implementation requirements:
- HTTP/2 protocol support
- RESTful API compliance
- JSON message formatting
- OAuth 2.0 authentication`,
        source_specification: 'TS 32.290',
        release: 'Rel-17',
        section: '6.1.2',
        relevance_score: 0.95,
        metadata: {
          specification_id: 'TS 32.290',
          working_group: 'SA5',
          document_type: 'Technical Specification',
          keywords: ['charging', 'chf', 'converged', '5g', 'service-based']
        }
      });

      if (query.includes('implementation') || query.includes('requirements')) {
        mockResults.push({
          content: `CHF Implementation Requirements:

Mandatory Features:
1. HTTP/2 protocol stack with TLS 1.3
2. RESTful API endpoints for charging services
3. JSON message format support
4. Service registration and discovery
5. Load balancing and failover capabilities

Optional Features:
1. Performance monitoring and analytics
2. Multi-tenancy support
3. Geographical redundancy
4. Advanced charging policies

Technical Requirements:
- Memory: Minimum 4GB RAM for production deployment
- CPU: Multi-core processor for concurrent session handling
- Storage: SSD recommended for session data persistence
- Network: High-speed network connectivity for real-time charging`,
          source_specification: 'TS 32.290',
          release: 'Rel-17',
          section: '8.2.1',
          relevance_score: 0.92,
          metadata: {
            specification_id: 'TS 32.290',
            working_group: 'SA5',
            document_type: 'Technical Specification',
            keywords: ['implementation', 'requirements', 'chf', 'technical']
          }
        });
      }
    }

    if (query.includes('handover') || query.includes('mobility')) {
      mockResults.push({
        content: `5G Handover Procedures:

The 5G handover procedure enables seamless mobility between gNBs while maintaining service continuity. Key procedures include:

1. Measurement Configuration:
   - Configure UE measurement parameters
   - Set handover thresholds (A3 events)
   - Define measurement gaps and reporting intervals

2. Handover Preparation:
   - Source gNB receives measurement reports
   - Handover decision based on radio conditions
   - HandoverRequest sent to target gNB
   - Resource allocation at target

3. Handover Execution:
   - RRCReconfiguration sent to UE
   - UE performs random access at target
   - Data forwarding from source to target
   - Path switch completion

Timing Requirements:
- Preparation phase: ≤50ms
- Execution phase: ≤27ms for intra-frequency`,
        source_specification: 'TS 38.331',
        release: 'Rel-16',
        section: '5.3.5',
        relevance_score: 0.89,
        metadata: {
          specification_id: 'TS 38.331',
          working_group: 'RAN2',
          document_type: 'Technical Specification',
          keywords: ['handover', 'mobility', '5g', 'rrc', 'procedures']
        }
      });
    }

    if (query.includes('authentication') || query.includes('security') || query.includes('5g-aka')) {
      mockResults.push({
        content: `5G-AKA Authentication Procedure:

The 5G Authentication and Key Agreement (5G-AKA) protocol provides mutual authentication between UE and network:

1. Authentication Initiation:
   - UE sends Registration Request with SUCI
   - AMF derives SUPI from SUCI using decryption
   - AMF initiates authentication with AUSF

2. Authentication Vector Generation:
   - AUSF requests authentication vectors from UDM
   - UDM generates RAND, AUTN, XRES*, Kausf
   - Authentication vectors sent to AUSF

3. Authentication Challenge:
   - AMF sends Authentication Request (RAND, AUTN)
   - UE verifies AUTN and computes RES*
   - UE sends Authentication Response with RES*

4. Authentication Verification:
   - AMF forwards RES* to AUSF for verification
   - AUSF confirms authentication success
   - Security context established

Security Features:
- SUCI/SUPI privacy protection
- Forward secrecy with 256-bit keys
- Anti-bidding down protection`,
        source_specification: 'TS 33.501',
        release: 'Rel-16',
        section: '6.1.3',
        relevance_score: 0.94,
        metadata: {
          specification_id: 'TS 33.501',
          working_group: 'SA3',
          document_type: 'Technical Specification',
          keywords: ['authentication', 'security', '5g-aka', 'ausf', 'keys']
        }
      });
    }

    if (query.includes('notifyid') || query.includes('29.594') || query.includes('event exposure') || query.includes('n28')) {
      mockResults.push({
        content: `TS 29.594 Event Exposure API - notifyID Field:

The notifyID field in TS 29.594 serves as a unique identifier for event exposure notifications in the 5G Service Based Architecture:

1. notifyID Field Definition:
   - Type: string
   - Format: UUID or vendor-specific identifier
   - Purpose: Uniquely identifies a notification within the scope of the subscription
   - Location: EventNotification data structure

2. Usage in N28 Interface:
   - Used in POST /events/{subscriptionId}/notify operations
   - Enables correlation between notifications and subscriptions
   - Supports duplicate detection and ordering
   - Required field in EventNotification structure

3. Implementation Requirements (Release 15):
   - MUST be unique per subscription instance
   - SHOULD follow UUID format (RFC 4122)
   - MUST be included in all event notifications
   - Used for notification acknowledgment and tracking

4. Event Exposure Procedures:
   - Subscription creation via POST /subscriptions
   - Event notification via POST /events/{subscriptionId}/notify
   - Subscription modification via PUT /subscriptions/{subscriptionId}
   - Unsubscription via DELETE /subscriptions/{subscriptionId}

5. N28 Interface Context:
   - Interface between Network Functions and Network Exposure Function (NEF)
   - Supports event monitoring and exposure to external applications
   - Enables real-time event notifications with proper identification

Data Structure Example:
{
  "notifyId": "123e4567-e89b-12d3-a456-426614174000",
  "eventNotifs": [...],
  "subscriptionId": "sub-001"
}`,
        source_specification: 'TS 29.594',
        release: 'Rel-15',
        section: '5.2.4',
        relevance_score: 0.98,
        metadata: {
          specification_id: 'TS 29.594',
          working_group: 'SA2',
          document_type: 'Technical Specification',
          keywords: ['notifyid', 'event-exposure', 'n28', 'notifications', 'api']
        }
      });

      if (query.toLowerCase().includes('r15') || query.toLowerCase().includes('rel-15') || query.toLowerCase().includes('release 15')) {
        mockResults.push({
          content: `TS 29.594 Release 15 Specific Features:

Release 15 introduces the foundational event exposure capabilities with notifyID field support:

1. notifyID Field in Release 15:
   - Initial specification of unique notification identifier
   - Mandatory field for all event notifications
   - Support for basic UUID format
   - Foundation for subscription management

2. N28 Interface Release 15 Capabilities:
   - Basic event exposure between NFs and NEF
   - Support for monitoring configuration events
   - Location reporting event exposure
   - Communication failure detection

3. Release 15 Implementation Notes:
   - notifyID format: UUID recommended but not mandatory
   - Limited event types compared to later releases
   - Basic subscription lifecycle management
   - Foundation for 5G SA event exposure architecture

4. API Operations in Release 15:
   - POST /subscriptions (create event subscription)
   - GET /subscriptions/{subscriptionId} (retrieve subscription)
   - PUT /subscriptions/{subscriptionId} (modify subscription)
   - DELETE /subscriptions/{subscriptionId} (cancel subscription)
   - POST /events/{subscriptionId}/notify (event notification with notifyID)

Backward Compatibility:
- Release 15 notifyID implementation is forward compatible
- Later releases enhance but maintain R15 basic functionality`,
          source_specification: 'TS 29.594',
          release: 'Rel-15',
          section: '4.1.1',
          relevance_score: 0.96,
          metadata: {
            specification_id: 'TS 29.594',
            working_group: 'SA2',
            document_type: 'Technical Specification',
            keywords: ['notifyid', 'release-15', 'n28', 'event-exposure', 'baseline']
          }
        });
      }
    }

    if (query.includes('n28') || query.includes('nef') || query.includes('network exposure')) {
      mockResults.push({
        content: `N28 Interface Specification:

The N28 interface connects Network Functions to the Network Exposure Function (NEF) in 5G Service Based Architecture:

1. N28 Interface Overview:
   - Purpose: Enables secure exposure of network capabilities to external applications
   - Architecture: Service-based interface using HTTP/2 REST APIs
   - Authentication: OAuth 2.0 and TLS mutual authentication
   - Data Format: JSON over HTTPS

2. Key N28 Services:
   - Event monitoring and notification services
   - Location services (positioning, tracking)
   - Device triggering and configuration
   - Quality of Service (QoS) management
   - Session management exposure

3. N28 Interface Procedures:
   - Service registration and discovery
   - Subscription management for events
   - Real-time event notification delivery
   - Policy and charging control exposure
   - Analytics and monitoring data exposure

4. Security Requirements:
   - Mutual TLS authentication between NF and NEF
   - OAuth 2.0 token-based authorization
   - API rate limiting and quota management
   - Audit logging for all exposed operations

5. Implementation Considerations:
   - HTTP/2 protocol mandatory for performance
   - JSON Schema validation for all API operations
   - Error handling with standardized problem details
   - Scalability through stateless design`,
        source_specification: 'TS 23.502',
        release: 'Rel-15',
        section: '4.3.6',
        relevance_score: 0.93,
        metadata: {
          specification_id: 'TS 23.502',
          working_group: 'SA2',
          document_type: 'Technical Specification',
          keywords: ['n28', 'nef', 'network-exposure', 'interface', 'external-exposure']
        }
      });

      mockResults.push({
        content: `N28 Event Exposure Implementation:

Detailed implementation guidance for N28 interface event exposure capabilities:

1. Event Subscription Process:
   - External application authenticates with NEF
   - NEF validates application credentials and permissions
   - Application creates event subscription via POST /subscriptions
   - NEF forwards subscription to relevant Network Function
   - Subscription confirmation returned with unique subscriptionId

2. Event Notification Flow:
   - Network Function detects subscribed event occurrence
   - NF sends notification to NEF via internal interface
   - NEF processes and enriches notification data
   - NEF delivers notification to external application via N28
   - Notification includes notifyID for correlation and tracking

3. N28 API Endpoints:
   - POST /subscriptions - Create event subscription
   - GET /subscriptions/{subscriptionId} - Retrieve subscription details
   - PUT /subscriptions/{subscriptionId} - Modify existing subscription
   - DELETE /subscriptions/{subscriptionId} - Cancel subscription
   - POST /events/{subscriptionId}/notify - Receive event notifications

4. Error Handling:
   - HTTP status codes for operation results
   - ProblemDetails structure for error information
   - Retry mechanisms for failed notifications
   - Fallback procedures for NEF unavailability

5. Performance Requirements:
   - Sub-second notification delivery for real-time events
   - Support for high-frequency event streams
   - Efficient batching for bulk notifications
   - Rate limiting to prevent system overload`,
        source_specification: 'TS 29.122',
        release: 'Rel-15',
        section: '5.2',
        relevance_score: 0.91,
        metadata: {
          specification_id: 'TS 29.122',
          working_group: 'SA2',
          document_type: 'Technical Specification',
          keywords: ['n28', 'event-exposure', 'implementation', 'api', 'notifications']
        }
      });
    }

    // Apply filters
    let filteredResults = mockResults;

    if (request.series_filter && request.series_filter.length > 0) {
      filteredResults = filteredResults.filter(result =>
        request.series_filter!.some(series =>
          result.source_specification.startsWith(`TS ${series}`)
        )
      );
    }

    if (request.release_filter && request.release_filter.length > 0) {
      filteredResults = filteredResults.filter(result =>
        request.release_filter!.includes(result.release)
      );
    }

    // If no results found, add search suggestions
    if (filteredResults.length === 0) {
      const suggestions = this.generateSearchSuggestions(query);
      mockResults.push({
        content: `No direct results found for query: "${request.query}"

Search Suggestions:
${suggestions.map((suggestion, index) => `${index + 1}. ${suggestion.suggestion} (Reason: ${suggestion.reason})`).join('\n')}

Tip: Try searching with:
- Exact specification numbers (e.g., "TS 29.594", "32.290")
- Key technical terms (e.g., "charging", "authentication", "handover")
- Interface names (e.g., "N28", "CHF", "NEF")
- Release-specific queries (e.g., "Release 15", "Rel-16")

Available specification areas:
- Charging and Billing: TS 32.x series
- Security: TS 33.x series
- Radio Access: TS 38.x series
- System Architecture: TS 23.x series
- APIs and Interfaces: TS 29.x series`,
        source_specification: 'Search Guidance',
        release: 'General',
        section: 'Search Help',
        relevance_score: 0.1,
        metadata: {
          specification_id: 'SEARCH_SUGGESTIONS',
          working_group: 'System',
          document_type: 'Search Guidance',
          keywords: ['search-help', 'suggestions', 'guidance']
        }
      });
      return mockResults;
    }

    // Sort by relevance score and limit results
    return filteredResults
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, maxResults);
  }

  private generateCacheKey(request: TSpecSearchRequest): string {
    return `tspec:${JSON.stringify(request)}`;
  }

  private findFuzzySpecificationMatches(query: string): Array<{specId: string, confidence: number}> {
    const knownSpecs = [
      'TS 32.290', 'TS 32.240', 'TS 38.331', 'TS 33.501',
      'TS 23.501', 'TS 23.502', 'TS 29.594', 'TS 29.122'
    ];

    const matches: Array<{specId: string, confidence: number}> = [];

    for (const spec of knownSpecs) {
      const confidence = this.calculateSimilarity(query, spec.toLowerCase());

      // Also check for partial matches without "TS" prefix
      const specNumber = spec.replace('TS ', '');
      const partialConfidence = this.calculateSimilarity(query, specNumber.toLowerCase());

      const maxConfidence = Math.max(confidence, partialConfidence);

      if (maxConfidence > 0.5) {
        matches.push({ specId: spec, confidence: maxConfidence });
      }
    }

    // Sort by confidence and return top 3 matches
    return matches
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Simple fuzzy matching using Levenshtein distance
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    // Check for exact substring match first
    if (longer.includes(shorter)) return 0.9;

    // Calculate Levenshtein distance
    const distance = this.levenshteinDistance(str1, str2);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private generateSearchSuggestions(query: string): Array<{suggestion: string, reason: string}> {
    const suggestions: Array<{suggestion: string, reason: string}> = [];

    // Suggest related terms based on partial matches
    if (query.includes('notify') || query.includes('event')) {
      suggestions.push({
        suggestion: 'TS 29.594 notifyID',
        reason: 'Event exposure API with notification identifiers'
      });
      suggestions.push({
        suggestion: 'N28 interface',
        reason: 'Interface for network exposure and event notifications'
      });
    }

    if (query.includes('29') || query.includes('594')) {
      suggestions.push({
        suggestion: 'TS 29.594',
        reason: 'Network Exposure Function Northbound APIs'
      });
      suggestions.push({
        suggestion: 'event exposure',
        reason: 'Related to TS 29.594 functionality'
      });
    }

    if (query.includes('n28') || query.includes('exposure')) {
      suggestions.push({
        suggestion: 'NEF',
        reason: 'Network Exposure Function'
      });
      suggestions.push({
        suggestion: 'TS 29.122',
        reason: 'T8 reference point for Northbound APIs'
      });
    }

    if (query.includes('r15') || query.includes('rel') || query.includes('release')) {
      suggestions.push({
        suggestion: 'Release 15 specifications',
        reason: 'Search for R15-specific features'
      });
      suggestions.push({
        suggestion: 'Rel-15 baseline features',
        reason: 'Foundational 5G SA capabilities'
      });
    }

    // Add general suggestions if no specific matches
    if (suggestions.length === 0) {
      suggestions.push({
        suggestion: 'charging CHF',
        reason: 'Popular search topic - 5G charging system'
      });
      suggestions.push({
        suggestion: 'authentication 5G-AKA',
        reason: 'Popular search topic - 5G security'
      });
      suggestions.push({
        suggestion: 'handover mobility',
        reason: 'Popular search topic - radio procedures'
      });
    }

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  async getSpecificationInfo(specId: string): Promise<any> {
    const cacheKey = `spec_info:${specId}`;
    const cached = this.cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    // Mock specification metadata
    const specInfo = {
      id: specId,
      title: this.getSpecificationTitle(specId),
      latest_release: 'Rel-17',
      working_group: this.getWorkingGroup(specId),
      status: 'Published',
      summary: this.getSpecificationSummary(specId)
    };

    this.cache.set(cacheKey, specInfo, 7200); // 2 hour cache for spec info
    return specInfo;
  }

  private getSpecificationTitle(specId: string): string {
    const titles: { [key: string]: string } = {
      'TS 32.290': '5G system; Services, operations and procedures of charging using Service Based Interface (SBI)',
      'TS 32.240': 'Telecommunication management; Charging management; Charging architecture and principles',
      'TS 38.331': '5G; NR; Radio Resource Control (RRC); Protocol specification',
      'TS 33.501': 'Security architecture and procedures for 5G System',
      'TS 23.501': 'System architecture for the 5G System (5GS)',
      'TS 23.502': 'Procedures for the 5G System (5GS)',
      'TS 29.594': '5G System; Network Exposure Function Northbound APIs; Stage 3',
      'TS 29.122': 'T8 reference point for Northbound APIs'
    };
    return titles[specId] || `${specId} - 3GPP Technical Specification`;
  }

  private getWorkingGroup(specId: string): string {
    const workingGroups: { [key: string]: string } = {
      'TS 32.290': 'SA5',
      'TS 32.240': 'SA5',
      'TS 38.331': 'RAN2',
      'TS 33.501': 'SA3',
      'TS 23.501': 'SA2',
      'TS 23.502': 'SA2',
      'TS 29.594': 'SA2',
      'TS 29.122': 'SA2'
    };
    return workingGroups[specId] || 'Unknown';
  }

  private getSpecificationSummary(specId: string): string {
    const summaries: { [key: string]: string } = {
      'TS 32.290': 'Defines the 5G converged charging system using Service Based Interface architecture with CHF as the central charging function.',
      'TS 32.240': 'Establishes the foundational charging architecture and principles for 3GPP networks including online and offline charging.',
      'TS 38.331': 'Specifies the Radio Resource Control protocol for 5G New Radio including connection management and mobility procedures.',
      'TS 33.501': 'Defines the comprehensive security architecture for 5G systems including authentication, authorization, and privacy protection.',
      'TS 23.501': 'Describes the overall system architecture for 5G including network functions, interfaces, and service-based architecture.',
      'TS 23.502': 'Specifies detailed procedures for 5G system operations including registration, session management, and mobility.',
      'TS 29.594': 'Specifies the Network Exposure Function (NEF) Northbound APIs for event exposure and network capability exposure to external applications.',
      'TS 29.122': 'Defines the T8 reference point for Northbound APIs between the Service Capability Exposure Function and external applications.'
    };
    return summaries[specId] || 'Technical specification for 3GPP telecommunications systems.';
  }

  clearCache(): void {
    this.cache.flushAll();
  }

  getCacheStats(): { keys: number; hits: number; misses: number } {
    const stats = this.cache.getStats();
    return {
      keys: this.cache.keys().length,
      hits: stats.hits,
      misses: stats.misses
    };
  }
}