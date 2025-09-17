import { KnowledgeBase } from '../src/utils/knowledge-base';

describe('KnowledgeBase', () => {
  let knowledgeBase: KnowledgeBase;

  beforeAll(async () => {
    knowledgeBase = new KnowledgeBase();
    await knowledgeBase.initialize();
  });

  describe('Initialization', () => {
    test('should initialize without errors', () => {
      expect(knowledgeBase).toBeDefined();
    });

    test('should load specifications', () => {
      const spec = knowledgeBase.getSpecification('TS 24.501');
      expect(spec).toBeDefined();
      expect(spec?.title).toContain('5G System');
      expect(spec?.series).toBe('24');
      expect(spec?.keyTopics.length).toBeGreaterThan(0);
    });

    test('should load protocols', () => {
      const protocol = knowledgeBase.getProtocol('NAS');
      expect(protocol).toBeDefined();
      expect(protocol?.fullName).toBe('Non-Access Stratum');
      expect(protocol?.procedures.length).toBeGreaterThan(0);
    });

    test('should load concepts', () => {
      const concept = knowledgeBase.getConcept('SUCI');
      expect(concept).toBeDefined();
      expect(concept?.fullName).toBe('Subscription Concealed Identifier');
      expect(concept?.category).toBe('Security');
    });

    test('should load research patterns', () => {
      const pattern = knowledgeBase.getPattern('Protocol Analysis');
      expect(pattern).toBeDefined();
      expect(pattern?.steps.length).toBeGreaterThan(0);
      expect(pattern?.expectedOutputs.length).toBeGreaterThan(0);
    });
  });

  describe('Specification Suggestions', () => {
    test('should suggest relevant specifications for authentication topic', async () => {
      const suggestions = await knowledgeBase.suggestSpecificationsForTopic('authentication');

      expect(suggestions.length).toBeGreaterThan(0);

      // Should include security-related specifications
      const securitySpecs = suggestions.filter(spec =>
        spec.id.includes('33.') ||
        spec.keyTopics.some(topic => topic.toLowerCase().includes('security')) ||
        spec.keyTopics.some(topic => topic.toLowerCase().includes('authentication'))
      );

      expect(securitySpecs.length).toBeGreaterThan(0);
    });

    test('should suggest relevant specifications for 5G topic', async () => {
      const suggestions = await knowledgeBase.suggestSpecificationsForTopic('5G');

      expect(suggestions.length).toBeGreaterThan(0);

      // Should prioritize 5G-specific specifications
      const fiveGSpecs = suggestions.filter(spec =>
        spec.title.includes('5G') ||
        spec.keyTopics.some(topic => topic.includes('5G'))
      );

      expect(fiveGSpecs.length).toBeGreaterThan(0);
    });

    test('should return specifications sorted by relevance', async () => {
      const suggestions = await knowledgeBase.suggestSpecificationsForTopic('NAS');

      expect(suggestions.length).toBeGreaterThan(0);

      // First result should be highly relevant to NAS
      const firstResult = suggestions[0];
      expect(
        firstResult.title.toLowerCase().includes('nas') ||
        firstResult.keyTopics.some(topic => topic.toLowerCase().includes('nas')) ||
        firstResult.searchKeywords.some(keyword => keyword.toLowerCase().includes('nas'))
      ).toBe(true);
    });
  });

  describe('Related Specifications', () => {
    test('should find related specifications', async () => {
      const related = await knowledgeBase.getRelatedSpecifications('TS 24.501');

      expect(related.length).toBeGreaterThan(0);

      // Should include related specifications like security or architecture
      const hasSecuritySpec = related.some(spec => spec.id.includes('33.'));
      const hasArchitectureSpec = related.some(spec => spec.id.includes('23.'));

      expect(hasSecuritySpec || hasArchitectureSpec).toBe(true);
    });
  });

  describe('Search Patterns', () => {
    test('should provide search pattern for authentication domain', async () => {
      const pattern = await knowledgeBase.getSearchPatternForDomain('authentication');

      expect(pattern).toBeDefined();
      expect(pattern?.keywords.length).toBeGreaterThan(0);
      expect(pattern?.series.length).toBeGreaterThan(0);
      expect(pattern?.startingSpecs.length).toBeGreaterThan(0);
    });

    test('should provide search pattern for mobility domain', async () => {
      const pattern = await knowledgeBase.getSearchPatternForDomain('mobility');

      expect(pattern).toBeDefined();
      expect(pattern?.domain).toBe('mobility');
      expect(pattern?.keywords).toContain('handover');
    });
  });

  describe('Implementation Guidance', () => {
    test('should provide implementation guidance for topics', async () => {
      const guidance = await knowledgeBase.getImplementationGuidanceForTopic('authentication');

      expect(guidance.length).toBeGreaterThan(0);

      // Should include specifications with implementation notes
      guidance.forEach(spec => {
        expect(spec.implementationNotes.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Data Quality', () => {
    test('should have consistent specification metadata', () => {
      const spec = knowledgeBase.getSpecification('TS 33.501');

      expect(spec).toBeDefined();
      expect(spec?.id).toBe('TS 33.501');
      expect(spec?.series).toBe('33');
      expect(spec?.workingGroup).toBeDefined();
      expect(spec?.purpose).toBeDefined();
      expect(spec?.keyTopics.length).toBeGreaterThan(0);
      expect(spec?.searchKeywords.length).toBeGreaterThan(0);
    });

    test('should have valid protocol metadata', () => {
      const protocols = knowledgeBase.getAllProtocols();

      expect(protocols.size).toBeGreaterThan(0);

      protocols.forEach(protocol => {
        expect(protocol.name).toBeDefined();
        expect(protocol.fullName).toBeDefined();
        expect(protocol.purpose).toBeDefined();
        expect(protocol.definingSpecs.length).toBeGreaterThan(0);
      });
    });

    test('should have valid research patterns', () => {
      const patterns = knowledgeBase.getAllPatterns();

      expect(patterns.size).toBeGreaterThan(0);

      patterns.forEach(pattern => {
        expect(pattern.name).toBeDefined();
        expect(pattern.description).toBeDefined();
        expect(pattern.steps.length).toBeGreaterThan(0);
        expect(pattern.timeEstimate).toBeDefined();
      });
    });
  });
});