#!/bin/bash

echo "🖼️ 更新集合封面图 (使用公开图片源)"
echo "======================================"
echo ""

API_URL="http://localhost:3000/mall/collections"
AUTH_TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoiMSIsImlhdCI6MTc2NjY0OTAwOCwiZXhwIjoxNzY2NzM1NDA4fQ.ff2adBc0bBPXufma-Z-X2lv6yFlLIS7R0EE5tvhKgv0"

# 更新 NIKE_HERO - 主推英雄
echo "1️⃣ 更新 NIKE_HERO 封面图..."
HERO_ID=$(curl -s -H "Authorization: $AUTH_TOKEN" "$API_URL?limit=100" | jq -r '.items[] | select(.code == "NIKE_HERO") | .id')
curl -X PUT "$API_URL/$HERO_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -d '{
    "coverImage": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1500&h=1500&fit=crop"
  }' | jq '{id, code, title, coverImage}'
echo ""

# 更新 NIKE_TRENDING - 本周热门推荐
echo "2️⃣ 更新 NIKE_TRENDING 封面图..."
TRENDING_ID=$(curl -s -H "Authorization: $AUTH_TOKEN" "$API_URL?limit=100" | jq -r '.items[] | select(.code == "NIKE_TRENDING") | .id')
curl -X PUT "$API_URL/$TRENDING_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -d '{
    "coverImage": "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1500&h=800&fit=crop"
  }' | jq '{id, code, title, coverImage}'
echo ""

# 更新 NIKE_LIFESTYLE - 生活方式
echo "3️⃣ 更新 NIKE_LIFESTYLE 封面图..."
LIFESTYLE_ID=$(curl -s -H "Authorization: $AUTH_TOKEN" "$API_URL?limit=100" | jq -r '.items[] | select(.code == "NIKE_LIFESTYLE") | .id')
curl -X PUT "$API_URL/$LIFESTYLE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -d '{
    "coverImage": "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1500&h=800&fit=crop"
  }' | jq '{id, code, title, coverImage}'
echo ""

# 更新 NIKE_RETRO - 经典复刻
echo "4️⃣ 更新 NIKE_RETRO 封面图..."
RETRO_ID=$(curl -s -H "Authorization: $AUTH_TOKEN" "$API_URL?limit=100" | jq -r '.items[] | select(.code == "NIKE_RETRO") | .id')
curl -X PUT "$API_URL/$RETRO_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -d '{
    "coverImage": "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=1500&h=800&fit=crop"
  }' | jq '{id, code, title, coverImage}'
echo ""

# 更新 NIKE_SALE - 限时优惠
echo "5️⃣ 更新 NIKE_SALE 封面图..."
SALE_ID=$(curl -s -H "Authorization: $AUTH_TOKEN" "$API_URL?limit=100" | jq -r '.items[] | select(.code == "NIKE_SALE") | .id')
curl -X PUT "$API_URL/$SALE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -d '{
    "coverImage": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1500&h=800&fit=crop"
  }' | jq '{id, code, title, coverImage}'
echo ""

echo "✅ 封面图更新完成！"
echo ""
echo "📸 使用的图片来源: Unsplash (运动鞋主题)"
echo ""
echo "🌐 查看效果:"
echo "   - http://localhost:4321/topic/NIKE_HERO"
echo "   - http://localhost:4321/topic/NIKE_TRENDING"
echo "   - http://localhost:4321/topic/NIKE_LIFESTYLE"
echo "   - http://localhost:4321/topic/NIKE_RETRO"
echo "   - http://localhost:4321/topic/NIKE_SALE"
echo ""
