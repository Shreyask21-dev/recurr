import { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  TooltipProps
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

interface RevenueChartProps {
  data: Array<{
    month: string;
    amount: number;
  }>;
  totalRevenue: number;
  revenueYTD: number;
  projectedRevenue: number;
  isLoading?: boolean;
}

export function RevenueChart({
  data = [],
  totalRevenue = 0,
  revenueYTD = 0,
  projectedRevenue = 0,
  isLoading = false,
}: RevenueChartProps) {
  const [timeRange, setTimeRange] = useState("6months");

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Monthly Revenue</CardTitle>
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-md"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>
          <div className="mt-4 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-800">Monthly Revenue</CardTitle>
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
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
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
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Total Revenue</div>
            <div className="mt-1 text-xl font-semibold">{formatCurrency(totalRevenue)}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Revenue (YTD)</div>
            <div className="mt-1 text-xl font-semibold">{formatCurrency(revenueYTD)}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Projected (EOY)</div>
            <div className="mt-1 text-xl font-semibold">{formatCurrency(projectedRevenue)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
