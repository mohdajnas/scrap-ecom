import crypto from 'crypto';

const API_URL = process.env.PAYMENT_GATEWAY_API_URL || 'https://api.xyz.com';
const MERCHANT_ID = process.env.PAYMENT_GATEWAY_MERCHANT_ID || '';
const API_KEY = process.env.PAYMENT_GATEWAY_API_KEY || '';
const SECRET_KEY = process.env.PAYMENT_GATEWAY_SECRET_KEY || '';

interface InitiatePaymentParams {
  clientReferenceId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  redirectUrl?: string;
}

export const paymentGateway = {
  generateSignature(fields: (string | number)[]) {
    const signatureString = fields.join('|');
    return crypto
      .createHmac('sha256', SECRET_KEY)
      .update(signatureString)
      .digest('hex');
  },

  verifyWebhookSignature(payload: any) {
    const { data, hash } = payload;
    if (!data || !hash) return false;

    // Webhook Signature Pattern: clientReferenceId|requestedAmount|transactionStatus
    // Note: PDF example used requestedAmount with .00 but we assume it matches the received payload strictly
    let amountStr = data.requestedAmount;
    if (typeof amountStr === 'number') {
        amountStr = amountStr.toFixed(2);
    }

    const dataToSign = `${data.clientReferenceId}|${amountStr}|${data.transactionStatus}`;
    
    // Webhook uses Base64 encoding for the hash
    const calculatedHash = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(dataToSign)
      .digest('base64');
      
    // Constant time compare
    const expectedBuffer = Buffer.from(calculatedHash, 'utf-8');
    const receivedBuffer = Buffer.from(hash, 'utf-8');
    
    if (expectedBuffer.length !== receivedBuffer.length) return false;
    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  },

  async initiatePayment(params: InitiatePaymentParams) {
    // Format amount to exact 2 decimals as required by gateway signature logic
    const formattedAmount = params.amount.toFixed(2);
    
    const signature = this.generateSignature([
      MERCHANT_ID,
      params.clientReferenceId,
      formattedAmount,
      params.customerEmail
    ]);

    const payload = {
      merchantId: MERCHANT_ID,
      clientReferenceId: params.clientReferenceId,
      amount: parseFloat(formattedAmount), // Gateway expects numeric in JSON but string in signature
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      currency: "INR",
      ...(params.redirectUrl && { redirectUrl: params.redirectUrl })
    };

    const res = await fetch(`${API_URL}/api/v1/payments/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY,
        'X-Signature': signature,
      },
      body: JSON.stringify(payload),
    });

    return res.json();
  },

  async checkStatus(internalReferenceId: string) {
    const signature = this.generateSignature([
      MERCHANT_ID,
      internalReferenceId
    ]);

    const res = await fetch(`${API_URL}/api/v1/payments/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY,
        'X-Signature': signature,
      },
      body: JSON.stringify({
        merchantId: MERCHANT_ID,
        internalReferenceId
      }),
    });

    return res.json();
  }
};
