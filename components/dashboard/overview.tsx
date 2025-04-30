'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber, formatPercentage } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useStaking } from '../providers/staking-provider';
import { APYChart } from './charts/apy-chart';
import { StakeDistributionChart } from './charts/stake-distribution-chart';
import { ValidatorScoresChart } from './charts/validator-scores-chart';
import { DataRefreshIndicator } from './data-refresh-indicator';
import { ErrorAlert } from './error-alert';

export function Overview() {
  const {
    data,
    refreshData,
    loading,
    error,
    lastUpdated,
    solPrice,
    solPriceChange,
  } = useStaking();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="lg:col-span-7">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl">
              Staking Ecosystem Overview
            </CardTitle>
            <CardDescription>
              Real-time analytics of Solana's staking ecosystem
              {lastUpdated && (
                <span className="ml-2 text-xs">
                  (Last updated: {lastUpdated.toLocaleTimeString()})
                </span>
              )}
            </CardDescription>
          </div>
          <DataRefreshIndicator />
        </CardHeader>
        {error && (
          <CardContent>
            <ErrorAlert message={error} onRetry={() => refreshData()} />
          </CardContent>
        )}
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Network Overview</CardTitle>
            <CardDescription>Key network metrics</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className="bg-purple-500/10 text-purple-500"
            >
              {loading ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                `Epoch ${data.networkStats?.epochInfo.epoch}`
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Total Staked SOL
                </p>
                <p className="text-2xl font-bold">
                  {data.networkStats
                    ? formatNumber(data.networkStats.totalStake)
                    : ''}{' '}
                  SOL
                </p>
                <div className="text-xs text-muted-foreground">
                  ~$
                  {data.networkStats && solPrice
                    ? formatNumber(data.networkStats.totalStake * solPrice)
                    : ''}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Staking Ratio</p>
                <p className="text-2xl font-bold">
                  {data.networkStats
                    ? formatPercentage(data.networkStats.stakingRatio)
                    : '0.00'}
                  %
                </p>
                <div className="flex items-center text-xs">
                  {data.networkStats && data.networkStats.stakingRatio > 70 ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={
                      data.networkStats && data.networkStats.stakingRatio > 70
                        ? 'text-green-500'
                        : 'text-red-500'
                    }
                  >
                    {data.networkStats
                      ? data.networkStats.stakingRatio > 70
                        ? 'Healthy'
                        : 'Low'
                      : 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Active Validators
                </p>
                <p className="text-2xl font-bold">
                  {data.networkStats
                    ? formatNumber(data.networkStats.activeValidators)
                    : '0'}
                </p>
                <div className="text-xs text-muted-foreground">
                  of{' '}
                  {data.networkStats
                    ? formatNumber(data.networkStats.totalValidators)
                    : '0.00'}{' '}
                  total
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Average APY</p>
                <p className="text-2xl font-bold">
                  {data.networkStats
                    ? formatPercentage(data.networkStats.averageAPY)
                    : '0.00'}
                  %
                </p>
                <div className="text-xs flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">+0.2% from last epoch</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Avg Commission</p>
                <p className="text-2xl font-bold">
                  {data.networkStats
                    ? formatPercentage(data.networkStats.averageCommission)
                    : '0.00'}
                  %
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Delinquent</p>
                <p className="text-2xl font-bold">
                  {data.delinquentValidators}
                </p>
                <div className="text-xs text-muted-foreground">
                  validators offline
                </div>
              </div>
            </div>
          )}

          {!loading && data.delinquentValidators > 10 && (
            <Alert className="mt-4 bg-red-500/10 text-red-500 border-red-500/20">
              <AlertTitle className="text-red-500">Attention</AlertTitle>
              <AlertDescription>
                High number of delinquent validators detected. Network
                performance might be affected.
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">SOL Price</h4>
                <div className="flex items-center mt-1">
                  <span className="text-2xl font-bold">
                    ${solPrice?.toFixed(2) || '0.00'}
                  </span>
                  <span
                    className={`ml-2 text-xs flex items-center ${
                      solPriceChange
                        ? solPriceChange >= 0
                          ? 'text-green-500'
                          : 'text-red-500'
                        : ''
                    }`}
                  >
                    {solPriceChange ? (
                      solPriceChange >= 0 ? (
                        <TrendingUp className="mr-1 h-3 w-3" />
                      ) : (
                        <TrendingDown className="mr-1 h-3 w-3" />
                      )
                    ) : null}
                    {solPriceChange && solPriceChange >= 0 ? '+' : ''}
                    {solPriceChange?.toFixed(2) || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Stake Distribution</CardTitle>
            <CardDescription>Top 25 validators by stake amount</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <ErrorAlert
                message="Failed to load stake distribution data"
                onRetry={() => refreshData()}
              />
            ) : (
              <StakeDistributionChart data={data.stakeDistribution} />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>APY Trend</CardTitle>
            <CardDescription>
              Historical staking returns over time
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <ErrorAlert
                message="Failed to load APY trend data"
                onRetry={() => refreshData()}
              />
            ) : (
              <APYChart data={data.apyHistory} />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Validator Scores</CardTitle>
            <CardDescription>Performance metrics</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <ErrorAlert
                message="Failed to load validator score data"
                onRetry={() => refreshData()}
              />
            ) : (
              <ValidatorScoresChart data={data.validatorScore} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
