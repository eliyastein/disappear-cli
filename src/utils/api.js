// utils/api.js

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE_URL = 'https://disappear.net/api';

async function postEncryptedPayload(encryptedData) {
    try {
        const response = await fetch(`${API_BASE_URL}/encrypt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ encryptedData })
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Server Response:", data);
            console.log('Success. Please keep your mnemonic safe. You will need it to retrieve your data.');
        } else {
            console.error('Failed to post encrypted data:', response.statusText);
        }
    } catch (error) {
        console.error("Error posting encrypted data:", error);
    }
}

async function getEncryptedPayload(hash) {
    try {
        const response = await fetch(`${API_BASE_URL}/decrypt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ hash })
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Server Response:", data);
            return data;
        } else {
            console.error('Failed to get encrypted data:', response.statusText);
        }
    } catch (error) {
        console.error("Error getting encrypted data:", error);
    }
}

async function checkHash(hash) {
    try {
        const response = await fetch(`${API_BASE_URL}/check-hash`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ hash })
        });

        if (response.ok) {
            const data = await response.json();
            return data.exists;
        } else {
            console.error('Failed to check hash:', response.statusText);
            return false;
        }
    } catch (error) {
        console.error("Error checking hash:", error);
        return false;
    }
}

module.exports = {
    postEncryptedPayload,
    getEncryptedPayload,
    checkHash
};
