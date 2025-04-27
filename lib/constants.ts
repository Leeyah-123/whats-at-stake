// This file contains constants used throughout the application

// Default SOL price values (used as fallback)
export const DEFAULT_SOL_PRICE = 0;
export const DEFAULT_SOL_PRICE_CHANGE = 0;

// Refresh intervals in seconds
export const DEFAULT_REFRESH_INTERVAL = 60;
export const MINIMUM_REFRESH_INTERVAL = 30;
export const MAXIMUM_REFRESH_INTERVAL = 600;

// Cache durations in milliseconds
export const CACHE_DURATION_SHORT = 60 * 1000; // 1 minute
export const CACHE_DURATION_MEDIUM = 5 * 60 * 1000; // 5 minutes
export const CACHE_DURATION_LONG = 30 * 60 * 1000; // 30 minutes

// Network constants
export const SLOTS_PER_EPOCH = 432000;
export const SLOT_TIME_MS = 400; // 400ms per slot

// Default validator metrics
export const DEFAULT_COMMISSION = 5;
export const BASE_APY = 7.0;
