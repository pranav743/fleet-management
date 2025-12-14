"use client";

import { Box, Heading, SimpleGrid, Stat, Text } from "@chakra-ui/react";
import { FiCalendar, FiClock, FiMapPin } from "react-icons/fi";

export default function CustomerDashboard() {
  const stats = [
    { label: "Active Bookings", value: "1", icon: FiCalendar, color: "blue.500" },
    { label: "Past Trips", value: "5", icon: FiClock, color: "gray.500" },
    { label: "Saved Locations", value: "3", icon: FiMapPin, color: "red.500" },
  ];

  return (
    <Box>
      <Heading mb={6}>Customer Dashboard</Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
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
        <Heading size="md" mb={4}>Active Booking</Heading>
        <Box p={6} bg="bg.panel" borderRadius="lg" borderWidth={1} borderColor="border">
          <Text fontWeight="bold" fontSize="lg">Trip to Airport</Text>
          <Text color="fg.muted">Scheduled for tomorrow at 10:00 AM</Text>
        </Box>
      </Box>
    </Box>
  );
}
