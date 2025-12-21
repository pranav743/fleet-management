import { z } from "zod";

export const vehicleSchema = z.object({
  make: z.string().min(2, "Make must be at least 2 characters"),
  vehicleModel: z.string().min(2, "Model must be at least 2 characters"),
  registrationNumber: z.string().min(3, "Registration number must be at least 3 characters"),
  type: z.enum(["SEDAN", "SUV", "TRUCK", "VAN", "MOTORCYCLE"], {
    message: "Please select a valid vehicle type",
  }),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
