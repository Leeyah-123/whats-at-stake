"use client"

import { useStaking } from "../providers/staking-provider"
import { RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useProfile } from "../profile/profile-provider"

export function DataRefreshIndicator() {
  const { refreshData, lastUpdated, isRefreshing } = useStaking()
  const { profile } = useProfile()

  // Format the last updated time
  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "Never"

  // Calculate time until next refresh
  const getTimeUntilNextRefresh = () => {
    if (profile.refreshInterval <= 0 || !lastUpdated) return "Manual refresh only"

    const nextRefresh = new Date(lastUpdated.getTime() + profile.refreshInterval * 1000)
    const now = new Date()
    const diffMs = nextRefresh.getTime() - now.getTime()

    if (diffMs <= 0) return "Refreshing soon..."

    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return `in ${diffSec}s`
    return `in ${Math.floor(diffSec / 60)}m ${diffSec % 60}s`
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshData()}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden md:inline">{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <p>Last updated: {formattedTime}</p>
            <p>Next refresh: {getTimeUntilNextRefresh()}</p>
            {profile.refreshInterval > 0 && <p>Auto-refresh: Every {profile.refreshInterval} seconds</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
