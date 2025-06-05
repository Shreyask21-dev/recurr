import { useState } from "react";
import { format, addMonths, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { RenewalWithRelations } from "@shared/schema";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface CalendarPreviewProps {
  renewals: RenewalWithRelations[];
  isLoading?: boolean;
}

export function CalendarPreview({ renewals = [], isLoading = false }: CalendarPreviewProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handlePreviousMonth = () => {
    setCurrentMonth(addMonths(currentMonth, -1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Process renewals for calendar display
  const daysWithRenewals = renewals.reduce((acc, renewal) => {
    const date = new Date(renewal.endDate);
    const dateKey = format(date, 'yyyy-MM-dd');

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }

    acc[dateKey].push({
      id: renewal.id,
      client: renewal.client.name,
      service: renewal.service.name,
      amount: renewal.amount,
      isPaid: renewal.isPaid,
      date,
      daysRemaining: Math.ceil(
        (date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    });

    return acc;
  }, {} as Record<string, Array<{
    id: number;
    client: string;
    service: string;
    amount: number;
    isPaid: boolean;
    date: Date;
    daysRemaining: number;
  }>>);

  // Get renewals for the selected date
  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedDateRenewals = daysWithRenewals[selectedDateKey] || [];

  // Generate days for the current month
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get the number of days from the previous month to fill the first week
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const prevMonthDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const days = [];

    // Previous month days
    const prevMonth = new Date(year, month, 0);
    // for (let i = prevMonthDays; i > 0; i--) {
    //   days.push({
    //     date: new Date(year, month - 1, prevMonth.getDate() - i + 1),
    //     isCurrentMonth: false,
    //   });
    // }

    for (let i = prevMonthDays; i > 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i + 1);
      days.push({
        date,
        isCurrentMonth: false,
        hasRenewals: !!daysWithRenewals[format(date, 'yyyy-MM-dd')],
        isToday: isToday(date),
      });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        hasRenewals: !!daysWithRenewals[format(date, 'yyyy-MM-dd')],
        isToday: isToday(date),
      });
    }

    // Next month days to fill the last week
    const lastDayOfWeek = lastDay.getDay();
    const nextMonthDays = lastDayOfWeek === 6 ? 0 : 6 - lastDayOfWeek;

    // for (let i = 1; i <= nextMonthDays; i++) {
    //   days.push({
    //     date: new Date(year, month + 1, i),
    //     isCurrentMonth: false,
    //   });
    // }

    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        hasRenewals: !!daysWithRenewals[format(date, 'yyyy-MM-dd')],
        isToday: isToday(date),
      });
    }


    return days;
  };

  // Determine appropriate status styling for a renewal
  const getRenewalStatusStyle = (daysRemaining: number, isPaid: boolean) => {
    if (isPaid) {
      return "bg-green-100 text-green-800 border-green-200";
    }

    if (daysRemaining < 0) {
      return "bg-red-100 text-red-800 border-red-200";
    }

    if (daysRemaining <= 15) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }

    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Calendar</CardTitle>
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>
        </CardContent>
      </Card>
    );
  }

  const days = getDaysInMonth();

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-800">Calendar</CardTitle>
          <Link href="/calendar">
            <Button variant="outline" size="sm" className="h-8 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-100">
              Full View
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-sm font-medium">
            {format(currentMonth, "MMMM yyyy")}
          </div>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Custom calendar implementation */}
        <div className="mb-4">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-1">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const dateKey = format(day.date, 'yyyy-MM-dd');
              const hasRenewals = !!daysWithRenewals[dateKey];
              const isSelected = format(selectedDate, 'yyyy-MM-dd') === dateKey;

              return (
                <div
                  key={i}
                  className={`
                    relative h-10 rounded-md text-xs flex items-center justify-center cursor-pointer
                    ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                    ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'}
                    ${day.isToday ? 'font-bold border border-blue-300' : ''}
                  `}
                  onClick={() => setSelectedDate(day.date)}
                >
                  <span>{format(day.date, 'd')}</span>
                  {hasRenewals && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                      {daysWithRenewals[dateKey].map((renewal, i) => {
                        if (i > 2) return null; // Show max 3 dots
                        return (
                          <div
                            key={renewal.id}
                            className={`
                              w-1.5 h-1.5 rounded-full
                              ${renewal.isPaid ? 'bg-green-500' :
                                renewal.daysRemaining <= 15 ? 'bg-yellow-500' : 'bg-blue-500'}
                            `}
                          />
                        );
                      })}
                      {daysWithRenewals[dateKey].length > 3 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected date renewals */}
        <div className="mt-4 border-t pt-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-700">
              {formatDate(selectedDate)} Renewals
            </h3>
            <CalendarIcon className="h-4 w-4 text-gray-400" />
          </div>

          {selectedDateRenewals.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-2">No renewals on this date</p>
          ) : (
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {selectedDateRenewals.map(renewal => (
                <div
                  key={renewal.id}
                  className={`px-2 py-1.5 rounded-md text-xs ${getRenewalStatusStyle(renewal.daysRemaining, renewal.isPaid)}`}
                >
                  <div className="font-medium">{renewal.client}</div>
                  <div className="flex justify-between items-center mt-0.5">
                    <span>{renewal.service}</span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 ${getRenewalStatusStyle(renewal.daysRemaining, renewal.isPaid)}`}>
                      {renewal.isPaid ? 'Paid' : Math.abs(renewal.daysRemaining) <= 0 ? 'Due today' :
                        renewal.daysRemaining < 0 ? `${Math.abs(renewal.daysRemaining)}d overdue` :
                          `${renewal.daysRemaining}d left`}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
