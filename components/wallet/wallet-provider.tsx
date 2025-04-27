"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
  useWallet as useSolanaWallet,
} from "@solana/wallet-adapter-react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { clusterApiUrl } from "@solana/web3.js"
import { useLocalStorage } from "@/hooks/use-local-storage"

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css"

type WalletContextType = {
  connected: boolean
  connecting: boolean
  publicKey: string | null
  walletName: string | null
  balance: number | null
  network: WalletAdapterNetwork
  setNetwork: (network: WalletAdapterNetwork) => void
  endpoint: string
  disconnect: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletContextProvider({ children }: { children: ReactNode }) {
  const [network, setNetwork] = useLocalStorage<WalletAdapterNetwork>("solana-network", WalletAdapterNetwork.Mainnet)

  // You can add more endpoints for better reliability
  const endpoint = clusterApiUrl(network)

  // Initialize wallet adapters - using only the most common and stable ones
  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()]

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContextInner network={network} setNetwork={setNetwork} endpoint={endpoint}>
            {children}
          </WalletContextInner>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  )
}

function WalletContextInner({
  children,
  network,
  setNetwork,
  endpoint,
}: {
  children: ReactNode
  network: WalletAdapterNetwork
  setNetwork: (network: WalletAdapterNetwork) => void
  endpoint: string
}) {
  const { connected, connecting, publicKey, wallet, disconnect: solanaDisconnect } = useSolanaWallet()

  const [balance, setBalance] = useState<number | null>(null)

  // Get wallet balance when connected
  useEffect(() => {
    if (!connected || !publicKey) {
      setBalance(null)
      return
    }

    const getBalance = async () => {
      try {
        const connection = new (window as any).solanaWeb3.Connection(endpoint)
        const balance = await connection.getBalance(publicKey)
        setBalance(balance / 1000000000) // Convert lamports to SOL
      } catch (error) {
        console.error("Failed to fetch balance:", error)
        setBalance(null)
      }
    }

    getBalance()
    const intervalId = setInterval(getBalance, 30000) // Update every 30 seconds

    return () => clearInterval(intervalId)
  }, [connected, publicKey, endpoint])

  const disconnect = async () => {
    try {
      await solanaDisconnect()
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    }
  }

  const value = {
    connected,
    connecting,
    publicKey: publicKey?.toString() || null,
    walletName: wallet?.adapter.name || null,
    balance,
    network,
    setNetwork,
    endpoint,
    disconnect,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletContextProvider")
  }
  return context
}
