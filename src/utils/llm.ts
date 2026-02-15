import { Message } from '../types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-3-5-sonnet-20241022';

export async function generateWithClaude(
  messages: Message[],
  apiKey: string,
  systemPrompt: string
): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

export function createSystemPrompt(currentFiles: string): string {
  return `You are an expert web developer helping users build web applications. You can create and modify HTML, CSS, and JavaScript files.

Current project files:
${currentFiles}

When the user asks you to create or modify something:
1. Analyze what changes need to be made
2. Respond with clear instructions about what you'll do
3. Provide the complete updated file contents wrapped in a code block with the filename

Format your responses like this:
[Explanation of what you're doing]

\`\`\`html:index.html
[Complete file content]
\`\`\`

\`\`\`javascript:script.js
[Complete file content]
\`\`\`

Always provide complete file contents, not just the changes. Be creative, write clean code, and make beautiful designs.`;
}

export function parseFilesFromResponse(response: string): Array<{ filename: string; content: string }> {
  const files: Array<{ filename: string; content: string }> = [];
  const codeBlockRegex = /```(\w+):([^\n]+)\n([\s\S]*?)```/g;
  let match;

  while ((match = codeBlockRegex.exec(response)) !== null) {
    const filename = match[2].trim();
    const content = match[3].trim();
    files.push({ filename, content });
  }

  return files;
}
