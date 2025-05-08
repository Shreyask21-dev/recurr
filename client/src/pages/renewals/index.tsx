import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { RenewalWithRelations } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash, Check } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { formatDate, formatCurrency, getRenewalStatus } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function RenewalsPage() {
  const { toast } = useToast();
  const [deleteRenewalId, setDeleteRenewalId] = useState<number | null>(null);
  
  const { data: renewals = [], isLoading } = useQuery<RenewalWithRelations[]>({
    queryKey: ["/api/renewals?withRelations=true"],
  });

  const handleDeleteRenewal = async () => {
    if (!deleteRenewalId) return;
    
    try {
      await apiRequest("DELETE", `/api/renewals/${deleteRenewalId}`);
      queryClient.invalidateQueries({ queryKey: ["/api/renewals"] });
      toast({
        title: "Renewal deleted",
        description: "The renewal has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete renewal.",
        variant: "destructive",
      });
    } finally {
      setDeleteRenewalId(null);
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      await apiRequest("PUT", `/api/renewals/${id}`, { isPaid: true });
      queryClient.invalidateQueries({ queryKey: ["/api/renewals?withRelations=true"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Renewal marked as paid.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update renewal payment status.",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<RenewalWithRelations>[] = [
    {
      accessorKey: "client.name",
      header: "Client",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.client.name}</div>
      ),
    },
    {
      accessorKey: "service.name",
      header: "Service",
      cell: ({ row }) => row.original.service.name,
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => formatDate(row.original.startDate),
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => formatDate(row.original.endDate),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: "isPaid",
      header: "Status",
      cell: ({ row }) => {
        const status = getRenewalStatus(row.original.endDate, row.original.isPaid);
        return (
          <Badge 
            variant="outline" 
            className={`${status.color} border-0 font-semibold rounded-full`}
          >
            {status.label}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          {!row.original.isPaid && (
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 text-green-500 hover:text-green-700"
              onClick={() => handleMarkAsPaid(row.original.id)}
              title="Mark as Paid"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Link href={`/renewals/${row.original.id}`}>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 text-red-500 hover:text-red-700"
            onClick={() => setDeleteRenewalId(row.original.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Renewals</h1>
        <Link href="/renewals/new">
          <Button className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add Renewal
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="pb-1">
            <CardTitle>All Renewals</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={renewals}
              searchColumn="client.name"
              searchPlaceholder="Search renewals..."
            />
          </CardContent>
        </Card>
      </motion.div>

      <AlertDialog open={!!deleteRenewalId} onOpenChange={() => setDeleteRenewalId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the renewal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRenewal}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
