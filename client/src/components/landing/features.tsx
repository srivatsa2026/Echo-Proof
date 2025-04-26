"use client"

import { motion } from "framer-motion"
import { MessageSquare, Video, Calendar, FileText, Shield, Zap } from "lucide-react"

export function LandingFeatures() {
  const features = [
    {
      icon: <MessageSquare className="h-10 w-10" />,
      title: "Secure Chatrooms",
      description: "Create private chatrooms for team discussions with end-to-end encryption.",
    },
    {
      icon: <Video className="h-10 w-10" />,
      title: "Video Meetings",
      description: "Host high-quality video conferences with screen sharing capabilities.",
    },
    {
      icon: <Calendar className="h-10 w-10" />,
      title: "Schedule Sessions",
      description: "Plan ahead with our intuitive scheduling system for meetings and events.",
    },
    {
      icon: <FileText className="h-10 w-10" />,
      title: "AI Summaries",
      description: "Get intelligent summaries of your meetings powered by advanced AI.",
    },
    {
      icon: <Shield className="h-10 w-10" />,
      title: "Decentralized Security",
      description: "Your data stays private with our decentralized architecture.",
    },
    {
      icon: <Zap className="h-10 w-10" />,
      title: "Instant Meetings",
      description: "Start impromptu meetings with a single click, no scheduling required.",
    },
  ]

  return (
    <section className="py-20 bg-secondary/20" id="features">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Powerful Features
          </motion.h2>
          <motion.p
            className="text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Everything you need for seamless communication and collaboration
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-card rounded-xl p-6 border border-border/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, boxShadow: "0 10px 30px -15px rgba(249, 115, 22, 0.3)" }}
            >
              <div className="mb-4 text-primary">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
