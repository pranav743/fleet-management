"use client";

import { Box, Flex, Heading, HStack, IconButton, Spacer, Text, VStack, Stack, Badge } from "@chakra-ui/react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/types/auth";
import { FiHome, FiTruck, FiLogOut, FiMenu, FiCalendar, FiMapPin, FiPackage } from "react-icons/fi";
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { ColorModeButton } from "@/components/ui/color-mode"

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: FiHome, roles: [UserRole.OWNER, UserRole.DRIVER, UserRole.CUSTOMER] },
  { label: "My Vehicles", href: "/owner/vehicles", icon: FiTruck, roles: [UserRole.OWNER] },
  { label: "My Trips", href: "/driver/trips", icon: FiMapPin, roles: [UserRole.DRIVER] },
  { label: "Register Vehicle", href: "/driver/register", icon: FiPackage, roles: [UserRole.DRIVER] },
  { label: "Browse Vehicles", href: "/customer/vehicles", icon: FiTruck, roles: [UserRole.CUSTOMER] },
  { label: "My Bookings", href: "/customer/bookings", icon: FiCalendar, roles: [UserRole.CUSTOMER] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const userRole = session?.user?.role;

  const filteredNavItems = NAV_ITEMS.filter((item) =>
    userRole ? item.roles.includes(userRole) : false
  );

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case UserRole.OWNER:
        return "purple";
      case UserRole.DRIVER:
        return "blue";
      case UserRole.CUSTOMER:
        return "green";
      default:
        return "gray";
    }
  };

  return (
    <Flex minH="100vh" direction="column" bg="bg.canvas">
      {/* Navbar */}
      <Flex
        as="header"
        align="center"
        justify="space-between"
        wrap="wrap"
        px={6}
        py={4}
        bg="bg.panel"
        borderBottomWidth={1}
        borderColor="border"
        boxShadow="sm"
        position="sticky"
        top={0}
        zIndex={10}
      >
        <HStack gap={4}>
           <DrawerRoot placement="start">
            <DrawerTrigger asChild>
               <IconButton
                  aria-label="Open Menu"
                  variant="ghost"
                  display={{ base: "flex", md: "none" }}
                  size="lg"
                >
                  <FiMenu />
                </IconButton>
            </DrawerTrigger>
            <DrawerBackdrop />
            <DrawerContent>
              <DrawerHeader borderBottomWidth={1}>
                <DrawerTitle>
                  <Stack direction="row" align="center" gap={3}>
                    <Box 
                      p={2} 
                      bg="blue.500" 
                      borderRadius="md"
                      color="white"
                    >
                      <FiTruck size={20} />
                    </Box>
                    <Text>Fleet Manager</Text>
                  </Stack>
                </DrawerTitle>
                <DrawerCloseTrigger />
              </DrawerHeader>
              <DrawerBody p={4}>
                <SidebarContent navItems={filteredNavItems} pathname={pathname} isMobile />
              </DrawerBody>
            </DrawerContent>
          </DrawerRoot>
          
          <Stack direction="row" align="center" gap={3}>
            <Box 
              p={2} 
              bg="blue.500" 
              borderRadius="md"
              color="white"
              display={{ base: "none", sm: "block" }}
            >
              <FiTruck size={20} />
            </Box>
            <Heading size={{ base: "sm", md: "md" }} fontWeight="bold">
              Fleet Manager
            </Heading>
          </Stack>
        </HStack>

        <Spacer />

        <HStack gap={3}>
          <ColorModeButton />
          <Box display={{ base: "none", md: "block" }}>
            <Stack direction="row" align="center" gap={2}>
              <Box>
                <Text fontSize="sm" fontWeight="medium" lineHeight="tight">
                  {session?.user?.name}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  {session?.user?.email}
                </Text>
              </Box>
              <Badge colorPalette={getRoleBadgeColor(userRole)} size="sm">
                {session?.user?.role}
              </Badge>
            </Stack>
          </Box>
          <Button 
            size="sm" 
            variant="outline" 
            colorPalette="red"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <FiLogOut />
            <Text display={{ base: "none", sm: "inline" }}>Logout</Text>
          </Button>
        </HStack>
      </Flex>

      <Flex flex={1}>
        {/* Sidebar (Desktop) */}
        <Box
          as="nav"
          width="280px"
          display={{ base: "none", md: "block" }}
          borderRightWidth={1}
          borderColor="border"
          bg="bg.panel"
          overflowY="auto"
        >
          <Box p={6}>
            <Text 
              fontSize="xs" 
              fontWeight="semibold" 
              textTransform="uppercase" 
              letterSpacing="wide"
              color="fg.muted"
              mb={4}
            >
              Navigation
            </Text>
            <SidebarContent navItems={filteredNavItems} pathname={pathname} />
          </Box>
        </Box>

        {/* Main Content */}
        <Box flex={1} p={{ base: 4, md: 8 }} bg="bg.canvas" overflowY="auto">
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}

const SidebarContent = ({ navItems, pathname }: { navItems: NavItem[], pathname: string, isMobile?: boolean }) => (
  <VStack align="stretch" gap={2}>
    {navItems.map((item) => {
      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
      return (
        <Link key={item.href} href={item.href} passHref style={{ width: '100%' }}>
           <Button
              variant={isActive ? "subtle" : "ghost"}
              justifyContent="flex-start"
              width="full"
              colorPalette={isActive ? "blue" : "gray"}
              size="md"
              fontWeight={isActive ? "semibold" : "medium"}
              px={4}
              py={6}
              borderRadius="lg"
              position="relative"
              _before={{
                content: '""',
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                width: isActive ? "4px" : "0px",
                height: "60%",
                bg: "blue.500",
                borderRadius: "0 4px 4px 0",
                transition: "width 0.2s",
              }}
              _hover={{
                bg: isActive ? "blue.50" : "gray.50",
                _dark: {
                  bg: isActive ? "blue.900" : "gray.800",
                }
              }}
            >
              <Box as={item.icon} fontSize="lg" />
              <Text ml={3}>{item.label}</Text>
            </Button>
        </Link>
      );
    })}
  </VStack>
);
