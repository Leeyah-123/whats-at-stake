import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number): string {
  if (value === null || value === undefined) return "0"

  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(2) + "M"
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(2) + "K"
  } else if (value >= 100) {
    return value.toFixed(0)
  } else if (value >= 10) {
    return value.toFixed(1)
  } else {
    return value.toFixed(2)
  }
}

export function formatPercentage(value: number): string {
  if (value === null || value === undefined) return "0"

  if (value >= 100) {
    return value.toFixed(0)
  } else if (value >= 10) {
    return value.toFixed(1)
  } else {
    return value.toFixed(2)
  }
}

export function formatAddress(address: string, length = 4): string {
  if (!address) return ""
  if (address.length <= length * 2) return address

  return `${address.slice(0, length)}...${address.slice(-length)}`
}

export function debounce<F extends (...args: any[]) => any>(func: F, wait: number): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<F>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<F extends (...args: any[]) => any>(func: F, limit: number): (...args: Parameters<F>) => void {
  let inThrottle = false

  return (...args: Parameters<F>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
