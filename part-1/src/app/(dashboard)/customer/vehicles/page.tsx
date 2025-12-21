"use client";

import {
  Box,
  Button,
  Heading,
  SimpleGrid,
  Text,
  Image,
  Badge,
  Stack,
  Spinner,
  Center,
  Input,
} from "@chakra-ui/react";
import { FiCalendar, FiFilter, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api-client";
import { Vehicle } from "@/types/api";
import { toaster } from "@/components/ui/toaster";
import { getRandomVehicleImage } from "@/constants/vehicle-images";
import { Field } from "@/components/ui/field";
import { NativeSelectRoot, NativeSelectField } from "@chakra-ui/react";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
} from "@/components/ui/dialog";

const ITEMS_PER_PAGE = 10;

export default function CustomerVehiclesPage() {
  const { data: session } = useSession();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  
  const [typeFilter, setTypeFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [bookingStartDate, setBookingStartDate] = useState("");
  const [bookingEndDate, setBookingEndDate] = useState("");

  useEffect(() => {
    if (session?.accessToken) {
      fetchAvailableVehicles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, page]);

  const fetchAvailableVehicles = async () => {
    if (!session?.accessToken) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const params: Record<string, string | number> = {
        page: page,
        limit: ITEMS_PER_PAGE,
        status: "IDLE",
      };
      
      if (typeFilter) params.type = typeFilter;
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();
      
      const response = await api.vehicles.getAvailable(session.accessToken, params);
      if (response.status === "success") {
        const newVehicles = response.data.vehicles || [];
        setVehicles(newVehicles);
        
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      toaster.create({
        title: "Error Fetching Vehicles",
        description: error.message,
        type: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };


  const handleBookVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setBookingStartDate("");
    setBookingEndDate("");
    setBookingOpen(true);
  };

  const submitBooking = async () => {
    if (!session?.accessToken || !selectedVehicle) return;
    
    if (!bookingStartDate || !bookingEndDate) {
      toaster.create({
        title: "Validation Error",
        description: "Please select start and end dates",
        type: "error",
        duration: 4000,
      });
      return;
    }

    const start = new Date(bookingStartDate);
    const end = new Date(bookingEndDate);

    if (start >= end) {
      toaster.create({
        title: "Validation Error",
        description: "End date must be after start date",
        type: "error",
        duration: 4000,
      });
      return;
    }

    try {
      setBooking(true);
      const response = await api.bookings.create(session.accessToken, {
        vehicleId: selectedVehicle._id,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
      
      if (response.status === "success") {
        toaster.create({
          title: "Booking Successful",
          description: "Your vehicle has been booked successfully",
          type: "success",
          duration: 4000,
        });
        setBookingOpen(false);
        fetchAvailableVehicles();
      }
    } catch (err) {
      const error = err as Error;
      toaster.create({
        title: "Booking Failed",
        description: error.message,
        type: "error",
        duration: 5000,
      });
    } finally {
      setBooking(false);
    }
  };

  const applyFilters = () => {
    setPage(1);
    fetchAvailableVehicles();
  };

  const clearFilters = () => {
    setTypeFilter("");
    setStartDate("");
    setEndDate("");
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
        <Heading>Available Vehicles</Heading>
      </Stack>

      {/* Filters */}
      <Box
        mb={6}
        p={4}
        borderWidth={1}
        borderColor="border"
        borderRadius="lg"
        bg="bg.panel"
      >
        <Stack direction="row" align="center" mb={3}>
          <Box as={FiFilter} />
          <Heading size="sm">Filters</Heading>
        </Stack>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
          <Field label="Vehicle Type">
            <NativeSelectRoot>
              <NativeSelectField
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="SEDAN">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="TRUCK">Truck</option>
                <option value="VAN">Van</option>
              </NativeSelectField>
            </NativeSelectRoot>
          </Field>
          
          <Field label="Start Date">
            <Input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Field>
          
          <Field label="End Date">
            <Input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Field>
        </SimpleGrid>
        
        <Stack direction="row" gap={2} mt={4}>
          <Button size="sm" onClick={applyFilters}>
            Apply Filters
          </Button>
          <Button size="sm" variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </Stack>
      </Box>

      {vehicles.length === 0 ? (
        <Box p={6} bg="bg.panel" borderRadius="lg" borderWidth={1} borderColor="border" textAlign="center">
          <Text color="fg.muted">No vehicles available at the moment.</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
          {vehicles.map((vehicle) => (
            <Box
              key={vehicle._id}
              borderWidth={1}
              borderColor="border"
              borderRadius="lg"
              overflow="hidden"
              bg="bg.panel"
              opacity={vehicle.availableForBooking ? 1 : 0.6}
            >
              <Image
                src={getRandomVehicleImage()}
                alt={vehicle.make}
                objectFit="cover"
                h="200px"
                w="full"
              />
              <Box p={4}>
                <Stack
                  direction="row"
                  justify="space-between"
                  align="center"
                  mb={2}
                >
                  <Heading size="md">
                    {vehicle.make} {vehicle.vehicleModel}
                  </Heading>
                  <Stack direction="column" gap={1} align="flex-end">
                    <Badge
                      colorPalette={
                        vehicle.status === "IDLE" ? "green" : 
                        vehicle.status === "ACTIVE" ? "blue" : "orange"
                      }
                    >
                      {vehicle.status}
                    </Badge>
                    {vehicle.availableForBooking ? (
                      <Badge colorPalette="green" variant="subtle">
                        Available
                      </Badge>
                    ) : (
                      <Badge colorPalette="red" variant="subtle">
                        Unavailable
                      </Badge>
                    )}
                  </Stack>
                </Stack>
                <Text color="fg.muted" fontSize="sm" mb={1}>
                  License Plate: {vehicle.registrationNumber}
                </Text>
                <Text color="fg.muted" fontSize="sm" mb={1}>
                  Type: {vehicle.type}
                </Text>
                {!vehicle.driverId && (
                  <Text color="orange.500" fontSize="xs" fontWeight="medium">
                    No driver assigned
                  </Text>
                )}
                <Button
                  size="sm"
                  colorPalette="blue"
                  mt={4}
                  w="full"
                  onClick={() => handleBookVehicle(vehicle)}
                  disabled={!vehicle.availableForBooking}
                >
                  <Box as={FiCalendar} mr={2} />
                  Book Vehicle
                </Button>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {!loading && vehicles.length > 0 && (
        <Box mt={8} p={4} borderWidth={1} borderColor="border" borderRadius="lg" bg="bg.panel">
          <Stack direction={{ base: "column", md: "row" }} justify="space-between" align="center" gap={4}>
            <Text fontSize="sm" color="fg.muted">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{" "}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{" "}
              {pagination.totalItems} vehicles
            </Text>
            
            <Stack direction="row" align="center" gap={2}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(1)}
                disabled={!pagination.hasPrevPage}
              >
                First
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(prev => prev - 1)}
                disabled={!pagination.hasPrevPage}
              >
                <Box as={FiChevronLeft} />
              </Button>
              
              <Stack direction="row" gap={1}>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={pagination.currentPage === pageNum ? "solid" : "outline"}
                      colorPalette={pagination.currentPage === pageNum ? "blue" : undefined}
                      onClick={() => setPage(pageNum)}
                      minW="40px"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </Stack>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(prev => prev + 1)}
                disabled={!pagination.hasNextPage}
              >
                <Box as={FiChevronRight} />
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(pagination.totalPages)}
                disabled={!pagination.hasNextPage}
              >
                Last
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}

      {/* Booking Dialog */}
      <DialogRoot open={bookingOpen} onOpenChange={(e) => setBookingOpen(e.open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Vehicle</DialogTitle>
          </DialogHeader>
          <DialogCloseTrigger />
          <DialogBody>
            {selectedVehicle && (
              <Stack gap={4}>
                <Box>
                  <Text fontWeight="bold" fontSize="lg">
                    {selectedVehicle.make} {selectedVehicle.vehicleModel}
                  </Text>
                  <Text color="fg.muted" fontSize="sm">
                    {selectedVehicle.registrationNumber} • {selectedVehicle.type}
                  </Text>
                </Box>
                
                <Field label="Start Date & Time" required>
                  <Input
                    type="datetime-local"
                    value={bookingStartDate}
                    onChange={(e) => setBookingStartDate(e.target.value)}
                  />
                </Field>
                
                <Field label="End Date & Time" required>
                  <Input
                    type="datetime-local"
                    value={bookingEndDate}
                    onChange={(e) => setBookingEndDate(e.target.value)}
                  />
                </Field>
              </Stack>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingOpen(false)}>
              Cancel
            </Button>
            <Button
              colorPalette="blue"
              onClick={submitBooking}
              loading={booking}
            >
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
}
