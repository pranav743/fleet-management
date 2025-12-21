"use client";

import {
  Box,
  Button,
  Heading,
  SimpleGrid,
  Text,
  Image,
  Badge,
  Stack,
  Spinner,
  Center,
  Card,
} from "@chakra-ui/react";
import { FiCheckCircle, FiTruck } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api-client";
import { Vehicle } from "@/types/api";
import { toaster } from "@/components/ui/toaster";
import { getRandomVehicleImage } from "@/constants/vehicle-images";

export default function OwnerVehiclesPage() {
  const { data: session } = useSession();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [registeredVehicle, setRegisteredVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (session?.accessToken) {
      fetchRegisteredVehicle();
      fetchVehicles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const fetchRegisteredVehicle = async () => {
    if (!session?.accessToken) return;
    try {
      const response = await api.vehicles.getRegistered(session.accessToken);
      if (response.status === "success") {
        setRegisteredVehicle(response.data.vehicle);
      }
    } catch {
      // Driver might not have a registered vehicle yet, which is fine
      console.log("No registered vehicle found");
    }
  };

  const handleRegister = async (vehicle: Vehicle) => {
    if (!session?.accessToken) return;
    
    try {
      setRegistering(true);
      const response = await api.vehicles.register(session.accessToken, vehicle._id);
      
      if (response.status === "success") {
        toaster.create({
          title: "Success",
          description: response.message || "Successfully registered to vehicle",
          type: "success",
          duration: 4000,
        });
        setRegisteredVehicle(response.data.vehicle);
        fetchVehicles(); // Refresh the vehicle list
      }
    } catch (err) {
      const error = err as Error;
      toaster.create({
        title: "Registration Failed",
        description: error.message,
        type: "error",
        duration: 5000,
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleReturn = async () => {
    if (!session?.accessToken) return;
    
    try {
      setRegistering(true);
      const response = await api.vehicles.return(session.accessToken);
      
      if (response.status === "success") {
        toaster.create({
          title: "Success",
          description: response.message || "Successfully returned vehicle",
          type: "success",
          duration: 4000,
        });
        setRegisteredVehicle(null);
        fetchVehicles(); // Refresh the vehicle list
      }
    } catch (err) {
      const error = err as Error;
      toaster.create({
        title: "Return Failed",
        description: error.message,
        type: "error",
        duration: 5000,
      });
    } finally {
      setRegistering(false);
    }
  };

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
        title: "Error Fetching Vehicles",
        description: error.message,
        type: "error",
        duration: 5000,
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
        <Heading>Vehicle Registration</Heading>
      </Stack>

      {registeredVehicle && (
              <Card.Root
                mb={6}
                borderWidth={2}
                borderColor="blue.500"
                boxShadow="lg"
                bg="gradient-to-br"
                gradientFrom="blue.50"
                gradientTo="blue.100"
                _dark={{ 
                  gradientFrom: "blue.950", 
                  gradientTo: "blue.900",
                  borderColor: "blue.600"
                }}
              >
                <Card.Header>
                  <Stack direction="row" justify="space-between" align="center">
                    <Stack direction="row" align="center" gap={3}>
                      <Box 
                        as={FiTruck} 
                        fontSize="3xl" 
                        color="blue.600" 
                        _dark={{ color: "blue.400", bg: "blue.800" }}
                        p={2}
                        bg="white"
                        borderRadius="md"
                      />
                      <Box>
                        <Heading size="lg" color="blue.700" _dark={{ color: "blue.300" }}>
                          Your Registered Vehicle
                        </Heading>
                        <Text fontSize="sm" color="blue.600" _dark={{ color: "blue.400" }}>
                          Currently assigned to you
                        </Text>
                      </Box>
                    </Stack>
                    <Button
                      size="sm"
                      colorPalette="red"
                      onClick={handleReturn}
                      loading={registering}
                      variant="solid"
                    >
                      Return Vehicle
                    </Button>
                  </Stack>
                </Card.Header>
                <Card.Body>
                  <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
                    <Box>
                      <Text fontSize="xs" color="fg.muted" mb={1} fontWeight="semibold" textTransform="uppercase">
                        Vehicle Details
                      </Text>
                      <Text fontWeight="bold" fontSize="2xl" mb={2} color="blue.800" _dark={{ color: "blue.200" }}>
                        {registeredVehicle.make} {registeredVehicle.vehicleModel}
                      </Text>
                      <Stack gap={1}>
                        <Stack direction="row" align="center" gap={2}>
                          <Text fontSize="xs" color="fg.muted">License Plate:</Text>
                          <Badge colorPalette="gray" size="sm" variant="solid">
                            {registeredVehicle.registrationNumber}
                          </Badge>
                        </Stack>
                        <Stack direction="row" align="center" gap={2}>
                          <Text fontSize="xs" color="fg.muted">Type:</Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {registeredVehicle.type}
                          </Text>
                        </Stack>
                      </Stack>
                    </Box>
                    
                    <Box>
                      <Text fontSize="xs" color="fg.muted" mb={2} fontWeight="semibold" textTransform="uppercase">
                        Status
                      </Text>
                      <Badge
                        size="lg"
                        colorPalette={
                          registeredVehicle.status === "IDLE" ? "green" : 
                          registeredVehicle.status === "ACTIVE" ? "blue" :
                          registeredVehicle.status === "IN_USE" ? "purple" : "orange"
                        }
                        variant="solid"
                        px={4}
                        py={2}
                      >
                        {registeredVehicle.status}
                      </Badge>
                    </Box>
                    
                    <Box
                      p={4}
                      bg="green.50"
                      _dark={{ bg: "green.900/30", borderColor: "green.600" }}
                      borderRadius="md"
                      borderWidth={1}
                      borderColor="green.200"
                    >
                      <Stack gap={2}>
                        <Stack direction="row" align="center" gap={2}>
                          <Box as={FiCheckCircle} color="green.600" _dark={{ color: "green.400" }} />
                          <Text fontSize="sm" fontWeight="medium" color="green.800" _dark={{ color: "green.300" }}>
                            Vehicle Registered
                          </Text>
                        </Stack>
                        <Text fontSize="xs" color="green.700" _dark={{ color: "green.400" }}>
                          Ready for trips and operations
                        </Text>
                      </Stack>
                    </Box>
                  </SimpleGrid>
                </Card.Body>
              </Card.Root>
            )}

      <Heading size="md" mb={4}>
        Available Vehicles
      </Heading>

      {vehicles.length === 0 ? (
        <Text>No vehicles available for registration at the moment.</Text>
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
              <Image
                src={getRandomVehicleImage()}
                alt={vehicle.make}
                objectFit="cover"
                h="200px"
                w="full"
              />
              <Box p={4}>
                <Stack
                  direction="row"
                  justify="space-between"
                  align="center"
                  mb={2}
                >
                  <Heading size="md">
                    {vehicle.make} {vehicle.vehicleModel}
                  </Heading>
                  <Badge
                    colorPalette={
                      vehicle.status === "IDLE" ? "green" : "orange"
                    }
                  >
                    {vehicle.status}
                  </Badge>
                </Stack>
                <Text color="fg.muted" fontSize="sm">
                  License Plate: {vehicle.registrationNumber}
                </Text>
                <Text color="fg.muted" fontSize="sm">
                  Type: {vehicle.type}
                </Text>
                <Stack direction="row" mt={4} gap={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    flex={1}
                    onClick={() => handleRegister(vehicle)}
                    disabled={
                      registering ||
                      !!registeredVehicle ||
                      vehicle.status !== "IDLE" ||
                      !!vehicle.driverId
                    }
                    loading={registering}
                  >
                    {registeredVehicle
                      ? "Already Registered"
                      : vehicle.driverId
                      ? "Already Assigned"
                      : vehicle.status !== "IDLE"
                      ? "Not Available"
                      : "Register to Drive"}
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
