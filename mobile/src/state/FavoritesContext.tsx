import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { Property } from "../types";

type FavoritesContextValue = {
  favoriteIds: string[];
  favoriteProperties: Property[];
  isFavorite: (propertyId: string) => boolean;
  toggleFavorite: (property: Property) => void;
  removeFavorite: (propertyId: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);
const FAVORITES_STORAGE_KEY = "wana-imba:favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteMap, setFavoriteMap] = useState<Record<string, Property>>({});
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const saved = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Record<string, Property>;
          setFavoriteMap(parsed);
        }
      } catch {
        setFavoriteMap({});
      } finally {
        setHasLoaded(true);
      }
    }

    loadFavorites();
  }, []);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteMap)).catch(() => undefined);
  }, [favoriteMap, hasLoaded]);

  const value = useMemo<FavoritesContextValue>(() => {
    const favoriteProperties = Object.values(favoriteMap);

    return {
      favoriteIds: favoriteProperties.map((property) => property.id),
      favoriteProperties,
      isFavorite: (propertyId) => Boolean(favoriteMap[propertyId]),
      toggleFavorite: (property) => {
        setFavoriteMap((current) => {
          if (current[property.id]) {
            const next = { ...current };
            delete next[property.id];
            return next;
          }

          return { ...current, [property.id]: property };
        });
      },
      removeFavorite: (propertyId) => {
        setFavoriteMap((current) => {
          const next = { ...current };
          delete next[propertyId];
          return next;
        });
      }
    };
  }, [favoriteMap]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }

  return context;
}
