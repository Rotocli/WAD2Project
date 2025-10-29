// src/utils/devUtils.js
// Developer utility functions for FishBit

import { useUserStore } from '@/stores/userStore'

/**
 * Check if current user is a developer account
 * @returns {boolean} - True if user has isDeveloper flag set
 */
export function isDevAccount() {
  const userStore = useUserStore()
  return userStore.isDeveloper === true
}

/**
 * Log message only for developer accounts
 * @param  {...any} args - Arguments to log
 */
export function devLog(...args) {
  if (isDevAccount()) {
    console.log('🔧 [DEV]', ...args)
  }
}

/**
 * Log error only for developer accounts
 * @param  {...any} args - Arguments to log
 */
export function devError(...args) {
  if (isDevAccount()) {
    console.error('🔧 [DEV]', ...args)
  }
}

/**
 * Log warning only for developer accounts
 * @param  {...any} args - Arguments to log
 */
export function devWarn(...args) {
  if (isDevAccount()) {
    console.warn('🔧 [DEV]', ...args)
  }
}

/**
 * Log info only for developer accounts
 * @param  {...any} args - Arguments to log
 */
export function devInfo(...args) {
  if (isDevAccount()) {
    console.info('🔧 [DEV]', ...args)
  }
}

/**
 * Execute a function only if user is a developer
 * @param {Function} callback - Function to execute
 */
export function devOnly(callback) {
  if (isDevAccount() && typeof callback === 'function') {
    callback()
  }
}

/**
 * Get developer-only data or default value
 * @param {*} devData - Data to return for developers
 * @param {*} defaultData - Data to return for non-developers
 * @returns {*} - Developer data if dev account, otherwise default data
 */
export function devData(devData, defaultData = null) {
  return isDevAccount() ? devData : defaultData
}

export default {
  isDevAccount,
  devLog,
  devError,
  devWarn,
  devInfo,
  devOnly,
  devData
}
