#!/bin/bash

echo "🌱 创建 Nike 风格集合数据"
echo "======================================"
echo ""

API_URL="http://localhost:3000/mall/collections"
AUTH_TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoiMSIsImlhdCI6MTc2NjY0OTAwOCwiZXhwIjoxNzY2NzM1NDA4fQ.ff2adBc0bBPXufma-Z-X2lv6yFlLIS7R0EE5tvhKgv0"

echo "📦 获取产品列表..."
PRODUCTS=$(curl -s http://localhost:3001/mall/products | jq -r '.[0:20] | map(.id) | @json')
echo "找到产品: $PRODUCTS"
echo ""

# 提取前几个产品 ID
PRODUCT_IDS=($(echo $PRODUCTS | jq -r '.[]'))

# 1. 创建主推英雄集合 (Single Hero)
echo "1️⃣ 创建主推英雄集合..."
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -d '{
    "code": "NIKE_HERO",
    "type": "topic",
    "title": "无畏前行",
    "subtitle": "全新力作",
    "description": "探索全新 Nike 运动系列，无论是赛场还是街头，助你时刻保持领先。",
    "coverImage": "https://images.nike.com.cn/is/image/DotCom/FA24_AF1_ECOM_HP_P1_DSK?wid=1500&hei=1500&fmt=jpg&qlt=85",
    "layoutType": "single_hero",
    "bgColor": "#FFFFFF",
    "metadata": {"campaign": "spring-2025", "theme": "performance"},
    "status": 1,
    "sort": 1,
    "items": []
  }' | jq '.'
echo ""

# 2. 创建本周热门推荐 (Grid - 产品集合)
echo "2️⃣ 创建本周热门推荐..."
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -d "{
    \"code\": \"NIKE_TRENDING\",
    \"type\": \"product\",
    \"title\": \"本周热门推荐\",
    \"subtitle\": \"\",
    \"description\": \"挑选最适合你的风格\",
    \"coverImage\": \"\",
    \"layoutType\": \"grid\",
    \"bgColor\": \"#F5F5F5\",
    \"metadata\": {\"badge\": \"HOT\", \"analytics\": {\"campaign\": \"weekly-trending\"}},
    \"status\": 1,
    \"sort\": 2,
    \"items\": [
      {\"targetId\": ${PRODUCT_IDS[0]}, \"sort\": 0, \"extraTag\": \"NEW\"},
      {\"targetId\": ${PRODUCT_IDS[1]}, \"sort\": 1, \"extraTag\": \"HOT\"},
      {\"targetId\": ${PRODUCT_IDS[2]}, \"sort\": 2, \"extraTag\": \"NEW\"},
      {\"targetId\": ${PRODUCT_IDS[3]}, \"sort\": 3, \"extraTag\": \"HOT\"}
    ]
  }" | jq '.'
echo ""

# 3. 创建生活方式精选 (Split Screen)
echo "3️⃣ 创建生活方式精选..."
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -d '{
    "code": "NIKE_LIFESTYLE",
    "type": "topic",
    "title": "尽显本色",
    "subtitle": "",
    "description": "Nike Sportswear 经典系列，助你轻松拿捏日常穿搭。",
    "coverImage": "https://images.nike.com.cn/is/image/DotCom/FA24_AF1_ECOM_HP_P4_DSK?wid=1500&hei=800&fmt=jpg&qlt=85",
    "layoutType": "split_screen",
    "bgColor": "#000000",
    "metadata": {"theme": "lifestyle", "collection": "sportswear"},
    "status": 1,
    "sort": 3,
    "items": []
  }' | jq '.'
echo ""

# 4. 创建经典复刻系列 (Grid - 产品集合)
echo "4️⃣ 创建经典复刻系列..."
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -d "{
    \"code\": \"NIKE_RETRO\",
    \"type\": \"product\",
    \"title\": \"经典复刻\",
    \"subtitle\": \"致敬传奇\",
    \"description\": \"重温经典设计，感受永恒魅力\",
    \"coverImage\": \"\",
    \"layoutType\": \"grid\",
    \"bgColor\": \"#FFFFFF\",
    \"metadata\": {\"collection\": \"retro\", \"year\": \"2025\"},
    \"status\": 1,
    \"sort\": 4,
    \"items\": [
      {\"targetId\": ${PRODUCT_IDS[4]}, \"sort\": 0, \"extraTag\": \"RETRO\"},
      {\"targetId\": ${PRODUCT_IDS[5]}, \"sort\": 1, \"extraTag\": \"RETRO\"},
      {\"targetId\": ${PRODUCT_IDS[6]}, \"sort\": 2, \"extraTag\": \"RETRO\"},
      {\"targetId\": ${PRODUCT_IDS[7]}, \"sort\": 3, \"extraTag\": \"RETRO\"},
      {\"targetId\": ${PRODUCT_IDS[8]}, \"sort\": 4, \"extraTag\": \"RETRO\"},
      {\"targetId\": ${PRODUCT_IDS[9]}, \"sort\": 5, \"extraTag\": \"RETRO\"}
    ]
  }" | jq '.'
echo ""

# 5. 创建限时优惠 (Grid - 产品集合)
echo "5️⃣ 创建限时优惠..."
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -d "{
    \"code\": \"NIKE_SALE\",
    \"type\": \"product\",
    \"title\": \"限时优惠\",
    \"subtitle\": \"全场5折起\",
    \"description\": \"精选商品限时特惠，数量有限，售完即止\",
    \"coverImage\": \"\",
    \"layoutType\": \"grid\",
    \"bgColor\": \"#FF6B6B\",
    \"metadata\": {\"discount\": \"50\", \"urgent\": true},
    \"status\": 1,
    \"sort\": 5,
    \"items\": [
      {\"targetId\": ${PRODUCT_IDS[10]}, \"sort\": 0, \"extraTag\": \"SALE\"},
      {\"targetId\": ${PRODUCT_IDS[11]}, \"sort\": 1, \"extraTag\": \"SALE\"},
      {\"targetId\": ${PRODUCT_IDS[12]}, \"sort\": 2, \"extraTag\": \"SALE\"},
      {\"targetId\": ${PRODUCT_IDS[13]}, \"sort\": 3, \"extraTag\": \"SALE\"},
      {\"targetId\": ${PRODUCT_IDS[14]}, \"sort\": 4, \"extraTag\": \"SALE\"},
      {\"targetId\": ${PRODUCT_IDS[15]}, \"sort\": 5, \"extraTag\": \"SALE\"},
      {\"targetId\": ${PRODUCT_IDS[16]}, \"sort\": 6, \"extraTag\": \"SALE\"},
      {\"targetId\": ${PRODUCT_IDS[17]}, \"sort\": 7, \"extraTag\": \"SALE\"}
    ]
  }" | jq '.'
echo ""

echo "✅ Nike 风格集合数据创建完成！"
echo ""
echo "🌐 现在可以访问以下地址查看效果:"
echo "   - 管理后台: http://localhost:5173/mall/collection"
echo "   - 前台首页: http://localhost:4321"
echo "   - 专题页示例: http://localhost:4321/topic/NIKE_HERO"
echo ""
