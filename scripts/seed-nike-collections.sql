-- Nike 风格的集合数据
-- 清理现有测试数据
DELETE FROM mall_collection_item WHERE collection_id IN (SELECT id FROM mall_collection WHERE code IN ('NIKE_HERO', 'NIKE_TRENDING', 'NIKE_LIFESTYLE'));
DELETE FROM mall_collection WHERE code IN ('NIKE_HERO', 'NIKE_TRENDING', 'NIKE_LIFESTYLE');

-- 1. 主推英雄集合 (Single Hero Layout)
INSERT INTO mall_collection (
  code, type, title, subtitle, description, 
  cover_image, layout_type, bg_color, 
  metadata, status, sort, start_at, end_at
) VALUES (
  'NIKE_HERO',
  'topic',
  '无畏前行',
  '全新力作',
  '探索全新 Nike 运动系列，无论是赛场还是街头，助你时刻保持领先。',
  'https://images.nike.com.cn/is/image/DotCom/FA24_AF1_ECOM_HP_P1_DSK?wid=1500&hei=1500&fmt=jpg&qlt=85',
  'single_hero',
  '#FFFFFF',
  '{"campaign": "spring-2025", "theme": "performance"}',
  1,
  1,
  NOW(),
  DATE_ADD(NOW(), INTERVAL 30 DAY)
);

-- 2. 本周热门推荐 (Grid Layout - 产品集合)
INSERT INTO mall_collection (
  code, type, title, subtitle, description, 
  cover_image, layout_type, bg_color, 
  metadata, status, sort, start_at, end_at
) VALUES (
  'NIKE_TRENDING',
  'product',
  '本周热门推荐',
  '',
  '挑选最适合你的风格',
  '',
  'grid',
  '#F5F5F5',
  '{"badge": "HOT", "analytics": {"campaign": "weekly-trending"}}',
  1,
  2,
  NOW(),
  NULL
);

-- 为热门推荐添加产品（使用数据库中前4个产品）
INSERT INTO mall_collection_item (collection_id, target_id, title_override, image_override, extra_tag, sort)
SELECT 
  (SELECT id FROM mall_collection WHERE code = 'NIKE_TRENDING'),
  id,
  NULL,
  NULL,
  CASE 
    WHEN id % 4 = 0 THEN 'NEW'
    WHEN id % 4 = 1 THEN 'HOT'
    ELSE NULL
  END,
  (@row_number:=@row_number + 1) as sort
FROM mall_product, (SELECT @row_number:=0) AS t
WHERE status = 1
ORDER BY sort DESC, created_at DESC
LIMIT 4;

-- 3. 生活方式精选 (Split Screen Layout)
INSERT INTO mall_collection (
  code, type, title, subtitle, description, 
  cover_image, layout_type, bg_color, 
  metadata, status, sort, start_at, end_at
) VALUES (
  'NIKE_LIFESTYLE',
  'topic',
  '尽显本色',
  '',
  'Nike Sportswear 经典系列，助你轻松拿捏日常穿搭。',
  'https://images.nike.com.cn/is/image/DotCom/FA24_AF1_ECOM_HP_P4_DSK?wid=1500&hei=800&fmt=jpg&qlt=85',
  'split_screen',
  '#000000',
  '{"theme": "lifestyle", "collection": "sportswear"}',
  1,
  3,
  NOW(),
  NULL
);

-- 4. 经典复刻系列 (Grid Layout - 产品集合)
INSERT INTO mall_collection (
  code, type, title, subtitle, description, 
  cover_image, layout_type, bg_color, 
  metadata, status, sort, start_at, end_at
) VALUES (
  'NIKE_RETRO',
  'product',
  '经典复刻',
  '致敬传奇',
  '重温经典设计，感受永恒魅力',
  '',
  'grid',
  '#FFFFFF',
  '{"collection": "retro", "year": "2025"}',
  1,
  4,
  NOW(),
  NULL
);

-- 为经典复刻添加产品
INSERT INTO mall_collection_item (collection_id, target_id, title_override, image_override, extra_tag, sort)
SELECT 
  (SELECT id FROM mall_collection WHERE code = 'NIKE_RETRO'),
  id,
  NULL,
  NULL,
  'RETRO',
  (@row_number2:=@row_number2 + 1) as sort
FROM mall_product, (SELECT @row_number2:=0) AS t
WHERE status = 1
ORDER BY RAND()
LIMIT 6;

-- 5. 限时优惠 (Grid Layout - 产品集合)
INSERT INTO mall_collection (
  code, type, title, subtitle, description, 
  cover_image, layout_type, bg_color, 
  metadata, status, sort, start_at, end_at
) VALUES (
  'NIKE_SALE',
  'product',
  '限时优惠',
  '全场5折起',
  '精选商品限时特惠，数量有限，售完即止',
  '',
  'grid',
  '#FF6B6B',
  '{"discount": "50", "urgent": true}',
  1,
  5,
  NOW(),
  DATE_ADD(NOW(), INTERVAL 7 DAY)
);

-- 为限时优惠添加产品
INSERT INTO mall_collection_item (collection_id, target_id, title_override, image_override, extra_tag, sort)
SELECT 
  (SELECT id FROM mall_collection WHERE code = 'NIKE_SALE'),
  id,
  NULL,
  NULL,
  'SALE',
  (@row_number3:=@row_number3 + 1) as sort
FROM mall_product, (SELECT @row_number3:=0) AS t
WHERE status = 1
ORDER BY sales DESC
LIMIT 8;

-- 查看创建的集合
SELECT 
  id, code, type, title, subtitle, layout_type, status, sort,
  (SELECT COUNT(*) FROM mall_collection_item WHERE collection_id = mall_collection.id) as item_count
FROM mall_collection 
WHERE code LIKE 'NIKE_%'
ORDER BY sort;
