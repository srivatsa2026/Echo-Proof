"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { encryptMessage, decryptMessage, simpleEncrypt, simpleDecrypt } from "@/lib/lit-encryption"
import { encryptMessage, decryptMessage, simpleEncrypt, simpleDecrypt } from "@/lib/simple-encryption"
import { useActiveWallet } from "thirdweb/react"

export default function EncryptionTest() {
    const [originalMessage, setOriginalMessage] = useState("Hello, this is a test message!")
    const [encryptedMessage, setEncryptedMessage] = useState("")
    const [decryptedMessage, setDecryptedMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isClient, setIsClient] = useState(false)

    const wallet = useActiveWallet()
    const walletAddress = wallet?.getAccount()?.address || "test-wallet"

    useEffect(() => {
        setIsClient(true)
    }, [])

    const testSimpleEncryption = () => {
        const chatroomId = "test-chatroom-123"
        const encrypted = simpleEncrypt(originalMessage, chatroomId)
        const decrypted = simpleDecrypt(encrypted, chatroomId)

        setEncryptedMessage(encrypted)
        setDecryptedMessage(decrypted)
    }

    const testLitEncryption = async () => {
        setIsLoading(true)
        try {
            const chatroomId = "test-chatroom-123"

            // Encrypt
            const { encryptedMessage: encrypted, encryptedSymmetricKey } = await encryptMessage(
                originalMessage,
                chatroomId,
                wallet,
                walletAddress
            )

            // Decrypt
            const decrypted = await decryptMessage(
                encrypted,
                encryptedSymmetricKey,
                chatroomId,
                wallet,
                walletAddress
            )

            setEncryptedMessage(encrypted)
            setDecryptedMessage(decrypted)
        } catch (error) {
            console.error("Encryption test failed:", error)
            setDecryptedMessage("Error: " + (error as Error).message)
        } finally {
            setIsLoading(false)
        }
    }

    if (!isClient) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Lit Protocol Encryption Test</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center">Loading...</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Lit Protocol Encryption Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Original Message:</label>
                    <Input
                        value={originalMessage}
                        onChange={(e) => setOriginalMessage(e.target.value)}
                        placeholder="Enter a message to encrypt"
                    />
                </div>

                <div className="flex gap-2">
                    <Button onClick={testSimpleEncryption} variant="outline">
                        Test Simple Encryption
                    </Button>
                    <Button onClick={testLitEncryption} disabled={isLoading}>
                        {isLoading ? "Testing..." : "Test Lit Protocol"}
                    </Button>
                </div>

                {encryptedMessage && (
                    <div>
                        <label className="text-sm font-medium">Encrypted Message:</label>
                        <div className="p-2 bg-gray-100 rounded text-xs font-mono break-all">
                            {encryptedMessage}
                        </div>
                    </div>
                )}

                {decryptedMessage && (
                    <div>
                        <label className="text-sm font-medium">Decrypted Message:</label>
                        <div className="p-2 bg-green-100 rounded">
                            {decryptedMessage}
                        </div>
                    </div>
                )}

                <div className="text-xs text-gray-500">
                    <p>• Simple encryption uses XOR with chatroom ID as key</p>
                    <p>• Lit Protocol encryption uses decentralized key management</p>
                    <p>• Both methods ensure messages are encrypted before sending to server</p>
                </div>
            </CardContent>
        </Card>
    )
} 