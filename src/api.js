// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to handle API responses
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    // Read the response body as text first to avoid "body stream already read" error
    const responseText = await response.text();

    console.error('API Response Error:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      responseText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    // Try parse JSON error payload (non-fatal if it fails)
    let errorData = null;
    try {
      errorData = responseText ? JSON.parse(responseText) : null;
      if (errorData) {
        console.error('Parsed error data:', errorData);
      }
    } catch (e) {
      console.error('Failed to parse error response as JSON:', e);
      console.error('Raw response text:', responseText);
    }

    // Special handling for 401 Unauthorized (e.g., expired token)
    if (response.status === 401) {
      try {
        // Clear any stored auth state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Notify the app so it can redirect to login
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(
            new CustomEvent('auth:expired', {
              detail: {
                status: 401,
                message: (errorData && errorData.error) || 'Unauthorized',
                url: response.url,
              },
            })
          );
        }
      } catch (e) {
        // Ignore notification errors
        console.warn('Auth expiry handling failed:', e);
      }
    }

    // Return validation errors directly for 400 responses
    if (response.status === 400 && errorData && errorData.validation_errors) {
      return {
        success: false,
        error: errorData.error,
        validation_errors: errorData.validation_errors,
      };
    }

    // Log more detail for 500 errors if available
    if (response.status === 500 && errorData) {
      console.error('HTTP 500 Internal Server Error Details:', {
        error: errorData.error,
        success: errorData.success,
        fullResponse: errorData,
      });
    }

    // Build a rich Error object
    const message = (errorData && errorData.error) || responseText || `HTTP ${response.status}: ${response.statusText}`;
    const err = new Error(message);
    err.status = response.status;
    err.data = errorData || null;
    err.url = response.url;
    err.responseText = responseText;
    throw err;
  }

  // Guard against non-JSON success responses
  if (!contentType.includes('application/json')) {
    const responseText = await response.text();
    console.error('Unexpected non-JSON success response:', {
      url: response.url,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      contentType,
      preview: responseText.slice(0, 200),
    });
    throw new Error(`Expected JSON but received '${contentType}'.`);
  }

  return response.json();
};

// Helper function to handle API errors
const handleError = (error) => {
  console.error('API Error:', error);
  throw error;
};

// API endpoints
export const api = {
  // Authentication
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Get all candidates
  getCandidates: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/candidates/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Search candidates
  searchCandidates: async (searchParams) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });
      
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Get candidate details by ID
  getCandidateById: async (candidateId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/candidates/${candidateId}`);
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Upload resume file
  uploadResume: async (file, candidateData = {}) => {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      // Add candidate metadata if provided
      Object.keys(candidateData).forEach(key => {
        if (candidateData[key]) {
          formData.append(key, candidateData[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Download resume file by Resume ID
  downloadResume: async (resumeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/download/${resumeId}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }
      
      // Check if response is a redirect (for external URLs)
      if (response.redirected) {
        window.open(response.url, '_blank');
        return { success: true };
      }
      
      // For file downloads, create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `resume_${resumeId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  },

  // Download resume file by candidate index (backward compatibility)
  downloadResumeByIndex: async (candidateIndex) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/download/candidate/${candidateIndex}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }
      
      // Check if response is a redirect (for external URLs)
      if (response.redirected) {
        window.open(response.url, '_blank');
        return { success: true };
      }
      
      // For file downloads, create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `resume_candidate_${candidateIndex}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  },

  // Get available skills for filtering
  getSkills: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/skills`);
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Get available locations for filtering
  getLocations: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/locations`);
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Get dashboard analytics data
  getDashboardData: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Upload candidate with resume
  uploadCandidate: async (candidateData, resumeFile) => {
    try {
      const formData = new FormData();
      
      // Add candidate data
      Object.keys(candidateData).forEach(key => {
        formData.append(key, candidateData[key]);
      });
      
      // Add resume file
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }
      
      const response = await fetch(`${API_BASE_URL}/api/candidates`, {
        method: 'POST',
        body: formData,
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Upload candidate error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get candidates list with approval status
  getCandidatesList: async (params = {}) => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/api/candidates/list?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Update candidate approval status (admin only)
  updateCandidateStatus: async (candidateId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/candidates/${candidateId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Update candidate record
  updateCandidate: async (candidateId, candidateData) => {
    try {
      const token = localStorage.getItem('token');
      console.log('=== UPDATE CANDIDATE REQUEST ===');
      console.log('Candidate ID:', candidateId, '(type:', typeof candidateId, ')');
      console.log('Candidate Data:', candidateData);
      console.log('Token present:', !!token);
      console.log('API Base URL:', API_BASE_URL);
      console.log('Full URL:', `${API_BASE_URL}/api/recruitment/candidates/${candidateId}`);
      console.log('Request body:', JSON.stringify(candidateData));
      
      const requestOptions = {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidateData),
      };
      
      console.log('Request options:', requestOptions);
      
      const response = await fetch(`${API_BASE_URL}/api/recruitment/candidates/${candidateId}`, requestOptions);
      
      console.log('Raw response status:', response.status);
      console.log('Raw response statusText:', response.statusText);
      console.log('Raw response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Raw response ok:', response.ok);
      
      const result = await handleResponse(response);
      console.log('Final processed response:', result);
      console.log('=== UPDATE CANDIDATE REQUEST COMPLETE ===');
      return result;
    } catch (error) {
      console.error('=== UPDATE CANDIDATE ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', error);
      console.error('=== END UPDATE CANDIDATE ERROR ===');
      return handleError(error);
    }
  },

  // Delete candidate (admin only)
  deleteCandidate: async (candidateId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/candidates/${candidateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Generic delete function
  delete: async (endpoint) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Subscription Management APIs
  subscriptions: {
    // Get all available subscription plans
    getPlans: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/subscriptions/plans`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return await handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },

    // Get current active subscription
    getCurrent: async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/subscriptions/current`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        return await handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },

    // Get subscription and payment history
    getHistory: async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/subscriptions/history`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        return await handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },

    // Create subscription order
    subscribe: async (planId, paymentMethod = 'razorpay') => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/subscriptions/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            plan_id: planId,
            payment_method: paymentMethod,
          }),
        });
        return await handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },

    // Cancel subscription
    cancel: async (subscriptionId) => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/subscriptions/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            subscription_id: subscriptionId,
          }),
        });
        return await handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },

    // Verify payment and activate subscription
    verifyPayment: async (paymentData) => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/subscriptions/payment/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(paymentData),
        });
        return await handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
  },

  // Convert candidate to employee
  convertCandidateToEmployee: async (conversionData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/recruitment/convert-to-employee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(conversionData),
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // HR listings
  getEmployees: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/hr/employees`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Get aggregated employee details for popup
  getEmployeeDetails: async (employeeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/hr/employees/${employeeId}/details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Employee CRUD
  createEmployee: async (employeeData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/hr/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(employeeData),
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  updateEmployee: async (employeeId, updates) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/hr/employees/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  deleteEmployee: async (employeeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/hr/employees/${employeeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  importEmployees: async (file) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE_URL}/api/hr/employees/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  exportEmployees: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/hr/employees/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to export employees');
      }
      const blob = await response.blob();
      return { success: true, blob };
    } catch (error) {
      return handleError(error);
    }
  },

  getSalaryStructures: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/hr/salary-structures`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getPayrollCompliances: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/hr/payroll-compliances`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Performance Evaluation APIs
  getPerformanceHistory: async (employeeId) => {
    try {
      const token = localStorage.getItem('token');
      const url = new URL(`${API_BASE_URL}/api/hr/performance`);
      if (employeeId) url.searchParams.set('employee_id', employeeId);
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  createPerformance: async (evaluationData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/hr/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(evaluationData),
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  updatePerformance: async (evaluationId, updates) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/hr/performance/${evaluationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Update workflow: review/approve/send-to-employee
  updatePerformanceWorkflow: async (evaluationId, { role, op }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/hr/performance/${evaluationId}/workflow`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role, op }),
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  deletePerformance: async (evaluationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/hr/performance/${evaluationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getPerformanceAnalytics: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/hr/performance/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Customer Management APIs
  customers: {
    // Get all customers with filtering and pagination
    getCustomers: async (queryParams = '') => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/customers?${queryParams}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        return await handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },

    // Create a new customer
    createCustomer: async (customerData) => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/customers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(customerData),
        });
        return await handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },

    // Get a specific customer by ID
    getCustomer: async (customerId) => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        return await handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },

    // Update a customer
    updateCustomer: async (customerId, customerData) => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(customerData),
        });
        return await handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },

    // Start customer onboarding
    startOnboarding: async (customerId) => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/customers/${customerId}/onboarding`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        return await handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },

    // Update customer onboarding progress
    updateOnboarding: async (customerId, onboardingData) => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/customers/${customerId}/onboarding`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(onboardingData),
        });
        return await handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },

    // Get customer dashboard metrics
    getDashboard: async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/customers/dashboard`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        return await handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },

    // Add customer interaction
    addInteraction: async (customerId, interactionData) => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/customers/${customerId}/interactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(interactionData),
        });
        return await handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },

    // Get customer interactions
    getInteractions: async (customerId) => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/customers/${customerId}/interactions`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        return await handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },

    // Get onboarding workflow configuration
    getWorkflow: async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/onboarding/workflow`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        return await handleResponse(response);
      } catch (error) {
        return handleError(error);
      }
    },
  },

};

// Convenience functions for backward compatibility
export const getCustomers = (queryParams) => api.customers.getCustomers(queryParams);
export const createCustomer = (customerData) => api.customers.createCustomer(customerData);
export const getCustomer = (customerId) => api.customers.getCustomer(customerId);
export const updateCustomer = (customerId, customerData) => api.customers.updateCustomer(customerId, customerData);
export const startCustomerOnboarding = (customerId) => api.customers.startOnboarding(customerId);
export const updateCustomerOnboarding = (customerId, onboardingData) => api.customers.updateOnboarding(customerId, onboardingData);
export const getCustomerDashboard = () => api.customers.getDashboard();
export const addCustomerInteraction = (customerId, interactionData) => api.customers.addInteraction(customerId, interactionData);
export const getCustomerInteractions = (customerId) => api.customers.getInteractions(customerId);
export const getOnboardingWorkflow = () => api.customers.getWorkflow();

// Utility functions for file handling
export const fileUtils = {
  // Trigger file download in browser
  downloadFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Validate file type and size
  validateResumeFile: (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload PDF or Word documents only.');
    }

    if (file.size > maxSize) {
      throw new Error('File size too large. Please upload files smaller than 10MB.');
    }

    return true;
  }
};

export default api;