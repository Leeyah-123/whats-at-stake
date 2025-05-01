'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatNumber, formatPercentage } from '@/lib/utils';
import { InfoIcon, Zap } from 'lucide-react';
import { useStaking } from '../providers/staking-provider';
import { RewardsComparisonChart } from './charts/rewards-comparison-chart';
import { RewardsDistributionChart } from './charts/rewards-distribution-chart';
import { RewardsOverTimeChart } from './charts/rewards-over-time-chart';

export function RewardsAnalytics() {
  const { data } = useStaking();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="max-w-full overflow-x-auto lg:col-span-7">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Staking Rewards Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/5 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-purple-500" />
                  <h3 className="text-sm font-medium">Current Avg. APY</h3>
                </div>
                <div className="mt-2">
                  <div className="text-3xl font-bold text-purple-500">
                    {data.networkStats
                      ? formatPercentage(data.networkStats.averageAPY)
                      : '0.00'}
                    %
                  </div>
                  <div className="text-xs mt-1 flex items-center">
                    <span className="text-green-500">+0.2%</span>
                    <span className="text-muted-foreground ml-1">
                      vs last epoch
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted/30 rounded-lg border p-4 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm text-muted-foreground">
                  Inflation Rate
                </h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80 text-xs">
                        Solana's inflation schedule started at 8% and decreases
                        at a rate of 15% per year until it reaches the long-term
                        inflation rate of 1.5%.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="text-xl font-medium">7.0%</div>
              <div className="text-xs text-muted-foreground">
                Decreasing to 6.85% in 23 days
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg border p-4 space-y-1">
              <h3 className="text-sm text-muted-foreground">
                Rewards per Epoch
              </h3>
              <div className="text-xl font-medium">
                {formatNumber(154621)} SOL
              </div>
              <div className="text-xs text-muted-foreground">
                ~{formatNumber(154621 * 60)} SOL monthly
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg border p-4 space-y-1">
              <h3 className="text-sm text-muted-foreground">
                Stake-Weighted APY
              </h3>
              <div className="text-xl font-medium">
                {data.networkStats
                  ? formatPercentage(data.networkStats.averageAPY - 0.3)
                  : '0.00'}
                %
              </div>
              <div className="text-xs text-muted-foreground">
                Accounts for validator stake distribution
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-full overflow-x-auto lg:col-span-4">
        <CardHeader className="pb-3">
          <CardTitle>Rewards Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-full h-[350px] overflow-x-auto">
            <RewardsOverTimeChart data={data.apyHistory} />
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-full overflow-x-auto lg:col-span-3">
        <CardHeader className="pb-3">
          <CardTitle>Validator APY Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-full h-[350px] overflow-x-auto">
            <RewardsDistributionChart />
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-full overflow-x-auto lg:col-span-7">
        <CardHeader className="pb-3">
          <CardTitle>Validator Rewards Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Tabs
              defaultValue="top-validators"
              className="min-w-[340px] md:min-w-0"
            >
              <TabsList
                className="flex flex-row md:grid md:grid-cols-3 mb-4 w-max md:w-[400px] gap-2 md:gap-0"
                style={{ minWidth: 340 }}
              >
                <TabsTrigger value="top-validators">Top Validators</TabsTrigger>
                <TabsTrigger value="by-commission">By Commission</TabsTrigger>
                <TabsTrigger value="by-size">By Size</TabsTrigger>
              </TabsList>
              <TabsContent value="top-validators" className="space-y-4">
                <div className="h-[400px]">
                  <RewardsComparisonChart />
                </div>
              </TabsContent>
              <TabsContent value="by-commission" className="space-y-4">
                <div className="h-[400px]">
                  <RewardsComparisonChart compareBy="commission" />
                </div>
              </TabsContent>
              <TabsContent value="by-size" className="space-y-4">
                <div className="h-[400px]">
                  <RewardsComparisonChart compareBy="size" />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
