"use client";

import { useCallback } from "react";
import type { PaymentAccount } from "../types/payment.types";
import { MOCK_PAYMENT_ACCOUNTS } from "../data/mock-settings-data";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";

export function usePaymentAccounts() {
  const [accounts, setAccounts] = useLocalStorageState<PaymentAccount[]>(
    "church-settings-payments",
    MOCK_PAYMENT_ACCOUNTS
  );

  const addAccount = useCallback(
    (accountData: Omit<PaymentAccount, "id" | "created_at">) => {
      const newId = `pay-${Date.now()}`;
      const newAccount: PaymentAccount = {
        ...accountData,
        id: newId,
        created_at: new Date().toISOString(),
      };

      setAccounts((prev) => {
        let list = prev;
        // If the new account is default, remove default flag from other accounts in the same branch
        if (newAccount.is_default) {
          list = list.map((a) =>
            a.branch_id === newAccount.branch_id && a.is_default ? { ...a, is_default: false } : a
          );
        }
        return [...list, newAccount];
      });
      return newAccount;
    },
    [setAccounts]
  );

  const updateAccount = useCallback(
    (id: string, updatedFields: Partial<Omit<PaymentAccount, "id" | "created_at">>) => {
      setAccounts((prev) => {
        let list = prev.map((a) => (a.id === id ? { ...a, ...updatedFields } : a));

        const targetAccount = list.find((a) => a.id === id);
        // If target account is default, reset default on other accounts in the same branch
        if (targetAccount && updatedFields.is_default) {
          list = list.map((a) =>
            a.id !== id && a.branch_id === targetAccount.branch_id && a.is_default
              ? { ...a, is_default: false }
              : a
          );
        }
        return list;
      });
    },
    [setAccounts]
  );

  const setDefaultAccount = useCallback(
    (id: string) => {
      setAccounts((prev) => {
        const target = prev.find((a) => a.id === id);
        if (!target) return prev;
        return prev.map((a) => {
          if (a.id === id) {
            return { ...a, is_default: true };
          }
          if (a.branch_id === target.branch_id && a.is_default) {
            return { ...a, is_default: false };
          }
          return a;
        });
      });
    },
    [setAccounts]
  );

  const toggleAccountStatus = useCallback(
    (id: string) => {
      setAccounts((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            const nextStatus = a.status === "Active" ? "Inactive" as const : "Active" as const;
            return { ...a, status: nextStatus };
          }
          return a;
        })
      );
    },
    [setAccounts]
  );

  const deleteAccount = useCallback(
    (id: string) => {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    },
    [setAccounts]
  );

  return {
    accounts,
    addAccount,
    updateAccount,
    setDefaultAccount,
    toggleAccountStatus,
    deleteAccount,
  };
}
