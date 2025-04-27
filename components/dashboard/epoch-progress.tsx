import { Progress } from "@/components/ui/progress"
import type { EpochInfo } from "@/lib/types"
import { formatNumber } from "@/lib/utils"
import { Timer } from "lucide-react"

interface EpochProgressProps {
  epochInfo: EpochInfo
}

export function EpochProgress({ epochInfo }: EpochProgressProps) {
  const progressPercentage = Math.round((epochInfo.slotIndex / epochInfo.slotsInEpoch) * 100)

  // Estimate remaining time
  const secondsPerSlot = 0.4 // Solana targets ~400ms per slot
  const remainingSeconds = epochInfo.slotsRemaining * secondsPerSlot
  const remainingHours = Math.floor(remainingSeconds / 3600)
  const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60)

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Current Epoch</h3>
      <div className="text-2xl font-bold">{epochInfo.epoch}</div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>{progressPercentage}%</span>
      </div>
      <Progress value={progressPercentage} className="h-1" />
      <div className="flex items-center text-xs text-muted-foreground mt-1">
        <Timer className="h-3 w-3 mr-1" />
        <span>
          ~{remainingHours}h {remainingMinutes}m remaining
        </span>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Slot {formatNumber(epochInfo.slot)}</span>
        <span>{formatNumber(epochInfo.slotsRemaining)} slots left</span>
      </div>
    </div>
  )
}
