"use client";

import { 
  Badge, 
  Box, 
  Button, 
  Heading, 
  Table, 
  Spinner, 
  Center, 
  Text,
  SimpleGrid,
  Stack,
  Card,
  Separator
} from "@chakra-ui/react";
import { FiCalendar, FiClock, FiDollarSign, FiTruck } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api-client";
import { Booking, Vehicle } from "@/types/api";
import { toaster } from "@/components/ui/toaster";

export default function CustomerBookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [cancelling, setCancelling] = useState<string | null>(null);

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
      setError(null);
      const response = await api.bookings.getMyBookings(session.accessToken!);
      if (response.status === "success") {
        setBookings(response.data.bookings);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toaster.create({
        title: "Error Fetching Bookings",
        description: err instanceof Error ? err.message : 'An error occurred',
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

  const handleCancelBooking = async (bookingId: string) => {
    if (!session?.accessToken) return;
    
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setCancelling(bookingId);
      const response = await api.bookings.cancel(session.accessToken, bookingId);
      
      if (response.status === "success") {
        toaster.create({
          title: "Success",
          description: response.message || "Booking cancelled successfully",
          type: "success",
          duration: 4000,
        });
        fetchBookings(); // Refresh the bookings list
      }
    } catch (err) {
      const error = err as Error;
      toaster.create({
        title: "Cancellation Failed",
        description: error.message,
        type: "error",
        duration: 5000,
      });
    } finally {
      setCancelling(null);
    }
  };

  const canCancelBooking = (booking: Booking) => {
    return booking.status === "CONFIRMED" || booking.status === "PENDING";
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
        <Heading>My Bookings</Heading>
        <Stack direction="row" gap={2}>
          <Button
            size="sm"
            variant={view === "grid" ? "solid" : "outline"}
            onClick={() => setView("grid")}
          >
            Grid View
          </Button>
          <Button
            size="sm"
            variant={view === "table" ? "solid" : "outline"}
            onClick={() => setView("table")}
          >
            Table View
          </Button>
        </Stack>
      </Stack>

      {bookings.length === 0 ? (
        <Box
          p={8}
          bg="bg.panel"
          borderRadius="lg"
          borderWidth={1}
          borderColor="border"
          textAlign="center"
        >
          <Text color="fg.muted" fontSize="lg">No bookings found.</Text>
          <Text color="fg.muted" fontSize="sm" mt={2}>
            Book a vehicle to see your bookings here.
          </Text>
          <Button mt={4} colorPalette="blue" asChild>
            <a href="/customer/vehicles">Browse Vehicles</a>
          </Button>
        </Box>
      ) : view === "grid" ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
          {bookings.map((booking) => {
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
                        <Box as={FiTruck} color="blue.500" />
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

                    {canCancelBooking(booking) && (
                      <>
                        <Separator />
                        <Button
                          size="sm"
                          colorPalette="red"
                          variant="outline"
                          onClick={() => handleCancelBooking(booking._id)}
                          loading={cancelling === booking._id}
                          w="full"
                        >
                          Cancel Booking
                        </Button>
                      </>
                    )}
                  </Stack>
                </Card.Body>
              </Card.Root>
            );
          })}
        </SimpleGrid>
      ) : (
        <Box overflowX="auto" borderWidth={1} borderColor="border" borderRadius="lg">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Booking ID</Table.ColumnHeader>
                <Table.ColumnHeader>Vehicle</Table.ColumnHeader>
                <Table.ColumnHeader>Start Date</Table.ColumnHeader>
                <Table.ColumnHeader>End Date</Table.ColumnHeader>
                <Table.ColumnHeader>Duration</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader>Price</Table.ColumnHeader>
                <Table.ColumnHeader>Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {bookings.map((booking) => {
                const vehicle = booking.vehicleId as Vehicle;
                return (
                  <Table.Row key={booking._id}>
                    <Table.Cell fontWeight="medium">
                      {booking._id.substring(0, 8)}...
                    </Table.Cell>
                    <Table.Cell>
                      <Box>
                        <Text fontWeight="medium">
                          {vehicle?.make} {vehicle?.vehicleModel}
                        </Text>
                        <Text fontSize="xs" color="fg.muted">
                          {vehicle?.registrationNumber}
                        </Text>
                      </Box>
                    </Table.Cell>
                    <Table.Cell>{formatDate(booking.startDate)}</Table.Cell>
                    <Table.Cell>{formatDate(booking.endDate)}</Table.Cell>
                    <Table.Cell>
                      {calculateDuration(booking.startDate, booking.endDate)}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell fontWeight="bold" color="blue.600">
                      ${booking.totalCost}
                    </Table.Cell>
                    <Table.Cell>
                      {canCancelBooking(booking) ? (
                        <Button
                          size="xs"
                          colorPalette="red"
                          variant="outline"
                          onClick={() => handleCancelBooking(booking._id)}
                          loading={cancelling === booking._id}
                        >
                          Cancel
                        </Button>
                      ) : (
                        <Text fontSize="xs" color="fg.muted">-</Text>
                      )}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        </Box>
      )}
    </Box>
  );
}
