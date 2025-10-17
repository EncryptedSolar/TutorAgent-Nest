export interface AgentDefinition {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  temperature?: number;
  model?: string;
}
