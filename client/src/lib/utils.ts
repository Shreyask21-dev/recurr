import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isBefore, isAfter, differenceInDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getRenewalStatus(endDate: Date | string, isPaid: boolean) {
  const date = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const today = new Date();
  
  if (isPaid) {
    return {
      label: "Paid",
      color: "bg-green-100 text-green-800",
    };
  }
  
  if (isBefore(date, today)) {
    return {
      label: "Overdue",
      color: "bg-red-100 text-red-800",
    };
  }
  
  const daysRemaining = differenceInDays(date, today);
  
  if (daysRemaining <= 7) {
    return {
      label: `Due in ${daysRemaining} days`,
      color: "bg-red-100 text-red-800",
    };
  }
  
  if (daysRemaining <= 15) {
    return {
      label: `Due in ${daysRemaining} days`,
      color: "bg-yellow-100 text-yellow-800",
    };
  }
  
  return {
    label: `Due in ${daysRemaining} days`,
    color: "bg-blue-100 text-blue-800",
  };
}

export function getActivityIcon(type: string) {
  switch (type) {
    case 'payment_received':
      return {
        icon: "check",
        color: "bg-green-100 text-green-600",
      };
    case 'client_added':
    case 'client_updated':
      return {
        icon: "plus",
        color: "bg-blue-100 text-blue-600",
      };
    case 'renewal_reminder':
      return {
        icon: "alert-triangle",
        color: "bg-yellow-100 text-yellow-600",
      };
    case 'service_added':
    case 'service_updated':
      return {
        icon: "edit",
        color: "bg-purple-100 text-purple-600",
      };
    case 'renewal_created':
    case 'renewal_updated':
      return {
        icon: "clock",
        color: "bg-indigo-100 text-indigo-600",
      };
    default:
      return {
        icon: "activity",
        color: "bg-gray-100 text-gray-600",
      };
  }
}

export function getTimeAgo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  let interval = seconds / 31536000; // seconds in a year
  
  if (interval > 1) {
    return Math.floor(interval) + " year" + (Math.floor(interval) === 1 ? "" : "s") + " ago";
  }
  
  interval = seconds / 2592000; // seconds in a month
  if (interval > 1) {
    return Math.floor(interval) + " month" + (Math.floor(interval) === 1 ? "" : "s") + " ago";
  }
  
  interval = seconds / 86400; // seconds in a day
  if (interval > 1) {
    return Math.floor(interval) + " day" + (Math.floor(interval) === 1 ? "" : "s") + " ago";
  }
  
  interval = seconds / 3600; // seconds in an hour
  if (interval > 1) {
    return Math.floor(interval) + " hour" + (Math.floor(interval) === 1 ? "" : "s") + " ago";
  }
  
  interval = seconds / 60; // seconds in a minute
  if (interval > 1) {
    return Math.floor(interval) + " minute" + (Math.floor(interval) === 1 ? "" : "s") + " ago";
  }
  
  return Math.floor(seconds) + " second" + (Math.floor(seconds) === 1 ? "" : "s") + " ago";
}
