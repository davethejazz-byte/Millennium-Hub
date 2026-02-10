import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { validateJobForm } from "@/lib/flow-guards";

const categories = [
  { value: "audio", label: "Audio" },
  { value: "production", label: "Production" },
  { value: "photography", label: "Photography" },
  { value: "videography", label: "Videography" },
  { value: "consultation", label: "Consultation" },
  { value: "av_install", label: "AV Install" },
  { value: "other", label: "Other" },
];

const statuses = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const operatorCategories = [
  { value: "audio_engineer", label: "Audio Engineer" },
  { value: "camera_operator", label: "Camera Operator" },
  { value: "photographer", label: "Photographer" },
  { value: "video_editor", label: "Video Editor" },
  { value: "lighting_tech", label: "Lighting Technician" },
  { value: "production_assistant", label: "Production Assistant" },
  { value: "other", label: "Other" },
];

export default function JobForm({ open, onClose, onSubmit, job, employees }) {
  const [formData, setFormData] = useState({
    title: "",
    client_name: "",
    client_email: "",
    client_phone: "",
    category: "production",
    description: "",
    location: "",
    start_date: "",
    end_date: "",
    status: "pending",
    assigned_employees: [],
    needs_operator: false,
    operator_category: "",
    operator_description: "",
    notes: "",
  });

  useEffect(() => {
    if (job) {
      setFormData({
        ...job,
        start_date: job.start_date ? new Date(job.start_date).toISOString().slice(0, 16) : "",
        end_date: job.end_date ? new Date(job.end_date).toISOString().slice(0, 16) : "",
        assigned_employees: job.assigned_employees || [],
        needs_operator: job.needs_operator || false,
        operator_category: job.operator_category || "",
        operator_description: job.operator_description || "",
      });
    } else {
      setFormData({
        title: "",
        client_name: "",
        client_email: "",
        client_phone: "",
        category: "production",
        description: "",
        location: "",
        start_date: "",
        end_date: "",
        status: "pending",
        assigned_employees: [],
        needs_operator: false,
        operator_category: "",
        operator_description: "",
        notes: "",
      });
    }
  }, [job, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateJobForm(formData);
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }
    onSubmit(validation.data);
  };

  const toggleEmployee = (employeeId) => {
    setFormData(prev => ({
      ...prev,
      assigned_employees: prev.assigned_employees.includes(employeeId)
        ? prev.assigned_employees.filter(id => id !== employeeId)
        : [...prev.assigned_employees, employeeId]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#12121a] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">{job ? "Edit Job" : "New Job"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label className="text-gray-300">Job Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Corporate Event Production"
                className="bg-white/5 border-white/10 mt-1 text-white placeholder:text-gray-500"
                required
              />
            </div>

            <div>
              <Label className="text-gray-300">Category *</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 mt-1 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a24] border-white/10">
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value} className="text-white">{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 mt-1 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a24] border-white/10">
                  {statuses.map(s => (
                    <SelectItem key={s.value} value={s.value} className="text-white">{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Client Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Client Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-300">Client Name</Label>
                <Input
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  className="bg-white/5 border-white/10 mt-1 text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <Label className="text-gray-300">Email</Label>
                <Input
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                  className="bg-white/5 border-white/10 mt-1 text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <Label className="text-gray-300">Phone</Label>
                <Input
                  value={formData.client_phone}
                  onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                  className="bg-white/5 border-white/10 mt-1 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Schedule & Location</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Start Date & Time *</Label>
                <Input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="bg-white/5 border-white/10 mt-1 text-white [color-scheme:dark]"
                  required
                />
              </div>
              <div>
                <Label className="text-gray-300">End Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="bg-white/5 border-white/10 mt-1 text-white [color-scheme:dark]"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-gray-300">Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Venue name or address"
                  className="bg-white/5 border-white/10 mt-1 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Needs Operator */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div>
                <h4 className="text-sm font-medium text-white">Need an Operator?</h4>
                <p className="text-xs text-gray-400">Enable this to allow contractors to apply</p>
              </div>
              <Switch
                checked={formData.needs_operator}
                onCheckedChange={(checked) => setFormData({ ...formData, needs_operator: checked })}
              />
            </div>

            {formData.needs_operator && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
                <div>
                  <Label className="text-gray-300">Operator Type</Label>
                  <Select value={formData.operator_category} onValueChange={(v) => setFormData({ ...formData, operator_category: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 mt-1 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a24] border-white/10">
                      {operatorCategories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value} className="text-white">{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-gray-300">Position Details</Label>
                  <Textarea
                    value={formData.operator_description}
                    onChange={(e) => setFormData({ ...formData, operator_description: e.target.value })}
                    placeholder="Describe what the operator will be doing..."
                    className="bg-white/5 border-white/10 mt-1 h-20 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Team Assignment */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Assign Team Members</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {employees && employees.length > 0 ? employees.map(emp => (
                <div
                  key={emp.id}
                  onClick={() => toggleEmployee(emp.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.assigned_employees?.includes(emp.id)
                      ? "bg-blue-500/20 border-blue-500/50"
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      formData.assigned_employees?.includes(emp.id)
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-500"
                    }`}>
                      {formData.assigned_employees?.includes(emp.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-white">{emp.name}</span>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 col-span-full text-sm">No team members added yet</p>
              )}
            </div>
          </div>

          {/* Description & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Job details..."
                className="bg-white/5 border-white/10 mt-1 h-24 text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <Label className="text-gray-300">Internal Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Private notes..."
                className="bg-white/5 border-white/10 mt-1 h-24 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="text-gray-300 hover:text-white">Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {job ? "Update Job" : "Create Job"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
