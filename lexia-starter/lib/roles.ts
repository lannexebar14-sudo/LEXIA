export const APP_ROLES = ["client", "juriste", "avocat", "admin", "developpeur"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  client: "Client",
  juriste: "Juriste",
  avocat: "Avocat",
  admin: "Administrateur",
  developpeur: "Développeur",
};

export const BACKOFFICE_ROLES: AppRole[] = ["juriste", "avocat", "admin", "developpeur"];
export const LEGAL_ROLES: AppRole[] = ["juriste", "avocat", "admin"];
export const ROLE_MANAGER_ROLES: AppRole[] = ["admin", "developpeur"];

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && APP_ROLES.includes(value as AppRole);
}

export function roleLabel(value: unknown) {
  return isAppRole(value) ? ROLE_LABELS[value] : "Client";
}
