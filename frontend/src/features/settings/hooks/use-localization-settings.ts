"use client";

import { useCallback } from "react";
import type { LocalizationSettings } from "../types/localization.types";
import { MOCK_LOCALIZATION_SETTINGS } from "../data/mock-settings-data";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";

export function useLocalizationSettings() {
  const [settings, setSettings] = useLocalStorageState<LocalizationSettings>(
    "church-settings-localization",
    MOCK_LOCALIZATION_SETTINGS
  );

  const updateLocalizationSettings = useCallback(
    (updatedFields: Partial<LocalizationSettings>) => {
      setSettings((prev) => ({
        ...prev,
        ...updatedFields
      }));
    },
    [setSettings]
  );

  return {
    settings,
    updateLocalizationSettings
  };
}
