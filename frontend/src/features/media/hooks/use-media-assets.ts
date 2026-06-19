"use client";

import { useState, useEffect, useCallback } from "react";
import type { MediaAsset, MediaCollection, PaginatedResponse, MediaFilters } from "../types/media.types";
import { MediaRepository } from "../repositories/media.repository";
import { useAuth } from "@/hooks/use-auth";

export function useMediaAssets(initialFilters: MediaFilters = {}) {
  const { user, role } = useAuth();
  const branchId = (user as any)?.branch_id || "branch-001";
  const userUuid = (user as any)?.id ? String((user as any).id) : "d3b07384-d113-4ec2-a5d8-c83d6850c2f3";
  const userName = user ? `${user.first_name} ${user.last_name}` : "Leader";

  const [filters, setFilters] = useState<MediaFilters>({
    page: 1,
    pageSize: 8,
    search: "",
    type: "all",
    category: "all",
    showArchived: false,
    ...initialFilters
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PaginatedResponse<MediaAsset> | null>(null);
  const [collections, setCollections] = useState<MediaCollection[]>([]);

  // Fetch collections
  const loadCollections = useCallback(async () => {
    try {
      const cols = await MediaRepository.getCollections(branchId);
      setCollections(cols);
    } catch (err: any) {
      console.error("Failed to load collections", err);
    }
  }, [branchId]);

  // Fetch assets
  const loadAssets = useCallback(async () => {
    if (!role) return;
    setLoading(true);
    setError(null);
    try {
      const response = await MediaRepository.getAssets(filters, { branchId, role });
      setData(response);
    } catch (err: any) {
      setError(err?.message || "An error occurred while fetching media assets.");
    } finally {
      setLoading(false);
    }
  }, [filters, branchId, role]);

  // Load collections on mount
  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  // Load assets whenever filters or role updates
  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  // Custom tab listener for updates
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string }>;
      if (customEvent.detail && (customEvent.detail.key === "church-mock-media-library" || customEvent.detail.key === "church-mock-media-collections")) {
        loadAssets();
        loadCollections();
      }
    };
    window.addEventListener("local-storage-update" as any, handleSync);
    return () => {
      window.removeEventListener("local-storage-update" as any, handleSync);
    };
  }, [loadAssets, loadCollections]);

  const updateFilters = useCallback((newFilters: Partial<MediaFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1 // Reset to page 1 on search/filter edits
    }));
  }, []);

  const uploadAsset = useCallback(async (
    title: string,
    description: string,
    file_name: string,
    file_type: MediaAsset["file_type"],
    file_size: number,
    file_url: string,
    category: MediaAsset["category"],
    is_public: boolean,
    thumbnail_url: string | null = null
  ) => {
    try {
      const newAsset = await MediaRepository.createAsset({
        title,
        description,
        file_name,
        file_type,
        file_size,
        file_url,
        thumbnail_url,
        category,
        branch_id: branchId,
        uploaded_by: userUuid,
        uploaded_by_name: userName,
        is_public,
        is_archived: false,
        archived_at: null,
        status: "Ready"
      });
      await loadAssets();
      return newAsset;
    } catch (err: any) {
      throw new Error(err?.message || "Failed to upload asset.");
    }
  }, [branchId, userUuid, userName, loadAssets]);

  const createAssetPreUpload = useCallback(async (
    title: string,
    description: string,
    file_name: string,
    file_type: MediaAsset["file_type"],
    file_size: number,
    category: MediaAsset["category"],
    is_public: boolean
  ) => {
    try {
      const newAsset = await MediaRepository.createAsset({
        title,
        description,
        file_name,
        file_type,
        file_size,
        file_url: "", // empty until uploaded
        thumbnail_url: null,
        category,
        branch_id: branchId,
        uploaded_by: userUuid,
        uploaded_by_name: userName,
        is_public,
        is_archived: false,
        archived_at: null,
        status: "Uploading"
      });
      await loadAssets();
      return newAsset;
    } catch (err: any) {
      throw new Error(err?.message || "Failed to initiate upload.");
    }
  }, [branchId, userUuid, userName, loadAssets]);

  const updateAssetStatus = useCallback(async (id: string, status: MediaAsset["status"], url?: string, thumb?: string | null) => {
    try {
      const updates: Partial<MediaAsset> = { status };
      if (url) updates.file_url = url;
      if (thumb !== undefined) updates.thumbnail_url = thumb;
      await MediaRepository.updateAsset(id, updates);
      await loadAssets();
    } catch (err) {
      console.error("Failed to update asset status", err);
    }
  }, [loadAssets]);

  const archiveAsset = useCallback(async (id: string) => {
    try {
      await MediaRepository.archiveAsset(id);
      await loadAssets();
    } catch (err: any) {
      throw new Error(err?.message || "Failed to archive asset.");
    }
  }, [loadAssets]);

  const restoreAsset = useCallback(async (id: string) => {
    try {
      await MediaRepository.restoreAsset(id);
      await loadAssets();
    } catch (err: any) {
      throw new Error(err?.message || "Failed to restore asset.");
    }
  }, [loadAssets]);

  const downloadAsset = useCallback(async (id: string) => {
    try {
      await MediaRepository.incrementDownloadCount(id);
      await loadAssets();
    } catch (err) {
      console.error("Failed to register download statistics", err);
    }
  }, [loadAssets]);

  const createCollection = useCallback(async (name: string, description: string) => {
    try {
      const newCol = await MediaRepository.createCollection(name, description, branchId, userUuid);
      await loadCollections();
      return newCol;
    } catch (err: any) {
      throw new Error(err?.message || "Failed to create collection.");
    }
  }, [branchId, userUuid, loadCollections]);

  return {
    assets: data?.results || [],
    pagination: {
      count: data?.count || 0,
      page: data?.page || 1,
      page_size: data?.page_size || 8,
      total_pages: data?.total_pages || 1,
      next: data?.next || null,
      previous: data?.previous || null
    },
    collections,
    loading,
    error,
    filters,
    updateFilters,
    uploadAsset,
    createAssetPreUpload,
    updateAssetStatus,
    archiveAsset,
    restoreAsset,
    downloadAsset,
    createCollection,
    refetch: loadAssets
  };
}
