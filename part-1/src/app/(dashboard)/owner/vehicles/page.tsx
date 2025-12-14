"use client";

import { Box, Button, Heading, SimpleGrid, Text, Image, Badge, Stack, Spinner, Center } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api-client";
import { Vehicle } from "@/types/api";
import { toaster } from "@/components/ui/toaster";

export default function OwnerVehiclesPage() {
  const { data: session } = useSession();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchVehicles();
    }
  }, [session]);

  const fetchVehicles = async () => {
    if (!session?.user?.accessToken) return;
    try {
      setLoading(true);
      const response = await api.vehicles.getAll(session.user.accessToken);
      if (response.status === "success") {
        setVehicles(response.data.vehicles);
      }
    } catch (err: any) {
      setError(err.message);
      toaster.create({
        title: "Error fetching vehicles",
        description: err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
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
        <Button colorPalette="blue">
          <FiPlus /> Add Vehicle
        </Button>
      </Stack>

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
              <Image src="https://placehold.co/600x400" alt={vehicle.make} objectFit="cover" h="200px" w="full" />
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
                  <Button size="sm" variant="outline" flex={1}>Edit</Button>
                  <Button size="sm" variant="outline" colorPalette="red" flex={1}>Delete</Button>
                </Stack>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
