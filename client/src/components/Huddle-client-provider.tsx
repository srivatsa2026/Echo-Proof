'use client';

import { HuddleClient, HuddleProvider } from "@huddle01/react";
import React from "react";

interface HuddleClientProviderProps {
    children: React.ReactNode;
}

export default function HuddleClientProvider({ children }: HuddleClientProviderProps) {
    const huddleClient = new HuddleClient({
        projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
    });

    return (
        <HuddleProvider client={huddleClient}>
            {children}
        </HuddleProvider>
    );
}