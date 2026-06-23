"use client";

import { useState, useEffect, useCallback } from "react";
import type { Child, Classroom, CheckInLog } from "../types/kids-kingdom.types";
import { apiGet, apiPost, apiPatch, isApiError } from "@/services/api-client";
import { toast } from "sonner";

export function useKidsKingdom() {
  const [children, setChildren] = useState<Child[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [checkIns, setCheckIns] = useState<CheckInLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchChildren = useCallback(async () => {
    try {
      const response = await apiGet<Child[]>("/api/kids-kingdom/children/");
      if (!isApiError(response)) {
        setChildren(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch children:", err);
    }
  }, []);

  const fetchClassrooms = useCallback(async () => {
    try {
      const response = await apiGet<Classroom[]>("/api/kids-kingdom/classrooms/");
      if (!isApiError(response)) {
        setClassrooms(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch classrooms:", err);
    }
  }, []);

  const fetchCheckIns = useCallback(async () => {
    try {
      // Fetch check-ins for today by default
      const response = await apiGet<CheckInLog[]>("/api/kids-kingdom/check-ins/");
      if (!isApiError(response)) {
        setCheckIns(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch check-ins:", err);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      fetchChildren(),
      fetchClassrooms(),
      fetchCheckIns(),
    ]);
    setIsLoading(false);
  }, [fetchChildren, fetchClassrooms, fetchCheckIns]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const addChild = useCallback(async (newChild: Omit<Child, "id" | "created_at" | "updated_at" | "status" | "age">) => {
    setIsLoading(true);
    try {
      const response = await apiPost<Child>("/api/kids-kingdom/children/", newChild);
      if (!isApiError(response)) {
        toast.success("Child registered successfully.");
        await fetchChildren();
        return response.data;
      } else {
        toast.error(`Registration failed: ${response.message}`);
      }
    } catch (err: any) {
      console.error("Failed to register child:", err);
      const detail = err.response?.data?.message || err.message;
      toast.error(`Failed to register child: ${detail}`);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [fetchChildren]);

  const updateChild = useCallback(async (id: string, updatedFields: Partial<Child>) => {
    setIsLoading(true);
    try {
      const response = await apiPatch<Child>(`/api/kids-kingdom/children/${id}/`, updatedFields);
      if (!isApiError(response)) {
        toast.success("Child profile updated successfully.");
        await fetchChildren();
        return response.data;
      } else {
        toast.error(`Update failed: ${response.message}`);
      }
    } catch (err: any) {
      console.error("Failed to update child:", err);
      const detail = err.response?.data?.message || err.message;
      toast.error(`Failed to update child: ${detail}`);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [fetchChildren]);

  const addClassroom = useCallback(async (newRoom: Omit<Classroom, "id" | "created_at" | "updated_at">) => {
    setIsLoading(true);
    try {
      const response = await apiPost<Classroom>("/api/kids-kingdom/classrooms/", newRoom);
      if (!isApiError(response)) {
        toast.success("Classroom created successfully.");
        await fetchClassrooms();
        return response.data;
      } else {
        toast.error(`Failed to create classroom: ${response.message}`);
      }
    } catch (err: any) {
      console.error("Failed to create classroom:", err);
      const detail = err.response?.data?.message || err.message;
      toast.error(`Failed to create classroom: ${detail}`);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [fetchClassrooms]);

  const checkInChild = useCallback(async (childId: string, checkedInById: string, classroomId?: string) => {
    setIsLoading(true);
    try {
      const payload = { child_id: childId, checked_in_by_id: checkedInById, classroom_id: classroomId };
      const response = await apiPost<CheckInLog>("/api/kids-kingdom/check-ins/check-in/", payload);
      if (!isApiError(response)) {
        toast.success("Child checked in successfully.");
        await fetchCheckIns();
        return response.data;
      } else {
        toast.error(`Check-in failed: ${response.message}`);
      }
    } catch (err: any) {
      console.error("Check-in error:", err);
      const detail = err.response?.data?.error || err.response?.data?.message || err.message;
      toast.error(`Check-in failed: ${detail}`);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [fetchCheckIns]);

  const checkOutChild = useCallback(async (logId: string, securityCode: string, checkedOutById: string) => {
    setIsLoading(true);
    try {
      const payload = { security_code: securityCode, checked_out_by_id: checkedOutById };
      const response = await apiPost<CheckInLog>(`/api/kids-kingdom/check-ins/${logId}/check-out/`, payload);
      if (!isApiError(response)) {
        toast.success("Child checked out successfully.");
        await fetchCheckIns();
        return response.data;
      } else {
        toast.error(`Check-out failed: ${response.message}`);
      }
    } catch (err: any) {
      console.error("Check-out error:", err);
      const detail = err.response?.data?.error || err.response?.data?.message || err.message;
      toast.error(`Check-out failed: ${detail}`);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [fetchCheckIns]);

  return {
    children,
    classrooms,
    checkIns,
    isLoading,
    addChild,
    updateChild,
    addClassroom,
    checkInChild,
    checkOutChild,
    refetch: fetchAllData
  };
}
