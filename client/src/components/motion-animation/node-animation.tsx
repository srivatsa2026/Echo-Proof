"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

export function BlockchainAnimation() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set canvas dimensions
        const setCanvasDimensions = () => {
            const container = canvas.parentElement
            if (container) {
                canvas.width = container.clientWidth
                canvas.height = container.clientHeight
            } else {
                canvas.width = 500
                canvas.height = 500
            }
        }

        setCanvasDimensions()
        window.addEventListener("resize", setCanvasDimensions)

        // Create nodes
        const nodeCount = 12
        const nodes: {
            x: number
            y: number
            radius: number
            vx: number
            vy: number
            connections: number[]
            type: "server" | "peer" | "supernode"
            active: boolean
            lastActive: number
            color: string
            pulseRadius: number
            pulseOpacity: number
        }[] = []

        // Create a mix of different node types
        for (let i = 0; i < nodeCount; i++) {
            // Determine node type
            let type: "server" | "peer" | "supernode"
            if (i === 0) {
                type = "server" // One central server
            } else if (i % 5 === 0) {
                type = "supernode" // Some supernodes
            } else {
                type = "peer" // Regular peers
            }

            // Assign different colors based on node type
            let color
            switch (type) {
                case "server":
                    color = "#FF6600"
                    break
                case "supernode":
                    color = "#FF8800"
                    break
                default:
                    color = "#FFAA00"
            }

            nodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: type === "server" ? 10 : type === "supernode" ? 7 : 5,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                connections: [],
                type,
                active: false,
                lastActive: 0,
                color,
                pulseRadius: 0,
                pulseOpacity: 0,
            })
        }

        // Create P2P network topology
        // Server connects to supernodes
        for (let i = 0; i < nodeCount; i++) {
            if (nodes[i].type === "supernode") {
                nodes[0].connections.push(i)
                nodes[i].connections.push(0)
            }
        }

        // Supernodes connect to peers
        for (let i = 0; i < nodeCount; i++) {
            if (nodes[i].type === "supernode") {
                for (let j = 0; j < nodeCount; j++) {
                    if (nodes[j].type === "peer" && Math.random() > 0.5) {
                        nodes[i].connections.push(j)
                        nodes[j].connections.push(i)
                    }
                }
            }
        }

        // Peers connect to other peers
        for (let i = 0; i < nodeCount; i++) {
            if (nodes[i].type === "peer") {
                for (let j = 0; j < nodeCount; j++) {
                    if (i !== j && nodes[j].type === "peer" && Math.random() > 0.8) {
                        if (!nodes[i].connections.includes(j)) {
                            nodes[i].connections.push(j)
                            nodes[j].connections.push(i)
                        }
                    }
                }
            }
        }

        // Animation loop
        let animationFrameId: number
        let time = 0
        let lastCommunicationTime = 0

        // Data packets for visualization
        type DataPacket = {
            fromNode: number
            toNode: number
            progress: number
            size: number
            color: string
            active: boolean
        }

        const dataPackets: DataPacket[] = []

        const animate = () => {
            time += 0.01
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Trigger new communication every few seconds
            if (time - lastCommunicationTime > 1.5) {
                lastCommunicationTime = time

                // Select random source node
                const sourceIndex = Math.floor(Math.random() * nodeCount)
                const sourceNode = nodes[sourceIndex]

                // Activate the source node
                sourceNode.active = true
                sourceNode.lastActive = time
                sourceNode.pulseRadius = 0
                sourceNode.pulseOpacity = 1

                // If it has connections, send data to connected nodes
                if (sourceNode.connections.length > 0) {
                    // Send to 1-3 random connections
                    const numTargets = Math.floor(Math.random() * 3) + 1
                    const shuffledConnections = [...sourceNode.connections].sort(() => Math.random() - 0.5)

                    for (let i = 0; i < Math.min(numTargets, shuffledConnections.length); i++) {
                        const targetIndex = shuffledConnections[i]

                        // Create a new data packet
                        dataPackets.push({
                            fromNode: sourceIndex,
                            toNode: targetIndex,
                            progress: 0,
                            size: 2 + Math.random() * 2,
                            color: sourceNode.color,
                            active: true,
                        })
                    }
                }
            }

            // Draw connections
            for (let i = 0; i < nodeCount; i++) {
                const node = nodes[i]

                // Update node position with slight movement
                node.x += node.vx
                node.y += node.vy

                // Bounce off walls
                if (node.x < node.radius || node.x > canvas.width - node.radius) {
                    node.vx *= -1
                }
                if (node.y < node.radius || node.y > canvas.height - node.radius) {
                    node.vy *= -1
                }

                // Update pulse effect if node is active
                if (node.active) {
                    node.pulseRadius += 0.5
                    node.pulseOpacity -= 0.02

                    if (node.pulseOpacity <= 0) {
                        node.active = false
                        node.pulseOpacity = 0
                    }
                }

                // Draw connections
                for (const connectedNodeIndex of node.connections) {
                    // Only draw connection once (from lower index to higher index)
                    if (i < connectedNodeIndex) {
                        const connectedNode = nodes[connectedNodeIndex]

                        // Calculate distance
                        const dx = connectedNode.x - node.x
                        const dy = connectedNode.y - node.y
                        const distance = Math.sqrt(dx * dx + dy * dy)

                        // Determine if this connection is active (has data packets)
                        const isActive = dataPackets.some(
                            (p) =>
                                (p.fromNode === i && p.toNode === connectedNodeIndex) ||
                                (p.fromNode === connectedNodeIndex && p.toNode === i),
                        )

                        // Draw connection line with gradient
                        const gradient = ctx.createLinearGradient(node.x, node.y, connectedNode.x, connectedNode.y)

                        if (isActive) {
                            // Brighter connection when active
                            gradient.addColorStop(0, `rgba(255, 102, 0, 0.8)`)
                            gradient.addColorStop(1, `rgba(255, 136, 0, 0.8)`)
                            ctx.lineWidth = 1.5
                        } else {
                            // Dimmer connection when inactive
                            gradient.addColorStop(0, `rgba(255, 102, 0, 0.3)`)
                            gradient.addColorStop(1, `rgba(255, 136, 0, 0.3)`)
                            ctx.lineWidth = 0.8
                        }

                        ctx.beginPath()
                        ctx.moveTo(node.x, node.y)
                        ctx.lineTo(connectedNode.x, connectedNode.y)
                        ctx.strokeStyle = gradient
                        ctx.stroke()
                    }
                }
            }

            // Update and draw data packets
            for (let i = dataPackets.length - 1; i >= 0; i--) {
                const packet = dataPackets[i]

                if (packet.active) {
                    // Update progress
                    packet.progress += 0.01

                    if (packet.progress >= 1) {
                        // Packet reached destination
                        packet.active = false

                        // Activate the destination node
                        nodes[packet.toNode].active = true
                        nodes[packet.toNode].lastActive = time
                        nodes[packet.toNode].pulseRadius = 0
                        nodes[packet.toNode].pulseOpacity = 1

                        // Sometimes create a response packet
                        if (Math.random() > 0.5) {
                            dataPackets.push({
                                fromNode: packet.toNode,
                                toNode: packet.fromNode,
                                progress: 0,
                                size: 2 + Math.random() * 2,
                                color: nodes[packet.toNode].color,
                                active: true,
                            })
                        }

                        // Sometimes propagate to other nodes (P2P sharing)
                        if (Math.random() > 0.7) {
                            const sourceNode = nodes[packet.toNode]
                            if (sourceNode.connections.length > 0) {
                                // Pick a random connection that isn't the original sender
                                const availableConnections = sourceNode.connections.filter((idx) => idx !== packet.fromNode)
                                if (availableConnections.length > 0) {
                                    const targetIndex = availableConnections[Math.floor(Math.random() * availableConnections.length)]

                                    dataPackets.push({
                                        fromNode: packet.toNode,
                                        toNode: targetIndex,
                                        progress: 0,
                                        size: packet.size * 0.9, // Slightly smaller packet
                                        color: sourceNode.color,
                                        active: true,
                                    })
                                }
                            }
                        }
                    }

                    if (packet.active) {
                        // Draw the packet
                        const fromNode = nodes[packet.fromNode]
                        const toNode = nodes[packet.toNode]

                        const x = fromNode.x + (toNode.x - fromNode.x) * packet.progress
                        const y = fromNode.y + (toNode.y - fromNode.y) * packet.progress

                        // Draw packet
                        ctx.beginPath()
                        ctx.arc(x, y, packet.size, 0, Math.PI * 2)
                        ctx.fillStyle = packet.color
                        ctx.fill()

                        // Draw packet glow
                        ctx.beginPath()
                        ctx.arc(x, y, packet.size + 3, 0, Math.PI * 2)
                        ctx.fillStyle = `rgba(255, 102, 0, 0.3)`
                        ctx.fill()
                    }
                }
            }

            // Remove inactive packets
            while (dataPackets.length > 0 && !dataPackets[0].active) {
                dataPackets.shift()
            }

            // Draw nodes
            for (const node of nodes) {
                // Draw pulse effect if active
                if (node.pulseOpacity > 0) {
                    ctx.beginPath()
                    ctx.arc(node.x, node.y, node.radius + node.pulseRadius, 0, Math.PI * 2)
                    ctx.fillStyle = `rgba(255, 102, 0, ${node.pulseOpacity})`
                    ctx.fill()
                }

                // Draw node based on type
                if (node.type === "server") {
                    // Server node (hexagon)
                    const size = node.radius * 1.2
                    ctx.beginPath()
                    for (let i = 0; i < 6; i++) {
                        const angle = (Math.PI / 3) * i
                        const x = node.x + size * Math.cos(angle)
                        const y = node.y + size * Math.sin(angle)
                        if (i === 0) ctx.moveTo(x, y)
                        else ctx.lineTo(x, y)
                    }
                    ctx.closePath()
                    ctx.fillStyle = node.color
                    ctx.fill()

                    // Inner details
                    ctx.beginPath()
                    ctx.arc(node.x, node.y, node.radius * 0.5, 0, Math.PI * 2)
                    ctx.fillStyle = "#FFF"
                    ctx.fill()
                } else if (node.type === "supernode") {
                    // Supernode (diamond)
                    const size = node.radius * 1.2
                    ctx.beginPath()
                    ctx.moveTo(node.x, node.y - size)
                    ctx.lineTo(node.x + size, node.y)
                    ctx.lineTo(node.x, node.y + size)
                    ctx.lineTo(node.x - size, node.y)
                    ctx.closePath()
                    ctx.fillStyle = node.color
                    ctx.fill()
                } else {
                    // Regular peer node (circle)
                    ctx.beginPath()
                    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
                    ctx.fillStyle = node.color
                    ctx.fill()

                    // Add inner ring for visual interest
                    ctx.beginPath()
                    ctx.arc(node.x, node.y, node.radius * 0.6, 0, Math.PI * 2)
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
                    ctx.lineWidth = 1
                    ctx.stroke()
                }

                // Add subtle glow effect
                const glow = Math.sin(time * 2 + node.x + node.y) * 0.3 + 0.7
                ctx.beginPath()
                ctx.arc(node.x, node.y, node.radius * 1.5, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(255, 102, 0, ${0.1 * glow})`
                ctx.fill()
            }

            animationFrameId = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener("resize", setCanvasDimensions)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <motion.div
            className="w-full h-[400px] md:h-[500px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
        >
            <canvas ref={canvasRef} className="w-full h-full" />
        </motion.div>
    )
}
