import { cva, type VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const statsCardVariants = cva("flex h-12 w-12 items-center justify-center rounded-lg", {
  variants: {
    variant: {
      blue: "bg-blue-100 text-blue-500",
      purple: "bg-purple-100 text-purple-500",
      orange: "bg-orange-100 text-orange-500",
      green: "bg-green-100 text-green-500",
    },
  },
  defaultVariants: {
    variant: "blue",
  },
});

interface StatsCardProps extends VariantProps<typeof statsCardVariants> {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  isCurrency?: boolean;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant, 
  isCurrency = false 
}: StatsCardProps) {
  const displayValue = isCurrency ? formatCurrency(Number(value)) : value;

  return (
    <div className="rounded-lg bg-white p-4 shadow transition-all hover:shadow-md">
      <div className="flex items-center">
        <div className={statsCardVariants({ variant })}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="mt-1 text-xl font-semibold">{displayValue}</p>
        </div>
      </div>
      {trend && (
        <div className={`mt-3 flex items-center text-sm font-medium ${
          trend.positive ? "text-green-500" : "text-red-500"
        }`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-1 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={trend.positive ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"}
            />
          </svg>
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  );
}
