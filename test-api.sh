#!/bin/bash

# API Test Script for Dev Feeds
# This script tests all API endpoints
# Make sure the dev server is running on http://localhost:3000

BASE_URL="http://localhost:3001"
API_KEY="${API_KEY:-}"  # Set this environment variable or pass as argument
SESSION_COOKIE="${SESSION_COOKIE:-}"  # Optional: session cookie for testing

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Dev Feeds API Test Suite ===${NC}\n"

# Check if API key is provided
if [ -z "$API_KEY" ]; then
    echo -e "${YELLOW}Warning: API_KEY not set. Some tests will fail.${NC}"
    echo -e "${YELLOW}Set it with: export API_KEY=your_api_key${NC}\n"
fi

# Test 1: Health Check
echo -e "${GREEN}Test 1: Health Check${NC}"
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$http_code" -eq 200 ]; then
    echo -e "✓ Health check passed (Status: $http_code)"
    echo "Response: $body"
else
    echo -e "${RED}✗ Health check failed (Status: $http_code)${NC}"
fi
echo ""

# Test 2: Get Feeds (Requires Auth)
if [ -n "$API_KEY" ]; then
    echo -e "${GREEN}Test 2: Get Your Feeds${NC}"
    response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/feeds" \
        -H "Authorization: Bearer $API_KEY")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    if [ "$http_code" -eq 200 ]; then
        echo -e "✓ Get feeds passed (Status: $http_code)"
        feed_count=$(echo "$body" | jq '. | length' 2>/dev/null || echo "0")
        echo "Found $feed_count feeds"
    else
        echo -e "${RED}✗ Get feeds failed (Status: $http_code)${NC}"
        echo "Response: $body"
    fi
else
    echo -e "${GREEN}Test 2: Get Feeds (Requires Auth)${NC}"
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/feeds")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    if [ "$http_code" -eq 401 ]; then
        echo -e "✓ Unauthorized access correctly rejected (Status: $http_code)"
    else
        echo -e "${RED}✗ Get feeds test failed (Status: $http_code, expected 401)${NC}"
        echo "Response: $body"
    fi
fi
echo ""

# Test 3: Create Feed (Requires Auth)
if [ -n "$API_KEY" ]; then
    echo -e "${GREEN}Test 3: Create Feed${NC}"
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/feeds" \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        -d '{
            "title": "API Test Feed",
            "description": "Created via API test"
        }')
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    if [ "$http_code" -eq 201 ]; then
        echo -e "✓ Create feed passed (Status: $http_code)"
        FEED_ID=$(echo "$body" | jq -r '.id' 2>/dev/null)
        FEED_SLUG=$(echo "$body" | jq -r '.slug' 2>/dev/null)
        echo "Feed ID: $FEED_ID"
        echo "Feed Slug: $FEED_SLUG"
    else
        echo -e "${RED}✗ Create feed failed (Status: $http_code)${NC}"
        echo "Response: $body"
    fi
    echo ""
else
    echo -e "${YELLOW}Test 3: Create Feed (Skipped - No API key)${NC}\n"
    FEED_ID=""
fi

# Test 4: Create Text Post (Requires Auth)
if [ -n "$API_KEY" ] && [ -n "$FEED_ID" ]; then
    echo -e "${GREEN}Test 4: Create Text Post${NC}"
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/posts" \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"feedId\": \"$FEED_ID\",
            \"type\": \"text\",
            \"content\": \"This is a test post created via API\"
        }")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    if [ "$http_code" -eq 201 ]; then
        echo -e "✓ Create text post passed (Status: $http_code)"
        POST_ID=$(echo "$body" | jq -r '.id' 2>/dev/null)
        echo "Post ID: $POST_ID"
    else
        echo -e "${RED}✗ Create text post failed (Status: $http_code)${NC}"
        echo "Response: $body"
    fi
    echo ""
else
    echo -e "${YELLOW}Test 4: Create Text Post (Skipped - No API key or Feed ID)${NC}\n"
    POST_ID=""
fi

# Test 5: Update Post (Requires Auth)
if [ -n "$API_KEY" ] && [ -n "$POST_ID" ]; then
    echo -e "${GREEN}Test 5: Update Post${NC}"
    response=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/api/posts/$POST_ID" \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        -d '{
            "content": "This post has been updated via API"
        }')
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    if [ "$http_code" -eq 200 ]; then
        echo -e "✓ Update post passed (Status: $http_code)"
        UPDATED_CONTENT=$(echo "$body" | jq -r '.content' 2>/dev/null)
        echo "Updated content: $UPDATED_CONTENT"
    else
        echo -e "${RED}✗ Update post failed (Status: $http_code)${NC}"
        echo "Response: $body"
    fi
    echo ""
else
    echo -e "${YELLOW}Test 5: Update Post (Skipped - No API key or Post ID)${NC}\n"
fi

# Test 6: Delete Post (Requires Auth)
if [ -n "$API_KEY" ] && [ -n "$POST_ID" ]; then
    echo -e "${GREEN}Test 6: Delete Post${NC}"
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/api/posts/$POST_ID" \
        -H "Authorization: Bearer $API_KEY")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    if [ "$http_code" -eq 200 ]; then
        echo -e "✓ Delete post passed (Status: $http_code)"
        echo "Response: $body"
    else
        echo -e "${RED}✗ Delete post failed (Status: $http_code)${NC}"
        echo "Response: $body"
    fi
    echo ""
else
    echo -e "${YELLOW}Test 6: Delete Post (Skipped - No API key or Post ID)${NC}\n"
fi

# Test 7: Upload File (Requires Auth)
if [ -n "$API_KEY" ]; then
    echo -e "${GREEN}Test 7: Upload File${NC}"
    # Create a test image file
    TEST_IMAGE="/tmp/test-api-image.png"
    if [ ! -f "$TEST_IMAGE" ]; then
        # Create a simple 1x1 PNG using ImageMagick or skip
        echo -e "${YELLOW}Note: Creating a minimal test file${NC}"
        # For now, we'll skip if no test file exists
        echo -e "${YELLOW}Skipping file upload test (no test file available)${NC}"
    else
        response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/upload" \
            -H "Authorization: Bearer $API_KEY" \
            -F "file=@$TEST_IMAGE")
        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | sed '$d')
        if [ "$http_code" -eq 200 ]; then
            echo -e "✓ Upload file passed (Status: $http_code)"
            FILE_URL=$(echo "$body" | jq -r '.url' 2>/dev/null)
            echo "File URL: $FILE_URL"
        else
            echo -e "${RED}✗ Upload file failed (Status: $http_code)${NC}"
            echo "Response: $body"
        fi
    fi
    echo ""
else
    echo -e "${YELLOW}Test 7: Upload File (Skipped - No API key)${NC}\n"
fi

# Test 8: Unauthorized Access
echo -e "${GREEN}Test 8: Unauthorized Access Test${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/posts" \
    -H "Content-Type: application/json" \
    -d '{
        "feedId": "test",
        "type": "text",
        "content": "Should fail"
    }')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$http_code" -eq 401 ]; then
    echo -e "✓ Unauthorized access correctly rejected (Status: $http_code)"
else
    echo -e "${RED}✗ Unauthorized access test failed (Status: $http_code, expected 401)${NC}"
    echo "Response: $body"
fi
echo ""

# Test 9: Invalid Post ID
if [ -n "$API_KEY" ]; then
    echo -e "${GREEN}Test 9: Invalid Post ID${NC}"
    response=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/api/posts/invalid-post-id" \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        -d '{"content": "test"}')
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    if [ "$http_code" -eq 404 ]; then
        echo -e "✓ Invalid post ID correctly rejected (Status: $http_code)"
    else
        echo -e "${RED}✗ Invalid post ID test failed (Status: $http_code, expected 404)${NC}"
        echo "Response: $body"
    fi
    echo ""
else
    echo -e "${YELLOW}Test 9: Invalid Post ID (Skipped - No API key)${NC}\n"
fi

echo -e "${YELLOW}=== Test Suite Complete ===${NC}"
echo ""
echo "To run with your API key:"
echo "  export API_KEY=your_api_key_here"
echo "  ./test-api.sh"
echo ""
echo "Or get your API key from: $BASE_URL/profile (enable Developer Mode)"

