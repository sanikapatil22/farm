const QRCode = require('qrcode');
const os = require('os');

function getLocalIp() {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name] || []) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

class QRService {
    async generateQRCode(productId, batchId, frontendBaseUrl) {
        const code = String(batchId || productId);

        const getBaseUrl = () => {
            if (frontendBaseUrl) {
                return frontendBaseUrl;
            }

            if (process.env.FRONTEND_URL) {
                return process.env.FRONTEND_URL;
            }

            if (process.env.NEXT_PUBLIC_FRONTEND_URL) {
                return process.env.NEXT_PUBLIC_FRONTEND_URL;
            }

            if (process.env.NODE_ENV === 'development') {
                const ip = getLocalIp();
                return `http://${ip}:3000`;
            }

            return 'https://farmchain.com';
        };

        const baseUrl = String(getBaseUrl()).replace(/\/+$/, '');
        const url = `${baseUrl}/verify/${encodeURIComponent(code)}`;
        
        const qrDataUrl = await QRCode.toDataURL(url, {
            width: 300,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' }
        });

        return { code, url, qrDataUrl };
    }

    async generateQRImage(data) {
        return QRCode.toDataURL(data, {
            width: 300,
            margin: 2
        });
    }

    async generateQRBuffer(data) {
        return QRCode.toBuffer(data, {
            width: 300,
            margin: 2
        });
    }
}

module.exports = new QRService();
