const axios = require('axios');

/**
 * Fetches the ABI for a contract from Etherscan.
 * @param {string} contractAddress - The contract address.
 * @param {string} apiKey - The Etherscan API key.
 * @param {string} [network='sepolia'] - The Ethereum network (default: sepolia).
 * @returns {Promise<Object|null>} The ABI as a JSON object, or null if not found.
 */
async function getContractAbi(contractAddress, apiKey, network = 'sepolia') {
    let baseUrl;
    switch (network) {
        case 'mainnet':
            baseUrl = 'https://api.etherscan.io/api';
            break;
        case 'sepolia':
            baseUrl = 'https://api-sepolia.etherscan.io/api';
            break;
        case 'goerli':
            baseUrl = 'https://api-goerli.etherscan.io/api';
            break;
        default:
            throw new Error(`Unsupported network: ${network}`);
    }
    const url = `${baseUrl}?module=contract&action=getabi&address=${contractAddress}&apikey=${apiKey}`;
    try {
        const response = await axios.get(url);
        const data = response.data;
        if (data.status === '1' && data.result) {
            return JSON.parse(data.result);
        } else {
            console.error(`Etherscan API error: ${data.message} | ${data.result}`);
            return null;
        }
    } catch (error) {
        console.error('Error fetching contract ABI:', error);
        return null;
    }
}

module.exports = { getContractAbi }; 