"use client";

import { 
  Box, 
  Heading, 
  SimpleGrid, 
  Stat, 
  Text, 
  Button, 
  Stack, 
  Badge, 
  Spinner, 
  Center,
  Card,
  Separator
} from "@chakra-ui/react";
import { FiCheckCircle, FiClock, FiMapPin, FiTruck, FiActivity, FiZap, FiAward } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api-client";
import { Vehicle, DriverAnalytics } from "@/types/api";
import { toaster } from "@/components/ui/toaster";

export default function DriverDashboard() {
  const { data: session } = useSession();
  const [registeredVehicle, setRegisteredVehicle] = useState<Vehicle | null>(null);
  const [analytics, setAnalytics] = useState<DriverAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    if (session?.accessToken) {
      fetchRegisteredVehicle();
      fetchAnalytics();
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
      setRegisteredVehicle(null);
    }
  };

  const fetchAnalytics = async () => {
    if (!session?.accessToken) return;
    try {
      setLoading(true);
      const response = await api.analytics.getDashboard(session.accessToken);
      if (response.status === "success") {
        setAnalytics(response.data.stats);
      }
    } catch (err) {
      const error = err as Error;
      toaster.create({
        title: "Error Fetching Analytics",
        description: error.message,
        type: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!session?.accessToken) return;
    
    try {
      setReturning(true);
      const response = await api.vehicles.return(session.accessToken);
      
      if (response.status === "success") {
        toaster.create({
          title: "Success",
          description: response.message || "Successfully returned vehicle",
          type: "success",
          duration: 4000,
        });
        setRegisteredVehicle(null);
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
      setReturning(false);
    }
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!analytics) {
    return (
      <Center h="50vh">
        <Text color="fg.muted">No analytics data available</Text>
      </Center>
    );
  }

  const stats = [
    { label: "Total Trips", value: analytics.totalTrips.toString(), icon: FiActivity, color: "blue.500" },
    { label: "Completed Trips", value: analytics.completedTrips.toString(), icon: FiCheckCircle, color: "green.500" },
    { label: "Active Trips", value: analytics.activeTrips.toString(), icon: FiClock, color: "orange.500" },
    { label: "Vehicles Driven", value: analytics.totalVehiclesDriven.toString(), icon: FiTruck, color: "purple.500" },
    { 
      label: "Total Hours", 
      value: `${analytics.drivingStats.totalDrivingHours.toFixed(1)}h`, 
      icon: FiZap, 
      color: "teal.500" 
    },
    { 
      label: "Avg Trip Duration", 
      value: `${analytics.drivingStats.averageTripHours.toFixed(1)}h`, 
      icon: FiMapPin, 
      color: "cyan.500" 
    },
  ];

  return (
    <Box>
      <Heading mb={6}>Driver Dashboard</Heading>

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
                loading={returning}
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

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} mb={8}>
        {stats.map((stat) => (
          <Box
            key={stat.label}
            p={6}
            bg="bg.panel"
            borderRadius="lg"
            borderWidth={1}
            borderColor="border"
            boxShadow="sm"
          >
            <Stack direction="row" align="center" gap={3} mb={2}>
              <Box as={stat.icon} fontSize="2xl" color={stat.color} />
              <Stat.Root>
                <Stat.Label fontSize="sm">{stat.label}</Stat.Label>
                <Stat.ValueText fontSize="2xl">{stat.value}</Stat.ValueText>
              </Stat.Root>
            </Stack>
          </Box>
        ))}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
        {/* Longest Trip */}
        {analytics.longestTrip && (
          <Card.Root borderWidth={1} borderColor="border">
            <Card.Header>
              <Stack direction="row" align="center" gap={2}>
                <Box as={FiAward} fontSize="xl" color="yellow.500" />
                <Heading size="md">Longest Trip</Heading>
              </Stack>
            </Card.Header>
            <Card.Body pt={0}>
              <Stack gap={4}>
                <Box>
                  <Text fontWeight="bold" fontSize="lg">
                    {analytics.longestTrip.vehicle.make} {analytics.longestTrip.vehicle.model}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    {analytics.longestTrip.vehicle.registrationNumber}
                  </Text>
                </Box>

                <Separator />

                <SimpleGrid columns={2} gap={4}>
                  <Box>
                    <Text fontSize="xs" color="fg.muted">Duration</Text>
                    <Text fontSize="xl" fontWeight="bold" color="yellow.600">
                      {analytics.longestTrip.durationHours.toFixed(1)} hours
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="fg.muted">Distance</Text>
                    <Text fontSize="xl" fontWeight="bold" color="blue.600">
                      {(analytics.longestTrip.endOdometer - analytics.longestTrip.startOdometer).toLocaleString()} km
                    </Text>
                  </Box>
                </SimpleGrid>

                <Separator />

                <Stack gap={2}>
                  <Box>
                    <Text fontSize="xs" color="fg.muted">Start Time</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {formatDateTime(analytics.longestTrip.startTime)}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="fg.muted">End Time</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {formatDateTime(analytics.longestTrip.endTime)}
                    </Text>
                  </Box>
                </Stack>
              </Stack>
            </Card.Body>
          </Card.Root>
        )}

        {/* Vehicles Driven */}
        <Card.Root borderWidth={1} borderColor="border">
          <Card.Header>
            <Stack direction="row" align="center" gap={2}>
              <Box as={FiTruck} fontSize="xl" color="purple.500" />
              <Heading size="md">Vehicles Driven</Heading>
            </Stack>
          </Card.Header>
          <Card.Body pt={0}>
            {analytics.vehiclesDriven.length === 0 ? (
              <Text color="fg.muted">No vehicles driven yet</Text>
            ) : (
              <Stack gap={4}>
                {analytics.vehiclesDriven.map((vehicle, index) => (
                  <Box key={vehicle.vehicleId}>
                    {index > 0 && <Separator />}
                    <Stack py={2}>
                      <Text fontWeight="bold" fontSize="md">
                        {vehicle.make} {vehicle.model}
                      </Text>
                      <Text fontSize="xs" color="fg.muted" mb={2}>
                        {vehicle.registrationNumber}
                      </Text>
                      <SimpleGrid columns={2} gap={3}>
                        <Box>
                          <Text fontSize="xs" color="fg.muted">Total Trips</Text>
                          <Text fontSize="lg" fontWeight="bold" color="blue.600">
                            {vehicle.tripCount}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="fg.muted">Completed</Text>
                          <Text fontSize="lg" fontWeight="bold" color="green.600">
                            {vehicle.completedTrips}
                          </Text>
                        </Box>
                      </SimpleGrid>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Card.Body>
        </Card.Root>
      </SimpleGrid>
    </Box>
  );
}
