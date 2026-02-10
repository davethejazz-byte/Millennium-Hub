import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import JobCard from "@/components/jobs/JobCard";
import JobForm from "@/components/jobs/JobForm";
import ApplicationsModal from "@/components/jobs/ApplicationsModal";
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

export default function Jobs() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deleteJob, setDeleteJob] = useState(null);
  const [applicationsJob, setApplicationsJob] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const queryClient = useQueryClient();

  const {
    data: jobs = [],
    isLoading,
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

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Job.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setFormOpen(false);
    },
    onError: () => {
      toast.error("Failed to create job.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Job.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setFormOpen(false);
      setEditingJob(null);
    },
    onError: () => {
      toast.error("Failed to update job.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Job.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setDeleteJob(null);
    },
    onError: () => {
      toast.error("Failed to delete job.");
    },
  });

  const handleSubmit = (data) => {
    if (editingJob) {
      updateMutation.mutate({ id: editingJob.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormOpen(true);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.client_name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || job.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold glow-text text-white">Jobs</h1>
          <p className="text-gray-400 mt-1">Manage your projects and events</p>
        </div>
        <Button onClick={() => { setEditingJob(null); setFormOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> New Job
        </Button>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a24] border-white/10">
            <SelectItem value="all" className="text-white">All Categories</SelectItem>
            <SelectItem value="audio" className="text-white">Audio</SelectItem>
            <SelectItem value="production" className="text-white">Production</SelectItem>
            <SelectItem value="photography" className="text-white">Photography</SelectItem>
            <SelectItem value="videography" className="text-white">Videography</SelectItem>
            <SelectItem value="consultation" className="text-white">Consultation</SelectItem>
            <SelectItem value="av_install" className="text-white">AV Install</SelectItem>
            <SelectItem value="other" className="text-white">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a24] border-white/10">
            <SelectItem value="all" className="text-white">All Status</SelectItem>
            <SelectItem value="pending" className="text-white">Pending</SelectItem>
            <SelectItem value="confirmed" className="text-white">Confirmed</SelectItem>
            <SelectItem value="in_progress" className="text-white">In Progress</SelectItem>
            <SelectItem value="completed" className="text-white">Completed</SelectItem>
            <SelectItem value="cancelled" className="text-white">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(jobsError || employeesError) && (
        <div className="glass rounded-2xl p-6 border border-red-500/30">
          <p className="text-red-300">Failed to load jobs data.</p>
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

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-gray-500">No jobs found</p>
          <Button onClick={() => setFormOpen(true)} variant="link" className="mt-2 text-blue-400">
            Create your first job
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              employees={employees}
              onEdit={handleEdit}
              onDelete={setDeleteJob}
              onViewApplications={setApplicationsJob}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <JobForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingJob(null); }}
        onSubmit={handleSubmit}
        job={editingJob}
        employees={employees}
      />

      <ApplicationsModal
        open={!!applicationsJob}
        onClose={() => setApplicationsJob(null)}
        job={applicationsJob}
      />

      <AlertDialog open={!!deleteJob} onOpenChange={() => setDeleteJob(null)}>
        <AlertDialogContent className="bg-[#12121a] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteJob?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteJob.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
