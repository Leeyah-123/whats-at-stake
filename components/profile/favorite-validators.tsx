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
import { useProfile } from "./profile-provider"
import { useState } from "react"
import { Star, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatAddress } from "@/lib/utils"

export function FavoriteValidators() {
  const { profile, removeFavoriteValidator } = useProfile()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Star className="h-4 w-4 mr-2" />
        Favorites
        {profile.favoriteValidators.length > 0 && (
          <Badge variant="secondary" className="ml-2">
            {profile.favoriteValidators.length}
          </Badge>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Favorite Validators</DialogTitle>
            <DialogDescription>Manage your favorite validators for quick access.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {profile.favoriteValidators.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No favorite validators yet. Add validators to your favorites from the validator explorer.
              </div>
            ) : (
              profile.favoriteValidators.map((validator) => (
                <Card key={validator.identity} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{validator.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => removeFavoriteValidator(validator.identity)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{formatAddress(validator.identity)}</span>
                      <Badge variant="outline" className="text-xs">
                        Added {new Date(validator.addedAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
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
