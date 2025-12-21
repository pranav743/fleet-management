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
import { FiCalendar, FiClock, FiMapPin, FiTruck, FiDollarSign } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { Booking, Vehicle } from "@/types/api";
import { toaster } from "@/components/ui/toaster";

export default function CustomerDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const fetchBookings = async () => {
    if (!session?.accessToken) return;
    try {
      setLoading(true);
      const response = await api.bookings.getMyBookings(session.accessToken);
      if (response.status === "success") {
        setBookings(response.data.bookings);
        const active = response.data.bookings.filter(
          (b: Booking) => b.status === "CONFIRMED" || b.status === "PENDING"
        );
        setActiveBookings(active);
      }
    } catch (err) {
      const error = err as Error;
      toaster.create({
        title: "Error Fetching Bookings",
        description: error.message,
        type: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "green";
      case "CONFIRMED":
        return "blue";
      case "PENDING":
        return "orange";
      case "CANCELLED":
        return "red";
      default:
        return "gray";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return days === 1 ? "1 day" : `${days} days`;
  };

  const completedBookings = bookings.filter((b) => b.status === "COMPLETED").length;

  const stats = [
    { label: "Active Bookings", value: activeBookings.length.toString(), icon: FiCalendar, color: "blue.500" },
    { label: "Completed Bookings", value: completedBookings.toString(), icon: FiClock, color: "green.500" },
    { label: "Total Bookings", value: bookings.length.toString(), icon: FiMapPin, color: "purple.500" },
  ];

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box>
      <Stack direction="row" justify="space-between" align="center" mb={6}>
        <Heading>Customer Dashboard</Heading>
        <Button
          colorPalette="blue"
          onClick={() => router.push("/customer/vehicles")}
        >
          Browse Vehicles
        </Button>
      </Stack>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mb={8}>
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
                <Stat.Label>{stat.label}</Stat.Label>
                <Stat.ValueText fontSize="3xl">{stat.value}</Stat.ValueText>
              </Stat.Root>
            </Stack>
          </Box>
        ))}
      </SimpleGrid>

      <Box>
        <Stack direction="row" justify="space-between" align="center" mb={4}>
          <Heading size="md">Active Bookings</Heading>
          {activeBookings.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push("/customer/bookings")}
            >
              View All Bookings
            </Button>
          )}
        </Stack>

        {activeBookings.length === 0 ? (
          <Box
            p={8}
            bg="bg.panel"
            borderRadius="lg"
            borderWidth={1}
            borderColor="border"
            textAlign="center"
          >
            <Box as={FiTruck} fontSize="4xl" color="fg.muted" mx="auto" mb={3} />
            <Text color="fg.muted" fontSize="lg" fontWeight="medium">
              No active bookings
            </Text>
            <Text color="fg.muted" fontSize="sm" mt={2} mb={4}>
              Book a vehicle to get started with your journey
            </Text>
            <Button
              colorPalette="blue"
              onClick={() => router.push("/customer/vehicles")}
            >
              Browse Available Vehicles
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            {activeBookings.map((booking) => {
              const vehicle = booking.vehicleId as Vehicle;
              return (
                <Card.Root
                  key={booking._id}
                  borderWidth={1}
                  borderColor="border"
                  overflow="hidden"
                >
                  <Card.Body p={5}>
                    <Stack gap={4}>
                      <Stack direction="row" justify="space-between" align="start">
                        <Box>
                          <Text fontSize="xs" color="fg.muted" mb={1}>
                            Booking ID
                          </Text>
                          <Text fontWeight="medium" fontSize="sm">
                            {booking._id.substring(0, 12)}...
                          </Text>
                        </Box>
                        <Badge colorPalette={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </Stack>

                      <Separator />

                      <Stack gap={3}>
                        <Stack direction="row" align="center" gap={2}>
                          <Box as={FiTruck} color="blue.500" fontSize="xl" />
                          <Box>
                            <Text fontWeight="bold" fontSize="lg">
                              {vehicle?.make} {vehicle?.vehicleModel}
                            </Text>
                            <Text fontSize="xs" color="fg.muted">
                              {vehicle?.registrationNumber} • {vehicle?.type}
                            </Text>
                          </Box>
                        </Stack>

                        <Stack direction="row" align="center" gap={2}>
                          <Box as={FiCalendar} color="green.500" />
                          <Box flex={1}>
                            <Text fontSize="xs" color="fg.muted">Duration</Text>
                            <Text fontSize="sm" fontWeight="medium">
                              {calculateDuration(booking.startDate, booking.endDate)}
                            </Text>
                          </Box>
                        </Stack>

                        <Stack direction="row" align="center" gap={2}>
                          <Box as={FiClock} color="orange.500" />
                          <Box flex={1}>
                            <Text fontSize="xs" color="fg.muted">Start Date</Text>
                            <Text fontSize="sm">{formatDate(booking.startDate)}</Text>
                          </Box>
                        </Stack>

                        <Stack direction="row" align="center" gap={2}>
                          <Box as={FiClock} color="purple.500" />
                          <Box flex={1}>
                            <Text fontSize="xs" color="fg.muted">End Date</Text>
                            <Text fontSize="sm">{formatDate(booking.endDate)}</Text>
                          </Box>
                        </Stack>

                        <Stack direction="row" align="center" gap={2}>
                          <Box as={FiDollarSign} color="blue.500" />
                          <Box flex={1}>
                            <Text fontSize="xs" color="fg.muted">Total Cost</Text>
                            <Text fontSize="lg" fontWeight="bold" color="blue.600">
                              ${booking.totalCost}
                            </Text>
                          </Box>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Card.Body>
                </Card.Root>
              );
            })}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
}
