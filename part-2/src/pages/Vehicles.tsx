import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VehiclesTable, TopVehiclesTable } from "@/components/vehicles/VehiclesTable";
import { FilterControls, type VehicleFilters } from "@/components/vehicles/FilterControls";
import { PaginationControls } from "@/components/vehicles/PaginationControls";
import { DeleteVehicleDialog } from "@/components/vehicles/DeleteVehicleDialog";
import { useVehicles, useTopVehicles } from "@/hooks/useVehicles";
import { useAuth } from "@/context/AuthContext";
import { Package, TrendingUp, Wrench, Car, AlertCircle } from "lucide-react";
import type { Vehicle, GetVehiclesParams, GetTopVehiclesParams } from "@/services/vehicleService";

export default function Vehicles() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [vehicleParams, setVehicleParams] = useState<GetVehiclesParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    order: 'desc',
  });

  const [topVehicleParams, setTopVehicleParams] = useState<GetTopVehiclesParams>({
    page: 1,
    limit: 10,
    sortBy: 'totalRevenue',
    order: 'desc',
  });

  const {
    vehicles,
    pagination: vehiclePagination,
    isLoading: isLoadingVehicles,
    error: vehiclesError,
    refetch: refetchVehicles,
    setParams: updateVehicleParams,
  } = useVehicles(vehicleParams);

  const {
    vehicles: topVehicles,
    pagination: topVehiclePagination,
    isLoading: isLoadingTopVehicles,
    error: topVehiclesError,
    setParams: updateTopVehicleParams,
  } = useTopVehicles(topVehicleParams);

  const stats = useMemo(() => {
    const total = vehiclePagination?.totalItems || 0;
    const idle = vehicles.filter(v => v.status === 'IDLE').length;
    const inTransit = vehicles.filter(v => v.status === 'IN_TRANSIT').length;
    const maintenance = vehicles.filter(v => v.status === 'MAINTENANCE').length;

    return { total, idle, inTransit, maintenance };
  }, [vehicles, vehiclePagination]);

  const handleFilterChange = useCallback((filters: VehicleFilters) => {
    if (activeTab === "all") {
      setVehicleParams(prev => ({
        ...prev,
        ...filters,
        page: 1,
      }));
      updateVehicleParams(prev => ({
        ...prev,
        ...filters,
        page: 1,
      }));
    } else {
      setTopVehicleParams(prev => ({
        ...prev,
        make: filters.make,
        model: filters.model,
        registrationNumber: filters.registrationNumber,
        minRevenue: filters.minRevenue,
        minBookings: filters.minBookings,
        page: 1,
      }));
      updateTopVehicleParams(prev => ({
        ...prev,
        make: filters.make,
        model: filters.model,
        registrationNumber: filters.registrationNumber,
        minRevenue: filters.minRevenue,
        minBookings: filters.minBookings,
        page: 1,
      }));
    }
  }, [activeTab, updateVehicleParams, updateTopVehicleParams]);

  const handleSortChange = useCallback((sortBy: string) => {
    if (activeTab === "all") {
      setVehicleParams(prev => ({
        ...prev,
        sortBy: sortBy as GetVehiclesParams['sortBy'],
      }));
      updateVehicleParams(prev => ({
        ...prev,
        sortBy: sortBy as GetVehiclesParams['sortBy'],
      }));
    } else {
      setTopVehicleParams(prev => ({
        ...prev,
        sortBy: sortBy as GetTopVehiclesParams['sortBy'],
      }));
      updateTopVehicleParams(prev => ({
        ...prev,
        sortBy: sortBy as GetTopVehiclesParams['sortBy'],
      }));
    }
  }, [activeTab, updateVehicleParams, updateTopVehicleParams]);

  const handleOrderChange = useCallback((order: 'asc' | 'desc') => {
    if (activeTab === "all") {
      setVehicleParams(prev => ({ ...prev, order }));
      updateVehicleParams(prev => ({ ...prev, order }));
    } else {
      setTopVehicleParams(prev => ({ ...prev, order }));
      updateTopVehicleParams(prev => ({ ...prev, order }));
    }
  }, [activeTab, updateVehicleParams, updateTopVehicleParams]);

  const handlePageChange = useCallback((page: number) => {
    if (activeTab === "all") {
      setVehicleParams(prev => ({ ...prev, page }));
      updateVehicleParams(prev => ({ ...prev, page }));
    } else {
      setTopVehicleParams(prev => ({ ...prev, page }));
      updateTopVehicleParams(prev => ({ ...prev, page }));
    }
  }, [activeTab, updateVehicleParams, updateTopVehicleParams]);

  const handleLimitChange = useCallback((limit: number) => {
    if (activeTab === "all") {
      setVehicleParams(prev => ({ ...prev, limit, page: 1 }));
      updateVehicleParams(prev => ({ ...prev, limit, page: 1 }));
    } else {
      setTopVehicleParams(prev => ({ ...prev, limit, page: 1 }));
      updateTopVehicleParams(prev => ({ ...prev, limit, page: 1 }));
    }
  }, [activeTab, updateVehicleParams, updateTopVehicleParams]);

  const handleDeleteClick = useCallback((vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    refetchVehicles();
  }, [refetchVehicles]);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Vehicles</h2>
        <p className="text-muted-foreground">Manage your fleet vehicles</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Active fleet count</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Idle</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.idle}</div>
            <p className="text-xs text-muted-foreground">Available for trips</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inTransit}</div>
            <p className="text-xs text-muted-foreground">Currently operational</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maintenance}</div>
            <p className="text-xs text-muted-foreground">Under maintenance</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Vehicles</TabsTrigger>
          {isAdmin && <TabsTrigger value="top">Top Performers</TabsTrigger>}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
              <CardDescription>Filter vehicles by various criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <FilterControls onFilterChange={handleFilterChange} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>All Vehicles</CardTitle>
                  <CardDescription>Complete list of fleet vehicles</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={vehicleParams.sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                      <SelectItem value="make">Make</SelectItem>
                      <SelectItem value="vehicleModel">Model</SelectItem>
                      <SelectItem value="year">Year</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={vehicleParams.order} onValueChange={handleOrderChange}>
                    <SelectTrigger className="w-30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Descending</SelectItem>
                      <SelectItem value="asc">Ascending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {vehiclesError ? (
                <div className="flex items-center justify-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <p>{vehiclesError}</p>
                </div>
              ) : isLoadingVehicles ? (
                <div className="flex items-center justify-center p-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (
                <VehiclesTable vehicles={vehicles} onDelete={handleDeleteClick} />
              )}
            </CardContent>
            {vehiclePagination && vehiclePagination.totalPages > 1 && (
              <CardContent className="pt-0">
                <PaginationControls
                  pagination={vehiclePagination}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                />
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="top" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Filters & Search</CardTitle>
                <CardDescription>Filter top vehicles by revenue and bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <FilterControls onFilterChange={handleFilterChange} showTopVehicleFilters />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Top Performing Vehicles</CardTitle>
                    <CardDescription>Ranked by revenue and bookings</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={topVehicleParams.sortBy} onValueChange={handleSortChange}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="totalRevenue">Revenue</SelectItem>
                        <SelectItem value="totalBookings">Bookings</SelectItem>
                        <SelectItem value="completedTrips">Completed Trips</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={topVehicleParams.order} onValueChange={handleOrderChange}>
                      <SelectTrigger className="w-30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Descending</SelectItem>
                        <SelectItem value="asc">Ascending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {topVehiclesError ? (
                  <div className="flex items-center justify-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <p>{topVehiclesError}</p>
                  </div>
                ) : isLoadingTopVehicles ? (
                  <div className="flex items-center justify-center p-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <TopVehiclesTable vehicles={topVehicles} />
                )}
              </CardContent>
              {topVehiclePagination && topVehiclePagination.totalPages > 1 && (
                <CardContent className="pt-0">
                  <PaginationControls
                    pagination={topVehiclePagination}
                    onPageChange={handlePageChange}
                    onLimitChange={handleLimitChange}
                  />
                </CardContent>
              )}
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <DeleteVehicleDialog
        vehicle={vehicleToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
