import React from "react";
import { format } from "date-fns";
import { MapPin, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const categoryColors = {
  audio: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  production: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  photography: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  videography: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  consultation: "bg-green-500/20 text-green-400 border-green-500/30",
  av_install: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
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

export default function UpcomingJobs({ jobs, employees }) {
  const getEmployeeNames = (ids) => {
    if (!ids || ids.length === 0) return [];
    return ids.map(id => {
      const emp = employees.find(e => e.id === id);
      return emp?.name || "Unknown";
    });
  };

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4 text-white">Upcoming Jobs</h3>
      
      {jobs.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No upcoming jobs scheduled</p>
      ) : (
        <div className="space-y-4">
          {jobs.slice(0, 5).map((job) => (
            <div 
              key={job.id} 
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/5"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-white">{job.title}</h4>
                <Badge variant="outline" className={cn("text-xs", categoryColors[job.category])}>
                  {categoryLabels[job.category]}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-400 mb-3">{job.client_name}</p>
              
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(job.start_date), "MMM d, h:mm a")}
                </div>
                {job.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </div>
                )}
                {job.assigned_employees?.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {getEmployeeNames(job.assigned_employees).join(", ")}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}