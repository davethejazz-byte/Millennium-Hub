import React from "react";
import { cn } from "@/lib/utils";

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, trendUp }) {
  return (
    <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Icon className="h-5 w-5 text-blue-400" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trendUp ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
          )}>
            {trendUp ? "+" : ""}{trend}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-bold mb-1 text-white">{value}</h3>
      <p className="text-gray-400 text-sm">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}