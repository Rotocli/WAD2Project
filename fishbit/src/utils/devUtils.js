import { useUserStore } from '@/stores/userStore'

export function isDevAccount() {
  const userStore = useUserStore()
  return userStore.isDeveloper === true
}

export function devLog(...args) {
  if (isDevAccount()) {
    console.log('🔧 [DEV]', ...args)
  }
}

export function devError(...args) {
  if (isDevAccount()) {
    console.error('🔧 [DEV]', ...args)
  }
}

export function devWarn(...args) {
  if (isDevAccount()) {
    console.warn('🔧 [DEV]', ...args)
  }
}

export function devInfo(...args) {
  if (isDevAccount()) {
    console.info('🔧 [DEV]', ...args)
  }
}

export function devOnly(callback) {
  if (isDevAccount() && typeof callback === 'function') {
    callback()
  }
}

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
