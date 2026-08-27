/**
 * West Bank governorates, in Arabic — the delivery area for this storefront
 * (cash-on-delivery only). Kept Arabic-only regardless of site locale since
 * these are the real place names delivery staff work with, not UI copy.
 */
export const WEST_BANK_CITIES = [
  "القدس",
  "رام الله والبيرة",
  "بيت لحم",
  "الخليل",
  "نابلس",
  "جنين",
  "طولكرم",
  "قلقيلية",
  "سلفيت",
  "أريحا والأغوار",
  "طوباس والأغوار الشمالية",
] as const;

export type WestBankCity = (typeof WEST_BANK_CITIES)[number];
