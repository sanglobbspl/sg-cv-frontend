// Debug script to test API calls from browser console
// Copy and paste this into the browser console on the frontend page

async function debugCandidatesAPI() {
    console.log('🔍 Debugging Candidates API...');
    
    // Check if token exists
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
    
    if (!token) {
        console.error('❌ No authentication token found. Please login first.');
        return;
    }
    
    // Test API call
    const apiUrl = 'http://localhost:5000/api/candidates/list?page=1&per_page=20';
    console.log('🌐 Making API call to:', apiUrl);
    
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            console.error('❌ API request failed:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error details:', errorText);
            return;
        }
        
        const data = await response.json();
        console.log('✅ API Response received');
        console.log('Success:', data.success);
        console.log('Total candidates:', data.data?.length || 0);
        console.log('Pagination:', data.pagination);
        
        // Look for test candidate
        const testCandidate = data.data?.find(c => c.id === 'CAND_CF03837D');
        if (testCandidate) {
            console.log('🎯 Found test candidate CAND_CF03837D:');
            console.log('  Name:', testCandidate.name);
            console.log('  Email:', testCandidate.email);
            console.log('  Status:', testCandidate.status);
            console.log('  Notes:', testCandidate.notes);
            console.log('  Last Updated:', testCandidate.last_updated);
        } else {
            console.log('❌ Test candidate CAND_CF03837D not found');
            console.log('Available candidates (first 3):');
            data.data?.slice(0, 3).forEach((c, i) => {
                console.log(`  ${i+1}. ${c.id} - ${c.name}`);
            });
        }
        
        return data;
        
    } catch (error) {
        console.error('❌ Network error:', error);
    }
}

// Also check current React state if available
function checkReactState() {
    console.log('🔍 Checking React component state...');
    
    // Try to find React components in the DOM
    const candidateElements = document.querySelectorAll('[data-candidate-id]');
    console.log('Found candidate elements:', candidateElements.length);
    
    // Check if our test candidate is in the DOM
    const testCandidateElement = document.querySelector('[data-candidate-id="CAND_CF03837D"]');
    if (testCandidateElement) {
        console.log('✅ Test candidate found in DOM');
        console.log('Element:', testCandidateElement);
    } else {
        console.log('❌ Test candidate not found in DOM');
    }
    
    // Check for any error messages
    const errorElements = document.querySelectorAll('.error, .alert-error, [class*="error"]');
    if (errorElements.length > 0) {
        console.log('⚠️ Found error elements:', errorElements);
    }
}

// Run both checks
console.log('🚀 Starting frontend debug...');
debugCandidatesAPI().then(() => {
    checkReactState();
});

// Instructions for user
console.log(`
📋 Debug Instructions:
1. Open browser developer tools (F12)
2. Go to the Console tab
3. Copy and paste this entire script
4. Press Enter to run
5. Check the output for any issues

If you see the test candidate data in the API response but not in the DOM,
there might be a React state or rendering issue.
`);