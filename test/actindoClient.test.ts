import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock `ofetch` so the client can be exercised without any network access.
// `createSpy` captures the config handed to `ofetch.create`; `fetchMock` is the
// returned fetch instance whose calls/results we control per test.
const { createSpy, fetchMock } = vi.hoisted(() => {
  const fetchMock = vi.fn();
  const createSpy = vi.fn(() => fetchMock);
  return { createSpy, fetchMock };
});

vi.mock('ofetch', () => ({
  ofetch: { create: createSpy },
}));

import { createActindoClient } from '../src/runtime/server/client/actindoClient';

const VALID_CONFIG = {
  baseUrl: 'https://laioutr.actindo.com',
  apiKey: 'tenant-secret-key',
} as const;

describe('createActindoClient', () => {
  beforeEach(() => {
    createSpy.mockClear();
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(undefined);
  });

  it('configures ofetch with the base URL and a Bearer auth header', () => {
    createActindoClient(VALID_CONFIG);

    expect(createSpy).toHaveBeenCalledTimes(1);
    const options = createSpy.mock.calls[0]![0];
    expect(options.baseURL).toBe(VALID_CONFIG.baseUrl);
    expect(options.headers).toMatchObject({
      Authorization: `Bearer ${VALID_CONFIG.apiKey}`,
    });
  });

  it('applies the default timeout, overridable via config', () => {
    createActindoClient(VALID_CONFIG);
    expect(createSpy.mock.calls[0]![0].timeout).toBe(10_000);

    createSpy.mockClear();
    createActindoClient({ ...VALID_CONFIG, timeout: 2500 });
    expect(createSpy.mock.calls[0]![0].timeout).toBe(2500);
  });

  it('throws when baseUrl is missing', () => {
    expect(() => createActindoClient({ ...VALID_CONFIG, baseUrl: '' })).toThrow(/baseUrl is required/);
  });

  it('throws when apiKey is missing', () => {
    expect(() => createActindoClient({ ...VALID_CONFIG, apiKey: '' })).toThrow(/apiKey is required/);
  });

  describe('request', () => {
    it('delegates to the configured fetch instance', async () => {
      fetchMock.mockResolvedValueOnce({ id: 1 });
      const client = createActindoClient(VALID_CONFIG);

      const result = await client.request('/v1/anything', { method: 'GET' });

      expect(fetchMock).toHaveBeenCalledWith('/v1/anything', { method: 'GET' });
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('health', () => {
    it('probes GET /health and reports ok on success', async () => {
      fetchMock.mockResolvedValueOnce({ status: 'up' });
      const client = createActindoClient(VALID_CONFIG);

      const status = await client.health();

      expect(fetchMock).toHaveBeenCalledWith('/health', { method: 'GET' });
      expect(status).toEqual({ ok: true, payload: { status: 'up' } });
    });

    it('reports not-ok with the error message instead of throwing', async () => {
      fetchMock.mockRejectedValueOnce(new Error('401 Unauthorized'));
      const client = createActindoClient(VALID_CONFIG);

      const status = await client.health();

      expect(status).toEqual({ ok: false, error: '401 Unauthorized' });
    });
  });
});
