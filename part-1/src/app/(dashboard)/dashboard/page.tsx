"use client";

import { Box, Heading, SimpleGrid, Stat, Text, Spinner, Center } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api-client";
import { DashboardStats } from "@/types/api";
import { toaster } from "@/components/ui/toaster";

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    if (!session?.user?.accessToken) return;
    try {
      setLoading(true);
      const response = await api.analytics.getDashboard(session.user.accessToken);
      if (response.status === "success") {
        setStats(response.data.stats);
      }
    } catch (err: any) {
      setError(err.message);
      toaster.create({
        title: "Error fetching dashboard stats",
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
      <Heading mb={6}>Dashboard Overview</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
        <Stat.Root borderWidth={1} borderColor="border" borderRadius="lg" p={4} bg="bg.panel">
          <Stat.Label>Total Revenue</Stat.Label>
          <Stat.ValueText>${stats?.totalRevenue}</Stat.ValueText>
          <Stat.HelpText>All time</Stat.HelpText>
        </Stat.Root>

        <Stat.Root borderWidth={1} borderColor="border" borderRadius="lg" p={4} bg="bg.panel">
          <Stat.Label>Active Trips</Stat.Label>
          <Stat.ValueText>{stats?.activeTrips}</Stat.ValueText>
          <Stat.HelpText>Currently in progress</Stat.HelpText>
        </Stat.Root>

        <Stat.Root borderWidth={1} borderColor="border" borderRadius="lg" p={4} bg="bg.panel">
          <Stat.Label>Total Bookings</Stat.Label>
          <Stat.ValueText>{stats?.totalBookings}</Stat.ValueText>
          <Stat.HelpText>All time</Stat.HelpText>
        </Stat.Root>

        <Stat.Root borderWidth={1} borderColor="border" borderRadius="lg" p={4} bg="bg.panel">
          <Stat.Label>Completed Trips</Stat.Label>
          <Stat.ValueText>{stats?.completedTrips}</Stat.ValueText>
          <Stat.HelpText>Successfully finished</Stat.HelpText>
        </Stat.Root>
      </SimpleGrid>

      <Box mt={8} borderWidth={1} borderColor="border" borderRadius="lg" p={6} bg="bg.panel">
        <Heading size="md" mb={4}>Vehicle Utilization</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
          <Box>
            <Text color="fg.muted">Total Vehicles</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats?.vehicleUtilization.totalVehicles}</Text>
          </Box>
          <Box>
            <Text color="fg.muted">Active Vehicles</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats?.vehicleUtilization.activeVehicles}</Text>
          </Box>
          <Box>
            <Text color="fg.muted">Utilization Rate</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats?.vehicleUtilization.utilizationRate}%</Text>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
}
