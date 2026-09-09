import { afterEach, describe, expect, it } from 'vitest';
import { createServer, type Server } from 'node:http';
import { GET } from '../health/route';

const ORIGINAL_API_URL = process.env.API_URL;
let server: Server | null = null;

function listen(handler: (path: string) => number): Promise<string> {
  return new Promise((resolve) => {
    server = createServer((request, response) => {
      response.writeHead(handler(request.url ?? '/'));
      response.end();
    });

    server.listen(0, '127.0.0.1', () => {
      const address = server?.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      resolve(`http://127.0.0.1:${port}`);
    });
  });
}

afterEach(async () => {
  await new Promise((resolve) => (server ? server.close(resolve) : resolve(null)));
  server = null;
  process.env.API_URL = ORIGINAL_API_URL;
});

async function probe(): Promise<{ status: number; body: { status: string } }> {
  const response = await GET();
  return { status: response.status, body: await response.json() };
}

describe('GET /api/health', () => {
  it('reports up when the backend serves /health', async () => {
    process.env.API_URL = await listen(() => 200);

    await expect(probe()).resolves.toMatchObject({ status: 200, body: { status: 'up' } });
  });

  it('reports up when the backend answers but has no /health route', async () => {
    process.env.API_URL = await listen(() => 404);

    await expect(probe()).resolves.toMatchObject({
      status: 200,
      body: { status: 'up', code: 404 },
    });
  });

  it('reports down when the backend cannot serve', async () => {
    process.env.API_URL = await listen(() => 500);

    await expect(probe()).resolves.toMatchObject({ status: 503, body: { status: 'down' } });
  });

  it('reports down when nothing is listening', async () => {
    const origin = await listen(() => 200);
    await new Promise((resolve) => (server ? server.close(resolve) : resolve(null)));
    server = null;
    process.env.API_URL = origin;

    await expect(probe()).resolves.toMatchObject({ status: 503, body: { status: 'down' } });
  });

  it('never lets the answer be cached', async () => {
    process.env.API_URL = await listen(() => 200);

    const response = await GET();
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
});
