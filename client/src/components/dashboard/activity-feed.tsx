import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity } from "@shared/schema";
import { getTimeAgo, getActivityIcon } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle, 
  PlusCircle, 
  AlertTriangle, 
  Edit, 
  Clock,
  Activity as ActivityIcon
} from "lucide-react";

interface ActivityFeedProps {
  activities: Activity[];
  isLoading?: boolean;
}

export function ActivityFeed({ activities = [], isLoading = false }: ActivityFeedProps) {
  const getIcon = (type: string) => {
    const iconInfo = getActivityIcon(type);
    
    switch (iconInfo.icon) {
      case "check":
        return <CheckCircle className="h-4 w-4" />;
      case "plus":
        return <PlusCircle className="h-4 w-4" />;
      case "alert-triangle":
        return <AlertTriangle className="h-4 w-4" />;
      case "edit":
        return <Edit className="h-4 w-4" />;
      case "clock":
        return <Clock className="h-4 w-4" />;
      default:
        return <ActivityIcon className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-md"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex">
                <div className="mr-4 flex flex-col items-center">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-full w-0.5 mt-1" />
                </div>
                <div className="w-full">
                  <Skeleton className="h-5 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-800">Recent Activity</CardTitle>
          <div>
            <Select defaultValue="7days">
              <SelectTrigger className="h-8 w-[115px] text-xs">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-center text-sm text-gray-500">No recent activities</p>
          ) : (
            activities.map((activity) => {
              const iconInfo = getActivityIcon(activity.type);
              
              return (
                <div key={activity.id} className="flex">
                  <div className="mr-4 flex flex-col items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${iconInfo.color}`}>
                      {getIcon(activity.type)}
                    </div>
                    <div className="h-full w-0.5 bg-gray-200"></div>
                  </div>
                  <div className="pb-4">
                    <div className="text-sm font-medium">
                      {activity.type
                        .split("_")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">{activity.description}</div>
                    <div className="mt-2 text-xs text-gray-400">{getTimeAgo(activity.createdAt)}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {activities.length > 0 && (
          <div className="mt-4 text-center">
            <button className="text-xs font-medium text-blue-600 hover:text-blue-800">
              View All Activity →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
