"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getStats } from "./actions";
import { Skeleton } from "@/components/ui/skeleton"

type DashboardStats = {
  activeProjects: number;
  completedProjects: number;
  totalEarnings: number;
}

function ClientDashboardContent() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const response = await getStats();
      if (response.success) {
        setData(response.stats as DashboardStats);
      } else {
        setError('Failed to load dashboard data');
      }
      setIsLoading(false);
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Active Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data?.activeProjects}</p>
          <p className="text-sm text-muted-foreground">In progress</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Completed Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data?.completedProjects}</p>
          <p className="text-sm text-muted-foreground">Total completed</p>
        </CardContent>
      </Card>
    </div>
  );
}

const DashboardPage = () => {
  return (
    <div className="flex w-full min-h-screen">
      <main className="flex-1 bg-muted/40">
        <ClientDashboardContent />
      </main>
    </div>
  );
};

export default DashboardPage;
