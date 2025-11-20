"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardChartsProps {
  applications: any[];
}

export function DashboardCharts({ applications }: DashboardChartsProps) {
  const applicationStatusData = Object.entries(applications?.reduce((acc: any, app: any) => {
    const status = app?.status || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {}) || {}).map(([name, value]) => {
    const lowerName = name.toLowerCase();
    let color = "#9CA3AF"; // default gray
    if (lowerName === 'pending') color = "#EAB308"; // yellow
    if (lowerName === 'shortlisted') color = "#3B82F6"; // blue
    if (lowerName === 'rejected') color = "#EF4444"; // red
    
    return {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: value as number,
      color
    };
  }).filter(item => item.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Applications by Status</CardTitle>
          <CardDescription>Distribution of application statuses</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={applicationStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {applicationStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applications by Track</CardTitle>
          <CardDescription>Number of applications per track</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={Object.entries(applications?.reduce((acc: any, app: any) => {
                const track = app?.track?.name || app?.preferredTrack || "Unknown";
                acc[track] = (acc[track] || 0) + 1;
                return acc;
              }, {}) || {}).map(([name, value]) => ({ name, value }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
