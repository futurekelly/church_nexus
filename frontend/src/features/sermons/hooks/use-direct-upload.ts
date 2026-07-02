"use client";

import { useState, useCallback, useRef } from "react";
import { getApiClient, apiPost, isApiError } from "@/services/api-client";
import { toast } from "sonner";

export type UploadStatus =
  | "idle"
  | "intent"
  | "uploading"
  | "completing"
  | "completed"
  | "error";

export interface DirectUploadOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useDirectUpload(options?: DirectUploadOptions) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [storageKey, setStorageKey] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);

  const activeFileRef = useRef<File | null>(null);
  const activeAssetTypeRef = useRef<"video" | "audio" | "thumbnail">("video");
  const activeSermonIdRef = useRef<string | undefined>(undefined);

  const startUpload = useCallback(
    async (
      file: File,
      assetType: "video" | "audio" | "thumbnail",
      sermonId?: string
    ) => {
      activeFileRef.current = file;
      activeAssetTypeRef.current = assetType;
      activeSermonIdRef.current = sermonId;

      setStatus("intent");
      setProgress(5);
      setError(null);

      try {
        // 1. Request Upload Intent
        const intentRes = await apiPost<any>("/api/sermons/upload-intent/", {
          filename: file.name,
          file_size: file.size,
          content_type: file.type,
          asset_type: assetType,
        });

        if (isApiError(intentRes)) {
          const errMsg = intentRes.message || "Failed to initiate upload session.";
          setStatus("error");
          setError(errMsg);
          options?.onError?.(errMsg);
          toast.error(errMsg);
          return null;
        }

        const { upload_id, storage_key, upload_url, direct_upload } = intentRes.data;
        setUploadId(upload_id);
        setStorageKey(storage_key);
        setStatus("uploading");

        // 2. Perform File Upload
        const client = getApiClient();
        if (direct_upload && upload_url) {
          // PUT binary file to S3/MinIO presigned URL
          await client.put(upload_url, file, {
            timeout: 0, // Disable timeout for large file uploads
            headers: { "Content-Type": file.type || "application/octet-stream" },
            onUploadProgress: (evt) => {
              if (evt.total) {
                const pct = Math.round((evt.loaded / evt.total) * 90);
                setProgress(Math.max(10, pct));
              }
            },
          });
        } else {
          // Standard local multipart upload fallback
          const formData = new FormData();
          formData.append("file", file);
          formData.append("storage_key", storage_key);

          await client.post("/api/sermons/upload-intent/", formData, {
            timeout: 0, // Disable timeout for large file uploads
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (evt) => {
              if (evt.total) {
                const pct = Math.round((evt.loaded / evt.total) * 90);
                setProgress(Math.max(10, pct));
              }
            },
          });
        }

        setStatus("completing");
        setProgress(95);

        // 3. Confirm Upload Completion
        const completeRes = await apiPost<any>("/api/sermons/upload-complete/", {
          upload_id,
          storage_key,
          asset_type: assetType,
          sermon_id: sermonId,
        });

        if (isApiError(completeRes)) {
          const errMsg = completeRes.message || "Failed to verify asset completion.";
          setStatus("error");
          setError(errMsg);
          options?.onError?.(errMsg);
          toast.error(errMsg);
          return null;
        }

        setStatus("completed");
        setProgress(100);
        options?.onSuccess?.(completeRes.data);
        toast.success("Media uploaded successfully.");
        return completeRes.data;
      } catch (err: any) {
        const errMsg = err.message || "An error occurred during media upload.";
        setStatus("error");
        setError(errMsg);
        options?.onError?.(errMsg);
        toast.error(errMsg);
        return null;
      }
    },
    [options]
  );

  const retry = useCallback(() => {
    if (activeFileRef.current && activeAssetTypeRef.current) {
      startUpload(
        activeFileRef.current,
        activeAssetTypeRef.current,
        activeSermonIdRef.current
      );
    }
  }, [startUpload]);

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setError(null);
    setStorageKey(null);
    setUploadId(null);
    activeFileRef.current = null;
  }, []);

  return {
    status,
    progress,
    error,
    storageKey,
    uploadId,
    startUpload,
    retry,
    reset,
    isUploading:
      status === "intent" || status === "uploading" || status === "completing",
  };
}
