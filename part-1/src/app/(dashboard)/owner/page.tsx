"use client";

import { Box, Heading, SimpleGrid, Stat, Text } from "@chakra-ui/react";
import { FiDollarSign, FiTruck, FiXCircle, FiCalendar } from "react-icons/fi";

export default function OwnerDashboard() {
  // Mock data
  const stats = [
    { label: "Total Revenue", value: "$12,500", icon: FiDollarSign, color: "green.500" },
    { label: "Total Bookings", value: "45", icon: FiCalendar, color: "blue.500" },
    { label: "Total Cancellations", value: "3", icon: FiXCircle, color: "red.500" },
    { label: "Active Vehicles", value: "8", icon: FiTruck, color: "purple.500" },
  ];

  return (
    <Box>
      <Heading mb={6}>Owner Dashboard</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
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
            <Stat.Root>
              <Stat.Label>{stat.label}</Stat.Label>
              <Stat.ValueText>{stat.value}</Stat.ValueText>
            </Stat.Root>
          </Box>
        ))}
      </SimpleGrid>
      
      <Box mt={8}>
        <Heading size="md" mb={4}>Recent Activity</Heading>
        <Text color="fg.muted">No recent activity to display.</Text>
      </Box>
    </Box>
  );
}
