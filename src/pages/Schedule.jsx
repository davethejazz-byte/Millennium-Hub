import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday
} from "date-fns";
import { ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const categoryColors = {
  audio: "bg-purple-500",
  production: "bg-blue-500",
  photography: "bg-pink-500",
  videography: "bg-orange-500",
  consultation: "bg-green-500",
  av_install: "bg-cyan-500",
  other: "bg-gray-500",
};

const categoryLabels = {
  audio: "Audio",
  production: "Production",
  photography: "Photography",
  videography: "Videography",
  consultation: "Consultation",
  av_install: "AV Install",
  other: "Other",
};

export default function Schedule() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const {
    data: jobs = [],
    isError: jobsError,
    refetch: refetchJobs,
  } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => base44.entities.Job.list("-start_date"),
  });

  const {
    data: employees = [],
    isError: employeesError,
    refetch: refetchEmployees,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list(),
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getJobsForDay = (day) => {
    return jobs.filter(job => {
      const jobDate = new Date(job.start_date);
      return isSameDay(jobDate, day) && job.status !== "cancelled";
    });
  };

  const getEmployeeNames = (ids) => {
    if (!ids || ids.length === 0) return [];
    return ids.map(id => {
      const emp = employees.find(e => e.id === id);
      return emp?.name || "Unknown";
    });
  };

  const dayJobs = selectedDay ? getJobsForDay(selectedDay) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold glow-text text-white">Schedule</h1>
          <p className="text-gray-400 mt-1">View and manage your calendar</p>
        </div>
      </div>

      {(jobsError || employeesError) && (
        <div className="glass rounded-2xl p-6 border border-red-500/30">
          <p className="text-red-300">Failed to load calendar data.</p>
          <Button
            onClick={() => {
              refetchJobs();
              refetchEmployees();
            }}
            className="mt-3 bg-red-600 hover:bg-red-700"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Calendar */}
      <div className="glass rounded-2xl p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold text-white">{format(currentMonth, "MMMM yyyy")}</h2>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center text-xs text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const dayJobsList = getJobsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDay && isSameDay(day, selectedDay);

            return (
              <div
                key={idx}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "min-h-[100px] p-2 rounded-lg cursor-pointer transition-all border",
                  isCurrentMonth ? "bg-white/5" : "bg-transparent opacity-30",
                  isSelected ? "border-blue-500 bg-blue-500/10" : "border-transparent hover:border-white/10",
                  isToday(day) && "ring-2 ring-blue-500/50"
                )}
              >
                <span className={cn(
                  "text-sm font-medium text-white",
                  isToday(day) && "text-blue-400"
                )}>
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-1">
                  {dayJobsList.slice(0, 3).map(job => (
                    <div
                      key={job.id}
                      onClick={(e) => { e.stopPropagation(); setSelectedJob(job); }}
                      className={cn(
                        "text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80",
                        categoryColors[job.category],
                        "text-white"
                      )}
                    >
                      {job.title}
                    </div>
                  ))}
                  {dayJobsList.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">+{dayJobsList.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Detail Panel */}
      {selectedDay && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-white">
            {format(selectedDay, "EEEE, MMMM d, yyyy")}
          </h3>
          {dayJobs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No jobs scheduled for this day</p>
          ) : (
            <div className="space-y-3">
              {dayJobs.map(job => (
                <div 
                  key={job.id} 
                  onClick={() => setSelectedJob(job)}
                  className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-white/5"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-white">{job.title}</h4>
                    <Badge className={cn("text-xs text-white", categoryColors[job.category])}>
                      {categoryLabels[job.category]}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{job.client_name}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(job.start_date), "h:mm a")}
                    </span>
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Job Detail Modal */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="bg-[#12121a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedJob?.title}</DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge className={cn("text-white", categoryColors[selectedJob.category])}>
                  {categoryLabels[selectedJob.category]}
                </Badge>
                <Badge variant="outline">{selectedJob.status}</Badge>
              </div>
              
              {selectedJob.client_name && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Client</p>
                  <p className="text-white">{selectedJob.client_name}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Date & Time</p>
                  <p className="text-white">{format(new Date(selectedJob.start_date), "MMM d, yyyy 'at' h:mm a")}</p>
                </div>
                {selectedJob.location && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Location</p>
                    <p className="text-white">{selectedJob.location}</p>
                  </div>
                )}
              </div>
              
              {selectedJob.assigned_employees?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Team</p>
                  <div className="flex flex-wrap gap-2">
                    {getEmployeeNames(selectedJob.assigned_employees).map((name, i) => (
                      <Badge key={i} variant="secondary" className="bg-white/10 text-gray-200">
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedJob.total_income > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Income</p>
                  <p className="text-xl font-bold text-green-400">${selectedJob.total_income.toLocaleString()}</p>
                </div>
              )}
              
              {selectedJob.description && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Description</p>
                  <p className="text-gray-300">{selectedJob.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
