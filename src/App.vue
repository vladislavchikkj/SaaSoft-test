<script setup lang="ts">
import { useAccountStore } from "@/stores/accountStore";
import AccountItem from "@/components/AccountItem.vue";
import { Button } from "@/components/ui/button";
import { Plus, Users, Info } from "lucide-vue-next";

const store = useAccountStore();
</script>

<template>
  <div class="min-h-screen bg-slate-50 py-8 px-6 font-sans text-slate-900">
    <div class="max-w-6xl mx-auto space-y-6">
      <header
        class="flex items-center justify-between border-b border-slate-200 pb-6"
      >
        <div class="flex items-center gap-3">
          <div
            class="p-2 bg-white border border-slate-200 rounded-lg shadow-sm"
          >
            <Users class="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Учетные записи</h1>
            <p class="text-sm text-slate-500">Управление пользователями</p>
          </div>
        </div>

        <Button
          size="default"
          @click="store.addAccount"
          class="bg-blue-600 hover:bg-blue-700"
        >
          <Plus class="w-4 h-4 mr-2" />
          Добавить
        </Button>
      </header>

      <div
        class="flex items-start gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-lg text-blue-900 text-sm"
      >
        <Info class="w-5 h-5 shrink-0 text-blue-600" />
        <div>
          <p class="font-medium">Правила заполнения</p>
          <p class="text-blue-800/80 mt-1">
            Метки разделяются знаком <code>;</code>. Максимальная длина метки —
            50 символов. Для LDAP учетных записей пароль не требуется.
          </p>
        </div>
      </div>

      <div class="space-y-4">
        <AccountItem
          v-for="account in store.accounts"
          :key="account.id"
          :account="account"
        />

        <div
          v-if="store.accounts.length === 0"
          class="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-lg bg-white"
        >
          <Users class="w-10 h-10 text-slate-300 mb-3" />
          <h3 class="text-base font-semibold text-slate-900">Список пуст</h3>
          <p class="text-sm text-slate-500 mb-4">
            Добавьте первую учетную запись
          </p>
          <Button variant="outline" size="sm" @click="store.addAccount">
            Создать запись
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
