import React from "react";
import { User } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

const RecentActivity = ({ activities }: { activities: any[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
    </CardHeader>
    <CardContent className="space-y-1">
      {activities.map((activity, i) => (
        <div
          key={i}
          className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-2 cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="font-medium text-sm">{activity.name}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
          <div className="text-right">
            <p
              className={`font-medium ${
                activity.type === "received"
                  ? "text-green-600"
                  : "text-gray-900"
              }`}
            >
              {activity.type === "received" ? "+" : "-"}Rs {activity.amount}
            </p>
            <p className="text-xs text-gray-500">{activity.type}</p>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

export default RecentActivity;