'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SLOT_TIME_MS } from '@/lib/constants';
import { formatNumber, formatPercentage } from '@/lib/utils';
import {
  AlertCircle,
  ArrowUpRight,
  Clock,
  Database,
  Download,
  ExternalLink,
  FileBarChart,
  Globe,
  HardDrive,
  Info,
  Server,
  Shield,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStaking } from '../providers/staking-provider';
import { CommissionDistributionChart } from './charts/commission-distribution-chart';
import { DelinquencyChart } from './charts/delinquency-chart';
import { NetworkStatsChart } from './charts/network-stats-chart';
import { ValidatorCountChart } from './charts/validator-count-chart';
import { DataRefreshIndicator } from './data-refresh-indicator';
import { EpochProgress } from './epoch-progress';
import { ErrorAlert } from './error-alert';

export function NetworkStats() {
  const { data, loading, error, refreshData } = useStaking();
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [dataAgeWarning, setDataAgeWarning] = useState(false);

  // Check if data is stale (older than 10 minutes)
  useEffect(() => {
    if (
      data.networkStats &&
      data.networkStats.epochInfo &&
      data.networkStats.epochInfo.slot > 0
    ) {
      const lastUpdated = new Date();
      const tenMinutesAgo = new Date(lastUpdated.getTime() - 10 * 60 * 1000);

      // If we have a lastUpdated timestamp and it's older than 10 minutes, show warning
      if (lastUpdated < tenMinutesAgo) {
        setDataAgeWarning(true);
      } else {
        setDataAgeWarning(false);
      }
    }
  }, [data.networkStats?.epochInfo.slot]);

  // Calculate estimated time to epoch end
  const calculateEpochTimeRemaining = () => {
    if (!data.networkStats?.epochInfo) return 'Unknown';

    const { slotsRemaining } = data.networkStats.epochInfo;
    const totalSeconds = (slotsRemaining * SLOT_TIME_MS) / 1000;
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (days > 0) {
      return `~${days}d ${hours}h remaining`;
    } else {
      return `~${hours}h ${minutes}m remaining`;
    }
  };

  // Calculate network health score based on various metrics
  const calculateNetworkHealth = () => {
    if (loading || error || !data.networkStats)
      return { score: 0, status: 'Unknown' };

    const { totalValidators, averageSkippedSlots, stakingRatio } =
      data.networkStats;
    const delinquentRatio = data.delinquentValidators / totalValidators;

    // Calculate health score (0-100)
    let score = 100;

    // Deduct for delinquent validators
    score -= delinquentRatio * 100 * 2; // Higher weight for delinquent validators

    // Deduct for high skip rate
    score -= Math.min(20, averageSkippedSlots * 10);

    // Deduct for low staking ratio
    if (stakingRatio < 50) {
      score -= (50 - stakingRatio) / 2;
    }

    // Ensure score is between 0-100
    score = Math.max(0, Math.min(100, score));

    // Determine status
    let status = 'Excellent';
    if (score < 50) status = 'Critical';
    else if (score < 70) status = 'Warning';
    else if (score < 85) status = 'Good';

    return { score: Math.round(score), status };
  };

  const networkHealth = calculateNetworkHealth();

  // Get software version distribution
  const getVersionDistribution = () => {
    if (loading || !data.validators.length) return [];

    const versionCounts: Record<string, number> = {};
    data.validators.forEach((validator) => {
      if (!validator.version) return;
      versionCounts[validator.version] =
        (versionCounts[validator.version] || 0) + 1;
    });

    return Object.entries(versionCounts)
      .map(([version, count]) => ({ version, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  // Get data center distribution
  const getDataCenterDistribution = () => {
    if (loading || !data.validators.length) return [];

    const dcCounts: Record<string, number> = {};
    data.validators.forEach((validator) => {
      if (!validator.dataCenter) return;
      dcCounts[validator.dataCenter] =
        (dcCounts[validator.dataCenter] || 0) + 1;
    });

    return Object.entries(dcCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const versionDistribution = getVersionDistribution();
  const dataCenterDistribution = getDataCenterDistribution();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="lg:col-span-7">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl">Network Statistics</CardTitle>
            <CardDescription>
              Real-time metrics and analytics for the Solana network
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {dataAgeWarning && (
              <Alert variant="warning" className="py-1 px-2 h-9">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Data may be stale. Last updated over 10 minutes ago.
                </AlertDescription>
              </Alert>
            )}
            <DataRefreshIndicator />
          </div>
        </CardHeader>
        {error && (
          <CardContent>
            <ErrorAlert message={error} onRetry={() => refreshData()} />
          </CardContent>
        )}
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader className="pb-3">
          <CardTitle>Network Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {loading ? (
              <>
                <Skeleton className="h-[100px]" />
                <Skeleton className="h-[100px]" />
                <Skeleton className="h-[100px]" />
              </>
            ) : (
              <>
                <EpochProgress epochInfo={data.networkStats?.epochInfo} />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Network Health</h3>
                  <div className="text-2xl font-bold flex items-center">
                    {networkHealth.score}
                    <Badge
                      className={`ml-2 ${
                        networkHealth.status === 'Excellent'
                          ? 'bg-green-500/20 text-green-500'
                          : networkHealth.status === 'Good'
                          ? 'bg-blue-500/20 text-blue-500'
                          : networkHealth.status === 'Warning'
                          ? 'bg-amber-500/20 text-amber-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {networkHealth.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Health Score</span>
                    <span>{networkHealth.score}/100</span>
                  </div>
                  <Progress
                    value={networkHealth.score}
                    className="h-1"
                    indicatorClassName={
                      networkHealth.score > 85
                        ? 'bg-green-500'
                        : networkHealth.score > 70
                        ? 'bg-blue-500'
                        : networkHealth.score > 50
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Epoch Timeline</h3>
                  <div className="text-2xl font-bold">
                    {calculateEpochTimeRemaining()}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Epoch {data.networkStats?.epochInfo.epoch || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>
                      {data.networkStats
                        ? formatPercentage(
                            (data.networkStats.epochInfo.slotIndex /
                              data.networkStats.epochInfo.slotsInEpoch) *
                              100
                          )
                        : '0'}
                      %
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {loading ? (
              <>
                <Skeleton className="h-[80px]" />
                <Skeleton className="h-[80px]" />
                <Skeleton className="h-[80px]" />
                <Skeleton className="h-[80px]" />
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Server className="h-4 w-4 mr-1" />
                    <span>Validators</span>
                  </div>
                  <p className="text-xl font-bold">
                    {data.networkStats
                      ? formatNumber(data.networkStats.activeValidators)
                      : '0'}{' '}
                    /{' '}
                    {data.networkStats
                      ? formatNumber(data.networkStats.totalValidators)
                      : '0'}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {formatNumber(data.delinquentValidators)} delinquent
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Database className="h-4 w-4 mr-1" />
                    <span>Total Stake</span>
                  </div>
                  <p className="text-xl font-bold">
                    {formatNumber(data.networkStats?.totalStake || 0)} SOL
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {formatPercentage(data.networkStats?.stakingRatio || 0)}% of
                    supply
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 mr-1" />
                    <span>Skip Rate</span>
                  </div>
                  <p className="text-xl font-bold">
                    {data.networkStats
                      ? formatPercentage(data.networkStats.averageSkippedSlots)
                      : '0'}
                    %
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Network average
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Zap className="h-4 w-4 mr-1" />
                    <span>Avg. APY</span>
                  </div>
                  <p className="text-xl font-bold">
                    {data.networkStats
                      ? formatPercentage(data.networkStats.averageAPY)
                      : '0'}
                    %
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {data.networkStats
                      ? formatPercentage(data.networkStats.averageCommission)
                      : '0'}
                    % avg. commission
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
            >
              {showAdvancedMetrics ? 'Hide' : 'Show'} Advanced Metrics
            </Button>
          </div>

          {showAdvancedMetrics && (
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Top Software Versions
                </h4>
                <div className="space-y-2">
                  {versionDistribution.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-sm"
                    >
                      <span>{item.version}</span>
                      <div className="flex items-center">
                        <span className="text-muted-foreground mr-2">
                          {item.count} validators
                        </span>
                        <span className="text-xs">
                          (
                          {data.networkStats
                            ? formatPercentage(
                                (item.count /
                                  data.networkStats.totalValidators) *
                                  100
                              )
                            : '0'}
                          %)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Top Data Centers</h4>
                <div className="space-y-2">
                  {dataCenterDistribution.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-sm"
                    >
                      <span>{item.name}</span>
                      <div className="flex items-center">
                        <span className="text-muted-foreground mr-2">
                          {item.count} validators
                        </span>
                        <span className="text-xs">
                          (
                          {data.networkStats
                            ? formatPercentage(
                                (item.count /
                                  data.networkStats.totalValidators) *
                                  100
                              )
                            : '0'}
                          %)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a
                    href="https://validators.app"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View More on validators.app
                  </a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-4">
        <CardHeader className="pb-3">
          <CardTitle>Network Metrics Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <ErrorAlert
                message="Failed to load network metrics"
                onRetry={() => refreshData()}
              />
            ) : (
              <NetworkStatsChart />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-full lg:col-span-7">
        <CardHeader className="pb-3">
          <CardTitle>Network Analytics</CardTitle>
        </CardHeader>
        <CardContent className="max-w-full">
          <Tabs defaultValue="validator-growth" className="space-y-4">
            <TabsList className="max-w-full grid max-md:grid-cols-2 h-fit grid-cols-4 mb-4">
              <TabsTrigger value="validator-growth">
                Validator Growth
              </TabsTrigger>
              <TabsTrigger value="commission">Commission</TabsTrigger>
              <TabsTrigger value="delinquency">Delinquency</TabsTrigger>
              <TabsTrigger value="geographic">Geographic</TabsTrigger>
            </TabsList>

            <TabsContent value="validator-growth" className="space-y-4">
              <div className="h-[400px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                  </div>
                ) : error ? (
                  <ErrorAlert
                    message="Failed to load validator growth data"
                    onRetry={() => refreshData()}
                  />
                ) : (
                  <ValidatorCountChart />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">
                        Total Validators
                      </span>
                      <span className="text-2xl font-bold">
                        {data.networkStats
                          ? formatNumber(data.networkStats.totalValidators)
                          : '0'}
                      </span>
                      <span className="text-xs text-green-500 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        +12% from last month
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">
                        Active Validators
                      </span>
                      <span className="text-2xl font-bold">
                        {data.networkStats
                          ? formatNumber(data.networkStats.activeValidators)
                          : '0'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {data.networkStats
                          ? formatPercentage(
                              (data.networkStats.activeValidators /
                                data.networkStats.totalValidators) *
                                100
                            )
                          : '0'}
                        % of total
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">
                        Superminority
                      </span>
                      <span className="text-2xl font-bold">20</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-muted-foreground flex items-center cursor-help">
                              <Info className="h-3 w-3 mr-1" />
                              Validators control 33% stake
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-[200px] text-xs">
                              The superminority is the minimum number of
                              validators that control 33% of the total stake.
                              This is important for network security as 33%
                              stake is required to halt consensus.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="commission" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 h-[400px]">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                    </div>
                  ) : error ? (
                    <ErrorAlert
                      message="Failed to load commission data"
                      onRetry={() => refreshData()}
                    />
                  ) : (
                    <CommissionDistributionChart />
                  )}
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">
                          Average Commission
                        </span>
                        <span className="text-2xl font-bold">
                          {data.networkStats
                            ? formatPercentage(
                                data.networkStats.averageCommission
                              )
                            : '0'}
                          %
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Network-wide average
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">
                          0% Commission
                        </span>
                        <span className="text-2xl font-bold">7.3%</span>
                        <span className="text-xs text-muted-foreground">
                          of validators
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">
                          10%+ Commission
                        </span>
                        <span className="text-2xl font-bold">12.1%</span>
                        <span className="text-xs text-muted-foreground">
                          of validators
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">
                          Commission Changes
                        </span>
                        <span className="text-2xl font-bold">24</span>
                        <span className="text-xs text-amber-500">
                          Pending changes this epoch
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="delinquency" className="space-y-4">
              <div className="h-[400px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                  </div>
                ) : error ? (
                  <ErrorAlert
                    message="Failed to load delinquency data"
                    onRetry={() => refreshData()}
                  />
                ) : (
                  <DelinquencyChart />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">
                        Delinquent Validators
                      </span>
                      <span className="text-2xl font-bold">
                        {data.delinquentValidators}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {data.networkStats
                          ? formatPercentage(
                              (data.delinquentValidators /
                                data.networkStats.totalValidators) *
                                100
                            )
                          : '0'}
                        % of total
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">
                        Avg. Skip Rate
                      </span>
                      <span className="text-2xl font-bold">
                        {data.networkStats
                          ? formatPercentage(
                              data.networkStats.averageSkippedSlots
                            )
                          : '0'}
                        %
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Network average
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">
                        Delinquent Stake
                      </span>
                      <span className="text-2xl font-bold">0.8%</span>
                      <span className="text-xs text-muted-foreground">
                        of total stake
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">
                        Block Time
                      </span>
                      <span className="text-2xl font-bold">400ms</span>
                      <span className="text-xs text-muted-foreground">
                        Target slot time
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="geographic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-3">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Geographic Distribution
                    </CardTitle>
                    <CardDescription>
                      Top countries by validator count
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {loading
                        ? Array(5)
                            .fill(0)
                            .map((_, i) => (
                              <Skeleton key={i} className="h-[80px]" />
                            ))
                        : 'Coming Soon'}
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-3">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Data Center Distribution
                    </CardTitle>
                    <CardDescription>
                      Top data centers by validator count
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {loading
                        ? Array(5)
                            .fill(0)
                            .map((_, i) => (
                              <Skeleton key={i} className="h-[80px]" />
                            ))
                        : dataCenterDistribution.map((dc, i) => (
                            <Card key={i}>
                              <CardContent className="p-4">
                                <div className="flex flex-col">
                                  <div className="flex items-center">
                                    <HardDrive className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span className="font-medium">
                                      {dc.name}
                                    </span>
                                  </div>
                                  <span className="text-xl font-bold mt-1">
                                    {dc.count}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {data.networkStats
                                      ? formatPercentage(
                                          (dc.count /
                                            data.networkStats.totalValidators) *
                                            100
                                        )
                                      : '0'}
                                    % of validators
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="lg:col-span-7">
        <CardHeader className="pb-3">
          <CardTitle>Network Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center space-y-2"
              asChild
            >
              <a
                href="https://docs.solana.com/cluster/stake-delegation-and-rewards"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileBarChart className="h-8 w-8 text-purple-500" />
                <span>Staking Documentation</span>
                <span className="text-xs text-muted-foreground">
                  Official Solana docs
                </span>
              </a>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center space-y-2"
              asChild
            >
              <a
                href="https://validators.app"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe className="h-8 w-8 text-cyan-500" />
                <span>validators.app</span>
                <span className="text-xs text-muted-foreground">
                  Real-time validator metrics
                </span>
              </a>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center space-y-2"
              asChild
            >
              <a
                href="https://explorer.solana.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-8 w-8 text-green-500" />
                <span>Solana Explorer</span>
                <span className="text-xs text-muted-foreground">
                  Block explorer and analytics
                </span>
              </a>
            </Button>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Data provided by validators.app API
                </span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://validators.app/api-docs"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  API Documentation
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
