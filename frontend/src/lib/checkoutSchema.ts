import { z } from "zod";
import { DELIVERY_CITIES } from "./palestineCities";

// The city or delivery area sets shipping; the address supplies exact details.
export const deliverySchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  phone: z.string().min(7, "Enter a valid phone number"),
  city: z.enum(DELIVERY_CITIES, { message: "Select your city" }),
  address: z.string().min(4, "Enter your address"),
});
export type DeliveryFormValues = z.infer<typeof deliverySchema>;
