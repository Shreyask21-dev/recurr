import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { RenewalWithRelations } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { isToday, isSameDay, format } from "date-fns";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { EventClickArg } from '@fullcalendar/core';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"month" | "list">("month");

  const { data: renewals = [], isLoading } = useQuery<RenewalWithRelations[]>({
    queryKey: ["/api/renewals?withRelations=true"],
  });

  const handlePreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  // Transform renewals for the calendar view
  const getDayRenewals = (day: Date) => {
    return renewals.filter(renewal => {
      const startDate = new Date(renewal.startDate);
      const endDate = new Date(renewal.endDate);

      // Check if the day is the start date, end date, or in between
      return isSameDay(day, startDate) || 
             isSameDay(day, endDate) || 
             (day >= startDate && day <= endDate);
    });
  };

  // Get selected day renewals
  const selectedDayRenewals = selectedDate ? getDayRenewals(selectedDate) : [];

  // Determine the color based on payment status and due date
  const getStatusColor = (renewal: RenewalWithRelations) => {
    if (renewal.isPaid) {
      return "bg-green-100 text-green-800 border-green-200";
    }

    const today = new Date();
    const endDate = new Date(renewal.endDate);

    if (endDate < today) {
      return "bg-red-100 text-red-800 border-red-200";
    }

    const daysUntilDue = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue <= 7) {
      return "bg-red-100 text-red-800 border-red-200";
    }

    if (daysUntilDue <= 15) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }

    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  // Custom renderer for calendar days
  const renderDay = (day: Date) => {
    const dayRenewals = getDayRenewals(day);

    if (dayRenewals.length === 0) return null;

    // Classify renewals by status
    const hasPaid = dayRenewals.some(r => r.isPaid);
    const hasOverdue = dayRenewals.some(r => {
      const endDate = new Date(r.endDate);
      return !r.isPaid && endDate < new Date();
    });
    const hasUrgent = dayRenewals.some(r => {
      const endDate = new Date(r.endDate);
      const daysUntil = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return !r.isPaid && daysUntil <= 15 && daysUntil > 0;
    });

    return (
      <div className="flex gap-1 flex-col items-center mt-1">
        {hasOverdue && <div className="w-2 h-2 rounded-full bg-red-500"></div>}
        {hasUrgent && <div className="w-2 h-2 rounded-full bg-yellow-500"></div>}
        {!hasOverdue && !hasUrgent && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
        {hasPaid && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
      </div>
    );
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-gray-500 mt-1">View and manage your renewal schedule</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Tabs defaultValue="month" value={view} onValueChange={(v) => setView(v as "month" | "list")}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="month">Month View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <Button variant="outline" size="sm" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-7">
            <TabsContent value="month" className="md:col-span-5 mt-0">
              <Card>
                <CardContent className="p-6">
                  <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={false}
                    initialDate={currentMonth}
                    height="auto"
                    eventDisplay="block"
                    eventTimeFormat={{
                      hour: 'numeric',
                      minute: '2-digit',
                      meridiem: 'short'
                    }}
                    dayMaxEventRows={3}
                    events={renewals.map(renewal => {
                      // Simple color coding
                      let color;
                      if (renewal.isPaid) {
                        color = '#10B981'; // green for paid
                      } else if (new Date(renewal.endDate) < new Date()) {
                        color = '#EF4444'; // red for overdue
                      } else {
                        color = '#3B82F6'; // blue for upcoming
                      }

                      return {
                        id: renewal.id.toString(),
                        title: renewal.client.name,
                        start: renewal.endDate,
                        allDay: true,
                        color: color
                      };
                    })}
                    eventClick={(info) => {
                      setSelectedDate(new Date(info.event.start || new Date()));
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="list" className="md:col-span-2 mt-0">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {renewals.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">No renewals found</p>
                    ) : (
                      <>
                        {/* Group renewals by month */}
                        {Array.from(
                          new Set(
                            renewals.map(renewal => 
                              format(new Date(renewal.endDate), "MMMM yyyy")
                            )
                          )
                        ).sort((a, b) => {
                          const dateA = new Date(a);
                          const dateB = new Date(b);
                          return dateA.getTime() - dateB.getTime();
                        }).map(month => (
                          <div key={month} className="space-y-2">
                            <h3 className="font-semibold text-lg">{month}</h3>
                            <div className="space-y-2">
                              {renewals
                                .filter(renewal => 
                                  format(new Date(renewal.endDate), "MMMM yyyy") === month
                                )
                                .sort((a, b) => 
                                  new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
                                )
                                .map(renewal => (
                                  <div 
                                    key={renewal.id}
                                    className={`p-3 rounded-md border ${getStatusColor(renewal)}`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-medium">{renewal.client.name} - {renewal.service.name}</p>
                                        <p className="text-sm">Due: {formatDate(renewal.endDate)}</p>
                                      </div>
                                      <Badge variant="outline" className={getStatusColor(renewal)}>
                                        {renewal.isPaid ? "Paid" : format(new Date(renewal.endDate), "dd MMM")}
                                      </Badge>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                      <p className="text-sm font-semibold">{formatCurrency(renewal.amount)}</p>
                                      <Link href={`/renewals/${renewal.id}`}>
                                        <Button variant="ghost" size="sm" className="h-8 p-0">
                                          Details <ArrowRight className="ml-1 h-3 w-3" />
                                        </Button>
                                      </Link>
                                    </div>
                                  </div>
                                ))
                              }
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <Card className="md:col-span-2 h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {selectedDate ? formatDate(selectedDate) : "Today's"} Renewals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDayRenewals.length === 0 ? (
                  <p className="text-gray-500 text-sm py-4 text-center">
                    No renewals {selectedDate && isToday(selectedDate) ? "today" : "on this day"}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedDayRenewals.map(renewal => (
                      <div 
                        key={renewal.id}
                        className={`p-3 rounded-md border ${getStatusColor(renewal)}`}
                      >
                        <div className="flex justify-between items-start">
                          <p className="font-medium">{renewal.client.name}</p>
                          <Badge variant="outline" className={getStatusColor(renewal)}>
                            {renewal.isPaid ? "Paid" : "Due"}
                          </Badge>
                        </div>
                        <p className="text-sm">{renewal.service.name}</p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-sm font-semibold">{formatCurrency(renewal.amount)}</p>
                          <Link href={`/renewals/${renewal.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 p-0">
                              Details <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 border-t pt-4">
                  <h3 className="font-medium text-sm mb-2">Legend</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center">
                      <div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
                      <div>Overdue renewals</div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2 h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div>Due soon (within 15 days)</div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2 h-3 w-3 rounded-full bg-blue-500"></div>
                      <div>Upcoming renewals</div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
                      <div>Paid renewals</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Tabs>
      </motion.div>
    </>
  );
}