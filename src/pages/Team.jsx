import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Mail, Phone, Pencil, Trash2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { validateTeamForm } from "@/lib/flow-guards";

const specialtyOptions = [
  "Audio Engineering",
  "Video Production",
  "Photography",
  "Lighting",
  "Stage Management",
  "Event Coordination",
  "AV Installation",
  "Live Streaming",
  "Post-Production",
  "Graphic Design",
];

export default function Team() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteEmployee, setDeleteEmployee] = useState(null);
  const [uploading, setUploading] = useState(false);

  const queryClient = useQueryClient();

  const {
    data: employees = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list(),
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    specialties: [],
    photo_url: "",
    bio: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
      specialties: [],
      photo_url: "",
      bio: "",
    });
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Employee.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setFormOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Employee.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setFormOpen(false);
      setEditingEmployee(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Employee.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setDeleteEmployee(null);
    },
  });

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      role: employee.role || "",
      specialties: employee.specialties || [],
      photo_url: employee.photo_url || "",
      bio: employee.bio || "",
    });
    setFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateTeamForm(formData);
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }

    if (editingEmployee) {
      updateMutation.mutate({ id: editingEmployee.id, data: validation.data });
    } else {
      createMutation.mutate(validation.data);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, photo_url: file_url }));
    } catch (error) {
      toast.error("Photo upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const toggleSpecialty = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold glow-text text-white">Team</h1>
          <p className="text-gray-400 mt-1">Manage your crew</p>
        </div>
        <Button 
          onClick={() => { setEditingEmployee(null); resetForm(); setFormOpen(true); }} 
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Team Member
        </Button>
      </div>

      {/* Team Grid */}
      {isError && (
        <div className="glass rounded-2xl p-6 border border-red-500/30">
          <p className="text-red-300">Failed to load team members.</p>
          <Button onClick={() => refetch()} className="mt-3 bg-red-600 hover:bg-red-700">
            Retry
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      ) : employees.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-gray-500">No team members yet</p>
          <Button onClick={() => setFormOpen(true)} variant="link" className="mt-2 text-blue-400">
            Add your first team member
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map(employee => (
            <div key={employee.id} className="glass rounded-2xl p-6 group hover:bg-white/5 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {employee.photo_url ? (
                    <img 
                      src={employee.photo_url} 
                      alt={employee.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold">
                      {employee.name?.split(" ").map(n => n[0]).join("")}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg text-white">{employee.name}</h3>
                    {employee.role && <p className="text-sm text-gray-400">{employee.role}</p>}
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(employee)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteEmployee(employee)} className="text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <a href={`mailto:${employee.email}`} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <Mail className="h-4 w-4" />
                  {employee.email}
                </a>
                {employee.phone && (
                  <a href={`tel:${employee.phone}`} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <Phone className="h-4 w-4" />
                    {employee.phone}
                  </a>
                )}
              </div>

              {employee.specialties?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {employee.specialties.slice(0, 3).map(specialty => (
                    <Badge key={specialty} variant="secondary" className="bg-white/10 text-xs text-gray-200">
                      {specialty}
                    </Badge>
                  ))}
                  {employee.specialties.length > 3 && (
                    <Badge variant="secondary" className="bg-white/10 text-xs text-gray-200">
                      +{employee.specialties.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Dialog open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) { setEditingEmployee(null); resetForm(); }}}>
        <DialogContent className="bg-[#12121a] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">{editingEmployee ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo Upload */}
            <div className="flex justify-center">
              <label className="cursor-pointer">
                <div className="relative">
                  {formData.photo_url ? (
                    <img 
                      src={formData.photo_url} 
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    {uploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </div>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-gray-300">Full Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/10 mt-1 text-white placeholder:text-gray-500"
                  required
                />
              </div>
              <div>
                <Label className="text-gray-300">Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/5 border-white/10 mt-1 text-white placeholder:text-gray-500"
                  required
                />
              </div>
              <div>
                <Label className="text-gray-300">Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white/5 border-white/10 mt-1 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-gray-300">Job Title / Role</Label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Lead Videographer"
                  className="bg-white/5 border-white/10 mt-1 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Specialties</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {specialtyOptions.map(specialty => (
                  <Badge
                    key={specialty}
                    variant="outline"
                    className={`cursor-pointer transition-all ${
                      formData.specialties.includes(specialty)
                        ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                        : "bg-white/5 border-white/10 hover:border-white/20 text-gray-300"
                    }`}
                    onClick={() => toggleSpecialty(specialty)}
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Short bio..."
                className="bg-white/5 border-white/10 mt-1 h-20 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)} className="text-gray-300 hover:text-white">Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingEmployee ? "Update" : "Add Member"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteEmployee} onOpenChange={() => setDeleteEmployee(null)}>
        <AlertDialogContent className="bg-[#12121a] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {deleteEmployee?.name} from the team?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteEmployee.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
