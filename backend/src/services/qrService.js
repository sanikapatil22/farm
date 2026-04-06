const QRCode = require('qrcode');

class QRService {
    async generateQRCode(productId, batchId, frontendBaseUrl) {
        const code = String(batchId || productId);
        const url = `https://farm-land.vercel.app/verify/${batchId}`;
        
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
