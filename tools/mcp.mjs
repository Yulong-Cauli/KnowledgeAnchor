#!/usr/bin/env node
// MCP stdio transport (2025-11-25 / 2025-06-18), no web server or npm runtime dependency.
// stdout is reserved exclusively for newline-delimited JSON-RPC.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT } from './ka-lib.mjs';
import { createKnowledgeTools, KnowledgeError, POLICY } from './ka-mcp-tools.mjs';

export const PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18'];
const MAX_MESSAGE_BYTES = 1024 * 1024;
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export function createMcpSession(knowledge) {
  let initialized = false;
  return function dispatch(message) {
    const validId = typeof message?.id === 'string' || (typeof message?.id === 'number' && Number.isFinite(message.id));
    const error = (code, text) => ({ jsonrpc: '2.0', id: validId ? message.id : null, error: { code, message: text } });
    if (!object(message) || message.jsonrpc !== '2.0' || typeof message.method !== 'string'
      || (Object.hasOwn(message, 'id') && !validId)
      || (message.params !== undefined && !object(message.params))) return error(-32600, 'Invalid Request');
    // Notifications never receive replies. We issue no server-to-client requests.
    if (!Object.hasOwn(message, 'id')) return null;
    const params = message.params ?? {};
    let result;
    if (message.method === 'initialize') {
      if (initialized) return error(-32600, 'Session is already initialized');
      if (typeof params.protocolVersion !== 'string' || !object(params.capabilities)
        || !object(params.clientInfo) || typeof params.clientInfo.name !== 'string'
        || typeof params.clientInfo.version !== 'string') return error(-32602, 'Invalid initialize parameters');
      initialized = true;
      result = { protocolVersion: PROTOCOL_VERSIONS.includes(params.protocolVersion) ? params.protocolVersion : PROTOCOL_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'knowledgeanchor', version: '0.1.0' },
        instructions: Object.values(POLICY).filter((value) => typeof value === 'string').join('\n') };
    } else if (message.method === 'ping') {
      result = {};
    } else if (!initialized) {
      return error(-32002, 'Initialize the MCP session first');
    } else if (message.method === 'tools/list') {
      if (params.cursor !== undefined) return error(-32602, 'This server lists all tools in one page; omit cursor');
      result = { tools: knowledge.definitions };
    } else if (message.method === 'tools/call') {
      if (typeof params.name !== 'string' || !knowledge.definitions.some((tool) => tool.name === params.name)) {
        return error(-32602, 'Unknown tool');
      }
      try {
        const data = knowledge.call(params.name, params.arguments ?? {});
        result = { content: [{ type: 'text', text: JSON.stringify(data) }], structuredContent: data, isError: false };
      } catch (cause) {
        const data = cause instanceof KnowledgeError
          ? { error: cause.message, details: cause.details }
          : { error: 'Knowledge could not be read. Check local files and run node tools/ka.mjs validate.' };
        result = { content: [{ type: 'text', text: JSON.stringify(data) }], isError: true };
      }
    } else {
      return error(-32601, 'Method not found');
    }
    return { jsonrpc: '2.0', id: message.id, result };
  };
}

export async function runStdio({ root = ROOT, input = process.stdin, output = process.stdout } = {}) {
  const dispatch = createMcpSession(createKnowledgeTools({ root }));
  const send = async (message) => {
    if (!message) return;
    await new Promise((resolve, reject) => output.write(`${JSON.stringify(message)}\n`, 'utf8', (error) => error ? reject(error) : resolve()));
  };
  let pending = Buffer.alloc(0);
  for await (const chunk of input) {
    pending = Buffer.concat([pending, Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)]);
    let boundary;
    while ((boundary = pending.indexOf(10)) !== -1) {
      if (boundary > MAX_MESSAGE_BYTES) throw new Error('MCP message exceeds 1 MiB');
      const line = pending.subarray(0, boundary).toString('utf8');
      pending = pending.subarray(boundary + 1);
      if (!line.trim()) continue;
      let message;
      try { message = JSON.parse(line); }
      catch { await send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }); continue; }
      await send(dispatch(message));
    }
    if (pending.length > MAX_MESSAGE_BYTES) throw new Error('MCP message exceeds 1 MiB');
  }
  if (pending.toString('utf8').trim()) await send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Incomplete newline-delimited message' } });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let root = ROOT;
  try {
    const args = process.argv.slice(2);
    if (args.length) {
      if (args.length !== 2 || args[0] !== '--root') throw new Error('Usage: node tools/mcp.mjs [--root <knowledge-directory>]');
      root = path.resolve(args[1]);
    }
    await runStdio({ root });
  } catch (error) {
    process.stderr.write(`KnowledgeAnchor MCP: ${error.message}\n`);
    process.exitCode = 1;
  }
}
