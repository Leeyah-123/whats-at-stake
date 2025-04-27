"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useProfile } from "./profile-provider"
import { useState } from "react"
import { Settings } from "lucide-react"

export function ProfileSettings() {
  const { profile, updateProfile } = useProfile()
  const [open, setOpen] = useState(false)

  const handleThemeChange = (value: string) => {
    updateProfile({ theme: value as "dark" | "light" | "system" })
  }

  const handleRefreshIntervalChange = (value: string) => {
    updateProfile({ refreshInterval: Number.parseInt(value) })
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Settings className="h-4 w-4 mr-2" />
        Settings
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Dashboard Settings</DialogTitle>
            <DialogDescription>
              Customize your dashboard experience. Settings are saved automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="theme" className="text-right">
                Theme
              </Label>
              <Select value={profile.theme} onValueChange={handleThemeChange}>
                <SelectTrigger id="theme" className="col-span-3">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="refresh" className="text-right">
                Refresh Interval
              </Label>
              <Select value={profile.refreshInterval.toString()} onValueChange={handleRefreshIntervalChange}>
                <SelectTrigger id="refresh" className="col-span-3">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                  <SelectItem value="600">10 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="auto-refresh" className="text-right">
                Auto Refresh
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="auto-refresh"
                  checked={profile.refreshInterval > 0}
                  onCheckedChange={(checked) => {
                    updateProfile({ refreshInterval: checked ? 60 : 0 })
                  }}
                />
                <Label htmlFor="auto-refresh">Enable automatic data refresh</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
