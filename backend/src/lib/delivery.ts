export const WEST_BANK_CITIES = [
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

export const JERUSALEM_AND_48_CITIES = [
  "القدس",
  "الناصرة",
  "حيفا",
  "يافا",
  "عكا",
  "اللد",
  "الرملة",
  "أم الفحم",
  "الطيبة",
  "الطيرة",
  "شفاعمرو",
  "سخنين",
  "طمرة",
  "عرابة",
  "كفر كنا",
  "كفر قاسم",
  "رهط",
  "بئر السبع",
] as const;

export const DELIVERY_CITIES = [...WEST_BANK_CITIES, ...JERUSALEM_AND_48_CITIES] as const;

export type DeliveryCity = (typeof DELIVERY_CITIES)[number];

export function getShippingCost(city: DeliveryCity) {
  return WEST_BANK_CITIES.includes(city as (typeof WEST_BANK_CITIES)[number]) ? 2000 : 5000;
}
