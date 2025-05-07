'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import React from 'react'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import { Card, CardContent } from '../ui/card'

// TypeScript types for the props
interface ShowSummaryProps {
    showSummary: boolean;
    setShowSummary: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ShowSummary({ showSummary, setShowSummary }: ShowSummaryProps) {
    return (
        <AnimatePresence>
            {showSummary && (
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 320, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-l border-border overflow-hidden bg-background"
                >
                    <div className="p-4 border-b border-border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <h3 className="font-medium">AI Summary</h3>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowSummary(false)}
                                aria-label="Close summary"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <ScrollArea className="h-full p-4">
                        <div className="space-y-4">
                            <Card>
                                <CardContent className="pt-4">
                                    <h4 className="font-medium mb-2">Key Points</h4>
                                    <ul className="space-y-1 text-sm list-disc list-inside text-muted-foreground">
                                        <li>Summarized insights generated using AI for quick review.</li>
                                        <li>Each point is relevant to the selected content or discussion.</li>
                                        <li>Click on a point for deeper context (coming soon).</li>
                                        <li>Summaries are verifiable and timestamped on the blockchain.</li>
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4">
                                    <h4 className="font-medium mb-2">Summary Text</h4>
                                    <p className="text-sm text-muted-foreground">
                                        This AI-generated summary condenses the conversation to its essential elements,
                                        allowing for quick understanding and easy sharing. All summaries are securely
                                        verified and stored for transparency.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </ScrollArea>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
