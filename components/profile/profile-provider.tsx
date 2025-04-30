'use client';

import { LoadingScreen } from '@/components/loading-screen';
import { useUser } from '@civic/auth/react';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type AlertSetting = {
  id: string;
  type: 'validator' | 'network' | 'stake';
  condition: string;
  value: string | number;
  enabled: boolean;
};

export type FavoriteValidator = {
  identity: string;
  name: string;
  addedAt: string;
};

export type UserProfile = {
  theme: 'dark' | 'light' | 'system';
  refreshInterval: number; // in seconds
  alerts: AlertSetting[];
  favoriteValidators: FavoriteValidator[];
  dashboardLayout: string[]; // IDs of visible widgets in preferred order
};

type ProfileContextType = {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addAlert: (alert: Omit<AlertSetting, 'id'>) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  addFavoriteValidator: (validator: { identity: string; name: string }) => void;
  removeFavoriteValidator: (identity: string) => void;
  isValidatorFavorite: (identity: string) => boolean;
  loading: boolean;
  error: string | null;
};

const defaultProfile: UserProfile = {
  theme: 'system',
  refreshInterval: 60,
  alerts: [],
  favoriteValidators: [],
  dashboardLayout: ['overview', 'validators', 'network', 'rewards'],
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { authStatus } = useUser();
  const isAuthenticated = authStatus === 'authenticated';
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user preferences from MongoDB when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(defaultProfile);
      setLoading(false);
      return;
    }

    const loadPreferences = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user/preferences');
        if (!response.ok) throw new Error('Failed to load preferences');

        const data = await response.json();
        setProfile(data);
        setError(null);
      } catch (err) {
        console.error('Error loading preferences:', err);
        setError('Failed to load user preferences');
        setProfile(defaultProfile);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [isAuthenticated]);

  // Update preferences in MongoDB
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!isAuthenticated) {
      setProfile((prev) => ({ ...prev, ...updates }));
      return;
    }

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update preferences');

      const updatedData = await response.json();
      setProfile(updatedData);
      setError(null);
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError('Failed to update preferences');
    }
  };

  // Add a new alert
  const addAlert = (alert: Omit<AlertSetting, 'id'>) => {
    const newAlert: AlertSetting = {
      ...alert,
      id: crypto.randomUUID(),
    };
    setProfile((prev) => ({
      ...prev,
      alerts: [...prev.alerts, newAlert],
    }));
  };

  // Remove an alert
  const removeAlert = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      alerts: prev.alerts.filter((alert) => alert.id !== id),
    }));
  };

  // Toggle alert enabled state
  const toggleAlert = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      alerts: prev.alerts.map((alert) =>
        alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
      ),
    }));
  };

  // Add a favorite validator
  const addFavoriteValidator = (validator: {
    identity: string;
    name: string;
  }) => {
    setProfile((prev) => {
      // Check if already exists
      if (
        prev.favoriteValidators.some(
          (fav) => fav.identity === validator.identity
        )
      ) {
        return prev;
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
      };
    });
  };

  // Remove a favorite validator
  const removeFavoriteValidator = (identity: string) => {
    setProfile((prev) => ({
      ...prev,
      favoriteValidators: prev.favoriteValidators.filter(
        (fav) => fav.identity !== identity
      ),
    }));
  };

  // Check if a validator is in favorites
  const isValidatorFavorite = (identity: string) => {
    return profile.favoriteValidators.some((fav) => fav.identity === identity);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ProfileContext.Provider
      value={{
        profile,
        updateProfile,
        loading,
        error,
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
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
