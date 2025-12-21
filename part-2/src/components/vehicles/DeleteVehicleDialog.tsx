import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, memo } from "react";
import { vehicleService } from "@/services/vehicleService";
import { toast } from "sonner";
import type { Vehicle } from "@/services/vehicleService";
import { AlertTriangle } from "lucide-react";

interface DeleteVehicleDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const DeleteVehicleDialog = memo(function DeleteVehicleDialog({
  vehicle,
  open,
  onOpenChange,
  onSuccess,
}: DeleteVehicleDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!vehicle) return;

    setIsDeleting(true);
    try {
      await vehicleService.deleteVehicle(vehicle._id);
      toast.success("Vehicle deleted successfully");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || "Failed to delete vehicle";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!vehicle) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 pt-4">
            <p>
              Are you sure you want to delete this vehicle? This action cannot be undone.
            </p>
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">Registration:</span>
                  <span className="font-mono text-foreground">{vehicle.registrationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">Make & Model:</span>
                  <span className="text-foreground">{vehicle.make} {vehicle.vehicleModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">Year:</span>
                  <span className="text-foreground">{vehicle.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">Status:</span>
                  <span className="text-foreground">{vehicle.status}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: Vehicles with active bookings or trips cannot be deleted.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Vehicle"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});
