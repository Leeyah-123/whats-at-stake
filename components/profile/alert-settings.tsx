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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useProfile, type AlertSetting } from "./profile-provider"
import { useState } from "react"
import { Bell, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function AlertSettings() {
  const { profile, addAlert, removeAlert, toggleAlert } = useProfile()
  const [open, setOpen] = useState(false)
  const [newAlert, setNewAlert] = useState({
    type: "validator",
    condition: "delinquent",
    value: "",
    enabled: true,
  })

  const handleAddAlert = () => {
    addAlert(newAlert)
    setNewAlert({
      type: "validator",
      condition: "delinquent",
      value: "",
      enabled: true,
    })
  }

  const getAlertDescription = (alert: AlertSetting) => {
    switch (alert.type) {
      case "validator":
        switch (alert.condition) {
          case "delinquent":
            return "Alert when validator becomes delinquent"
          case "commission_change":
            return "Alert when validator changes commission"
          case "score_below":
            return `Alert when validator score falls below ${alert.value}`
          default:
            return "Validator alert"
        }
      case "network":
        switch (alert.condition) {
          case "delinquency_above":
            return `Alert when network delinquency rate exceeds ${alert.value}%`
          case "stake_concentration":
            return "Alert when stake becomes too concentrated"
          default:
            return "Network alert"
        }
      case "stake":
        switch (alert.condition) {
          case "apy_below":
            return `Alert when APY falls below ${alert.value}%`
          case "rewards_ready":
            return "Alert when staking rewards are ready to claim"
          default:
            return "Stake alert"
        }
      default:
        return "Custom alert"
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Bell className="h-4 w-4 mr-2" />
        Alerts
        {profile.alerts.length > 0 && (
          <Badge variant="secondary" className="ml-2">
            {profile.alerts.length}
          </Badge>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Alert Settings</DialogTitle>
            <DialogDescription>Set up alerts for important events in the Solana staking ecosystem.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {profile.alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No alerts configured. Add your first alert below.
              </div>
            ) : (
              profile.alerts.map((alert) => (
                <Card key={alert.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
                      </CardTitle>
                      <Switch checked={alert.enabled} onCheckedChange={() => toggleAlert(alert.id)} />
                    </div>
                    <CardDescription>{getAlertDescription(alert)}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="capitalize">
                        {alert.condition.replace("_", " ")}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => removeAlert(alert.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Add New Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="alert-type">Alert Type</Label>
                      <Select
                        value={newAlert.type}
                        onValueChange={(value) => setNewAlert({ ...newAlert, type: value as any, condition: "" })}
                      >
                        <SelectTrigger id="alert-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="validator">Validator</SelectItem>
                          <SelectItem value="network">Network</SelectItem>
                          <SelectItem value="stake">Stake</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alert-condition">Condition</Label>
                      <Select
                        value={newAlert.condition}
                        onValueChange={(value) => setNewAlert({ ...newAlert, condition: value })}
                      >
                        <SelectTrigger id="alert-condition">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {newAlert.type === "validator" && (
                            <>
                              <SelectItem value="delinquent">Becomes Delinquent</SelectItem>
                              <SelectItem value="commission_change">Commission Change</SelectItem>
                              <SelectItem value="score_below">Score Below Threshold</SelectItem>
                            </>
                          )}
                          {newAlert.type === "network" && (
                            <>
                              <SelectItem value="delinquency_above">High Delinquency Rate</SelectItem>
                              <SelectItem value="stake_concentration">Stake Concentration</SelectItem>
                            </>
                          )}
                          {newAlert.type === "stake" && (
                            <>
                              <SelectItem value="apy_below">APY Below Threshold</SelectItem>
                              <SelectItem value="rewards_ready">Rewards Ready</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {(newAlert.condition === "score_below" ||
                    newAlert.condition === "delinquency_above" ||
                    newAlert.condition === "apy_below") && (
                    <div className="space-y-2">
                      <Label htmlFor="alert-value">Threshold Value</Label>
                      <Input
                        id="alert-value"
                        type="number"
                        value={newAlert.value.toString()}
                        onChange={(e) => setNewAlert({ ...newAlert, value: e.target.value })}
                        placeholder="Enter threshold value"
                      />
                    </div>
                  )}

                  <Button onClick={handleAddAlert} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Alert
                  </Button>
                </div>
              </CardContent>
            </Card>
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
