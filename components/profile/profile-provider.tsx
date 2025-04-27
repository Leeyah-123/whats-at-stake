"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useWallet } from "../wallet/wallet-provider"

export type AlertSetting = {
  id: string
  type: "validator" | "network" | "stake"
  condition: string
  value: string | number
  enabled: boolean
}

export type FavoriteValidator = {
  identity: string
  name: string
  addedAt: string
}

export type UserProfile = {
  theme: "dark" | "light" | "system"
  refreshInterval: number // in seconds
  alerts: AlertSetting[]
  favoriteValidators: FavoriteValidator[]
  dashboardLayout: string[] // IDs of visible widgets in preferred order
}

type ProfileContextType = {
  profile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
  addAlert: (alert: Omit<AlertSetting, "id">) => void
  removeAlert: (id: string) => void
  toggleAlert: (id: string) => void
  addFavoriteValidator: (validator: { identity: string; name: string }) => void
  removeFavoriteValidator: (identity: string) => void
  isValidatorFavorite: (identity: string) => boolean
}

const defaultProfile: UserProfile = {
  theme: "system",
  refreshInterval: 60,
  alerts: [],
  favoriteValidators: [],
  dashboardLayout: ["overview", "validators", "network", "rewards"],
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet()
  const storageKey = publicKey ? `solana-dashboard-profile-${publicKey}` : "solana-dashboard-profile"
  const [profile, setProfile] = useLocalStorage<UserProfile>(storageKey, defaultProfile)

  // Update profile with partial data
  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }))
  }

  // Add a new alert
  const addAlert = (alert: Omit<AlertSetting, "id">) => {
    const newAlert: AlertSetting = {
      ...alert,
      id: crypto.randomUUID(),
    }
    setProfile((prev) => ({
      ...prev,
      alerts: [...prev.alerts, newAlert],
    }))
  }

  // Remove an alert
  const removeAlert = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      alerts: prev.alerts.filter((alert) => alert.id !== id),
    }))
  }

  // Toggle alert enabled state
  const toggleAlert = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      alerts: prev.alerts.map((alert) => (alert.id === id ? { ...alert, enabled: !alert.enabled } : alert)),
    }))
  }

  // Add a favorite validator
  const addFavoriteValidator = (validator: { identity: string; name: string }) => {
    setProfile((prev) => {
      // Check if already exists
      if (prev.favoriteValidators.some((fav) => fav.identity === validator.identity)) {
        return prev
      }

      return {
        ...prev,
        favoriteValidators: [
          ...prev.favoriteValidators,
          {
            ...validator,
            addedAt: new Date().toISOString(),
          },
        ],
      }
    })
  }

  // Remove a favorite validator
  const removeFavoriteValidator = (identity: string) => {
    setProfile((prev) => ({
      ...prev,
      favoriteValidators: prev.favoriteValidators.filter((fav) => fav.identity !== identity),
    }))
  }

  // Check if a validator is in favorites
  const isValidatorFavorite = (identity: string) => {
    return profile.favoriteValidators.some((fav) => fav.identity === identity)
  }

  return (
    <ProfileContext.Provider
      value={{
        profile,
        updateProfile,
        addAlert,
        removeAlert,
        toggleAlert,
        addFavoriteValidator,
        removeFavoriteValidator,
        isValidatorFavorite,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}
