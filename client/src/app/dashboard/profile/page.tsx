"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Wallet, Trash2, CreditCard, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getUserDetails, updateUserProfile } from "@/store/reducers/userSlice"
import { useDispatch, useSelector } from "react-redux"
import { useActiveWallet } from "thirdweb/react"

export default function SettingsPage() {
  const dispatch = useDispatch()
  const { toast } = useToast()
  const activeWallet = useActiveWallet()

  const wallet_address = activeWallet?.getAdminAccount?.()?.address ?? ""

  const user_name = useSelector((state: any) => state.user.name)
  const user_email = useSelector((state: any) => state.user.email)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch user details
  useEffect(() => {
    dispatch<any>(getUserDetails())
  }, [dispatch])

  // Sync local state when redux state updates
  useEffect(() => {
    if (user_name) setName(user_name)
    if (user_email) setEmail(user_email)
  }, [user_name, user_email, dispatch])

  const updateProfile = async () => {
    setIsUpdating(true)
    try {
      await dispatch<any>(updateUserProfile({
        name,
        email,
        toast
      }))

      toast({
        title: "Profile Updated",
        description: "Your profile details were successfully updated.",
      })
      setName(user_name)
      setEmail(user_email)
      setIsUpdating(false)
    } catch (err) {
      toast({
        title: "Update Failed",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      })
      setIsUpdating(false)
    }
  }

  const deleteAccount = () => {
    setIsDeleting(true)
    setTimeout(() => {
      setIsDeleting(false)
      toast({
        title: "Account Deletion Requested",
        description: "Your account deletion request has been submitted.",
      })
    }, 1500)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Account Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="md:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Wallet Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Wallet Details</h3>

                {/* Admin Wallet */}
                <Card className="bg-secondary/50 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Admin Wallet</p>
                        <p className="text-xs text-muted-foreground">Main Account Wallet</p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-background rounded-md border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Admin Wallet Address</p>
                      <p className="text-sm font-mono break-all">{wallet_address || "Not connected"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* User Details Form */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">User Details</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  <Button onClick={updateProfile} className="w-full mt-2" disabled={isUpdating}>
                    {isUpdating ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2" />
                        Updating...
                      </span>
                    ) : (
                      "Update Profile"
                    )}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Danger Zone */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Danger Zone</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Account</DialogTitle>
                      <DialogDescription>
                        Are you sure? This action is permanent.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button variant="destructive" onClick={deleteAccount} disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Delete Account"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src="/placeholder.svg?height=96&width=96" />
                  <AvatarFallback>
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-medium">{user_name || "Anonymous"}</h3>
                <p className="text-sm text-muted-foreground mb-2">{user_email || "No email"}</p>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  Free Plan
                </Badge>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Subscription</h3>
                <Card className="bg-secondary/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Free Plan</p>
                        <p className="text-xs text-muted-foreground">Basic features</p>
                      </div>
                    </div>
                    <Button className="w-full mt-4" asChild>
                      <a href="/dashboard/subscription">Upgrade to Pro</a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
