import React from "react";
import { format } from "date-fns";
import { MapPin, Clock, Users, MoreVertical, Pencil, Trash2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-400",
  in_progress: "bg-purple-500/20 text-purple-400",
  completed: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
};

const operatorLabels = {
  audio_engineer: "Audio Engineer",
  camera_operator: "Camera Operator",
  photographer: "Photographer",
  video_editor: "Video Editor",
  lighting_tech: "Lighting Tech",
  production_assistant: "Production Assistant",
  other: "Other",
};

export default function JobCard({ job, employees, onEdit, onDelete, onViewApplications }) {
  const getEmployeeNames = (ids) => {
    if (!ids || ids.length === 0) return [];
    return ids.map(id => {
      const emp = employees.find(e => e.id === id);
      return emp?.name || "Unknown";
    });
  };

  const assignedNames = getEmployeeNames(job.assigned_employees);

  return (
    <div className="glass rounded-xl p-5 hover:bg-white/5 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-lg text-white">{job.title}</h3>
            <Badge variant="outline" className={cn("text-xs", categoryColors[job.category])}>
              {categoryLabels[job.category]}
            </Badge>
          </div>
          <p className="text-sm text-gray-400">{job.client_name}</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#1a1a24] border-white/10">
            <DropdownMenuItem onClick={() => onEdit(job)} className="cursor-pointer text-white">
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            {job.needs_operator && onViewApplications && (
              <DropdownMenuItem onClick={() => onViewApplications(job)} className="cursor-pointer text-white">
                <UserPlus className="h-4 w-4 mr-2" /> View Applications
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onDelete(job)} className="cursor-pointer text-red-400">
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {format(new Date(job.start_date), "MMM d, yyyy 'at' h:mm a")}
        </div>
        {job.location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {job.location}
          </div>
        )}
      </div>

      {/* Needs Operator Badge */}
      {job.needs_operator && (
        <div className="mb-4 p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-blue-400">
              Needs: {operatorLabels[job.operator_category] || "Operator"}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={cn("text-xs", statusColors[job.status])}>
            {job.status.replace("_", " ").toUpperCase()}
          </Badge>
          {assignedNames.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="h-3 w-3" />
              {assignedNames.length > 2 
                ? `${assignedNames.slice(0, 2).join(", ")} +${assignedNames.length - 2}`
                : assignedNames.join(", ")
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}