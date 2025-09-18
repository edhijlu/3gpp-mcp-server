import { TSpecLLMClient, TSpecSearchRequest, TSpecSearchResponse } from './tspec-llm-client';
import { TGPPApiClient, SpecificationMetadata, ReleaseInfo, WorkingGroupInfo } from './tgpp-api-client';

export interface APIConfig {
  huggingFaceToken?: string;
  enableCaching?: boolean;
  cacheTimeout?: number;
}

export interface EnhancedSearchRequest {
  query: string;
  include_tspec_content?: boolean;
  include_official_metadata?: boolean;
  max_results?: number;
  series_filter?: string[];
  release_filter?: string[];
}

export interface EnhancedSearchResult {
  tspec_results?: TSpecSearchResponse;
  official_metadata?: SpecificationMetadata[];
  related_specifications?: SpecificationMetadata[];
  working_group_info?: WorkingGroupInfo[];
  release_info?: ReleaseInfo[];
}

export class APIManager {
  private tspecClient: TSpecLLMClient;
  private tgppClient: TGPPApiClient;
  private config: APIConfig;

  constructor(config: APIConfig = {}) {
    this.config = {
      enableCaching: true,
      cacheTimeout: 3600,
      ...config
    };

    this.tspecClient = new TSpecLLMClient(config.huggingFaceToken);
    this.tgppClient = new TGPPApiClient();
  }

  async enhancedSearch(request: EnhancedSearchRequest): Promise<EnhancedSearchResult> {
    const result: EnhancedSearchResult = {};

    try {
      // Parallel execution for better performance
      const promises: Promise<any>[] = [];

      // TSpec-LLM content search
      if (request.include_tspec_content !== false) {
        const tspecRequest: TSpecSearchRequest = {
          query: request.query,
          max_results: request.max_results || 5,
          series_filter: request.series_filter,
          release_filter: request.release_filter
        };
        promises.push(
          this.tspecClient.searchSpecifications(tspecRequest)
            .then(res => { result.tspec_results = res; })
            .catch(err => console.warn('TSpec search failed:', err))
        );
      }

      // Official metadata search
      if (request.include_official_metadata !== false) {
        const filters = {
          release: request.release_filter?.[0],
          series: request.series_filter?.[0]
        };
        promises.push(
          this.tgppClient.searchSpecifications(request.query, filters)
            .then(res => { result.official_metadata = res; })
            .catch(err => console.warn('Official metadata search failed:', err))
        );
      }

      await Promise.all(promises);

      // Enhance with related information
      await this.addRelatedInformation(result, request);

      return result;

    } catch (error) {
      throw new Error(`Enhanced search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSpecificationDetails(specId: string): Promise<{
    metadata: SpecificationMetadata;
    tspec_content?: TSpecSearchResponse;
    working_group: WorkingGroupInfo;
    release: ReleaseInfo;
  }> {
    try {
      // Get official metadata
      const metadata = await this.tgppClient.getSpecificationMetadata(specId);

      // Get related TSpec content
      const tspecContent = await this.tspecClient.searchSpecifications({
        query: specId,
        max_results: 3
      });

      // Get working group info
      const workingGroup = await this.tgppClient.getWorkingGroupInfo(metadata.working_group);

      // Get release info
      const release = await this.tgppClient.getReleaseInfo(metadata.release);

      return {
        metadata,
        tspec_content: tspecContent,
        working_group: workingGroup,
        release
      };

    } catch (error) {
      throw new Error(`Failed to get specification details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async compareSpecifications(specIds: string[]): Promise<{
    specifications: SpecificationMetadata[];
    comparison_matrix: any;
    evolution_analysis?: any;
  }> {
    try {
      // Get metadata for all specifications
      const specifications = await Promise.all(
        specIds.map(id => this.tgppClient.getSpecificationMetadata(id))
      );

      // Create comparison matrix
      const comparisonMatrix = this.createComparisonMatrix(specifications);

      // Add evolution analysis if comparing across releases
      const releases = [...new Set(specifications.map(spec => spec.release))];
      let evolutionAnalysis;
      if (releases.length > 1) {
        evolutionAnalysis = await this.analyzeEvolution(specifications);
      }

      return {
        specifications,
        comparison_matrix: comparisonMatrix,
        evolution_analysis: evolutionAnalysis
      };

    } catch (error) {
      throw new Error(`Specification comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findImplementationRequirements(feature: string, context?: {
    domain?: string;
    complexity_level?: 'basic' | 'intermediate' | 'advanced';
  }): Promise<{
    requirements: any[];
    related_specifications: SpecificationMetadata[];
    implementation_guidance: string[];
  }> {
    try {
      const searchQuery = `${feature} implementation requirements ${context?.domain || ''}`;

      // Search TSpec-LLM for implementation details
      const tspecResults = await this.tspecClient.searchSpecifications({
        query: searchQuery,
        max_results: 10
      });

      // Extract requirements from content
      const requirements = this.extractRequirements(tspecResults);

      // Find related specifications
      const relatedSpecs = await this.tgppClient.searchSpecifications(feature);

      // Generate implementation guidance
      const implementationGuidance = this.generateImplementationGuidance(
        feature,
        tspecResults,
        context
      );

      return {
        requirements,
        related_specifications: relatedSpecs,
        implementation_guidance: implementationGuidance
      };

    } catch (error) {
      throw new Error(`Failed to find implementation requirements: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async addRelatedInformation(result: EnhancedSearchResult, request: EnhancedSearchRequest): Promise<void> {
    try {
      // Extract specification IDs from TSpec results
      const specIds = result.tspec_results?.results
        .map(r => r.source_specification)
        .filter((id, index, arr) => arr.indexOf(id) === index) // Remove duplicates
        .slice(0, 5); // Limit to 5 specs

      if (specIds && specIds.length > 0) {
        // Get related specifications
        const relatedSpecs = await Promise.all(
          specIds.map(id => this.tgppClient.getSpecificationMetadata(id).catch(() => null))
        );
        result.related_specifications = relatedSpecs.filter(spec => spec !== null) as SpecificationMetadata[];

        // Get working group information
        const workingGroups = [...new Set(
          result.related_specifications?.map(spec => spec.working_group) || []
        )];
        const wgInfo = await Promise.all(
          workingGroups.map(wg => this.tgppClient.getWorkingGroupInfo(wg).catch(() => null))
        );
        result.working_group_info = wgInfo.filter(wg => wg !== null) as WorkingGroupInfo[];

        // Get release information
        const releases = [...new Set(
          result.related_specifications?.map(spec => spec.release) || []
        )];
        const releaseInfo = await Promise.all(
          releases.map(rel => this.tgppClient.getReleaseInfo(rel).catch(() => null))
        );
        result.release_info = releaseInfo.filter(rel => rel !== null) as ReleaseInfo[];
      }
    } catch (error) {
      console.warn('Failed to add related information:', error);
    }
  }

  private createComparisonMatrix(specifications: SpecificationMetadata[]): any {
    return {
      working_groups: specifications.map(spec => ({
        id: spec.id,
        working_group: spec.working_group
      })),
      releases: specifications.map(spec => ({
        id: spec.id,
        release: spec.release,
        publication_date: spec.publication_date
      })),
      dependencies: specifications.map(spec => ({
        id: spec.id,
        dependencies: spec.dependencies
      })),
      focus_areas: specifications.map(spec => ({
        id: spec.id,
        keywords: spec.keywords
      }))
    };
  }

  private async analyzeEvolution(specifications: SpecificationMetadata[]): Promise<any> {
    // Group by base specification (without release info)
    const groups = specifications.reduce((acc, spec) => {
      const baseId = spec.id.replace(/v\d+\.\d+\.\d+/, '');
      if (!acc[baseId]) acc[baseId] = [];
      acc[baseId].push(spec);
      return acc;
    }, {} as { [key: string]: SpecificationMetadata[] });

    return Object.entries(groups).map(([baseId, specs]) => ({
      specification: baseId,
      evolution: specs
        .sort((a, b) => a.release.localeCompare(b.release))
        .map(spec => ({
          release: spec.release,
          version: spec.version,
          major_changes: this.inferMajorChanges(spec)
        }))
    }));
  }

  private inferMajorChanges(spec: SpecificationMetadata): string[] {
    // This would be enhanced with actual change analysis
    const changes: string[] = [];

    if (spec.release === 'Rel-17') {
      changes.push('Enhanced features for 5G Advanced');
    }
    if (spec.working_group === 'SA5' && spec.keywords.includes('charging')) {
      changes.push('Converged charging enhancements');
    }
    if (spec.keywords.includes('security')) {
      changes.push('Security protocol updates');
    }

    return changes;
  }

  private extractRequirements(tspecResults: TSpecSearchResponse): any[] {
    return tspecResults.results.map(result => ({
      source: result.source_specification,
      section: result.section,
      type: this.classifyRequirement(result.content),
      description: this.extractRequirementText(result.content),
      mandatory: this.isMandatoryRequirement(result.content),
      technical_details: this.extractTechnicalDetails(result.content)
    }));
  }

  private classifyRequirement(content: string): string {
    const lower = content.toLowerCase();
    if (lower.includes('must') || lower.includes('mandatory')) return 'mandatory';
    if (lower.includes('should') || lower.includes('recommended')) return 'recommended';
    if (lower.includes('may') || lower.includes('optional')) return 'optional';
    return 'informational';
  }

  private extractRequirementText(content: string): string {
    // Extract the most relevant requirement sentence
    const sentences = content.split(/[.!?]+/);
    return sentences.find(sentence =>
      sentence.toLowerCase().includes('requirement') ||
      sentence.toLowerCase().includes('must') ||
      sentence.toLowerCase().includes('shall')
    )?.trim() || sentences[0]?.trim() || '';
  }

  private isMandatoryRequirement(content: string): boolean {
    const lower = content.toLowerCase();
    return lower.includes('must') || lower.includes('shall') || lower.includes('mandatory');
  }

  private extractTechnicalDetails(content: string): string[] {
    const details: string[] = [];
    const lines = content.split('\n');

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.match(/^\d+\./) || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        details.push(trimmed);
      }
    });

    return details.slice(0, 5); // Limit technical details
  }

  private generateImplementationGuidance(
    feature: string,
    tspecResults: TSpecSearchResponse,
    context?: any
  ): string[] {
    const guidance: string[] = [];

    // Add basic guidance based on feature type
    if (feature.toLowerCase().includes('charging')) {
      guidance.push('1. Review TS 32.290 for 5G converged charging architecture');
      guidance.push('2. Implement HTTP/2 REST API interfaces for CHF integration');
      guidance.push('3. Ensure compliance with service-based architecture principles');
    }

    if (feature.toLowerCase().includes('security')) {
      guidance.push('1. Implement 5G-AKA authentication as per TS 33.501');
      guidance.push('2. Ensure SUCI/SUPI privacy protection mechanisms');
      guidance.push('3. Validate key derivation and management procedures');
    }

    if (feature.toLowerCase().includes('handover') || feature.toLowerCase().includes('mobility')) {
      guidance.push('1. Configure measurement parameters according to TS 38.331');
      guidance.push('2. Implement preparation and execution phases within timing constraints');
      guidance.push('3. Test with various radio conditions and load scenarios');
    }

    // Add context-specific guidance
    if (context?.complexity_level === 'basic') {
      guidance.unshift('0. Start with fundamental concepts and basic implementation');
    } else if (context?.complexity_level === 'advanced') {
      guidance.push('4. Consider advanced optimization and edge case handling');
    }

    return guidance;
  }

  getCacheStats(): {
    tspec_cache: { keys: number; hits: number; misses: number };
    tgpp_cache: { keys: number; hits: number; misses: number };
  } {
    return {
      tspec_cache: this.tspecClient.getCacheStats(),
      tgpp_cache: this.tgppClient.getCacheStats()
    };
  }

  clearAllCaches(): void {
    this.tspecClient.clearCache();
    this.tgppClient.clearCache();
  }
}