// Payment Gateway Integration Utilities
import { api } from '../api';

// Razorpay Configuration
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_key_id';

// Stripe Configuration  
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key';

// Initialize Stripe
let stripe = null;
if (window.Stripe) {
  stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
}

/**
 * Process payment using Razorpay
 * @param {Object} orderData - Order data from backend
 * @param {Object} userInfo - User information
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export const processRazorpayPayment = (orderData, userInfo, onSuccess, onError) => {
  if (!window.Razorpay) {
    onError(new Error('Razorpay SDK not loaded'));
    return;
  }

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: orderData.amount, // Amount in paise
    currency: orderData.currency,
    name: 'SG CV Search',
    description: `Subscription: ${orderData.plan?.name}`,
    order_id: orderData.order_id,
    handler: async function (response) {
      try {
        // Verify payment with backend
        const verificationResult = await api.subscriptions.verifyPayment({
          payment_id: response.razorpay_payment_id,
          order_id: response.razorpay_order_id,
          signature: response.razorpay_signature,
        });

        if (verificationResult.success) {
          onSuccess(verificationResult);
        } else {
          onError(new Error(verificationResult.error || 'Payment verification failed'));
        }
      } catch (error) {
        onError(error);
      }
    },
    prefill: {
      name: userInfo.name || '',
      email: userInfo.email || '',
      contact: userInfo.phone || '',
    },
    notes: {
      plan_id: orderData.plan_id,
      user_id: orderData.user_id,
    },
    theme: {
      color: '#3B82F6', // Blue theme matching the app
    },
    modal: {
      ondismiss: function () {
        onError(new Error('Payment cancelled by user'));
      },
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};

/**
 * Process payment using Stripe
 * @param {Object} orderData - Order data from backend
 * @param {Object} userInfo - User information
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export const processStripePayment = async (orderData, userInfo, onSuccess, onError) => {
  if (!stripe) {
    onError(new Error('Stripe SDK not loaded'));
    return;
  }

  try {
    // Create Stripe checkout session
    const sessionData = {
      plan_id: orderData.plan_id,
      payment_method: 'stripe',
      success_url: `${window.location.origin}/settings?payment=success`,
      cancel_url: `${window.location.origin}/settings?payment=cancelled`,
    };

    const sessionResult = await api.subscriptions.subscribe(orderData.plan_id, 'stripe');
    
    if (!sessionResult.success) {
      onError(new Error(sessionResult.error || 'Failed to create payment session'));
      return;
    }

    // For demo purposes, we'll simulate the Stripe checkout
    // In a real implementation, you would redirect to Stripe Checkout
    const simulateStripePayment = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            payment_id: `stripe_${Date.now()}`,
            session_id: sessionResult.order.session_id,
            status: 'succeeded',
          });
        }, 2000);
      });
    };

    const paymentResult = await simulateStripePayment();

    // Verify payment with backend
    const verificationResult = await api.subscriptions.verifyPayment({
      payment_id: paymentResult.payment_id,
      session_id: paymentResult.session_id,
    });

    if (verificationResult.success) {
      onSuccess(verificationResult);
    } else {
      onError(new Error(verificationResult.error || 'Payment verification failed'));
    }
  } catch (error) {
    onError(error);
  }
};

/**
 * Main payment processor that handles both Razorpay and Stripe
 * @param {string} paymentMethod - 'razorpay' or 'stripe'
 * @param {string} planId - Selected plan ID
 * @param {Object} userInfo - User information
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @param {Function} onLoading - Loading state callback
 */
export const processPayment = async (paymentMethod, planId, userInfo, onSuccess, onError, onLoading) => {
  try {
    onLoading(true);

    // Create order/session with backend
    const orderResult = await api.subscriptions.subscribe(planId, paymentMethod);

    if (!orderResult.success) {
      onError(new Error(orderResult.error || 'Failed to create payment order'));
      return;
    }

    onLoading(false);

    // Process payment based on method
    if (paymentMethod === 'razorpay') {
      processRazorpayPayment(orderResult.order, userInfo, onSuccess, onError);
    } else if (paymentMethod === 'stripe') {
      await processStripePayment(orderResult.order, userInfo, onSuccess, onError);
    } else {
      onError(new Error('Unsupported payment method'));
    }
  } catch (error) {
    onLoading(false);
    onError(error);
  }
};

/**
 * Format currency for display
 * @param {number} amount - Amount in paise/cents
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR') => {
  const value = amount / 100; // Convert paise to rupees
  
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  } else if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }
  
  return `${currency} ${value.toFixed(2)}`;
};

/**
 * Get payment method display name
 * @param {string} method - Payment method code
 * @returns {string} Display name
 */
export const getPaymentMethodName = (method) => {
  const methods = {
    razorpay: 'Razorpay',
    stripe: 'Stripe',
    card: 'Credit/Debit Card',
    upi: 'UPI',
    netbanking: 'Net Banking',
    wallet: 'Wallet',
  };
  
  return methods[method] || method;
};

/**
 * Validate payment gateway availability
 * @returns {Object} Available payment methods
 */
export const getAvailablePaymentMethods = () => {
  return {
    razorpay: !!window.Razorpay,
    stripe: !!stripe,
  };
};

export default {
  processPayment,
  processRazorpayPayment,
  processStripePayment,
  formatCurrency,
  getPaymentMethodName,
  getAvailablePaymentMethods,
};