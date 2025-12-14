"use client";

import { Badge, Box, Button, Heading, Table, Text, Spinner, Center } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api-client";
import { Trip, Booking, Vehicle } from "@/types/api";
import { toaster } from "@/components/ui/toaster";

export default function DriverTripsPage() {
  const { data: session } = useSession();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchTrips();
    }
  }, [session]);

  const fetchTrips = async () => {
    if (!session?.user?.accessToken) return;
    try {
      setLoading(true);
      const response = await api.trips.getAssigned(session.user.accessToken);
      if (response.status === "success") {
        setTrips(response.data.trips);
      }
    } catch (err: any) {
      setError(err.message);
      toaster.create({
        title: "Error fetching trips",
        description: err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (tripId: string, newStatus: string) => {
    if (!session?.user?.accessToken) return;
    try {
      await api.trips.updateStatus(session.user.accessToken, tripId, newStatus);
      fetchTrips(); // Refresh list
      toaster.create({
        title: "Trip updated",
        type: "success",
      });
    } catch (err: any) {
      toaster.create({
        title: "Error updating trip",
        description: err.message,
        type: "error",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "green";
      case "STARTED":
        return "blue";
      default:
        return "orange";
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
      <Heading mb={6}>My Trips</Heading>
      {trips.length === 0 ? (
        <Text>No trips assigned.</Text>
      ) : (
        <Box overflowX="auto" borderWidth={1} borderColor="border" borderRadius="lg">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Trip ID</Table.ColumnHeader>
                <Table.ColumnHeader>Vehicle</Table.ColumnHeader>
                <Table.ColumnHeader>Date</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader>Action</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {trips.map((trip) => {
                const booking = trip.bookingId as Booking;
                const vehicle = trip.vehicleId as Vehicle;
                return (
                  <Table.Row key={trip._id}>
                    <Table.Cell fontWeight="medium">{trip._id.substring(0, 8)}...</Table.Cell>
                    <Table.Cell>
                      <Text>{vehicle?.make} {vehicle?.vehicleModel}</Text>
                      <Text color="fg.muted" fontSize="xs">{vehicle?.registrationNumber}</Text>
                    </Table.Cell>
                    <Table.Cell>{booking?.startDate ? new Date(booking.startDate).toLocaleDateString() : "N/A"}</Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={getStatusColor(trip.status)}>
                        {trip.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {trip.status === "ASSIGNED" && (
                        <Button size="xs" onClick={() => handleStatusUpdate(trip._id, "STARTED")}>Start Trip</Button>
                      )}
                      {trip.status === "STARTED" && (
                        <Button size="xs" colorPalette="green" onClick={() => handleStatusUpdate(trip._id, "COMPLETED")}>Complete Trip</Button>
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
