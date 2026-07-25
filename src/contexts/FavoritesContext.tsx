/**
 * FavoritesContext.tsx
 * Malazone.com — Favorites Context with Server Sync
 * Dual-mode: anonymous → localStorage; authenticated → API + localStorage cache
 * © 2026 Malazone Technologies PLC
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import type { ListingItem } from '../components/ZoneCatalogGrid';

interface FavoritesContextType {
  favorites: ListingItem[];
  toggleFavorite: (item: ListingItem) => void;
  isFavorite: (id: string) => boolean;
  clearFavorites: () => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = 'malazone_favorites';

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<ListingItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const syncedRef = useRef(false);

  // Persist to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // On login: fetch server favorites, merge with localStorage, sync localStorage to server
  useEffect(() => {
    if (isAuthenticated && user && !syncedRef.current) {
      syncedRef.current = true;

      const syncFavorites = async () => {
        try {
          // 1. Fetch server favorites
          const response = await fetch('/api/favorites', { credentials: 'include' });
          const data = await response.json();

          if (data.success && Array.isArray(data.data)) {
            // Convert server favorites to ListingItem format
            const serverItems: ListingItem[] = data.data.map((f: any) => ({
              id: String(f.id),
              titleEn: f.title_en || '',
              titleAm: f.title_am || '',
              price: Number(f.price) || 0,
              priceSuffixKey: f.price_suffix || 'fixed',
              priceTagKey: 'price.fixed',
              image: f.images?.[0] || '/placeholder.svg',
              images: f.images || [],
              zone: 'all' as any,
              locationKey: f.location_key || '',
              locationTag: f.location_label_en || f.location_key || '',
              rating: 0,
              isVerified: Boolean(f.is_verified),
              isPremium: Boolean(f.is_premium),
              badgeKey: 'badge.verified',
            }));

            // 2. Merge with localStorage favorites
            const localFavorites = favorites;
            const serverIds = new Set(serverItems.map((s) => s.id));
            const localOnly = localFavorites.filter((l) => !serverIds.has(l.id));

            // 3. Sync local-only favorites to server
            if (localOnly.length > 0) {
              const localIds = localOnly.map((l) => Number(l.id)).filter((n) => !isNaN(n));
              if (localIds.length > 0) {
                await fetch('/api/favorites/sync', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ listing_ids: localIds }),
                });
              }
            }

            // 4. Set merged favorites (server + local-only)
            setFavorites([...serverItems, ...localOnly]);
          }
        } catch (err) {
          console.error('Failed to sync favorites:', err);
        }
      };

      syncFavorites();
    }
  }, [isAuthenticated, user]);

  // Reset sync flag on logout
  useEffect(() => {
    if (!isAuthenticated) {
      syncedRef.current = false;
    }
  }, [isAuthenticated]);

  const toggleFavorite = useCallback((item: ListingItem) => {
    setFavorites((prev) => {
      const exists = prev.some((fav) => fav.id === item.id);
      const next = exists
        ? prev.filter((fav) => fav.id !== item.id)
        : [...prev, item];

      // API call in background (fire-and-forget)
      if (isAuthenticated && user) {
        const method = exists ? 'DELETE' : 'POST';
        const url = exists ? `/api/favorites/${item.id}` : '/api/favorites';
        const body = exists ? undefined : JSON.stringify({ listing_id: Number(item.id) });
        fetch(url, {
          method,
          headers: exists ? undefined : { 'Content-Type': 'application/json' },
          credentials: 'include',
          body,
        }).catch((err) => console.error('Favorite sync failed:', err));
      }

      return next;
    });
  }, [isAuthenticated, user]);

  const isFavorite = useCallback((id: string) => {
    return favorites.some((fav) => fav.id === id);
  }, [favorites]);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        clearFavorites,
        isSidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
