#!/bin/bash

echo "🖼️ 为集合添加封面图"
echo "======================================"
echo ""

API_URL="http://localhost:3000/mall/collections"
AUTH_TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoiMSIsImlhdCI6MTc2NjY0OTAwOCwiZXhwIjoxNzY2NzM1NDA4fQ.ff2adBc0bBPXufma-Z-X2lv6yFlLIS7R0EE5tvhKgv0"

# 获取所有 Nike 集合
echo "📦 获取集合列表..."
COLLECTIONS=$(curl -s -H "Authorization: $AUTH_TOKEN" "$API_URL?limit=100" | jq -r '.items[] | select(.code | startswith("NIKE_")) | {id, code}')

# 更新 NIKE_TRENDING - 本周热门推荐
echo "1️⃣ 更新 NIKE_TRENDING 封面图..."
TRENDING_ID=$(curl -s -H "Authorization: $AUTH_TOKEN" "$API_URL?limit=100" | jq -r '.items[] | select(.code == "NIKE_TRENDING") | .id')
curl -X PUT "$API_URL/$TRENDING_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -d '{
    "coverImage": "https://images.nike.com.cn/is/image/DotCom/FA24_JORDAN_ECOM_HP_P2_DSK?wid=1500&hei=800&fmt=jpg&qlt=85"
  }' | jq '{id, code, title, coverImage}'
echo ""

# 更新 NIKE_RETRO - 经典复刻
echo "2️⃣ 更新 NIKE_RETRO 封面图..."
RETRO_ID=$(curl -s -H "Authorization: $AUTH_TOKEN" "$API_URL?limit=100" | jq -r '.items[] | select(.code == "NIKE_RETRO") | .id')
curl -X PUT "$API_URL/$RETRO_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -d '{
    "coverImage": "https://images.nike.com.cn/is/image/DotCom/FA24_DUNK_ECOM_HP_P3_DSK?wid=1500&hei=800&fmt=jpg&qlt=85"
  }' | jq '{id, code, title, coverImage}'
echo ""

# 更新 NIKE_SALE - 限时优惠
echo "3️⃣ 更新 NIKE_SALE 封面图..."
SALE_ID=$(curl -s -H "Authorization: $AUTH_TOKEN" "$API_URL?limit=100" | jq -r '.items[] | select(.code == "NIKE_SALE") | .id')
curl -X PUT "$API_URL/$SALE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -d '{
    "coverImage": "https://images.nike.com.cn/is/image/DotCom/FA24_SALE_ECOM_HP_P5_DSK?wid=1500&hei=800&fmt=jpg&qlt=85"
  }' | jq '{id, code, title, coverImage}'
echo ""

echo "✅ 封面图更新完成！"
echo ""
