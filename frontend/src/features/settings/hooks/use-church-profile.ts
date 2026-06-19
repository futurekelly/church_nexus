"use client";

import { useCallback } from "react";
import type { ChurchProfileSettings } from "../types/church-profile.types";
import { MOCK_CHURCH_PROFILE } from "../data/mock-settings-data";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";

export function useChurchProfile() {
  const [profile, setProfile] = useLocalStorageState<ChurchProfileSettings>(
    "church-settings-profile",
    MOCK_CHURCH_PROFILE
  );

  const updateChurchProfile = useCallback(
    (updatedFields: Partial<ChurchProfileSettings>) => {
      setProfile((prev) => ({
        ...prev,
        ...updatedFields
      }));
    },
    [setProfile]
  );

  return {
    profile,
    updateChurchProfile
  };
}
