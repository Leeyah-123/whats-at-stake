import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Validator } from "@/lib/types"
import { formatNumber, formatPercentage } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Clock, ExternalLink, Info, Percent, Shield, XCircle } from "lucide-react"
import { ValidatorPerformanceChart } from "./charts/validator-performance-chart"

interface ValidatorDetailsCardProps {
  validator: Validator
}

export function ValidatorDetailsCard({ validator }: ValidatorDetailsCardProps) {
  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle>{validator.name}</CardTitle>
          <div className="text-sm text-muted-foreground mt-1">
            {validator.identity.slice(0, 12)}...{validator.identity.slice(-12)}
          </div>
        </div>
        <div className="flex items-center">
          {validator.delinquent ? (
            <div className="flex items-center text-red-500 bg-red-500/10 px-3 py-1 rounded-full text-xs">
              <XCircle className="h-3 w-3 mr-1" />
              Delinquent
            </div>
          ) : (
            <div className="flex items-center text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Active
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Activated Stake</p>
                <p className="text-xl font-bold">{formatNumber(validator.activatedStake)} SOL</p>
                <div className="text-xs text-muted-foreground">
                  {formatPercentage(validator.stakePercentage)}% of total network stake
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Commission</p>
                <p className="text-xl font-bold">{validator.commission}%</p>
                {validator.commissionChange ? (
                  <div className="text-xs text-amber-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Rate change planned soon
                  </div>
                ) : (
                  <div className="text-xs text-green-500 flex items-center">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Steady commission rate
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Estimated APY</p>
                <p className="text-xl font-bold text-green-500">{validator.apy}%</p>
                <div className="text-xs text-muted-foreground">Net of commission</div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Voting Power</p>
                <p className="text-xl font-bold">{formatPercentage(validator.votingPower)}%</p>
                <div className="text-xs flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                  <span className="text-muted-foreground">{validator.voteDistance} votes behind</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <Shield className="h-4 w-4 mr-1 text-muted-foreground" />
                    Validator Score
                  </span>
                  <span
                    className={
                      validator.score >= 80
                        ? "text-green-500"
                        : validator.score >= 60
                          ? "text-amber-500"
                          : "text-red-500"
                    }
                  >
                    {validator.score}/100
                  </span>
                </div>
                <Progress
                  value={validator.score}
                  className="h-2"
                  indicatorClassName={
                    validator.score >= 80 ? "bg-green-500" : validator.score >= 60 ? "bg-amber-500" : "bg-red-500"
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Based on performance, reliability, and decentralization contribution
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <Percent className="h-4 w-4 mr-1 text-muted-foreground" />
                    Skip Rate
                  </span>
                  <span
                    className={
                      validator.skippedSlots <= 1
                        ? "text-green-500"
                        : validator.skippedSlots <= 5
                          ? "text-amber-500"
                          : "text-red-500"
                    }
                  >
                    {validator.skippedSlots}%
                  </span>
                </div>
                <Progress
                  value={100 - validator.skippedSlots}
                  className="h-2"
                  indicatorClassName={
                    validator.skippedSlots <= 1
                      ? "bg-green-500"
                      : validator.skippedSlots <= 5
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lower skip rate indicates better validator performance
                </p>
              </div>
            </div>

            <div className="flex items-center pt-4">
              <Info className="h-4 w-4 mr-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Data updated {validator.updatedAt}</p>
            </div>

            <Button variant="outline" className="w-full text-sm mt-2">
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Solana Explorer
            </Button>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="h-[200px]">
              <ValidatorPerformanceChart validator={validator} />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-sm">Data Center</span>
                <span className="text-sm font-medium">{validator.dataCenter}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Uptime (30d)</span>
                <span className="text-sm font-medium">{validator.uptime}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Version</span>
                <span className="text-sm font-medium">{validator.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Last Vote</span>
                <span className="text-sm font-medium">{validator.lastVote}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Root Slot</span>
                <span className="text-sm font-medium">{validator.rootSlot}</span>
              </div>
            </div>

            <Button variant="outline" className="w-full text-sm mt-2">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Performance History
            </Button>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Average Rewards (7d)</span>
                <span className="text-sm font-medium text-green-500">+{validator.rewards.daily} SOL/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Epoch Rewards (est.)</span>
                <span className="text-sm font-medium text-green-500">+{validator.rewards.epoch} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Rewards per 1000 SOL</span>
                <span className="text-sm font-medium text-green-500">+{validator.rewards.per1000} SOL/epoch</span>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <h4 className="text-sm font-semibold">Stake Account Distribution</h4>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Account Count</span>
                <span>{validator.stakeAccounts.count}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Average Account Size</span>
                <span>{validator.stakeAccounts.averageSize} SOL</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Largest Account</span>
                <span>{validator.stakeAccounts.largest} SOL</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Superminority Stake</span>
                <span>{validator.stakeAccounts.superminority ? "Yes" : "No"}</span>
              </div>
            </div>

            <Button variant="outline" className="w-full text-sm mt-6">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Staking Analytics
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </>
  )
}
