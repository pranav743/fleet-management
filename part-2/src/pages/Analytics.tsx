import { memo, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalytics } from '@/hooks/useAnalytics';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Car,
  Users,
  Activity,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const StatCard = memo(({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  description: string; 
  icon: any; 
  trend?: number;
}) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
      {trend !== undefined && (
        <div className={`flex items-center mt-2 text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className={`h-3 w-3 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
          {Math.abs(trend)}% from last month
        </div>
      )}
    </CardContent>
  </Card>
));

StatCard.displayName = 'StatCard';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-semibold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { stats, topOwners, topVehicles, topCustomers, loading, error, refetch } = useAnalytics(5);

  const vehicleChartData = useMemo(() => 
    topVehicles.map(v => ({
      name: `${v.make} ${v.model}`,
      revenue: v.totalRevenue,
      bookings: v.totalBookings,
    }))
  , [topVehicles]);

  const ownerChartData = useMemo(() =>
    topOwners.map(o => ({
      name: o.email.split('@')[0],
      revenue: o.totalRevenue,
      vehicles: o.vehicleCount,
    }))
  , [topOwners]);

  const customerChartData = useMemo(() =>
    topCustomers.map(c => ({
      name: c.email.split('@')[0],
      trips: c.completedTrips,
      spent: c.totalSpent,
    }))
  , [topCustomers]);

  const utilizationData = useMemo(() => stats ? [
    { name: 'Active', value: stats.vehicleUtilization.activeVehicles },
    { name: 'Idle', value: stats.vehicleUtilization.totalVehicles - stats.vehicleUtilization.activeVehicles },
  ] : [], [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Fleet performance insights and metrics</p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`$${stats?.totalRevenue.toLocaleString() || 0}`}
          description="Total earnings from all trips"
          icon={DollarSign}
          trend={12.5}
        />
        <StatCard
          title="Active Trips"
          value={stats?.activeTrips || 0}
          description="Currently ongoing trips"
          icon={Activity}
          trend={8.2}
        />
        <StatCard
          title="Vehicle Utilization"
          value={`${stats?.vehicleUtilization.utilizationRate || 0}%`}
          description={`${stats?.vehicleUtilization.activeVehicles || 0}/${stats?.vehicleUtilization.totalVehicles || 0} vehicles active`}
          icon={Car}
          trend={-3.1}
        />
        <StatCard
          title="Completed Trips"
          value={stats?.completedTrips || 0}
          description={`${stats?.totalBookings || 0} total bookings`}
          icon={CheckCircle}
          trend={15.8}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Utilization</CardTitle>
            <CardDescription>Active vs Idle vehicles</CardDescription>
          </CardHeader>
          <CardContent>
            {utilizationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={utilizationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {utilizationData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Vehicles</CardTitle>
            <CardDescription>Revenue by vehicle</CardDescription>
          </CardHeader>
          <CardContent>
            {vehicleChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vehicleChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Owners by Revenue</CardTitle>
            <CardDescription>Owner performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {ownerChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ownerChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#10b981" name="Revenue ($)" />
                  <Bar yAxisId="right" dataKey="vehicles" fill="#f59e0b" name="Vehicles" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>Customer activity and spending</CardDescription>
          </CardHeader>
          <CardContent>
            {customerChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={customerChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="spent" stroke="#8b5cf6" name="Total Spent ($)" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="trips" stroke="#ec4899" name="Completed Trips" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.length > 0 ? (
                topCustomers.map((customer, index) => (
                  <div key={customer.customerId} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg text-primary">#{index + 1}</span>
                        <p className="font-medium truncate">{customer.email}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {customer.completedTrips} trips • {customer.uniqueVehiclesUsed} vehicles
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${customer.totalSpent.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No customer data</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Top Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topVehicles.length > 0 ? (
                topVehicles.map((vehicle, index) => (
                  <div key={vehicle.vehicleId} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg text-primary">#{index + 1}</span>
                        <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {vehicle.registrationNumber} • {vehicle.completedTrips} trips
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${vehicle.totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No vehicle data</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Top Owners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topOwners.length > 0 ? (
                topOwners.map((owner, index) => (
                  <div key={owner.ownerId} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg text-primary">#{index + 1}</span>
                        <p className="font-medium truncate">{owner.email}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {owner.vehicleCount} vehicles • {owner.totalBookings} bookings
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${owner.totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No owner data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
