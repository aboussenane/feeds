/**
 * API Test Script for Dev Feeds
 * Run with: node test-api.js [API_KEY]
 * 
 * Make sure the dev server is running on https://feeds-pink.vercel.app
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const API_KEY = process.argv[2] || process.env.API_KEY || '';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

let feedId = '';
let postId = '';

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log(`\n${colors.green}${testName}${colors.reset}`);
}

async function testEndpoint(name, method, path, options = {}) {
  try {
    const url = `${BASE_URL}${path}`;
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` }),
        ...options.headers
      },
      ...(options.body && { body: JSON.stringify(options.body) })
    };

    // Handle FormData for file uploads
    if (options.formData) {
      delete config.headers['Content-Type'];
      config.body = options.formData;
    }

    const response = await fetch(url, config);
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    const success = response.ok;
    const status = response.status;

    if (success) {
      log(`✓ ${name} passed (Status: ${status})`, 'green');
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        console.log('Response:', JSON.stringify(data, null, 2));
      }
      return { success: true, data, status };
    } else {
      log(`✗ ${name} failed (Status: ${status})`, 'red');
      console.log('Response:', data);
      return { success: false, data, status };
    }
  } catch (error) {
    log(`✗ ${name} error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('=== Dev Feeds API Test Suite ===', 'yellow');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`API Key: ${API_KEY ? '***' + API_KEY.slice(-4) : 'Not provided'}\n`);

  if (!API_KEY) {
    log('Warning: API_KEY not provided. Some tests will be skipped.', 'yellow');
    log(`Get your API key from: ${BASE_URL}/profile (enable Developer Mode)`, 'yellow');
    log('Run with: node test-api.js YOUR_API_KEY\n', 'yellow');
  }

  // Test 1: Health Check
  logTest('Test 1: Health Check');
  await testEndpoint('Health check', 'GET', '/api/health');

  // Test 2: Get Feeds (Requires Auth)
  if (API_KEY) {
    logTest('Test 2: Get Your Feeds');
    const feedsResult = await testEndpoint('Get feeds', 'GET', '/api/feeds');
    if (feedsResult.success && Array.isArray(feedsResult.data)) {
      console.log(`Found ${feedsResult.data.length} feeds`);
    }
  } else {
    logTest('Test 2: Get Feeds (Requires Auth)');
    try {
      const response = await fetch(`${BASE_URL}/api/feeds`, {
        method: 'GET',
        // No Authorization header
      });
      const data = await response.json();
      if (response.status === 401) {
        log('✓ Unauthorized access correctly rejected (Status: 401)', 'green');
      } else {
        log(`✗ Get feeds test failed (Status: ${response.status}, expected 401)`, 'red');
        console.log('Response:', data);
      }
    } catch (error) {
      log(`✗ Get feeds test error: ${error.message}`, 'red');
    }
  }

  // Test 3: Create Feed (Requires Auth)
  if (API_KEY) {
    logTest('Test 3: Create Feed');
    const createFeedResult = await testEndpoint('Create feed', 'POST', '/api/feeds', {
      body: {
        title: 'API Test Feed',
        description: 'Created via API test script'
      }
    });
    if (createFeedResult.success && createFeedResult.data?.id) {
      feedId = createFeedResult.data.id;
      console.log(`Feed ID: ${feedId}`);
      console.log(`Feed Slug: ${createFeedResult.data.slug}`);
    }
  } else {
    log('Test 3: Create Feed (Skipped - No API key)', 'yellow');
  }

  // Test 4: Create Text Post (Requires Auth)
  if (API_KEY && feedId) {
    logTest('Test 4: Create Text Post');
    const createPostResult = await testEndpoint('Create text post', 'POST', '/api/posts', {
      body: {
        feedId,
        type: 'text',
        content: 'This is a test post created via API'
      }
    });
    if (createPostResult.success && createPostResult.data?.id) {
      postId = createPostResult.data.id;
      console.log(`Post ID: ${postId}`);
    }
  } else {
    log('Test 4: Create Text Post (Skipped - No API key or Feed ID)', 'yellow');
  }

  // Test 5: Update Post (Requires Auth)
  if (API_KEY && postId) {
    logTest('Test 5: Update Post');
    const updateResult = await testEndpoint('Update post', 'PATCH', `/api/posts/${postId}`, {
      body: {
        content: 'This post has been updated via API'
      }
    });
    if (updateResult.success) {
      console.log(`Updated content: ${updateResult.data?.content}`);
    }
  } else {
    log('Test 5: Update Post (Skipped - No API key or Post ID)', 'yellow');
  }

  // Test 6: Delete Post (Requires Auth)
  if (API_KEY && postId) {
    logTest('Test 6: Delete Post');
    await testEndpoint('Delete post', 'DELETE', `/api/posts/${postId}`);
  } else {
    log('Test 6: Delete Post (Skipped - No API key or Post ID)', 'yellow');
  }

  // Test 7: Upload File (Requires Auth)
  if (API_KEY) {
    logTest('Test 7: Upload File');
    log('Note: File upload test requires a test file. Skipping for now.', 'yellow');
    // To test file upload, you would need to create a FormData object
    // This is better tested manually or with a test image file
  } else {
    log('Test 7: Upload File (Skipped - No API key)', 'yellow');
  }

  // Test 8: Unauthorized Access
  logTest('Test 8: Unauthorized Access Test');
  try {
    const response = await fetch(`${BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // No Authorization header
      },
      body: JSON.stringify({
        feedId: 'test',
        type: 'text',
        content: 'Should fail'
      })
    });
    const data = await response.json();
    if (response.status === 401) {
      log('✓ Unauthorized access correctly rejected (Status: 401)', 'green');
    } else {
      log(`✗ Unauthorized access test failed (Status: ${response.status}, expected 401)`, 'red');
      console.log('Response:', data);
    }
  } catch (error) {
    log(`✗ Unauthorized access test error: ${error.message}`, 'red');
  }

  // Test 9: Invalid Post ID
  if (API_KEY) {
    logTest('Test 9: Invalid Post ID');
    const invalidResult = await testEndpoint('Invalid post ID', 'PATCH', '/api/posts/invalid-post-id', {
      body: {
        content: 'test'
      }
    });
    if (invalidResult.status === 404) {
      log('✓ Invalid post ID correctly rejected (Status: 404)', 'green');
    } else if (invalidResult.status === 401) {
      log('✓ Invalid post ID correctly rejected (Status: 401 - Unauthorized)', 'green');
    } else {
      log(`✗ Invalid post ID test unexpected status (Status: ${invalidResult.status})`, 'red');
    }
  } else {
    log('Test 9: Invalid Post ID (Skipped - No API key)', 'yellow');
  }

  // Test 10: Invalid Feed ID
  if (API_KEY) {
    logTest('Test 10: Invalid Feed ID');
    const invalidFeedResult = await testEndpoint('Invalid feed ID', 'POST', '/api/posts', {
      body: {
        feedId: 'invalid-feed-id',
        type: 'text',
        content: 'Should fail'
      }
    });
    if (invalidFeedResult.status === 404 || invalidFeedResult.status === 403) {
      log('✓ Invalid feed ID correctly rejected', 'green');
    }
  } else {
    log('Test 10: Invalid Feed ID (Skipped - No API key)', 'yellow');
  }

  log('\n=== Test Suite Complete ===', 'yellow');
  console.log('\nTo run with your API key:');
  console.log('  node test-api.js YOUR_API_KEY');
  console.log(`\nOr get your API key from: ${BASE_URL}/profile (enable Developer Mode)`);
}

// Run tests
runTests().catch(console.error);

