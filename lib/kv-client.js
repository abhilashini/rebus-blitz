/**
 * Vercel KV Client Utility
 * Manages connection to Vercel KV (Redis) with error handling and fallbacks
 */

import { createClient } from '@vercel/kv';

let kvClient = null;
let isConnected = false;

/**
 * Initialize KV client with environment variables
 * @returns {Promise<Object>} KV client instance
 * @throws {Error} If KV credentials are missing
 */
export async function initKVClient() {
  if (kvClient && isConnected) {
    return kvClient;
  }

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    console.warn('KV credentials not configured. Using fallback mode.');
    return createFallbackClient();
  }

  try {
    kvClient = createClient({
      url,
      token,
      retry: {
        retries: 3,
        factor: 2,
        minTimeout: 100,
        maxTimeout: 1000,
      },
    });

    // Test connection
    await kvClient.ping();
    isConnected = true;
    console.log('KV client connected successfully');
    
    return kvClient;
  } catch (error) {
    console.error('Failed to connect to KV:', error.message);
    return createFallbackClient();
  }
}

/**
 * Create fallback client for when KV is unavailable
 * @returns {Object} Mock KV client with in-memory storage
 */
function createFallbackClient() {
  const memoryStore = new Map();
  const listStore = new Map();
  
  console.log('Using fallback in-memory KV client');
  
  return {
    // Hash operations
    hset: async (key, field, value) => {
      if (typeof field === 'object') {
        memoryStore.set(key, field);
      } else {
        const existing = memoryStore.get(key) || {};
        existing[field] = value;
        memoryStore.set(key, existing);
      }
      return 1;
    },
    
    hgetall: async (key) => {
      return memoryStore.get(key) || {};
    },
    
    hincrby: async (key, field, increment) => {
      const existing = memoryStore.get(key) || {};
      const current = parseInt(existing[field]) || 0;
      existing[field] = current + increment;
      memoryStore.set(key, existing);
      return existing[field];
    },
    
    // List operations
    lrange: async (key, start, stop) => {
      const list = listStore.get(key) || [];
      const normalizedStop = stop < 0 ? list.length + stop + 1 : stop + 1;
      return list.slice(start, normalizedStop);
    },
    
    lpush: async (key, ...values) => {
      const list = listStore.get(key) || [];
      list.unshift(...values);
      listStore.set(key, list);
      return list.length;
    },
    
    // Set operations
    sadd: async (key, ...members) => {
      const set = listStore.get(key) || new Set();
      members.forEach(member => set.add(member));
      listStore.set(key, Array.from(set));
      return members.length;
    },
    
    smembers: async (key) => {
      return listStore.get(key) || [];
    },
    
    // Generic operations
    get: async (key) => {
      return memoryStore.get(key) || null;
    },
    
    set: async (key, value) => {
      memoryStore.set(key, value);
      return 'OK';
    },
    
    del: async (key) => {
      const existed = memoryStore.has(key) || listStore.has(key);
      memoryStore.delete(key);
      listStore.delete(key);
      return existed ? 1 : 0;
    },
    
    ping: async () => 'PONG',
    
    // Health check
    isConnected: () => isConnected,
  };
}

/**
 * Get KV client instance (initializes if needed)
 * @returns {Promise<Object>} KV client
 */
export async function getKVClient() {
  if (!kvClient) {
    return initKVClient();
  }
  return kvClient;
}

/**
 * Check if KV is healthy
 * @returns {Promise<Object>} Health status
 */
export async function checkKVHealth() {
  try {
    const client = await getKVClient();
    await client.ping();
    
    // Try to get puzzle count
    const puzzleIds = await client.lrange('puzzles:ids', 0, -1);
    
    return {
      status: 'healthy',
      connected: client.isConnected ? client.isConnected() : true,
      puzzleCount: puzzleIds.length,
      mode: client.isConnected && client.isConnected() ? 'kv' : 'fallback',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      connected: false,
      puzzleCount: 0,
      mode: 'fallback',
      error: error.message,
    };
  }
}
