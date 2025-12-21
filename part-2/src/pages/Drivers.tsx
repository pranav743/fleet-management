import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2, AlertCircle } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { useDrivers } from "@/hooks/useDrivers";
import { CreateDriverDialog } from "@/components/drivers/CreateDriverDialog";
import { DeleteDriverDialog } from "@/components/drivers/DeleteDriverDialog";
import { DriversTable } from "@/components/drivers/DriversTable";
import { PaginationControls } from "@/components/drivers/PaginationControls";
import type { Driver, GetDriversParams } from "@/services/driverService";
import { useDebounce } from "@/hooks/useDebounce";

export default function Drivers() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const debouncedSearch = useDebounce(searchQuery, 500);

  const { drivers, pagination, isLoading, error, refetch, setParams } = useDrivers({
    page: 1,
    limit: 10,
  });

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setParams((prev: GetDriversParams) => ({ ...prev, page }));
  }, [setParams]);

  const handleDeleteClick = useCallback((driver: Driver) => {
    setSelectedDriver(driver);
    setDeleteDialogOpen(true);
  }, []);

  const stats = useMemo(() => {
    const total = pagination?.totalItems || 0;
    const active = drivers.filter(d => !d.isDeleted).length;
    const inactive = drivers.filter(d => d.isDeleted).length;
    return { total, active, inactive };
  }, [drivers, pagination]);

  useMemo(() => {
    setParams((prev: GetDriversParams) => ({ ...prev, email: debouncedSearch || undefined, page: 1 }));
  }, [debouncedSearch, setParams]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Drivers</h2>
          <p className="text-muted-foreground">Manage your fleet drivers</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Driver
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Drivers</CardTitle>
            <CardDescription>Registered drivers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active</CardTitle>
            <CardDescription>Currently active on Page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inactive</CardTitle>
            <CardDescription>Deleted drivers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <DriversTable drivers={drivers} onDelete={handleDeleteClick} />
          {pagination && pagination.totalPages > 1 && (
            <PaginationControls pagination={pagination} onPageChange={handlePageChange} />
          )}
        </div>
      )}

      <CreateDriverDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={refetch} />

      <DeleteDriverDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        driverId={selectedDriver?._id || null}
        driverEmail={selectedDriver?.email || null}
        onSuccess={refetch}
      />
    </div>
  );
}

