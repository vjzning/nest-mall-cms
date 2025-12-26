#!/bin/bash

echo "🧪 Testing Collection API Integration"
echo "======================================"
echo ""

echo "1️⃣ Testing GET /collections/active"
echo "-----------------------------------"
curl -s http://localhost:3001/collections/active | jq '.' || echo "❌ Failed to fetch active collections"
echo ""

echo "2️⃣ Testing GET /mall/products"
echo "-----------------------------------"
curl -s http://localhost:3001/mall/products | jq '.[0:2]' || echo "❌ Failed to fetch products"
echo ""

echo "✅ API Tests Complete!"
