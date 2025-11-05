import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Crown,
  Zap,
  Shield,
  Users,
  Database,
  Download,
  Mail,
  Phone,
  ArrowUp,
  ArrowDown,
  X,
  RefreshCw,
  AlertTriangle,
  Info,
  ExternalLink,
  Check
} from 'lucide-react';
import { api } from '../api';
import { processPayment, formatCurrency, getPaymentMethodName } from '../utils/paymentGateway';

const SubscriptionManagement = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('plans');
  
  // State for API data
  const [subscriptionPlans, setSubscriptionPlans] = useState([
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: 99,
      duration: 30,
      period: 'month',
      popular: false,
      features: [
        'Up to 100 candidate searches',
        'Basic resume parsing',
        'Email support',
        'Standard templates',
        '5 GB storage'
      ]
    },
    {
      id: 'quarterly',
      name: 'Quarterly Plan',
      price: 249,
      duration: 90,
      period: 'quarter',
      popular: true,
      originalPrice: 297,
      savings: 48,
      features: [
        'Up to 500 candidate searches',
        'Advanced resume parsing',
        'Priority email support',
        'Premium templates',
        '25 GB storage',
        'Bulk import/export'
      ]
    },
    {
      id: 'halfyearly',
      name: 'Half-Yearly Plan',
      price: 445,
      duration: 180,
      period: '6 months',
      popular: false,
      originalPrice: 594,
      savings: 149,
      features: [
        'Up to 1000 candidate searches',
        'AI-powered matching',
        'Phone & email support',
        'Custom templates',
        '50 GB storage',
        'Advanced analytics',
        'API access'
      ]
    },
    {
      id: 'yearly',
      name: 'Yearly Plan',
      price: 831,
      duration: 365,
      period: 'year',
      popular: false,
      originalPrice: 1188,
      savings: 357,
      features: [
        'Unlimited candidate searches',
        'Full AI suite',
        '24/7 priority support',
        'All premium templates',
        '100 GB storage',
        'Advanced analytics',
        'Full API access',
        'Custom integrations'
      ]
    }
  ]);

  // Current Subscription State
  const [currentSubscription, setCurrentSubscription] = useState({
    id: 'quarterly',
    name: 'Quarterly Plan',
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2024-04-15',
    renewalDate: '2024-04-15',
    price: 249,
    autoRenewal: true
  });

  // Payment History State
  const [paymentHistory, setPaymentHistory] = useState([
    {
      id: 'TXN001',
      transactionId: 'pay_MxYz123456789',
      date: '2024-01-15',
      amount: 2499,
      status: 'completed',
      plan: 'Quarterly Plan',
      paymentMethod: 'Credit Card',
      gateway: 'Razorpay'
    },
    {
      id: 'TXN002',
      transactionId: 'pay_AbCd987654321',
      date: '2023-10-15',
      amount: 999,
      status: 'completed',
      plan: 'Monthly Plan',
      paymentMethod: 'UPI',
      gateway: 'Razorpay'
    },
    {
      id: 'TXN003',
      transactionId: 'pay_EfGh456789123',
      date: '2023-09-15',
      amount: 999,
      status: 'failed',
      plan: 'Monthly Plan',
      paymentMethod: 'Credit Card',
      gateway: 'Stripe'
    }
  ]);

  // Modal States


  // Load subscription data
  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    setLoading(true);
    try {
      // Load subscription plans
      const plansResult = await api.subscriptions.getPlans();
      if (plansResult.success) {
        setSubscriptionPlans(plansResult.plans);
      }
      
      // Load current subscription
      const currentResult = await api.subscriptions.getCurrent();
      if (currentResult.success && currentResult.subscription) {
        setCurrentSubscription(currentResult.subscription);
      }
      
      // Load payment history
      const historyResult = await api.subscriptions.getHistory();
      if (historyResult.success) {
        setPaymentHistory(historyResult.history.payments || []);
      }
      
    } catch (error) {
      setMessage('Failed to load subscription data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };



  const handleSubscribe = async (plan, paymentMethod = 'razorpay') => {
    const userInfo = {
      name: 'User Name', // Get from user context
      email: 'user@example.com', // Get from user context
      phone: '9999999999' // Get from user context
    };

    await processPayment(
      paymentMethod,
      plan.id,
      userInfo,
      (result) => {
        setMessage({ type: 'success', text: 'Subscription activated successfully!' });
        loadSubscriptionData();
      },
      (error) => {
        setMessage({ type: 'error', text: 'Subscription failed: ' + error.message });
      },
      setLoading
    );
  };

  const handleUpgrade = async (plan, paymentMethod = 'razorpay') => {
    // Cancel current subscription first, then subscribe to new plan
    if (currentSubscription) {
      try {
        await api.subscriptions.cancel(currentSubscription.subscription_id);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to cancel current subscription: ' + error.message });
        return;
      }
    }
    
    // Subscribe to new plan
    await handleSubscribe(plan, paymentMethod);
  };

  const handleCancelSubscription = () => {
    setShowCancelModal(true);
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }
    
    setLoading(true);
    try {
      const result = await api.subscriptions.cancel(currentSubscription.subscription_id);
      if (result.success) {
        setMessage({ type: 'success', text: 'Subscription cancelled successfully!' });
        setCurrentSubscription(null);
        setShowCancelModal(false);
        loadSubscriptionData();
      } else {
        setMessage({ type: 'error', text: 'Cancellation failed: ' + result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Cancellation failed: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const confirmSubscription = async () => {
    setLoading(true);
    try {
      // API call to initiate subscription
      const response = await api.post('/subscriptions/subscribe', {
        planId: selectedPlan.id,
        gateway: paymentGateway
      });
      
      // Handle payment gateway redirect
      if (paymentGateway === 'razorpay') {
        handleRazorpayPayment(response.data);
      } else {
        handleStripePayment(response.data);
      }
      
      setMessage({ type: 'success', text: 'Subscription initiated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to initiate subscription. Please try again.' });
    } finally {
      setLoading(false);
      setShowUpgradeModal(false);
    }
  };

  const confirmCancelSubscription = async () => {
    setLoading(true);
    try {
      await api.post('/subscriptions/cancel');
      setCurrentSubscription({ ...currentSubscription, status: 'cancelled' });
      setMessage({ type: 'success', text: 'Subscription cancelled successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to cancel subscription. Please try again.' });
    } finally {
      setLoading(false);
      setShowCancelModal(false);
    }
  };

  const handleRazorpayPayment = (orderData) => {
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'SG CV Search',
      description: `Subscription: ${selectedPlan.name}`,
      order_id: orderData.orderId,
      handler: function (response) {
        verifyPayment(response);
      },
      prefill: {
        name: 'User Name',
        email: 'user@example.com',
        contact: '9999999999'
      },
      theme: {
        color: '#3B82F6'
      }
    };
    
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleStripePayment = (sessionData) => {
    // Redirect to Stripe Checkout
    window.location.href = sessionData.url;
  };

  const verifyPayment = async (paymentData) => {
    try {
      await api.post('/subscriptions/verify', paymentData);
      setMessage({ type: 'success', text: 'Payment successful! Subscription activated.' });
      loadCurrentSubscription();
      loadPaymentHistory();
    } catch (error) {
      setMessage({ type: 'error', text: 'Payment verification failed. Please contact support.' });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'monthly':
        return <Calendar className="w-6 h-6" />;
      case 'quarterly':
        return <Star className="w-6 h-6" />;
      case 'halfyearly':
        return <Crown className="w-6 h-6" />;
      case 'yearly':
        return <Zap className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Subscription Management</h1>
        <p className="text-gray-600">Manage your subscription plans and payment history</p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
          'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertTriangle className="w-5 h-5 mr-2" />
          )}
          {message.text}
          <button
            onClick={() => setMessage({ type: '', text: '' })}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('plans')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'plans'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Subscription Plans
          </button>
          <button
            onClick={() => setActiveTab('current')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'current'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Current Subscription
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Payment History
          </button>
        </nav>
      </div>

      {/* Subscription Plans Tab */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg shadow-sm border-2 p-6 ${
                plan.popular ? 'border-blue-500' : 'border-gray-200'
              } ${currentSubscription.id === plan.id ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              {currentSubscription.id === plan.id && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                    <Check className="w-3 h-3 mr-1" />
                    Active
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                <div className={`inline-flex p-3 rounded-full mb-3 ${
                  plan.popular ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {getPlanIcon(plan.id)}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatCurrency(plan.price, plan.currency)}
                  </span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>
                {plan.savings && (
                  <div className="mt-1">
                    <span className="text-sm text-gray-500 line-through">
                      {formatCurrency(plan.originalPrice)}
                    </span>
                    <span className="ml-2 text-sm text-green-600 font-medium">
                      Save {formatCurrency(plan.savings)}
                    </span>
                  </div>
                )}
                <p className="text-sm text-gray-600 mt-1">{plan.duration} days</p>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
                {currentSubscription?.plan_id === plan.id ? (
                  <div className="text-center">
                    <span className="text-sm text-green-600 font-medium">Current Plan</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleSubscribe(plan)}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      Subscribe Now
                    </button>
                    {currentSubscription.status === 'active' && (
                      <button
                        onClick={() => handleUpgrade(plan)}
                        className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                      >
                        {plan.price > subscriptionPlans.find(p => p.id === currentSubscription.id)?.price ? 'Upgrade' : 'Downgrade'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Subscription Tab */}
      {activeTab === 'current' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Current Subscription</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentSubscription.status)}`}>
                {currentSubscription.status.charAt(0).toUpperCase() + currentSubscription.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Crown className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Plan</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{currentSubscription.plan_name || currentSubscription.name}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Start Date</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{formatDate(currentSubscription.start_date || currentSubscription.startDate)}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Clock className="w-5 h-5 text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">End Date</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{formatDate(currentSubscription.end_date || currentSubscription.endDate)}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <RefreshCw className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Renewal</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{formatDate(currentSubscription.renewal_date || currentSubscription.renewalDate)}</p>
              </div>
            </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-6">
            <div>
              <h3 className="font-medium text-blue-900">Auto Renewal</h3>
              <p className="text-sm text-blue-700">
                {currentSubscription.autoRenewal ? 'Enabled' : 'Disabled'} - 
                Your subscription will {currentSubscription.autoRenewal ? '' : 'not '}automatically renew
              </p>
            </div>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              {currentSubscription.autoRenewal ? 'Disable' : 'Enable'}
            </button>
          </div>

          {currentSubscription.status === 'active' && (
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('plans')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                Upgrade Plan
              </button>
              <button
                onClick={handleCancelSubscription}
                className="flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Subscription
              </button>
            </div>
          )}
        </div>
      )}

      {/* Payment History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
            <p className="text-sm text-gray-600 mt-1">View all your subscription payments and transactions</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gateway
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentHistory.map((payment) => (
                  <tr key={payment.transaction_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{payment.transaction_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.plan_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount, payment.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.payment_method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.gateway}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


    </div>
  );
};

export default SubscriptionManagement;