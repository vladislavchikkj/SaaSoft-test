import { defineStore } from "pinia";
import { ref, watch } from "vue";
import type { Account } from "@/types/account";

const STORAGE_KEY = "accounts_data";

export const useAccountStore = defineStore("accounts", () => {
  const initFromStorage = (): Account[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const accounts = ref<Account[]>(initFromStorage());

  const addAccount = () => {
    accounts.value.push({
      id: crypto.randomUUID(),
      labels: [],
      type: "Local",
      login: "",
      password: "",
    });
  };

  const removeAccount = (id: string) => {
    accounts.value = accounts.value.filter((acc) => acc.id !== id);
  };

  const updateAccount = (updatedAccount: Account) => {
    const index = accounts.value.findIndex(
      (acc) => acc.id === updatedAccount.id
    );
    if (index === -1) return;

    if (updatedAccount.type === "LDAP") {
      updatedAccount.password = null;
    }

    accounts.value[index] = updatedAccount;
  };

  watch(
    accounts,
    (newVal) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
    },
    { deep: true }
  );

  return {
    accounts,
    addAccount,
    removeAccount,
    updateAccount,
  };
});
