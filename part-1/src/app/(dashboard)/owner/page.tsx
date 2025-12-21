"use client";

import { 
  Box, 
  Heading, 
  SimpleGrid, 
  Stat, 
  Text,
  Stack,
  Spinner,
  Center,
  Card,
  Badge,
  Separator
} from "@chakra-ui/react";
import { FiDollarSign, FiTruck, FiCheckCircle, FiCalendar, FiActivity, FiClock, FiTrendingUp } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api-client";
import { OwnerAnalytics } from "@/types/api";
import { toaster } from "@/components/ui/toaster";

export default function OwnerDashboard() {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<OwnerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

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
    { 
      label: "Total Revenue", 
      value: `$${analytics.totalRevenue.toLocaleString()}`, 
      icon: FiDollarSign, 
      color: "green.500" 
    },
    { 
      label: "Total Vehicles", 
      value: analytics.totalVehicles.toString(), 
      icon: FiTruck, 
      color: "purple.500" 
    },
    { 
      label: "Total Bookings", 
      value: analytics.totalBookings.toString(), 
      icon: FiCalendar, 
      color: "blue.500" 
    },
    { 
      label: "Completed Trips", 
      value: analytics.completedTrips.toString(), 
      icon: FiCheckCircle, 
      color: "green.500" 
    },
    { 
      label: "Active Trips", 
      value: analytics.activeTrips.toString(), 
      icon: FiActivity, 
      color: "orange.500" 
    },
  ];

  return (
    <Box>
      <Heading mb={6}>Owner Dashboard</Heading>
      
      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} gap={6} mb={8}>
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

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} mb={8}>
        {/* Top Performing Vehicles */}
        <Card.Root borderWidth={1} borderColor="border">
          <Card.Header>
            <Stack direction="row" align="center" gap={2}>
              <Box as={FiTrendingUp} fontSize="xl" color="blue.500" />
              <Heading size="md">Top Performing Vehicles</Heading>
            </Stack>
          </Card.Header>
          <Card.Body pt={0}>
            {analytics.topVehicles.length === 0 ? (
              <Text color="fg.muted">No bookings yet</Text>
            ) : (
              <Stack gap={4}>
                {analytics.topVehicles.map((vehicle, index) => (
                  <Box key={vehicle.vehicleId}>
                    {index > 0 && <Separator />}
                    <Stack direction="row" justify="space-between" align="center" py={2}>
                      <Box flex={1}>
                        <Stack direction="row" align="center" gap={2} mb={1}>
                          <Badge colorPalette="blue" size="sm">#{index + 1}</Badge>
                          <Text fontWeight="bold" fontSize="md">
                            {vehicle.make} {vehicle.model}
                          </Text>
                        </Stack>
                        <Text fontSize="xs" color="fg.muted">
                          {vehicle.registrationNumber}
                        </Text>
                        <Stack direction="row" gap={3} mt={2}>
                          <Text fontSize="sm" color="fg.muted">
                            <Box as="span" fontWeight="medium" color="blue.600">
                              {vehicle.bookingCount}
                            </Box>{" "}
                            bookings
                          </Text>
                          <Text fontSize="sm" color="fg.muted">
                            Revenue:{" "}
                            <Box as="span" fontWeight="bold" color="green.600">
                              ${vehicle.totalRevenue.toLocaleString()}
                            </Box>
                          </Text>
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Card.Body>
        </Card.Root>

        {/* Trip Duration Statistics */}
        <Card.Root borderWidth={1} borderColor="border">
          <Card.Header>
            <Stack direction="row" align="center" gap={2}>
              <Box as={FiClock} fontSize="xl" color="purple.500" />
              <Heading size="md">Trip Duration Statistics</Heading>
            </Stack>
          </Card.Header>
          <Card.Body pt={0}>
            {analytics.tripDurations.length === 0 ? (
              <Text color="fg.muted">No trip data available</Text>
            ) : (
              <Stack gap={4}>
                {analytics.tripDurations.map((trip, index) => (
                  <Box key={trip.vehicleId}>
                    {index > 0 && <Separator />}
                    <Stack py={2}>
                      <Text fontWeight="bold" fontSize="md">
                        {trip.make} {trip.model}
                      </Text>
                      <Text fontSize="xs" color="fg.muted" mb={2}>
                        {trip.registrationNumber}
                      </Text>
                      <SimpleGrid columns={3} gap={2}>
                        <Box>
                          <Text fontSize="xs" color="fg.muted">Total Trips</Text>
                          <Text fontSize="lg" fontWeight="bold" color="blue.600">
                            {trip.totalTrips}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="fg.muted">Avg Duration</Text>
                          <Text fontSize="lg" fontWeight="bold" color="green.600">
                            {trip.avgDurationHours.toFixed(1)}h
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="fg.muted">Total Hours</Text>
                          <Text fontSize="lg" fontWeight="bold" color="purple.600">
                            {trip.totalDurationHours.toFixed(1)}h
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
