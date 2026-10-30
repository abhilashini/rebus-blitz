/**
 * Lightweight, Zero-Dependency Upstash / Vercel KV REST Client
 * Communicates directly with Upstash Redis via native fetch.
 * Automatically falls back to in-memory store if credentials are missing or invalid.
 */

let activeClient = null;
let isConnected = false;

// Fallback in-memory store for local testing or when offline
const inMemoryStore = {
  hashes: new Map(),
  lists: new Map(),
  counters: new Map(),
};

/**
 * Creates in-memory mock client when KV is unreachable
 */
function createFallbackClient() {
  console.log('[KV Client] Running in Fallback Mode (In-Memory)');
  return {
    isFallback: true,
    ping: async () => 'PONG (memory)',
    hset: async (key, fieldOrObj, val) => {
      let existing = inMemoryStore.hashes.get(key) || {};
      if (typeof fieldOrObj === 'object' && fieldOrObj !== null) {
        existing = { ...existing, ...fieldOrObj };
      } else {
        existing[fieldOrObj] = val;
      }
      inMemoryStore.hashes.set(key, existing);
      return 1;
    },
    hgetall: async (key) => {
      return inMemoryStore.hashes.get(key) || {};
    },
    hincrby: async (key, field, amount = 1) => {
      const existing = inMemoryStore.hashes.get(key) || {};
      const current = parseInt(existing[field], 10) || 0;
      existing[field] = current + amount;
      inMemoryStore.hashes.set(key, existing);
      return existing[field];
    },
    lpush: async (key, ...values) => {
      const list = inMemoryStore.lists.get(key) || [];
      list.unshift(...values);
      inMemoryStore.lists.set(key, list);
      return list.length;
    },
    lrange: async (key, start = 0, stop = -1) => {
      const list = inMemoryStore.lists.get(key) || [];
      if (stop === -1) return list.slice(start);
      return list.slice(start, stop + 1);
    },
    get: async (key) => inMemoryStore.hashes.get(key) || null,
    set: async (key, value) => {
      inMemoryStore.hashes.set(key, value);
      return 'OK';
    }
  };
}

/**
 * Creates real HTTP REST client for Upstash Redis / Vercel KV
 */
function createRestClient(url, token) {
  const cleanUrl = url.replace(/\/$/, '');

  const executeCommand = async (commandArray) => {
    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commandArray),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upstash HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`Upstash Redis Error: ${data.error}`);
    }

    return data.result;
  };

  return {
    isFallback: false,
    ping: async () => executeCommand(['PING']),

    hset: async (key, fieldOrObj, val) => {
      if (typeof fieldOrObj === 'object' && fieldOrObj !== null) {
        const flatArgs = ['HSET', key];
        for (const [k, v] of Object.entries(fieldOrObj)) {
          flatArgs.push(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
        }
        return executeCommand(flatArgs);
      }
      return executeCommand(['HSET', key, fieldOrObj, typeof val === 'object' ? JSON.stringify(val) : String(val)]);
    },

    hgetall: async (key) => {
      const res = await executeCommand(['HGETALL', key]);
      if (!res) return {};
      // If Upstash returns an array: [k1, v1, k2, v2, ...]
      if (Array.isArray(res)) {
        const obj = {};
        for (let i = 0; i < res.length; i += 2) {
          obj[res[i]] = res[i + 1];
        }
        return obj;
      }
      // If Upstash returns an object
      return typeof res === 'object' ? res : {};
    },

    hincrby: async (key, field, amount = 1) => {
      return executeCommand(['HINCRBY', key, field, String(amount)]);
    },

    lpush: async (key, ...values) => {
      const flat = ['LPUSH', key, ...values.map(String)];
      return executeCommand(flat);
    },

    lrange: async (key, start = 0, stop = -1) => {
      const res = await executeCommand(['LRANGE', key, String(start), String(stop)]);
      return Array.isArray(res) ? res : [];
    },

    get: async (key) => executeCommand(['GET', key]),
    set: async (key, value) => executeCommand(['SET', key, typeof value === 'object' ? JSON.stringify(value) : String(value)]),
  };
}

/**
 * Initialize connection to KV
 */
export async function initKVClient() {
  if (activeClient && isConnected) {
    return activeClient;
  }

  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('[KV Client] Missing KV_REST_API_URL or KV_REST_API_TOKEN. Using fallback mode.');
    activeClient = createFallbackClient();
    return activeClient;
  }

  try {
    const client = createRestClient(url, token);
    await client.ping();
    activeClient = client;
    isConnected = true;
    console.log('[KV Client] Successfully connected to Upstash / Vercel KV');
    return activeClient;
  } catch (err) {
    console.warn(`[KV Client] Could not reach KV (${err.message}). Using in-memory fallback.`);
    activeClient = createFallbackClient();
    return activeClient;
  }
}

export async function getKVClient() {
  return initKVClient();
}

/**
 * Health check status utility
 */
export async function checkKVHealth() {
  try {
    const client = await initKVClient();
    const isFallback = Boolean(client.isFallback);
    let connected = !isFallback;

    return {
      status: connected ? 'healthy' : 'fallback',
      connected,
      mode: isFallback ? 'fallback' : 'production',
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    return {
      status: 'error',
      connected: false,
      mode: 'fallback',
      error: err.message,
      timestamp: new Date().toISOString()
    };
  }
}

export default {
  initKVClient,
  getKVClient,
  checkKVHealth
};
