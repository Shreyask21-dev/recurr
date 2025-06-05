import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RenewalWithRelations } from "@shared/schema";
import { formatDate, formatCurrency, getRenewalStatus } from "@/lib/utils";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface RenewalsTableProps {
  renewals: RenewalWithRelations[];
  isLoading?: boolean;
}

export function RenewalsTable({ renewals = [], isLoading = false }: RenewalsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Upcoming Renewals</CardTitle>
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="-mx-5 mt-2">
            <div className="border-b border-gray-200 bg-gray-50 px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Client
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border-b border-gray-200 px-5 py-4">
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-800">Upcoming Renewals</CardTitle>
          <Link href="/renewals">
            <Button variant="outline" size="sm" className="h-8 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-100">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full  min-w-[800px] border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 border-b border-gray-200">Client</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 border-b border-gray-200">Service</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 border-b border-gray-200">Due Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 border-b border-gray-200">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 border-b border-gray-200">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 border-b border-gray-200">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {renewals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-5 text-center text-sm text-gray-500">
                      No upcoming renewals found
                    </td>
                  </tr>
                ) : (
                  renewals.map((renewal, index) => {
                    const status = getRenewalStatus(renewal.endDate, renewal.isPaid);
                    const isEven = index % 2 === 0;
                    
                    return (
                      <tr 
                        key={renewal.id} 
                        className={`${isEven ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150 ease-in-out`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {renewal.client.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {renewal.service.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(renewal.endDate)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatCurrency(renewal.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge 
                            variant="outline" 
                            className={`${status.color} border-0 font-semibold rounded-full px-3 py-1`}
                          >
                            {status.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Link href={`/renewals/${renewal.id}`}>
                            <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-8 px-2">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
