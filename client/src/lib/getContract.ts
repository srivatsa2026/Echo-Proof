import { getContract } from "thirdweb"
import { ethers } from "ethers"
import { client } from "@/app/client"
import { sepolia } from "thirdweb/chains"

// Export a function to get the contract instance
export const getEchoContract = (): any => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string
    console.log("Contract Address:", contractAddress)
    const contract = getContract({
        client,
        address: contractAddress,
        chain: sepolia
    })
    return contract
}

