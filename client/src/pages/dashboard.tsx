import { useQuery } from "@tanstack/react-query";
import { DashboardStats } from "@shared/schema";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RenewalsTable } from "@/components/dashboard/renewals-table";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { CalendarPreview } from "@/components/dashboard/calendar-preview";
import { Users, Briefcase, Clock, DollarSign } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard"],
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        className="mb-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <h2 className="mb-4 text-xl font-semibold">Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div variants={itemVariants}>
            <StatsCard
              title="Total Clients"
              value={isLoading ? "..." : stats?.totalClients || 0}
              icon={Users}
              variant="blue"
              trend={{
                value: "12.5% up from last month",
                positive: true
              }}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <StatsCard
              title="Active Services"
              value={isLoading ? "..." : stats?.activeServices || 0}
              icon={Briefcase}
              variant="purple"
              trend={{
                value: "8.2% up from last month",
                positive: true
              }}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <StatsCard
              title="Pending Renewals"
              value={isLoading ? "..." : stats?.pendingRenewals || 0}
              icon={Clock}
              variant="orange"
              trend={{
                value: `${isLoading ? "..." : stats?.upcomingRenewals.filter(r => {
                  const daysUntil = Math.ceil(
                    (new Date(r.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return daysUntil <= 7;
                }).length || 0} due in the next 7 days`,
                positive: false
              }}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <StatsCard
              title="Revenue (MTD)"
              value={isLoading ? "..." : stats?.revenue.mtd || 0}
              icon={DollarSign}
              variant="green"
              trend={{
                value: "18.3% up from last month",
                positive: true
              }}
              isCurrency
            />
          </motion.div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <RenewalsTable 
          renewals={stats?.upcomingRenewals || []} 
          isLoading={isLoading} 
        />
      </motion.div>

      <motion.div 
        className="mt-6 grid gap-6 lg:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="lg:col-span-2">
          <RevenueChart 
            data={stats?.monthlyRevenue || []}
            totalRevenue={stats?.revenue.mtd || 0}
            revenueYTD={stats?.revenue.ytd || 0}
            projectedRevenue={stats?.revenue.projected || 0}
            isLoading={isLoading}
          />
        </div>
        <CalendarPreview 
          renewals={stats?.upcomingRenewals || []} 
          isLoading={isLoading}
        />
      </motion.div>
    </div>
  );
}
