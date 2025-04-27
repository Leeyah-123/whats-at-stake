'use client';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { NetworkStats } from '@/components/dashboard/network-stats';
import { Overview } from '@/components/dashboard/overview';
import { RewardsAnalytics } from '@/components/dashboard/rewards-analytics';
import { Validators } from '@/components/dashboard/validators';
import { LoadingScreen } from '@/components/loading-screen';
import { useStaking } from '@/components/providers/staking-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function StakingDashboard() {
  const { loading } = useStaking();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <DashboardHeader />

      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-muted/40">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">What's At Stake</h2>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-4 md:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="validators">Validators</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Overview />
          </TabsContent>

          <TabsContent value="validators" className="space-y-4">
            <Validators />
          </TabsContent>

          <TabsContent value="network" className="space-y-4">
            <NetworkStats />
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <RewardsAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
