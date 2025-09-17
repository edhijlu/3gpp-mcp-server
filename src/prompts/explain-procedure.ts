export class ExplainProcedurePrompt {

  getDefinition() {
    return {
      name: 'explain_3gpp_procedure',
      description: 'Template for explaining specific 3GPP procedures in detail with context and examples',
      arguments: [
        {
          name: 'procedure_name',
          description: 'Name of the 3GPP procedure to explain',
          required: true
        },
        {
          name: 'specification',
          description: 'Relevant specification (e.g., TS 24.501)',
          required: false
        },
        {
          name: 'detail_level',
          description: 'Level of detail: overview, detailed, or implementation',
          required: false
        }
      ]
    };
  }

  async generate(args: any) {
    const procedureName = args?.procedure_name || '[PROCEDURE_NAME]';
    const specification = args?.specification || '[RELEVANT_SPEC]';
    const detailLevel = args?.detail_level || 'detailed';

    const prompt = `You are explaining the ${procedureName} procedure from 3GPP specification ${specification}.

Structure your explanation as follows:

## ${procedureName} Procedure Overview

### Purpose and Context
- Explain why this procedure exists
- Describe when it is triggered
- Identify the network entities involved

### High-Level Flow
- Provide step-by-step sequence
- Highlight key decision points
- Note error conditions and handling

${detailLevel === 'implementation' ? `
### Implementation Considerations
- Key algorithm requirements
- Performance considerations
- Common implementation challenges
- Testing and validation approaches
` : ''}

### References and Related Procedures
- Reference the relevant 3GPP specifications
- Connect to related procedures
- Suggest further reading

Focus on clarity and practical understanding. Use examples where helpful.`;

    return {
      description: `Template for explaining ${procedureName} procedure`,
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