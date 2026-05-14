import OpenAI from 'openai';
import type { Config } from '@netlify/functions';
import type { ChatCompletionChunk } from 'openai/resources/chat/completions';
import { withSentry, captureException } from './lib/sentry.ts';

type ChatRole = 'system' | 'user' | 'assistant';

type ChatMessage = {
  role: ChatRole;
  content: string;
};

const CHAT_SYSTEM_PROMPT = `
You are the Infamous Freight site assistant. Help shippers, carriers, drivers, and dispatch teams understand Infamous Freight services, quote requests, shipment tracking, carrier onboarding, driver applications, pricing, and operational workflows.

Keep answers practical, concise, and focused on freight logistics. Do not invent shipment statuses, prices, legal advice, compliance determinations, or account-specific information. When a request requires private account data, a firm quote, a booking decision, or human review, direct the visitor to the relevant site workflow or the Infamous Freight team.
`.trim();

const HISTORY_LIMIT = 20;
const MAX_MESSAGE_LENGTH = 4000;

const openai = new OpenAI();

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });

const isChatMessage = (value: unknown): value is ChatMessage => {
  if (!value || typeof value !== 'object') return false;
  const message = value as Partial<ChatMessage>;
  return (
    (message.role === 'user' || message.role === 'assistant') &&
    typeof message.content === 'string' &&
    message.content.trim().length > 0
  );
};

const sanitizeMessages = (messages: unknown): ChatMessage[] => {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter(isChatMessage)
    .slice(-HISTORY_LIMIT)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_MESSAGE_LENGTH),
    }));
};

export default withSentry(async (req: Request) => {
  if (req.method !== 'POST') {
    return json(405, { error: 'method_not_allowed', message: 'Use POST to send chat messages.' });
  }

  let payload: { messages?: unknown };
  try {
    payload = (await req.json()) as { messages?: unknown };
  } catch {
    return json(400, { error: 'invalid_json', message: 'Request body must be valid JSON.' });
  }

  const messages = sanitizeMessages(payload.messages);
  if (messages.length === 0) {
    return json(400, { error: 'missing_messages', message: 'At least one user message is required.' });
  }

  let stream: AsyncIterable<ChatCompletionChunk>;
  try {
    stream = await openai.chat.completions.create({
      model: 'gpt-5.2',
      messages: [{ role: 'system', content: CHAT_SYSTEM_PROMPT }, ...messages],
      stream: true,
    });
  } catch {
    return json(502, {
      error: 'chat_unavailable',
      message: 'The assistant is unavailable right now. Please try again in a moment.',
    });
  }

  const encoder = new TextEncoder();
  const responseStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        captureException(error);
        controller.enqueue(
          encoder.encode(`event: error\ndata: ${JSON.stringify({ message: 'Chat response failed.' })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(responseStream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-content-type-options': 'nosniff',
    },
  });
});

export const config: Config = {
  path: '/.netlify/functions/chat',
};
