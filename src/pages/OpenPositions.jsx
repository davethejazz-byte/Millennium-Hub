import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { MapPin, Clock, Send, CheckCircle } from "lucide-react";
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
import { toast } from "sonner";
import {
  filterOpenJobs,
  hasDuplicateApplication,
  validateApplicationForm,
} from "@/lib/flow-guards";

const operatorLabels = {
  audio_engineer: "Audio Engineer",
  camera_operator: "Camera Operator",
  photographer: "Photographer",
  video_editor: "Video Editor",
  lighting_tech: "Lighting Technician",
  production_assistant: "Production Assistant",
  other: "Other",
};

const categoryColors = {
  audio: "bg-purple-500/20 text-purple-400",
  production: "bg-blue-500/20 text-blue-400",
  photography: "bg-pink-500/20 text-pink-400",
  videography: "bg-orange-500/20 text-orange-400",
  consultation: "bg-green-500/20 text-green-400",
  av_install: "bg-cyan-500/20 text-cyan-400",
  other: "bg-gray-500/20 text-gray-400",
};

export default function OpenPositions() {
  const [applyJob, setApplyJob] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [user, setUser] = useState(null);

  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const {
    data: jobs = [],
    isLoading,
    isError: jobsError,
    refetch: refetchJobs,
  } = useQuery({
    queryKey: ["open-positions"],
    queryFn: async () => {
      const allJobs = await base44.entities.Job.list("-start_date");
      return filterOpenJobs(allJobs);
    },
  });

  const {
    data: myApplications = [],
    isError: applicationsError,
    refetch: refetchMyApplications,
  } = useQuery({
    queryKey: ["my-applications"],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.JobApplication.filter({ applicant_email: user.email });
    },
    enabled: !!user?.email,
  });

  const applyMutation = useMutation({
    mutationFn: async (data) => {
      const existing = await base44.entities.JobApplication.filter({
        job_id: data.job_id,
        applicant_email: data.applicant_email,
      });
      if (existing.length > 0) {
        throw new Error("You have already applied for this position.");
      }
      return base44.entities.JobApplication.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      setApplyJob(null);
      setFormData({ name: "", email: "", message: "" });
      toast.success("Application submitted!");
    },
    onError: (error) => {
      toast.error(error?.message || "Unable to submit application.");
    },
  });

  const handleApply = (e) => {
    e.preventDefault();
    const validation = validateApplicationForm(formData);
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }
    if (hasDuplicateApplication(myApplications, applyJob.id, validation.data.email)) {
      toast.error("You have already applied for this position.");
      return;
    }
    applyMutation.mutate({
      job_id: applyJob.id,
      applicant_name: validation.data.name,
      applicant_email: validation.data.email,
      message: validation.data.message,
      status: "pending",
    });
  };

  const hasApplied = (jobId) => {
    return myApplications.some(app => app.job_id === jobId);
  };

  const getApplicationStatus = (jobId) => {
    const app = myApplications.find(a => a.job_id === jobId);
    return app?.status;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold glow-text text-white">Open Positions</h1>
        <p className="text-gray-400 mt-1">Apply for available operator positions</p>
      </div>

      {(jobsError || applicationsError) && (
        <div className="glass rounded-2xl p-6 border border-red-500/30">
          <p className="text-red-300">Failed to load open positions data.</p>
          <Button
            onClick={() => {
              refetchJobs();
              refetchMyApplications();
            }}
            className="mt-3 bg-red-600 hover:bg-red-700"
          >
            Retry
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-gray-400">No open positions at the moment</p>
          <p className="text-sm text-gray-500 mt-2">Check back later for new opportunities</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map(job => {
            const applied = hasApplied(job.id);
            const appStatus = getApplicationStatus(job.id);
            
            return (
              <div key={job.id} className="glass rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                    <Badge className={`mt-2 ${categoryColors[job.category]}`}>
                      {operatorLabels[job.operator_category] || "Operator Needed"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {format(new Date(job.start_date), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                  </div>
                  {job.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                  )}
                </div>

                {job.operator_description && (
                  <p className="text-sm text-gray-300 mb-4 p-3 rounded-lg bg-white/5">
                    {job.operator_description}
                  </p>
                )}

                {applied ? (
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${
                    appStatus === "accepted" ? "bg-green-500/20 text-green-400" :
                    appStatus === "rejected" ? "bg-red-500/20 text-red-400" :
                    "bg-blue-500/20 text-blue-400"
                  }`}>
                    <CheckCircle className="h-5 w-5" />
                    <span>
                      {appStatus === "accepted" ? "You've been accepted!" :
                       appStatus === "rejected" ? "Application not selected" :
                       "Application submitted"}
                    </span>
                  </div>
                ) : (
                  <Button 
                    onClick={() => {
                      setApplyJob(job);
                      if (user) {
                        setFormData({ 
                          name: user.full_name || "", 
                          email: user.email || "", 
                          message: "" 
                        });
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4 mr-2" /> Apply Now
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Modal */}
      <Dialog open={!!applyJob} onOpenChange={() => setApplyJob(null)}>
        <DialogContent className="bg-[#12121a] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Apply for {applyJob?.title}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <Label className="text-gray-300">Your Name *</Label>
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
              <Label className="text-gray-300">Message (optional)</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us about your experience..."
                className="bg-white/5 border-white/10 mt-1 h-24 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setApplyJob(null)} className="text-gray-300 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {applyMutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
