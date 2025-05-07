"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Check, CreditCard, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState("free")
  const [isUpgrading, setIsUpgrading] = useState(false)
  const { toast } = useToast()

  const upgradePlan = () => {
    setIsUpgrading(true)

    // Simulate upgrade process
    setTimeout(() => {
      setIsUpgrading(false)
      setCurrentPlan("pro")

      toast({
        title: "Subscription Upgraded",
        description: "You&apos;ve successfully upgraded to the Pro plan."

      })
    }, 1500)
  }

  const plans = [
    {
      id: "free",
      name: "Free",
      description: "Basic features for individuals",
      price: "$0",
      period: "forever",
      features: [
        "30-minute meeting limit",
        "Up to 5 participants",
        "Basic AI summaries",
        "7-day recording storage",
        "Standard support",
      ],
      limitations: ["No custom branding", "Limited analytics", "No recording downloads"],
    },
    {
      id: "pro",
      name: "Pro",
      description: "Advanced features for teams",
      price: "$15",
      period: "per user / month",
      features: [
        "Unlimited meeting duration",
        "Up to 50 participants",
        "Enhanced AI summaries",
        "30-day recording storage",
        "Priority support",
        "Custom branding",
        "Advanced analytics",
        "Recording downloads",
        "Team management",
      ],
      limitations: [],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription plan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className={`overflow-hidden h-full ${currentPlan === plan.id ? "border-primary" : ""}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                  {currentPlan === plan.id && <Badge>Current Plan</Badge>}
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.1 + i * 0.05 }}
                    >
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </motion.li>
                  ))}

                  {plan.limitations.map((limitation, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start text-muted-foreground"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.1 + (plan.features.length + i) * 0.05 }}
                    >
                      <span className="h-5 w-5 border-2 rounded-full mr-2 mt-0.5 shrink-0" />
                      <span>{limitation}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.id === "free" ? (
                  currentPlan === "free" ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <Zap className="mr-2 h-4 w-4" />
                          Upgrade to Pro
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Upgrade to Pro Plan</DialogTitle>
                          <DialogDescription>Unlock all features with our Pro plan.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="rounded-lg bg-secondary/50 p-4">
                            <div className="flex justify-between mb-2">
                              <span>Pro Plan (Monthly)</span>
                              <span>$15.00</span>
                            </div>
                            <div className="text-sm text-muted-foreground">Billed monthly. Cancel anytime.</div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Payment Method</h4>
                            <div className="rounded-md border p-3 flex items-center">
                              <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm">Add payment method</span>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={upgradePlan} disabled={isUpgrading} className="w-full">
                            {isUpgrading ? (
                              <span className="flex items-center">
                                <svg
                                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Processing...
                              </span>
                            ) : (
                              "Upgrade Now"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button variant="outline" className="w-full">
                      Current Plan
                    </Button>
                  )
                ) : currentPlan === "pro" ? (
                  <Button variant="outline" className="w-full">
                    Current Plan
                  </Button>
                ) : (
                  <Button className="w-full" disabled>
                    Upgrade
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>View your past invoices and payment history</CardDescription>
          </CardHeader>
          <CardContent>
            {currentPlan === "pro" ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-md border">
                  <div>
                    <p className="font-medium">Pro Plan</p>
                    <p className="text-sm text-muted-foreground">Apr 15, 2023</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$15.00</p>
                    <p className="text-xs text-muted-foreground">Paid</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 rounded-md border">
                  <div>
                    <p className="font-medium">Pro Plan</p>
                    <p className="text-sm text-muted-foreground">Mar 15, 2023</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$15.00</p>
                    <p className="text-xs text-muted-foreground">Paid</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Billing History</h3>
                <p className="text-muted-foreground max-w-sm">
                  You&apos;re currently on the Free plan. Upgrade to Pro to view your billing history.
                </p>

              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
