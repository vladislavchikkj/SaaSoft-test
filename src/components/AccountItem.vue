<script setup lang="ts">
import { ref, computed } from "vue";
import { useAccountStore } from "@/stores/accountStore";
import {
  type Account,
  type AccountType,
  ACCOUNT_TYPE,
  isAccountType,
  ACCOUNT_FIELDS,
  type AccountField
} from "@/types/account";
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

const errors = ref<Record<AccountField, boolean>>({
  [ACCOUNT_FIELDS.Login]: false,
  [ACCOUNT_FIELDS.Password]: false,
  [ACCOUNT_FIELDS.Labels]: false,
});

const isLoginInvalid = computed(() => {
  return !localLogin.value.trim() || localLogin.value.length > MAX_FIELD;
});

const isPasswordInvalid = computed(() => {
  if (localType.value === ACCOUNT_TYPE.Ldap) return false;
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
    password: localType.value === ACCOUNT_TYPE.Local ? localPassword.value : null,
    labels: processedLabels,
  });
};

const handleBlur = (field: AccountField) => {
  const validationMap: Record<AccountField, boolean> = {
    [ACCOUNT_FIELDS.Login]: isLoginInvalid.value,
    [ACCOUNT_FIELDS.Password]: isPasswordInvalid.value,
    [ACCOUNT_FIELDS.Labels]: isLabelsInvalid.value,
  };

  errors.value[field] = validationMap[field];

  if (!errors.value[field]) {
    saveIfValid();
  }
};

const handleTypeChange = (val: AcceptableValue) => {
  if (!isAccountType(val)) {
    return;
  }

  localType.value = val;
  errors.value[ACCOUNT_FIELDS.Password] = false;
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
              @blur="handleBlur(ACCOUNT_FIELDS.Labels)"
              :maxlength="MAX_LABEL"
              placeholder="mark1; mark2"
              class="bg-slate-50"
              :class="{
                'border-red-500 focus-visible:ring-red-500': errors[ACCOUNT_FIELDS.Labels],
              }"
            />
          </div>
          <p v-if="errors[ACCOUNT_FIELDS.Labels]" class="text-xs text-red-600 font-medium">
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
              <SelectItem :value="ACCOUNT_TYPE.Ldap">LDAP</SelectItem>
              <SelectItem :value="ACCOUNT_TYPE.Local">Local</SelectItem>
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
            @blur="handleBlur(ACCOUNT_FIELDS.Login)"
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
          <template v-if="localType === ACCOUNT_TYPE.Local">
            <Label
              class="text-xs font-bold text-slate-600 uppercase flex items-center gap-1"
            >
              <Key class="w-3 h-3" /> Пароль <span class="text-red-500">*</span>
            </Label>
            <Input
              v-model="localPassword"
              @blur="handleBlur(ACCOUNT_FIELDS.Password)"
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
          <template v-else>
            <Label class="text-xs font-bold opacity-0 flex items-center gap-1">
              <Key class="w-3 h-3" />
            </Label>
            <div class="h-10 flex items-center justify-center bg-slate-100 rounded-md border border-slate-200">
              <span class="text-xs text-slate-400 font-medium">Пороль не требуется</span>
            </div>
          </template>
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
