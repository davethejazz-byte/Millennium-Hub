import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const statusColors = {
  pending: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  accepted: "bg-green-500/20 text-green-400 border-green-500/40",
  rejected: "bg-red-500/20 text-red-400 border-red-500/40",
};

export default function ApplicationsModal({ open, onClose, job }) {
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["job-applications", job?.id],
    queryFn: () => base44.entities.JobApplication.filter({ job_id: job.id }),
    enabled: open && !!job?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.JobApplication.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications", job?.id] });
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      toast.success("Application updated");
    },
  });

  const handleStatusUpdate = (applicationId, status) => {
    updateStatusMutation.mutate({ id: applicationId, status });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#12121a] border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Applications for {job?.title}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Review contractor applications and set their status.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <div className="py-10 text-center text-gray-400">
            No applications yet for this position.
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {applications.map((application) => (
              <div
                key={application.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-white font-medium">{application.applicant_name}</p>
                    <p className="text-sm text-gray-400">{application.applicant_email}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={statusColors[application.status] || statusColors.pending}
                  >
                    {application.status}
                  </Badge>
                </div>

                {application.message && (
                  <p className="text-sm text-gray-300 bg-black/20 rounded-lg p-3">
                    {application.message}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-green-500/40 text-green-400 hover:bg-green-500/10"
                    disabled={updateStatusMutation.isPending}
                    onClick={() => handleStatusUpdate(application.id, "accepted")}
                  >
                    Accept
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                    disabled={updateStatusMutation.isPending}
                    onClick={() => handleStatusUpdate(application.id, "rejected")}
                  >
                    Reject
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
                    disabled={updateStatusMutation.isPending}
                    onClick={() => handleStatusUpdate(application.id, "pending")}
                  >
                    Mark Pending
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
