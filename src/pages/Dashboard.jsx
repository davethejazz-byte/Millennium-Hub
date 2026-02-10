import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Calendar, UserPlus } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import UpcomingJobs from "@/components/dashboard/UpcomingJobs";
import { startOfYear, endOfYear, isAfter, startOfMonth, endOfMonth } from "date-fns";

export default function Dashboard() {
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

  const {
    data: applications = [],
    isError: applicationsError,
    refetch: refetchApplications,
  } = useQuery({
    queryKey: ["job-applications"],
    queryFn: () => base44.entities.JobApplication.list(),
  });

  const now = new Date();
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const yearlyJobs = jobs.filter(job => {
    const jobDate = new Date(job.start_date);
    return jobDate >= yearStart && jobDate <= yearEnd;
  });

  const monthlyJobs = jobs.filter(job => {
    const jobDate = new Date(job.start_date);
    return jobDate >= monthStart && jobDate <= monthEnd;
  });

  const upcomingJobs = jobs.filter(job => {
    const jobDate = new Date(job.start_date);
    return isAfter(jobDate, now) && job.status !== "cancelled";
  }).sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  const completedJobs = jobs.filter(job => job.status === "completed");
  const jobsNeedingOperators = jobs.filter(job => job.needs_operator && job.status !== "cancelled" && job.status !== "completed");
  const pendingApplications = applications.filter(app => app.status === "pending");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold glow-text text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back to Millennium Visuals</p>
      </div>

      {(jobsError || employeesError || applicationsError) && (
        <div className="glass rounded-2xl p-6 border border-red-500/30">
          <p className="text-red-300">Failed to load dashboard data.</p>
          <button
            type="button"
            onClick={() => {
              refetchJobs();
              refetchEmployees();
              refetchApplications();
            }}
            className="mt-3 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="This Month"
          value={monthlyJobs.length}
          icon={Calendar}
          subtitle="Jobs scheduled"
        />
        <StatsCard
          title="YTD Jobs"
          value={yearlyJobs.length}
          icon={Briefcase}
          subtitle="Total this year"
        />
        <StatsCard
          title="Upcoming Jobs"
          value={upcomingJobs.length}
          icon={Calendar}
          subtitle="Scheduled"
        />
        <StatsCard
          title="Needs Operators"
          value={jobsNeedingOperators.length}
          icon={UserPlus}
          subtitle={`${pendingApplications.length} pending apps`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingJobs jobs={upcomingJobs} employees={employees} />
        
        {/* Open Positions */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-white">Open Positions</h3>
          {jobsNeedingOperators.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No positions currently open</p>
          ) : (
            <div className="space-y-3">
              {jobsNeedingOperators.slice(0, 5).map(job => (
                <div key={job.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="font-medium text-white">{job.title}</p>
                  <p className="text-sm text-blue-400">{job.operator_category?.replace("_", " ")}</p>
                  <p className="text-xs text-gray-500">{new Date(job.start_date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{completedJobs.length}</p>
          <p className="text-xs text-gray-500 mt-1">Completed Jobs</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{employees.length}</p>
          <p className="text-xs text-gray-500 mt-1">Team Members</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{pendingApplications.length}</p>
          <p className="text-xs text-gray-500 mt-1">Pending Applications</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-400">{jobsNeedingOperators.length}</p>
          <p className="text-xs text-gray-500 mt-1">Open Positions</p>
        </div>
      </div>
    </div>
  );
}
