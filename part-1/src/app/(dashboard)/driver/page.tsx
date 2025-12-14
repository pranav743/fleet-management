"use client";

import { Box, Heading, SimpleGrid, Stat, Text } from "@chakra-ui/react";
import { FiCheckCircle, FiClock, FiMapPin } from "react-icons/fi";

export default function DriverDashboard() {
  const stats = [
    { label: "Completed Trips", value: "12", icon: FiCheckCircle, color: "green.500" },
    { label: "Pending Trips", value: "2", icon: FiClock, color: "orange.500" },
    { label: "Total Distance", value: "1,250 km", icon: FiMapPin, color: "blue.500" },
  ];

  return (
    <Box>
      <Heading mb={6}>Driver Dashboard</Heading>
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
        <Heading size="md" mb={4}>Current Assignment</Heading>
        <Box p={6} bg="bg.panel" borderRadius="lg" borderWidth={1} borderColor="border">
          <Text color="fg.muted">You have no active trips at the moment.</Text>
        </Box>
      </Box>
    </Box>
  );
}
