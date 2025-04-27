"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWallet } from "./wallet-provider"
import { Copy, ExternalLink, LogOut, Wallet } from "lucide-react"
import { formatAddress, formatNumber } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export function WalletDetails() {
  const { publicKey, balance, walletName, disconnect } = useWallet()
  const { toast } = useToast()

  if (!publicKey) return null

  const copyAddress = () => {
    navigator.clipboard.writeText(publicKey)
    toast({
      title: "Address copied",
      description: "Wallet address copied to clipboard",
    })
  }

  const openExplorer = () => {
    window.open(`https://explorer.solana.com/address/${publicKey}`, "_blank")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[140px]">
          <Wallet className="mr-2 h-4 w-4" />
          {formatAddress(publicKey)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px]">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{walletName}</span>
            <span className="text-xs text-muted-foreground">{formatAddress(publicKey, 8)}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex justify-between">
          <span>Balance</span>
          <span className="font-medium">{balance !== null ? `${formatNumber(balance)} SOL` : "Loading..."}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyAddress}>
          <Copy className="mr-2 h-4 w-4" />
          Copy address
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openExplorer}>
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => disconnect()}>
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
