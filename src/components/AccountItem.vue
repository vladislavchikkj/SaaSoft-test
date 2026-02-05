<script setup lang="ts">
import { ref, computed } from "vue";
import { useAccountStore } from "@/stores/accountStore";
import type { Account, AccountType } from "@/types/account";
import { Trash2, User, Key, Hash, LayoutList } from "lucide-vue-next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AcceptableValue } from "reka-ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const props = defineProps<{
  account: Account;
}>();

const store = useAccountStore();
const MAX_LABEL = 50;
const MAX_FIELD = 100;

const localLabels = ref(props.account.labels.map((l) => l.text).join("; "));
const localLogin = ref(props.account.login);
const localPassword = ref(props.account.password || "");
const localType = ref<AccountType>(props.account.type);

const errors = ref({
  login: false,
  password: false,
  labels: false,
});

const isLoginInvalid = computed(() => {
  return !localLogin.value.trim() || localLogin.value.length > MAX_FIELD;
});

const isPasswordInvalid = computed(() => {
  if (localType.value === "LDAP") return false;
  return !localPassword.value || localPassword.value.length > MAX_FIELD;
});

const isLabelsInvalid = computed(() => {
  return localLabels.value.length > MAX_LABEL;
});

const saveIfValid = () => {
  if (
    isLoginInvalid.value ||
    isPasswordInvalid.value ||
    isLabelsInvalid.value
  ) {
    return;
  }

  const processedLabels = localLabels.value
    .split(";")
    .map((text) => text.trim())
    .filter((text) => text.length > 0)
    .map((text) => ({ text }));

  store.updateAccount({
    id: props.account.id,
    type: localType.value,
    login: localLogin.value,
    password: localType.value === "Local" ? localPassword.value : null,
    labels: processedLabels,
  });
};

const handleBlur = (field: keyof typeof errors.value) => {
  if (field === "login") errors.value.login = isLoginInvalid.value;
  if (field === "password") errors.value.password = isPasswordInvalid.value;
  if (field === "labels") errors.value.labels = isLabelsInvalid.value;

  if (!errors.value[field]) {
    saveIfValid();
  }
};

const handleTypeChange = (val: AcceptableValue) => {
  if (typeof val !== "string") return;
  localType.value = val as AccountType;
  errors.value.password = false;
  saveIfValid();
};
</script>

<template>
  <Card class="border-slate-200 shadow-sm bg-white">
    <CardContent class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div class="md:col-span-4 space-y-2">
          <Label
            class="text-xs font-bold text-slate-600 uppercase flex items-center gap-1"
          >
            <Hash class="w-3 h-3" /> Метки
          </Label>
          <div class="relative">
            <Input
              v-model="localLabels"
              @blur="handleBlur('labels')"
              :maxlength="MAX_LABEL"
              placeholder="mark1; mark2"
              class="bg-slate-50"
              :class="{
                'border-red-500 focus-visible:ring-red-500': errors.labels,
              }"
            />
          </div>
          <p v-if="errors.labels" class="text-xs text-red-600 font-medium">
            Максимум {{ MAX_LABEL }} символов
          </p>
        </div>

        <div class="md:col-span-2 space-y-2">
          <Label
            class="text-xs font-bold text-slate-600 uppercase flex items-center gap-1"
          >
            <LayoutList class="w-3 h-3" /> Тип
          </Label>
          <Select
            :model-value="localType"
            @update:model-value="handleTypeChange"
          >
            <SelectTrigger class="bg-slate-50 border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LDAP">LDAP</SelectItem>
              <SelectItem value="Local">Local</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="md:col-span-3 space-y-2">
          <Label
            class="text-xs font-bold text-slate-600 uppercase flex items-center gap-1"
          >
            <User class="w-3 h-3" /> Логин <span class="text-red-500">*</span>
          </Label>
          <Input
            v-model="localLogin"
            @blur="handleBlur('login')"
            :maxlength="MAX_FIELD"
            class="bg-slate-50"
            :class="{
              'border-red-500 focus-visible:ring-red-500': errors.login,
            }"
          />
          <span v-if="errors.login" class="text-xs text-red-600 font-medium">
            Обязательное поле
          </span>
        </div>

        <div class="md:col-span-2 space-y-2">
          <template v-if="localType === 'Local'">
            <Label
              class="text-xs font-bold text-slate-600 uppercase flex items-center gap-1"
            >
              <Key class="w-3 h-3" /> Пароль <span class="text-red-500">*</span>
            </Label>
            <Input
              v-model="localPassword"
              @blur="handleBlur('password')"
              type="password"
              :maxlength="MAX_FIELD"
              class="bg-slate-50"
              :class="{
                'border-red-500 focus-visible:ring-red-500': errors.password,
              }"
            />
            <span
              v-if="errors.password"
              class="text-xs text-red-600 font-medium"
            >
              Введите пароль
            </span>
          </template>
          <div
            v-else
            class="h-10 flex items-center justify-center bg-slate-100 rounded-md border border-slate-200 mt-6 md:mt-0"
          >
            <span class="text-xs text-slate-400 font-medium">Не требуется</span>
          </div>
        </div>

        <div
          class="md:col-span-1 flex items-center justify-center pt-8 md:pt-8"
        >
          <Button
            variant="ghost"
            size="icon"
            class="text-slate-400 hover:text-red-600 hover:bg-red-50"
            @click="store.removeAccount(account.id)"
          >
            <Trash2 class="w-5 h-5" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
