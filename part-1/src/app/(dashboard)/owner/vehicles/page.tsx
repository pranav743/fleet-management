"use client";

import { Box, Button, Heading, SimpleGrid, Text, Image, Badge, Stack, Spinner, Center, Input } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api-client";
import { Vehicle } from "@/types/api";
import { toaster } from "@/components/ui/toaster";
import { vehicleSchema, VehicleFormData } from "@/schemas/vehicle";
import { getRandomVehicleImage } from "@/constants/vehicle-images";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import {
  NativeSelectRoot,
  NativeSelectField,
} from "@chakra-ui/react";

export default function OwnerVehiclesPage() {
  const { data: session } = useSession();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
  });

  useEffect(() => {
    if (session?.accessToken) {
      fetchVehicles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const fetchVehicles = async () => {
    if (!session?.accessToken) return;
    try {
      setLoading(true);
      const response = await api.vehicles.getAll(session.accessToken!);
      if (response.status === "success") {
        setVehicles(response.data.vehicles);
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      toaster.create({
        title: "Error fetching vehicles",
        description: error.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: VehicleFormData) => {
    if (!session?.accessToken) return;
    
    setIsSubmitting(true);
    try {
      const response = await api.vehicles.create(session.accessToken, data);
      if (response.status === "success") {
        toaster.create({
          title: "Vehicle added successfully",
          type: "success",
        });
        setIsAddModalOpen(false);
        reset();
        fetchVehicles();
      }
    } catch (err) {
      const error = err as Error;
      toaster.create({
        title: "Error adding vehicle",
        description: error.message,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setValue("make", vehicle.make);
    setValue("vehicleModel", vehicle.vehicleModel);
    setValue("registrationNumber", vehicle.registrationNumber);
    setValue("type", vehicle.type as "SEDAN" | "SUV" | "TRUCK" | "VAN" | "MOTORCYCLE");
    setIsEditModalOpen(true);
  };

  const onUpdate = async (data: VehicleFormData) => {
    if (!session?.accessToken || !selectedVehicle) return;
    
    setIsSubmitting(true);
    try {
      const response = await api.vehicles.update(session.accessToken, selectedVehicle._id, data);
      if (response.status === "success") {
        toaster.create({
          title: "Vehicle updated successfully",
          type: "success",
        });
        setIsEditModalOpen(false);
        setSelectedVehicle(null);
        reset();
        fetchVehicles();
      }
    } catch (err) {
      const error = err as Error;
      toaster.create({
        title: "Error updating vehicle",
        description: error.message,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (!session?.accessToken) return;
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      await api.vehicles.delete(session.accessToken, vehicleId);
      toaster.create({
        title: "Vehicle deleted successfully",
        type: "success",
      });
      fetchVehicles();
    } catch (err) {
      const error = err as Error;
      toaster.create({
        title: "Error deleting vehicle",
        description: error.message,
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="50vh">
        <Text color="red.500">Error: {error}</Text>
      </Center>
    );
  }

  return (
    <Box>
      <Stack direction="row" justify="space-between" align="center" mb={6}>
        <Heading>My Vehicles</Heading>
        <DialogRoot open={isAddModalOpen} onOpenChange={(e: { open: boolean }) => setIsAddModalOpen(e.open)}>
          <DialogTrigger asChild>
            <Button colorPalette="blue">
              <FiPlus /> Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
              <DialogCloseTrigger />
            </DialogHeader>
            <DialogBody>
              <form id="add-vehicle-form" onSubmit={handleSubmit(onSubmit)}>
                <Stack gap={4}>
                  <Field label="Make" invalid={!!errors.make} errorText={errors.make?.message}>
                    <Input {...register("make")} placeholder="e.g., Toyota" />
                  </Field>

                  <Field label="Model" invalid={!!errors.vehicleModel} errorText={errors.vehicleModel?.message}>
                    <Input {...register("vehicleModel")} placeholder="e.g., Camry" />
                  </Field>

                  <Field label="Registration Number" invalid={!!errors.registrationNumber} errorText={errors.registrationNumber?.message}>
                    <Input {...register("registrationNumber")} placeholder="e.g., ABC-1234" />
                  </Field>

                  <Field label="Vehicle Type" invalid={!!errors.type} errorText={errors.type?.message}>
                    <NativeSelectRoot>
                      <NativeSelectField {...register("type")} placeholder="Select type">
                        <option value="">Select type</option>
                        <option value="SEDAN">Sedan</option>
                        <option value="SUV">SUV</option>
                        <option value="TRUCK">Truck</option>
                        <option value="VAN">Van</option>
                        <option value="MOTORCYCLE">Motorcycle</option>
                      </NativeSelectField>
                    </NativeSelectRoot>
                  </Field>
                </Stack>
              </form>
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="add-vehicle-form" colorPalette="blue" loading={isSubmitting}>
                Add Vehicle
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>
      </Stack>

      <DialogRoot open={isEditModalOpen} onOpenChange={(e: { open: boolean }) => setIsEditModalOpen(e.open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            <form id="edit-vehicle-form" onSubmit={handleSubmit(onUpdate)}>
              <Stack gap={4}>
                <Field label="Make" invalid={!!errors.make} errorText={errors.make?.message}>
                  <Input {...register("make")} placeholder="e.g., Toyota" />
                </Field>

                <Field label="Model" invalid={!!errors.vehicleModel} errorText={errors.vehicleModel?.message}>
                  <Input {...register("vehicleModel")} placeholder="e.g., Camry" />
                </Field>

                <Field label="Registration Number" invalid={!!errors.registrationNumber} errorText={errors.registrationNumber?.message}>
                  <Input {...register("registrationNumber")} placeholder="e.g., ABC-1234" />
                </Field>

                <Field label="Vehicle Type" invalid={!!errors.type} errorText={errors.type?.message}>
                  <NativeSelectRoot>
                    <NativeSelectField {...register("type")} placeholder="Select type">
                      <option value="">Select type</option>
                      <option value="SEDAN">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="TRUCK">Truck</option>
                      <option value="VAN">Van</option>
                      <option value="MOTORCYCLE">Motorcycle</option>
                    </NativeSelectField>
                  </NativeSelectRoot>
                </Field>
              </Stack>
            </form>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditModalOpen(false);
              setSelectedVehicle(null);
              reset();
            }}>
              Cancel
            </Button>
            <Button type="submit" form="edit-vehicle-form" colorPalette="blue" loading={isSubmitting}>
              Update Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {vehicles.length === 0 ? (
        <Text>No vehicles found.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
          {vehicles.map((vehicle) => (
            <Box
              key={vehicle._id}
              borderWidth={1}
              borderColor="border"
              borderRadius="lg"
              overflow="hidden"
              bg="bg.panel"
            >
              <Image src={getRandomVehicleImage()} alt={vehicle.make} objectFit="cover" h="200px" w="full" />
              <Box p={4}>
                <Stack direction="row" justify="space-between" align="center" mb={2}>
                  <Heading size="md">{vehicle.make} {vehicle.vehicleModel}</Heading>
                  <Badge colorPalette={vehicle.status === "IDLE" ? "green" : "orange"}>
                    {vehicle.status}
                  </Badge>
                </Stack>
                <Text color="fg.muted" fontSize="sm">License Plate: {vehicle.registrationNumber}</Text>
                <Text color="fg.muted" fontSize="sm">Type: {vehicle.type}</Text>
                <Stack direction="row" mt={4} gap={2}>
                  <Button size="sm" variant="outline" flex={1} onClick={() => handleEdit(vehicle)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" colorPalette="red" flex={1} onClick={() => handleDelete(vehicle._id)}>
                    Delete
                  </Button>
                </Stack>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
