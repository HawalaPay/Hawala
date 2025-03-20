import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

// Define interface for the stats card properties
interface StatCardProps {
  amount: string;
  label: string;
  trend?: number; // Optional, default to 0 if not provided
}

// Define interface for the stats grid properties
interface StatsGridProps {
  stats?: StatCardProps[] | null; // stats can be an array or null
  isLoading?: boolean; // isLoading is a boolean, defaults to false
  isConnected?: boolean; // Flag to check if MetaMask is connected
}

// StatsCard component: responsible for rendering each stat card
const StatsCard: React.FC<StatCardProps> = ({ amount, label, trend = 0 }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h3 className="text-2xl font-bold mt-1">
          {Number(amount).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
          })}
        </h3>
      </div>
      {trend !== 0 && (
        <div
          className={`flex items-center ${
            trend > 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {trend > 0 ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="text-sm ml-1">{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  </div>
);

// Loading skeleton component for when data is being fetched
const LoadingSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="w-full">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  </div>
);

// StatsGrid component: Responsible for rendering the grid of stats cards
const StatsGrid: React.FC<StatsGridProps> = ({
  stats = [],
  isLoading = false,
  isConnected = false,
}) => {
  // If MetaMask is not connected, set stats to zeroes
  const displayStats = isConnected
    ? Array.isArray(stats)
      ? stats
      : []
    : [
        {
          label: "Token 1 Balance",
          amount: "0.00",
          trend: 0,
        },
        {
          label: "Token 2 Balance",
          amount: "0.00",
          trend: 0,
        },
      ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    );
  }

  if (displayStats.length === 0) {
    return (
      <div className="text-center text-gray-500">
        <p>No stats available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {displayStats.map((stat, index) => (
        <StatsCard
          key={index}
          amount={stat.amount}
          label={stat.label}
          trend={stat.trend}
        />
      ))}
    </div>
  );
};

export default StatsGrid;
