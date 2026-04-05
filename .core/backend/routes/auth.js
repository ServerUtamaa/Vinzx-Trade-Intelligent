
import express from 'express';
import CryptoJS from 'crypto-js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// [OMEGA LEVEL SECURITY - BACKEND VAULT]
// This is the isolated vault for membership codes.
// It is NOT accessible from the frontend.
let SECURE_VAULT = {
    // Existing codes (simulated for now, as I can't decrypt the original file)
    // The user provided this new code:
    "3a1f8e9b2c4d5a6b7c8d9e0f1a2b3c4d": {
        tier: "MONTHLY",
        duration: 30 * 24 * 60 * 60 * 1000 // 30 days
    },
    // New 1-month code requested by user
    "vzx-m1-9f8e7d6c5b4a3": {
        tier: "MONTHLY",
        duration: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
};

// Try to load and decrypt codes from encrypted_codes.json
try {
    const encryptedPath = path.join(process.cwd(), 'encrypted_codes.json');
    if (fs.existsSync(encryptedPath)) {
        const rawData = fs.readFileSync(encryptedPath, 'utf8');
        const encryptedData = JSON.parse(rawData);
        
        // Decrypt using the Master Key (from env or hardcoded fallback)
        const masterKey = process.env.ULTRA_SECRET_KEY || '3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a85a';
        
        if (encryptedData.membership) {
            const bytes = CryptoJS.AES.decrypt(encryptedData.membership, masterKey);
            const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
            if (decryptedText) {
                const decrypted = JSON.parse(decryptedText);
                // Merge decrypted codes into vault
                Object.assign(SECURE_VAULT, decrypted);
            }
        }
    }
} catch (error) {
    console.error('Failed to load/decrypt SECURE_VAULT:', error.message);
}

router.post('/verify-membership', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ error: 'Code is required' });

        const membership = SECURE_VAULT[code];
        if (!membership) {
            return res.status(404).json({ error: 'Invalid or expired code' });
        }

        // Calculate expiry
        const expiresAt = Date.now() + membership.duration;

        res.json({
            success: true,
            plan: membership.tier,
            expiresAt: expiresAt
        });
    } catch (error) {
        console.error('Membership Verification Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
