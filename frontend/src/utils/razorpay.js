import { userAPI } from '../services/api';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TJJav5Ou7pwOzz';

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(script);
  });
}

/**
 * Initiates a Razorpay payment for wallet recharge.
 * @param {Object} options
 * @param {number} options.amount - Amount in INR
 * @param {string} options.name - User display name
 * @param {string} options.email - User email
 * @param {string} [options.contact] - User mobile/contact
 * @param {Function} options.onSuccess - Callback(balance, transaction) on verified success
 * @param {Function} options.onError - Callback(errorMessage) on failure
 * @param {Function} options.onDismiss - Callback() when user closes checkout
 */
export async function initiateWalletRecharge({ amount, name, email, contact, onSuccess, onError, onDismiss }) {
  try {
    const Razorpay = await loadRazorpayScript();
    const orderRes = await userAPI.createOrder(amount);
    const { orderId, keyId } = orderRes.data?.data || {};

    if (!orderId) {
      throw new Error('Failed to create payment order');
    }

    const options = {
      key: keyId || RAZORPAY_KEY_ID,
      amount: Math.round(amount * 100),
      currency: 'INR',
      name: 'Avisa Experts',
      description: 'Wallet Recharge',
      order_id: orderId,
      prefill: {
        name: name || '',
        email: email || '',
        contact: contact || '',
      },
      theme: {
        color: '#3b82f6',
      },
      handler: async (response) => {
        try {
          const verifyRes = await userAPI.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            amount,
          });
          const { balance, transaction } = verifyRes.data?.data || {};
          if (onSuccess) onSuccess(balance, transaction);
        } catch (err) {
          const msg = err?.response?.data?.message || err.message || 'Payment verification failed';
          if (onError) onError(msg);
        }
      },
      modal: {
        ondismiss: () => {
          if (onDismiss) onDismiss();
        },
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to initiate payment';
    if (onError) onError(msg);
  }
}
