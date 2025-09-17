import { GuidanceEngine } from '../src/utils/guidance-engine';
import { UserQuery, QueryIntent } from '../src/types/guidance';

describe('GuidanceEngine', () => {
  let guidanceEngine: GuidanceEngine;

  beforeAll(async () => {
    guidanceEngine = new GuidanceEngine();
    await guidanceEngine.initialize();
  });

  describe('Query Analysis', () => {
    test('should analyze discovery intent correctly', async () => {
      const query: UserQuery = {
        text: 'find specifications for 5G authentication',
        userLevel: 'intermediate'
      };

      const analysis = await guidanceEngine.analyzeQuery(query);

      expect(analysis.intent).toBe('discovery');
      expect(analysis.domain).toBe('authentication');
      expect(analysis.concepts).toContain('5G');
      expect(analysis.userLevel).toBe('intermediate');
      expect(analysis.complexity).toBeGreaterThan(0);
    });

    test('should analyze learning intent correctly', async () => {
      const query: UserQuery = {
        text: 'explain how NAS protocol works',
        userLevel: 'beginner'
      };

      const analysis = await guidanceEngine.analyzeQuery(query);

      expect(analysis.intent).toBe('learning');
      expect(analysis.domain).toBe('protocol');
      expect(analysis.concepts).toContain('NAS');
      expect(analysis.userLevel).toBe('beginner');
    });

    test('should analyze implementation intent correctly', async () => {
      const query: UserQuery = {
        text: 'implement SUCI encryption for identity protection',
        userLevel: 'expert'
      };

      const analysis = await guidanceEngine.analyzeQuery(query);

      expect(analysis.intent).toBe('implementation');
      expect(['security', 'authentication']).toContain(analysis.domain); // Both are valid for SUCI
      expect(analysis.concepts).toContain('SUCI');
      expect(analysis.userLevel).toBe('expert');
    });

    test('should handle complex queries with multiple concepts', async () => {
      const query: UserQuery = {
        text: 'compare 5G-AKA vs EPS-AKA authentication procedures',
        userLevel: 'intermediate'
      };

      const analysis = await guidanceEngine.analyzeQuery(query);

      expect(analysis.intent).toBe('comparison');
      expect(analysis.domain).toBe('authentication');
      expect(analysis.concepts.length).toBeGreaterThan(1);
      // Check for components that would be extracted (5G, AKA, etc.)
      expect(analysis.concepts.some(c => c.includes('5G') || c.includes('AKA'))).toBe(true);
    });
  });

  describe('Guidance Generation', () => {
    test('should generate discovery guidance with specifications', async () => {
      const query: UserQuery = {
        text: 'find 5G security specifications',
        userLevel: 'intermediate'
      };

      const analysis = await guidanceEngine.analyzeQuery(query);
      const guidance = await guidanceEngine.generateGuidance(query, analysis);

      expect(guidance.type).toBe('guidance');
      expect(guidance.summary).toContain('security');
      expect(guidance.sections.length).toBeGreaterThan(0);
      expect(guidance.confidence).toBeGreaterThan(0.5);
      expect(guidance.nextSteps).toBeDefined();
      expect(guidance.relatedTopics).toBeDefined();
    });

    test('should generate learning guidance with educational content', async () => {
      const query: UserQuery = {
        text: 'learn about 5G network architecture',
        userLevel: 'beginner'
      };

      const analysis = await guidanceEngine.analyzeQuery(query);
      analysis.intent = 'learning';

      const guidance = await guidanceEngine.generateGuidance(query, analysis);

      expect(guidance.sections.some(s => s.type === 'overview')).toBe(true);
      expect(guidance.sections.some(s => s.title.includes('Learning'))).toBe(true);
      expect(guidance.nextSteps?.length).toBeGreaterThan(0);
    });

    test('should adapt guidance to user level', async () => {
      const beginnerQuery: UserQuery = {
        text: 'understand 5G authentication',
        userLevel: 'beginner'
      };

      const expertQuery: UserQuery = {
        text: 'understand 5G authentication',
        userLevel: 'expert'
      };

      const beginnerAnalysis = await guidanceEngine.analyzeQuery(beginnerQuery);
      const expertAnalysis = await guidanceEngine.analyzeQuery(expertQuery);

      const beginnerGuidance = await guidanceEngine.generateGuidance(beginnerQuery, beginnerAnalysis);
      const expertGuidance = await guidanceEngine.generateGuidance(expertQuery, expertAnalysis);

      // Expert guidance should be more detailed and have different content
      expect(beginnerGuidance.summary).not.toBe(expertGuidance.summary);
      expect(beginnerGuidance.sections.length).toBeGreaterThan(0);
      expect(expertGuidance.sections.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    test('should generate guidance within performance target', async () => {
      const query: UserQuery = {
        text: 'find specifications for session management in 5G',
        userLevel: 'intermediate'
      };

      const startTime = Date.now();

      const analysis = await guidanceEngine.analyzeQuery(query);
      const guidance = await guidanceEngine.generateGuidance(query, analysis);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within 500ms as per v2 requirements
      expect(duration).toBeLessThan(500);
      expect(guidance).toBeDefined();
      expect(guidance.sections.length).toBeGreaterThan(0);
    });
  });
});