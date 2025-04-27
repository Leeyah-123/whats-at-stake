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
import { Check, Globe } from "lucide-react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"

export function NetworkSelector() {
  const { network, setNetwork } = useWallet()

  const networks = [
    { name: "Mainnet", value: WalletAdapterNetwork.Mainnet },
    { name: "Devnet", value: WalletAdapterNetwork.Devnet },
    { name: "Testnet", value: WalletAdapterNetwork.Testnet },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Globe className="mr-2 h-4 w-4" />
          {networks.find((n) => n.value === network)?.name || "Network"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Select Network</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {networks.map((n) => (
          <DropdownMenuItem
            key={n.value}
            onClick={() => setNetwork(n.value)}
            className="flex items-center justify-between"
          >
            {n.name}
            {network === n.value && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
