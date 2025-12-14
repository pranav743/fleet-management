"use client";

import { Box, Flex, Heading, HStack, IconButton, Spacer, Text, VStack } from "@chakra-ui/react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/types/auth";
import { FiHome, FiTruck, FiUser, FiLogOut, FiMenu } from "react-icons/fi";
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

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: FiHome, roles: [UserRole.VEHICLE_OWNER, UserRole.DRIVER, UserRole.CUSTOMER] },
  { label: "Vehicles", href: "/owner/vehicles", icon: FiTruck, roles: [UserRole.VEHICLE_OWNER] },
  { label: "Trips", href: "/driver/trips", icon: FiTruck, roles: [UserRole.DRIVER] },
  { label: "Bookings", href: "/customer/bookings", icon: FiTruck, roles: [UserRole.CUSTOMER] },
  { label: "Profile", href: "/profile", icon: FiUser, roles: [UserRole.VEHICLE_OWNER, UserRole.DRIVER, UserRole.CUSTOMER] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const userRole = session?.user?.role;

  const filteredNavItems = NAV_ITEMS.filter((item) =>
    userRole ? item.roles.includes(userRole) : false
  );

  return (
    <Flex minH="100vh" direction="column">
      {/* Navbar */}
      <Flex
        as="header"
        align="center"
        justify="space-between"
        wrap="wrap"
        padding={4}
        bg="bg.panel"
        borderBottomWidth={1}
        borderColor="border"
      >
        <HStack gap={4}>
           <DrawerRoot placement="start">
            <DrawerTrigger asChild>
               <IconButton
                  aria-label="Open Menu"
                  variant="ghost"
                  display={{ base: "flex", md: "none" }}
                >
                  <FiMenu />
                </IconButton>
            </DrawerTrigger>
            <DrawerBackdrop />
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Menu</DrawerTitle>
                <DrawerCloseTrigger />
              </DrawerHeader>
              <DrawerBody>
                <SidebarContent navItems={filteredNavItems} pathname={pathname} />
              </DrawerBody>
            </DrawerContent>
          </DrawerRoot>
          
          <Heading size="md">Fleet Manager</Heading>
        </HStack>

        <Spacer />

        <HStack gap={4}>
          <Text fontSize="sm" display={{ base: "none", md: "block" }}>
            {session?.user?.name} ({session?.user?.role})
          </Text>
          <Button size="sm" variant="outline" onClick={() => signOut({ callbackUrl: "/login" })}>
            <FiLogOut />
            Logout
          </Button>
        </HStack>
      </Flex>

      <Flex flex={1}>
        {/* Sidebar (Desktop) */}
        <Box
          as="nav"
          width="250px"
          display={{ base: "none", md: "block" }}
          borderRightWidth={1}
          borderColor="border"
          p={4}
          bg="bg.panel"
        >
          <SidebarContent navItems={filteredNavItems} pathname={pathname} />
        </Box>

        {/* Main Content */}
        <Box flex={1} p={8} bg="bg.canvas">
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}

const SidebarContent = ({ navItems, pathname }: { navItems: NavItem[], pathname: string }) => (
  <VStack align="stretch" gap={4}>
    {navItems.map((item) => {
      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
      return (
        <Link key={item.href} href={item.href} passHref style={{ width: '100%' }}>
           <Button
              variant={isActive ? "solid" : "ghost"}
              justifyContent="flex-start"
              width="full"
              colorPalette={isActive ? "blue" : "gray"}
            >
              <item.icon />
              <Text ml={2}>{item.label}</Text>
            </Button>
        </Link>
      );
    })}
  </VStack>
);
