"use client";

import { useCallback } from "react";
import type { Branch } from "../types/branch.types";
import { MOCK_BRANCHES } from "../data/mock-settings-data";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";

export function useBranches() {
  const [branches, setBranches] = useLocalStorageState<Branch[]>(
    "church-settings-branches",
    MOCK_BRANCHES
  );

  const addBranch = useCallback(
    (branchData: Omit<Branch, "id" | "created_at">) => {
      const newId = `branch-${Date.now()}`;
      const newBranch: Branch = {
        ...branchData,
        id: newId,
        created_at: new Date().toISOString(),
      };

      setBranches((prev) => {
        let updatedList = prev.map((b) => {
          if (newBranch.branch_type === "Headquarters" && b.branch_type === "Headquarters") {
            return { ...b, branch_type: "Satellite" as const };
          }
          return b;
        });
        return [...updatedList, newBranch];
      });
      return newBranch;
    },
    [setBranches]
  );

  const updateBranch = useCallback(
    (id: string, updatedFields: Partial<Omit<Branch, "id" | "created_at">>) => {
      setBranches((prev) => {
        let updatedList = prev.map((b) => (b.id === id ? { ...b, ...updatedFields } : b));
        
        // If the updated branch was changed to Headquarters, change all other HQ branches to Satellite
        if (updatedFields.branch_type === "Headquarters") {
          updatedList = updatedList.map((b) => {
            if (b.id !== id && b.branch_type === "Headquarters") {
              return { ...b, branch_type: "Satellite" as const };
            }
            return b;
          });
        }
        return updatedList;
      });
    },
    [setBranches]
  );

  const setHeadquarters = useCallback(
    (id: string) => {
      setBranches((prev) =>
        prev.map((b) => {
          if (b.id === id) {
            return { ...b, branch_type: "Headquarters" as const };
          }
          if (b.branch_type === "Headquarters") {
            return { ...b, branch_type: "Satellite" as const };
          }
          return b;
        })
      );
    },
    [setBranches]
  );

  const toggleBranchStatus = useCallback(
    (id: string) => {
      setBranches((prev) =>
        prev.map((b) => {
          if (b.id === id) {
            const nextStatus = b.status === "Active" ? "Inactive" as const : "Active" as const;
            return { ...b, status: nextStatus };
          }
          return b;
        })
      );
    },
    [setBranches]
  );

  const deleteBranch = useCallback(
    (id: string) => {
      setBranches((prev) => prev.filter((b) => b.id !== id));
    },
    [setBranches]
  );

  return {
    branches,
    addBranch,
    updateBranch,
    setHeadquarters,
    toggleBranchStatus,
    deleteBranch,
  };
}
