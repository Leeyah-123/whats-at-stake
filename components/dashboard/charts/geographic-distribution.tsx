"use client"

import { useEffect, useRef, useState } from "react"
import type { GeographicDistribution } from "@/lib/types"

interface GeographicDistributionMapProps {
  data: GeographicDistribution[]
}

export function GeographicDistributionMap({ data }: GeographicDistributionMapProps) {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // Calculate total stake for percentage calculations
  const totalStake = data.reduce((sum, item) => sum + item.stake, 0)

  // Detect theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"))
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    setIsDarkMode(document.documentElement.classList.contains("dark"))

    return () => observer.disconnect()
  }, [])

  // Simple world map visualization
  useEffect(() => {
    if (!mapContainerRef.current) return
    const container = mapContainerRef.current

    // Clear previous content
    container.innerHTML = ""

    // Create map canvas
    const canvas = document.createElement("canvas")
    canvas.width = container.clientWidth
    canvas.height = container.clientHeight
    container.appendChild(canvas)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw background
    ctx.fillStyle = isDarkMode ? "#0f172a" : "#f8fafc"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw world map outlines (simplified)
    ctx.strokeStyle = isDarkMode ? "#334155" : "#cbd5e1"
    ctx.lineWidth = 0.5

    // Very simplified world map outline - in a real implementation use a GeoJSON library
    drawSimplifiedWorldMap(ctx, canvas.width, canvas.height)

    // Plot validator locations
    data.forEach((location) => {
      // Convert lat/long to x,y coordinates
      const x = ((180 + location.longitude) / 360) * canvas.width
      const y = ((90 - location.latitude) / 180) * canvas.height

      // Size based on stake amount
      const stakePercentage = location.stake / totalStake
      const radius = Math.max(4, Math.min(15, 5 + stakePercentage * 100))

      // Color based on count (number of validators)
      const intensity = Math.min(1, location.count / 20)
      const color = location.delinquent
        ? `rgba(239, 68, 68, ${0.5 + intensity * 0.5})`
        : `rgba(124, 58, 237, ${0.5 + intensity * 0.5})`

      // Draw circle for location
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      // Add subtle glow effect
      ctx.beginPath()
      ctx.arc(x, y, radius + 2, 0, Math.PI * 2)
      ctx.fillStyle = location.delinquent ? `rgba(239, 68, 68, 0.2)` : `rgba(124, 58, 237, 0.2)`
      ctx.fill()
    })

    // Add legend
    addLegend(ctx, canvas.width, canvas.height)
  }, [data, isDarkMode])

  function drawSimplifiedWorldMap(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // This is a very simplified representation of continents
    // In a real implementation, use a proper mapping library like Leaflet or MapboxGL

    ctx.beginPath()
    // North America (simplified)
    drawContinent(
      ctx,
      [
        [0.1, 0.2],
        [0.3, 0.2],
        [0.3, 0.4],
        [0.1, 0.4],
      ],
      width,
      height,
    )

    // South America (simplified)
    drawContinent(
      ctx,
      [
        [0.2, 0.5],
        [0.3, 0.5],
        [0.3, 0.8],
        [0.2, 0.8],
      ],
      width,
      height,
    )

    // Europe (simplified)
    drawContinent(
      ctx,
      [
        [0.4, 0.2],
        [0.5, 0.2],
        [0.5, 0.35],
        [0.4, 0.35],
      ],
      width,
      height,
    )

    // Africa (simplified)
    drawContinent(
      ctx,
      [
        [0.4, 0.4],
        [0.5, 0.4],
        [0.5, 0.6],
        [0.4, 0.6],
      ],
      width,
      height,
    )

    // Asia (simplified)
    drawContinent(
      ctx,
      [
        [0.5, 0.2],
        [0.7, 0.2],
        [0.7, 0.5],
        [0.5, 0.5],
      ],
      width,
      height,
    )

    // Australia (simplified)
    drawContinent(
      ctx,
      [
        [0.7, 0.6],
        [0.8, 0.6],
        [0.8, 0.7],
        [0.7, 0.7],
      ],
      width,
      height,
    )

    ctx.stroke()
  }

  function drawContinent(ctx: CanvasRenderingContext2D, points: [number, number][], width: number, height: number) {
    ctx.moveTo(points[0][0] * width, points[0][1] * height)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0] * width, points[i][1] * height)
    }
    ctx.closePath()
  }

  function addLegend(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const legendX = width - 120
    const legendY = height - 80

    ctx.fillStyle = isDarkMode ? "rgba(15, 23, 42, 0.8)" : "rgba(248, 250, 252, 0.8)"
    ctx.fillRect(legendX - 10, legendY - 10, 110, 70)
    ctx.strokeStyle = isDarkMode ? "#334155" : "#cbd5e1"
    ctx.strokeRect(legendX - 10, legendY - 10, 110, 70)

    // Active validators
    ctx.beginPath()
    ctx.arc(legendX, legendY, 6, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(124, 58, 237, 0.8)"
    ctx.fill()

    ctx.fillStyle = isDarkMode ? "#e2e8f0" : "#1e293b"
    ctx.font = "12px sans-serif"
    ctx.fillText("Active validators", legendX + 15, legendY + 4)

    // Delinquent validators
    ctx.beginPath()
    ctx.arc(legendX, legendY + 25, 6, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(239, 68, 68, 0.8)"
    ctx.fill()

    ctx.fillStyle = isDarkMode ? "#e2e8f0" : "#1e293b"
    ctx.fillText("Delinquent", legendX + 15, legendY + 29)
  }

  return (
    <div ref={mapContainerRef} className="w-full h-full relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
      </div>
    </div>
  )
}
