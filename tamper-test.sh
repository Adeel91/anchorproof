#!/bin/bash
# tamper-test-api.sh

# Your blob ID from the database
BLOB_ID="alzd7i6Z5VvwfiqlLZpc15DdeXau5ASF6E4vV7lCsh8"
USER_ID="0xef69bef17320570a42095855c0502cd43b1c65a136693d5fd0a5c9c138a3571f"

echo "🚀 Starting Tamper Test"
echo "================================"

# Step 1: Get original verification
echo ""
echo "📋 Step 1: Getting original verification..."
curl -s -X POST http://localhost:3000/api/walrus/verify \
  -H "Content-Type: application/json" \
  -H "Cookie: anchorproof-session=$USER_ID" \
  -d "{\"blobId\": \"$BLOB_ID\"}" | jq '.'

# Step 2: Download blob
echo ""
echo "📥 Step 2: Downloading blob from Walrus..."
curl -s -o original_blob.json \
  "https://aggregator.walrus-testnet.walrus.space/v1/blobs/${BLOB_ID}"

echo "📊 Original blob size: $(wc -c < original_blob.json) bytes"
echo "📝 Original content preview:"
jq '.messages[0].content' original_blob.json

# Step 3: Tamper with it
echo ""
echo "🔧 Step 3: Tampering with blob content..."
jq '.messages[0].content = "🔥 TAMPERED: This conversation has been compromised!"' \
  original_blob.json > tampered_blob.json

echo "📝 Tampered content:"
jq '.messages[0].content' tampered_blob.json

# Step 4: Upload tampered blob
echo ""
echo "📤 Step 4: Uploading tampered blob to Walrus..."
RESPONSE=$(curl -s -X PUT \
  "https://publisher.walrus-testnet.walrus.space/v1/blobs" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @tampered_blob.json)

NEW_BLOB_ID=$(echo $RESPONSE | jq -r '.newlyCreated.blobObject.blobId')
echo "✅ New blob ID: $NEW_BLOB_ID"

# Step 5: Update database using the API endpoint
echo ""
echo "🔄 Step 5: Updating database via API..."
UPDATE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/test/update-blob \
  -H "Content-Type: application/json" \
  -H "Cookie: anchorproof-session=$USER_ID" \
  -d "{\"oldBlobId\": \"$BLOB_ID\", \"newBlobId\": \"$NEW_BLOB_ID\"}")

echo "Update response:"
echo $UPDATE_RESPONSE | jq '.'

# Check if update was successful
SUCCESS=$(echo $UPDATE_RESPONSE | jq -r '.success')
if [ "$SUCCESS" = "true" ]; then
  echo "✅ Database updated successfully!"
else
  ERROR_MSG=$(echo $UPDATE_RESPONSE | jq -r '.error')
  echo "❌ Database update failed: $ERROR_MSG"
  echo ""
  echo "💡 You can manually update the database in Supabase Dashboard:"
  echo "   1. Go to Table Editor → Verification"
  echo "   2. Find blobId: $BLOB_ID"
  echo "   3. Change to: $NEW_BLOB_ID"
  echo "   4. Save"
fi

# Step 6: Test tamper detection
echo ""
echo "🔍 Step 6: Testing tamper detection..."
curl -s -X POST http://localhost:3000/api/walrus/verify \
  -H "Content-Type: application/json" \
  -H "Cookie: anchorproof-session=$USER_ID" \
  -d "{\"blobId\": \"$NEW_BLOB_ID\"}" | jq '.'

echo ""
echo "================================"
echo "✅ Tamper test complete!"
echo ""
echo "📊 Results:"
echo "  Original Blob: $BLOB_ID"
echo "  Tampered Blob: $NEW_BLOB_ID"
echo ""
echo "🔄 To rollback (if update was successful):"
echo "  curl -X POST http://localhost:3000/api/test/update-blob \\"
echo "    -H \"Content-Type: application/json\" \\"
echo "    -H \"Cookie: anchorproof-session=$USER_ID\" \\"
echo "    -d '{\"oldBlobId\": \"$NEW_BLOB_ID\", \"newBlobId\": \"$BLOB_ID\"}'"