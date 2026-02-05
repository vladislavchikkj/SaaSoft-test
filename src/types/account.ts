export const ACCOUNT_TYPE = {
  Ldap: "LDAP",
  Local: "Local",
} as const;

export type AccountType = (typeof ACCOUNT_TYPE)[keyof typeof ACCOUNT_TYPE];

export const ACCOUNT_FIELDS = {
  Login: "login",
  Password: "password",
  Labels: "labels",
} as const;

export type AccountField = (typeof ACCOUNT_FIELDS)[keyof typeof ACCOUNT_FIELDS];

export interface AccountLabel {
  text: string;
}

export interface Account {
  id: string;
  labels: AccountLabel[];
  type: AccountType;
  login: string;
  password: string | null;
}

export const isAccountType = (val: unknown): val is AccountType => {
  return Object.values(ACCOUNT_TYPE).includes(val as AccountType);
};