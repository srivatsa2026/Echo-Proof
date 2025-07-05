'use client'

import { Sparkles } from 'lucide-react'
import React, { useState, useCallback } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog'
import { Message } from '@/app/chatroom/[id]/page'
import GenerateSummary from '@/lib/generate-summary'

interface ShowSummaryProps {
    showSummary: boolean;
    setShowSummary: React.Dispatch<React.SetStateAction<boolean>>;
    messages: Message[];
}

export default function ShowSummary({ showSummary, setShowSummary, messages }: ShowSummaryProps) {
    const [summary, setSummary] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const fetchSummary = useCallback(async () => {
        try {
            setIsLoading(true);
            setSummary("");
            const response: any = await GenerateSummary(messages);
            setSummary(response);
        } catch (error) {
            console.error('Error generating summary:', error);
            setSummary("");
        } finally {
            setIsLoading(false);
        }
    }, [messages]);

    // Auto-generate summary when messages change and dialog is open
    React.useEffect(() => {
        if (showSummary && messages.length > 0) {
            fetchSummary();
        }
    }, [showSummary, messages, fetchSummary]);

    // Reset summary when dialog opens
    React.useEffect(() => {
        if (showSummary) {
            setSummary("");
        }
    }, [showSummary]);

    const renderSummaryContent = () => {
        if (isLoading) {
            return (
                <Card>
                    <CardContent className="pt-4">
                        <h4 className="font-medium mb-2">Generating Summary...</h4>
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                            AI is analyzing the conversation...
                        </p>
                    </CardContent>
                </Card>
            );
        }

        if (!summary) {
            return (
                <Card>
                    <CardContent className="pt-4">
                        <h4 className="font-medium mb-2">Generate Summary</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            Click the button below to generate an AI summary of this conversation.
                        </p>
                        <Button
                            onClick={fetchSummary}
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? 'Generating...' : 'Generate Summary'}
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        const [participantsSection, summarySection] = summary.split('---').map(section => section.trim());
        const participants = participantsSection?.replace('PARTICIPANTS:', '').trim() || "No participants found.";
        const summaryText = summarySection?.replace('CONVERSATION SUMMARY:', '').trim() || "Summary section missing.";

        return (
            <div className="space-y-4">
                <Card>
                    <CardContent className="pt-4">
                        <h4 className="font-medium mb-2">Participants</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {participants}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <h4 className="font-medium mb-2">Conversation Summary</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-4">
                            {summaryText}
                        </p>
                        <Button
                            onClick={fetchSummary}
                            disabled={isLoading}
                            size="sm"
                            variant="outline"
                        >
                            {isLoading ? 'Regenerating...' : 'Regenerate Summary'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    };

    // Calculate content-based sizing
    const getDialogSize = () => {
        if (!summary) {
            return "max-w-lg"; // Increased size for generate button
        }

        const contentLength = summary.length;
        if (contentLength < 500) {
            return "max-w-xl";
        } else if (contentLength < 1500) {
            return "max-w-3xl";
        } else {
            return "max-w-5xl";
        }
    };

    return (
        <Dialog open={showSummary} onOpenChange={setShowSummary}>
            <DialogContent className={`${getDialogSize()} max-h-[85vh] overflow-hidden`}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        AI Summary
                    </DialogTitle>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[calc(85vh-8rem)] pr-2">
                    {renderSummaryContent()}
                </div>
            </DialogContent>
        </Dialog>
    )
}