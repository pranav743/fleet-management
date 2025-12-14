"use client";

import { Badge, Box, Button, Heading, Table, Spinner, Center, Text } from "@chakra-ui/react";
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

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchBookings();
    }
  }, [session]);

  const fetchBookings = async () => {
    if (!session?.user?.accessToken) return;
    try {
      setLoading(true);
      const response = await api.bookings.getMyBookings(session.user.accessToken);
      if (response.status === "success") {
        setBookings(response.data.bookings);
      }
    } catch (err: any) {
      setError(err.message);
      toaster.create({
        title: "Error fetching bookings",
        description: err.message,
        type: "error",
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
      default:
        return "red";
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
      <Heading mb={6}>My Bookings</Heading>
      {bookings.length === 0 ? (
        <Text>No bookings found.</Text>
      ) : (
        <Box overflowX="auto" borderWidth={1} borderColor="border" borderRadius="lg">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Booking ID</Table.ColumnHeader>
                <Table.ColumnHeader>Vehicle</Table.ColumnHeader>
                <Table.ColumnHeader>Start Date</Table.ColumnHeader>
                <Table.ColumnHeader>End Date</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader>Price</Table.ColumnHeader>
                <Table.ColumnHeader>Action</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {bookings.map((booking) => {
                const vehicle = booking.vehicleId as Vehicle;
                return (
                  <Table.Row key={booking._id}>
                    <Table.Cell fontWeight="medium">{booking._id.substring(0, 8)}...</Table.Cell>
                    <Table.Cell>{vehicle?.make} {vehicle?.vehicleModel}</Table.Cell>
                    <Table.Cell>{new Date(booking.startDate).toLocaleDateString()}</Table.Cell>
                    <Table.Cell>{new Date(booking.endDate).toLocaleDateString()}</Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>${booking.totalCost}</Table.Cell>
                    <Table.Cell>
                      <Button size="xs" variant="outline">View</Button>
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
