import { z } from "zod";
import { WEST_BANK_CITIES } from "./palestineCities";

// Cash-on-delivery only, West Bank only — a single delivery-details step
// (name, phone, city, one free-text address) replaces the old
// shipping-address + card-payment pair.
export const deliverySchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  phone: z.string().min(7, "Enter a valid phone number"),
  city: z.enum(WEST_BANK_CITIES, { message: "Select your city" }),
  address: z.string().min(4, "Enter your address"),
});
export type DeliveryFormValues = z.infer<typeof deliverySchema>;
