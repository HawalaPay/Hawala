import React from "react";

export interface StatCardProps {
  label: string;
  amount: string;
  trend: number; // You can enhance this with a trend calculation or visualization
}

const StatCard: React.FC<StatCardProps> = ({ label, amount, trend }) => {
  return (
    <div className="p-4 bg-white shadow-md rounded-lg border border-gray-200">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-700">{label}</h3>
        {/* Trend visualization could go here */}
        <span className={`text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-2">{amount}</p>
    </div>
  );
};

export default StatCard;
