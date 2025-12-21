"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  SimpleGrid, 
  Flex, 
  VStack, 
  HStack, 
  Icon,
  Badge,
  Stack,
  Image
} from "@chakra-ui/react";
import { FaCar, FaRoute, FaUserShield, FaChartLine, FaClock, FaHeadset, FaArrowRight, FaCheckCircle } from "react-icons/fa";
import { IoRocketSharp } from "react-icons/io5";

export default function Home() {
  return (
    <Box bg="bg.canvas" minH="100vh">
      {/* Navbar */}
      <Box 
        as="nav" 
        position="sticky" 
        top={0} 
        zIndex={50} 
        bg="white/80" 
        backdropFilter="blur(12px)" 
        borderBottomWidth="1px" 
        borderColor="gray.100"
        _dark={{ bg: "gray.900/80", borderColor: "gray.800" }}
      >
        <Container maxW="7xl" py={4}>
          <Flex justify="space-between" align="center">
            <HStack gap={2}>
              <Icon as={IoRocketSharp} color="blue.500" boxSize={6} />
              <Heading size="md" fontWeight="bold" letterSpacing="tight">
                FleetFlow
              </Heading>
            </HStack>
            <HStack gap={4} display={{ base: "none", md: "flex" }}>
              <Link href="#features"><Button variant="ghost" size="sm">Features</Button></Link>
              <Link href="#pricing"><Button variant="ghost" size="sm">Pricing</Button></Link>
              <Link href="/login">
                <Button variant="ghost" size="sm" fontWeight="semibold">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button colorPalette="blue" size="sm" px={6}>Get Started</Button>
              </Link>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box position="relative" overflow="hidden" pt={{ base: 20, md: 32 }} pb={{ base: 20, md: 40 }}>
        <Box 
          position="absolute" 
          top="-20%" 
          left="50%" 
          transform="translateX(-50%)" 
          width="140%" 
          height="140%" 
          bgGradient="radial(blue.500 1px, transparent 1px)" 
          backgroundSize="40px 40px" 
          opacity={0.1} 
          zIndex={-1} 
        />
        <Container maxW="7xl" position="relative">
          <VStack gap={8} textAlign="center" maxW="4xl" mx="auto">
            <Badge 
              colorPalette="blue" 
              variant="subtle" 
              px={4} 
              py={1} 
              borderRadius="full" 
              fontSize="sm"
              textTransform="none"
            >
              🚀 The #1 Fleet Management Platform
            </Badge>
            <Heading 
              size={{ base: "4xl", md: "6xl" }} 
              fontWeight="900" 
              lineHeight="1.1"
              letterSpacing="tight"
            >
              Smart Fleet Management <br />
              <Text as="span" color="blue.500">Simplified.</Text>
            </Heading>
            <Text fontSize={{ base: "lg", md: "xl" }} color="gray.500" maxW="2xl" lineHeight="tall">
              Optimize operations, reduce costs, and ensure safety with our AI-powered fleet tracking and management solution.
            </Text>
            <HStack gap={4} pt={4}>
              <Link href="/signup">
                <Button size="xl" colorPalette="blue" px={10} h={14} fontSize="lg" borderRadius="full">
                  Start Free Trial <Icon as={FaArrowRight} ml={2} />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="xl" variant="outline" px={10} h={14} fontSize="lg" borderRadius="full">
                  View Demo
                </Button>
              </Link>
            </HStack>
            
            <HStack gap={8} pt={8} color="gray.400" fontSize="sm" fontWeight="medium">
              <HStack><Icon as={FaCheckCircle} color="green.500" /> <Text>14-day free trial</Text></HStack>
              <HStack><Icon as={FaCheckCircle} color="green.500" /> <Text>No credit card required</Text></HStack>
              <HStack><Icon as={FaCheckCircle} color="green.500" /> <Text>Cancel anytime</Text></HStack>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Dashboard Preview (Abstract) */}
      <Container maxW="7xl" mt={-20} mb={20} position="relative" zIndex={1}>
        <Box 
          borderRadius="2xl" 
          overflow="hidden" 
          boxShadow="2xl" 
          p={8}
          bgGradient="to-br"
          gradientFrom="blue.500"
          gradientTo="purple.600"
        >
          <Box borderRadius="xl" overflow="hidden" boxShadow="xl">
            <Image 
              src="/dashboard-image.png" 
              alt="FleetFlow Dashboard Preview" 
              w="full" 
              h="auto"
            />
          </Box>
        </Box>
      </Container>

      {/* Features Grid */}
      <Box bg="gray.50" _dark={{ bg: "gray.900" }} py={24}>
        <Container maxW="7xl">
          <VStack gap={16}>
            <VStack gap={4} textAlign="center" maxW="3xl" mx="auto">
              <Text color="blue.500" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" fontSize="sm">Features</Text>
              <Heading size="3xl" fontWeight="bold">
                Everything you need to scale
              </Heading>
              <Text fontSize="xl" color="gray.500">
                Powerful tools designed for modern fleet managers, drivers, and business owners.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8} w="full">
              {features.map((feature, index) => (
                <Box 
                  key={index} 
                  bg="white" 
                  _dark={{ bg: "gray.800" }}
                  p={8} 
                  borderRadius="3xl" 
                  borderWidth="1px" 
                  borderColor="transparent"
                  position="relative"
                  overflow="hidden"
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{ 
                    transform: "translateY(-8px)", 
                    shadow: "2xl",
                    borderColor: "blue.400",
                    _dark: { borderColor: "blue.500" }
                  }}
                  _before={{
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    bgGradient: "to-r",
                    gradientFrom: "blue.400",
                    gradientTo: "purple.500",
                    opacity: 0,
                    transition: "opacity 0.3s"
                  }}
                  _after={{
                    content: '""',
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    bgGradient: "to-br",
                    gradientFrom: "blue.50",
                    gradientTo: "purple.50",
                    _dark: { gradientFrom: "blue.900/10", gradientTo: "purple.900/10" },
                    opacity: 0,
                    transition: "opacity 0.3s",
                    zIndex: -1
                  }}
                  css={{
                    '&:hover::before': { opacity: 1 },
                    '&:hover::after': { opacity: 1 }
                  }}
                >
                  <VStack align="start" gap={5}>
                    <Box 
                      p={4} 
                      borderRadius="2xl" 
                      bgGradient="to-br"
                      gradientFrom="blue.400"
                      gradientTo="blue.600"
                      color="white"
                      boxShadow="lg"
                      transition="all 0.3s"
                      _groupHover={{ transform: "scale(1.1)" }}
                    >
                      <Icon as={feature.icon} boxSize={7} />
                    </Box>
                    <VStack align="start" gap={2}>
                      <Heading size="lg" fontWeight="bold" letterSpacing="tight">
                        {feature.title}
                      </Heading>
                      <Text color="gray.600" _dark={{ color: "gray.400" }} lineHeight="relaxed" fontSize="md">
                        {feature.description}
                      </Text>
                    </VStack>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box py={24} borderTopWidth="1px" borderColor="gray.100" _dark={{ borderColor: "gray.800" }}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={12} textAlign="center">
            {stats.map((stat, index) => (
              <VStack key={index} gap={1}>
                <Heading size="4xl" fontWeight="900" color="blue.600" _dark={{ color: "blue.400" }}>
                  {stat.value}
                </Heading>
                <Text fontSize="lg" fontWeight="medium" color="gray.500">
                  {stat.label}
                </Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxW="7xl" py={20}>
        <Box 
          bg="blue.600" 
          borderRadius="3xl" 
          px={{ base: 8, md: 20 }}
          py={{ base: 12, md: 20 }}
          position="relative"
          overflow="hidden"
          textAlign="center"
        >
          <Box position="absolute" top={0} left={0} w="full" h="full" bgGradient="to-r" gradientFrom="blue.600" gradientTo="purple.600" opacity={0.9} zIndex={0} />
          <VStack gap={8} position="relative" zIndex={1} color="white">
            <Heading size="3xl" fontWeight="bold">
              Ready to modernize your fleet?
            </Heading>
            <Text fontSize="xl" maxW="2xl" opacity={0.9}>
              Join over 5,000+ companies using FleetFlow to streamline their operations today.
            </Text>
            <Stack direction={{ base: "column", sm: "row" }} gap={4} pt={4}>
              <Link href="/signup">
                <Button size="xl" bg="white" color="blue.600" px={10} h={14} fontSize="lg" borderRadius="full" _hover={{ bg: "gray.100" }}>
                  Get Started Now
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="xl" variant="outline" color="white" borderColor="white" px={10} h={14} fontSize="lg" borderRadius="full" _hover={{ bg: "whiteAlpha.200" }}>
                  Contact Sales
                </Button>
              </Link>
            </Stack>
          </VStack>
        </Box>
      </Container>

      {/* Footer */}
      <Box bg="gray.50" _dark={{ bg: "gray.900", borderColor: "gray.800" }} borderTopWidth="1px" borderColor="gray.200" pt={16} pb={8}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 4 }} gap={12} mb={12}>
            <VStack align="start" gap={4}>
              <HStack gap={2}>
                <Icon as={IoRocketSharp} color="blue.500" boxSize={5} />
                <Heading size="md" fontWeight="bold">FleetFlow</Heading>
              </HStack>
              <Text color="gray.500" fontSize="sm" maxW="xs">
                Empowering fleets with next-generation technology for a smarter, safer future.
              </Text>
            </VStack>
            <VStack align="start" gap={3}>
              <Heading size="sm" mb={1}>Product</Heading>
              <Link href="#"><Text color="gray.500" fontSize="sm" _hover={{ color: "blue.500" }}>Features</Text></Link>
              <Link href="#"><Text color="gray.500" fontSize="sm" _hover={{ color: "blue.500" }}>Pricing</Text></Link>
              <Link href="#"><Text color="gray.500" fontSize="sm" _hover={{ color: "blue.500" }}>API</Text></Link>
            </VStack>
            <VStack align="start" gap={3}>
              <Heading size="sm" mb={1}>Company</Heading>
              <Link href="#"><Text color="gray.500" fontSize="sm" _hover={{ color: "blue.500" }}>About</Text></Link>
              <Link href="#"><Text color="gray.500" fontSize="sm" _hover={{ color: "blue.500" }}>Blog</Text></Link>
              <Link href="#"><Text color="gray.500" fontSize="sm" _hover={{ color: "blue.500" }}>Careers</Text></Link>
            </VStack>
            <VStack align="start" gap={3}>
              <Heading size="sm" mb={1}>Legal</Heading>
              <Link href="#"><Text color="gray.500" fontSize="sm" _hover={{ color: "blue.500" }}>Privacy</Text></Link>
              <Link href="#"><Text color="gray.500" fontSize="sm" _hover={{ color: "blue.500" }}>Terms</Text></Link>
              <Link href="#"><Text color="gray.500" fontSize="sm" _hover={{ color: "blue.500" }}>Security</Text></Link>
            </VStack>
          </SimpleGrid>
          <Box borderTopWidth="1px" borderColor="gray.200" _dark={{ borderColor: "gray.800" }} pt={8} textAlign="center">
            <Text color="gray.500" fontSize="sm">
              © {new Date().getFullYear()} FleetFlow Inc. All rights reserved.
            </Text>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

const features = [
  {
    icon: FaCar,
    title: "Vehicle Tracking",
    description: "Real-time GPS tracking and monitoring of your entire fleet with detailed insights and alerts."
  },
  {
    icon: FaRoute,
    title: "Route Optimization",
    description: "Intelligent route planning to reduce fuel costs and improve delivery times automatically."
  },
  {
    icon: FaUserShield,
    title: "Driver Management",
    description: "Complete driver profiles, performance tracking, and safety monitoring in one place."
  },
  {
    icon: FaChartLine,
    title: "Analytics & Reports",
    description: "Comprehensive dashboards and reports to make data-driven decisions for your fleet."
  },
  {
    icon: FaClock,
    title: "Maintenance Scheduling",
    description: "Automated maintenance reminders and service history tracking to keep vehicles running."
  },
  {
    icon: FaHeadset,
    title: "24/7 Support",
    description: "Round-the-clock customer support to ensure your operations never stop."
  }
];

const stats = [
  { value: "10K+", label: "Active Vehicles" },
  { value: "500+", label: "Happy Clients" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" }
];
