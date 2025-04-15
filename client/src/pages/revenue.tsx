import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DashboardStats, RenewalWithRelations } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  TooltipProps
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function RevenuePage() {
  const [timeRange, setTimeRange] = useState("6months");
  const [chartView, setChartView] = useState("monthly");
  
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard"],
  });
  
  const { data: renewals = [] } = useQuery<RenewalWithRelations[]>({
    queryKey: ["/api/renewals?withRelations=true"],
  });

  // For monthly revenue chart
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
          <p className="font-semibold">{label}</p>
          <p className="text-blue-600">{formatCurrency(payload[0].value as number)}</p>
        </div>
      );
    }
    return null;
  };

  // Calculate paid vs unpaid amounts
  const paidAmount = renewals
    .filter(r => r.isPaid)
    .reduce((sum, r) => sum + r.amount, 0);
  
  const unpaidAmount = renewals
    .filter(r => !r.isPaid)
    .reduce((sum, r) => sum + r.amount, 0);

  const pieData = [
    { name: "Paid", value: paidAmount },
    { name: "Unpaid", value: unpaidAmount },
  ];

  // For service-wise revenue breakdown
  const serviceRevenueData = Array.from(
    renewals.reduce((acc, renewal) => {
      const { service, amount, isPaid } = renewal;
      if (!acc.has(service.name)) {
        acc.set(service.name, { paid: 0, unpaid: 0 });
      }
      
      const current = acc.get(service.name)!;
      if (isPaid) {
        current.paid += amount;
      } else {
        current.unpaid += amount;
      }
      
      return acc;
    }, new Map<string, { paid: number; unpaid: number }>())
  ).map(([name, { paid, unpaid }]) => ({
    name,
    paid,
    unpaid,
    total: paid + unpaid,
  }));

  // For quarterly revenue
  const getQuarterlyData = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Initialize quarters
    const quarters = [
      { name: 'Q1', paid: 0, unpaid: 0 },
      { name: 'Q2', paid: 0, unpaid: 0 },
      { name: 'Q3', paid: 0, unpaid: 0 },
      { name: 'Q4', paid: 0, unpaid: 0 },
    ];
    
    renewals.forEach(renewal => {
      const date = new Date(renewal.endDate);
      if (date.getFullYear() === currentYear) {
        const quarter = Math.floor(date.getMonth() / 3);
        if (renewal.isPaid) {
          quarters[quarter].paid += renewal.amount;
        } else {
          quarters[quarter].unpaid += renewal.amount;
        }
      }
    });
    
    // Add total property
    return quarters.map(q => ({
      ...q,
      total: q.paid + q.unpaid,
    }));
  };

  const quarterlyData = getQuarterlyData();

  // For client-wise revenue
  const clientRevenueData = Array.from(
    renewals.reduce((acc, renewal) => {
      const { client, amount, isPaid } = renewal;
      if (!acc.has(client.name)) {
        acc.set(client.name, { paid: 0, unpaid: 0 });
      }
      
      const current = acc.get(client.name)!;
      if (isPaid) {
        current.paid += amount;
      } else {
        current.unpaid += amount;
      }
      
      return acc;
    }, new Map<string, { paid: number; unpaid: number }>())
  )
    .map(([name, { paid, unpaid }]) => ({
      name,
      paid,
      unpaid,
      total: paid + unpaid,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5); // Get top 5 clients by total revenue

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const COLORS = ['#10b981', '#ef4444'];
  
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Revenue Analytics</h1>
        <p className="text-gray-500 mt-1">Track and analyze your business revenue</p>
      </div>

      <motion.div 
        className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.revenue.ytd || 0)}</div>
            <p className="text-xs text-gray-500 mt-1">Year to date</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(paidAmount)}</div>
            <p className="text-xs text-gray-500 mt-1">{Math.round((paidAmount / (paidAmount + unpaidAmount || 1)) * 100)}% of total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(unpaidAmount)}</div>
            <p className="text-xs text-gray-500 mt-1">{Math.round((unpaidAmount / (paidAmount + unpaidAmount || 1)) * 100)}% of total</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue="overview">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="services">By Service</TabsTrigger>
              <TabsTrigger value="clients">By Client</TabsTrigger>
            </TabsList>
            <div>
              <Select
                value={timeRange}
                onValueChange={setTimeRange}
              >
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6months">Last 6 months</SelectItem>
                  <SelectItem value="year">Last year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="overview" className="mt-0">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Revenue Trend</CardTitle>
                    <div>
                      <Select
                        value={chartView}
                        onValueChange={setChartView}
                      >
                        <SelectTrigger className="h-8 w-[130px] text-xs">
                          <SelectValue placeholder="Select view" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartView === "monthly" ? (
                        <BarChart
                          data={stats?.monthlyRevenue || []}
                          margin={{
                            top: 10,
                            right: 0,
                            left: 0,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="month" 
                            axisLine={false}
                            tickLine={false}
                            tickMargin={8}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `₹${value/1000}k`}
                            tickMargin={8}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar
                            dataKey="amount"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                          />
                        </BarChart>
                      ) : (
                        <BarChart
                          data={quarterlyData}
                          margin={{
                            top: 10,
                            right: 0,
                            left: 0,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false}
                            tickLine={false}
                            tickMargin={8}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `₹${value/1000}k`}
                            tickMargin={8}
                          />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Legend />
                          <Bar dataKey="paid" fill="#10b981" name="Paid" />
                          <Bar dataKey="unpaid" fill="#ef4444" name="Unpaid" />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Revenue Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72 flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height="75%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm">Paid</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <span className="text-sm">Unpaid</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="mt-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Revenue by Service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={serviceRevenueData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis 
                        type="number" 
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `₹${value/1000}k`}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="paid" stackId="a" fill="#10b981" name="Paid" />
                      <Bar dataKey="unpaid" stackId="a" fill="#ef4444" name="Unpaid" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="mt-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Top 5 Clients by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={clientRevenueData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis 
                        type="number" 
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `₹${value/1000}k`}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="paid" stackId="a" fill="#10b981" name="Paid" />
                      <Bar dataKey="unpaid" stackId="a" fill="#ef4444" name="Unpaid" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </>
  );
}
