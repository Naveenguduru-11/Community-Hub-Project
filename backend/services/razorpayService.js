const Razorpay = require('razorpay');
const crypto = require('crypto');

const getRazorpayInstance = (customKeyId, customKeySecret) => {
  const key_id = customKeyId || process.env.RAZORPAY_KEY_ID;
  const key_secret = customKeySecret || process.env.RAZORPAY_KEY_SECRET;

  if (key_id && key_secret && !key_id.includes('your_key')) {
    return new Razorpay({ key_id, key_secret });
  }
  return null;
};

const createRazorpayOrder = async (amountInINR, receiptId, customKeyId, customKeySecret) => {
  const instance = getRazorpayInstance(customKeyId, customKeySecret);

  if (instance) {
    const options = {
      amount: Math.round(amountInINR * 100), // paise
      currency: 'INR',
      receipt: receiptId
    };
    const order = await instance.orders.create(options);
    return { ...order, mock: false };
  }

  // Fallback order structure for sandbox testing without env keys
  return {
    id: `order_rzp_${Date.now()}`,
    entity: 'order',
    amount: Math.round(amountInINR * 100),
    currency: 'INR',
    receipt: receiptId,
    status: 'created',
    mock: true
  };
};

const verifyRazorpaySignature = (orderId, paymentId, signature, customKeySecret) => {
  const secret = customKeySecret || process.env.RAZORPAY_KEY_SECRET;

  if (secret && !secret.includes('your_razorpay') && signature) {
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generatedSignature === signature;
  }

  return true;
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpaySignature,
  getRazorpayInstance
};
