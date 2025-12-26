-- 更新产品数据为鞋子相关
-- 先清空现有产品和SKU
DELETE FROM mall_product_sku;
DELETE FROM mall_product;

-- 插入Nike风格鞋子产品
INSERT INTO mall_product
    (id, name, description, cover, images, detail, status, sort, sales, view_count, created_at, updated_at)
VALUES
    (1, 'Air Max 270',
        '标志性的Nike Air Max 270采用大型Max Air单元，提供全天候舒适体验。流线型设计与经典气垫科技完美融合。',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800", "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800", "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800", "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800"]',
        '鞋面：透气网眼材质与合成材料\n中底：全掌Air Max气垫\n外底：橡胶华夫格纹路\n鞋带闭合系统',
        1, 1, 1280, 5600, NOW(), NOW()),

    (2, 'Air Force 1 ''07',
        '经典永不过时。Nike Air Force 1 ''07以1982年的原版设计为基础，采用经久耐用的皮革鞋面和标志性的Air气垫。',
        'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800',
        '["https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800", "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800", "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800", "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800"]',
        '鞋面：全粒面皮革\n中底：封装式Air-Sole气垫\n外底：非贴合式杯形鞋底\n穿孔鞋头设计',
        1, 2, 2560, 12800, NOW(), NOW()),

    (3, 'Dunk Low Retro',
        'Dunk Low以80年代的篮球传奇为灵感，如今已成为街头文化的标志。经典配色搭配现代细节。',
        'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=800',
        '["https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=800", "https://images.unsplash.com/photo-1612902377937-2f7c8a6e24e4?w=800", "https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=800", "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800"]',
        '鞋面：皮革与合成材料\n中底：轻质泡棉\n外底：橡胶人字纹底\nPadded低帮领口',
        1, 3, 1890, 8900, NOW(), NOW()),

    (4, 'Air Jordan 1 High OG',
        '1985年的传奇再现。Air Jordan 1 High OG保留了原版设计的每一个细节，从翼标到Air-Sole气垫。',
        'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800',
        '["https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800", "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800", "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800", "https://images.unsplash.com/photo-1584735174914-9f8c8a7c8c4f?w=800"]',
        '鞋面：全粒面皮革\n中底：封装式Air-Sole气垫\n外底：实心橡胶\n标志性翼标设计',
        1, 4, 3200, 15600, NOW(), NOW()),

    (5, 'Zoom Fly 5',
        '专为追求速度的跑者打造。Nike Zoom Fly 5采用ZoomX泡棉与碳纤维板，助你突破个人最佳。',
        'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
        '["https://images.unsplash.com/photo-1539185441755-769473a23570?w=800", "https://images.unsplash.com/photo-1562183241-b937e95585b6?w=800", "https://images.unsplash.com/photo-1605408499391-6368c628ef42?w=800", "https://images.unsplash.com/photo-1606890658317-7d14490b76fd?w=800"]',
        '鞋面：透气Flyknit编织\n中底：ZoomX泡棉+碳纤维板\n外底：橡胶华夫格\n重量：约269克(男款US9)',
        1, 5, 980, 4500, NOW(), NOW()),

    (6, 'Blazer Mid ''77 Vintage',
        '复古篮球风格的现代演绎。Blazer Mid ''77采用做旧处理的皮革鞋面，展现岁月沉淀的独特魅力。',
        'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
        '["https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800", "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800", "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800", "https://images.unsplash.com/photo-1465453869711-7e174808ace9?w=800"]',
        '鞋面：做旧皮革材质\n中底：发泡橡胶\n外底：硫化橡胶\n露出的泡棉鞋舌标签',
        1, 6, 1560, 7200, NOW(), NOW()),

    (7, 'React Infinity Run 3',
        '稳定性与舒适性的完美结合。Nike React Infinity Run 3采用加宽的前掌和React泡棉，减少跑步伤害。',
        'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800',
        '["https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800", "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800", "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800"]',
        '鞋面：Flyknit编织技术\n中底：Nike React泡棉\n外底：橡胶华夫格\n加宽前掌设计',
        1, 7, 760, 3800, NOW(), NOW()),

    (8, 'Pegasus 40',
        '传奇跑鞋的最新篇章。Nike Pegasus 40采用双密度Air Zoom气垫，为每一步提供澎湃能量回馈。',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
        '["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800", "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800", "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800", "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800"]',
        '鞋面：工程网眼透气材料\n中底：双密度Air Zoom气垫\n外底：耐磨橡胶\n10mm鞋跟落差',
        1, 8, 2100, 9800, NOW(), NOW());

-- 为每个产品插入尺码SKU (38-46码)
-- 产品1: Air Max 270 (价格: 1299)
INSERT INTO mall_product_sku
    (id, product_id, code, specs, price, market_price, stock, created_at, updated_at)
VALUES
    (1, 1, 'AM270-38', '[{"key": "尺码", "value": "38"}]', 1299, 1599, 50, NOW(), NOW()),
    (2, 1, 'AM270-39', '[{"key": "尺码", "value": "39"}]', 1299, 1599, 80, NOW(), NOW()),
    (3, 1, 'AM270-40', '[{"key": "尺码", "value": "40"}]', 1299, 1599, 120, NOW(), NOW()),
    (4, 1, 'AM270-41', '[{"key": "尺码", "value": "41"}]', 1299, 1599, 100, NOW(), NOW()),
    (5, 1, 'AM270-42', '[{"key": "尺码", "value": "42"}]', 1299, 1599, 90, NOW(), NOW()),
    (6, 1, 'AM270-43', '[{"key": "尺码", "value": "43"}]', 1299, 1599, 70, NOW(), NOW()),
    (7, 1, 'AM270-44', '[{"key": "尺码", "value": "44"}]', 1299, 1599, 60, NOW(), NOW()),
    (8, 1, 'AM270-45', '[{"key": "尺码", "value": "45"}]', 1299, 1599, 40, NOW(), NOW()),
    (9, 1, 'AM270-46', '[{"key": "尺码", "value": "46"}]', 1299, 1599, 25, NOW(), NOW()),

    -- 产品2: Air Force 1 (价格: 899)
    (10, 2, 'AF1-38', '[{"key": "尺码", "value": "38"}]', 899, 1099, 150, NOW(), NOW()),
    (11, 2, 'AF1-39', '[{"key": "尺码", "value": "39"}]', 899, 1099, 200, NOW(), NOW()),
    (12, 2, 'AF1-40', '[{"key": "尺码", "value": "40"}]', 899, 1099, 250, NOW(), NOW()),
    (13, 2, 'AF1-41', '[{"key": "尺码", "value": "41"}]', 899, 1099, 220, NOW(), NOW()),
    (14, 2, 'AF1-42', '[{"key": "尺码", "value": "42"}]', 899, 1099, 180, NOW(), NOW()),
    (15, 2, 'AF1-43', '[{"key": "尺码", "value": "43"}]', 899, 1099, 150, NOW(), NOW()),
    (16, 2, 'AF1-44', '[{"key": "尺码", "value": "44"}]', 899, 1099, 100, NOW(), NOW()),
    (17, 2, 'AF1-45', '[{"key": "尺码", "value": "45"}]', 899, 1099, 60, NOW(), NOW()),
    (18, 2, 'AF1-46', '[{"key": "尺码", "value": "46"}]', 899, 1099, 30, NOW(), NOW()),

    -- 产品3: Dunk Low (价格: 799)
    (19, 3, 'DL-38', '[{"key": "尺码", "value": "38"}]', 799, 999, 80, NOW(), NOW()),
    (20, 3, 'DL-39', '[{"key": "尺码", "value": "39"}]', 799, 999, 120, NOW(), NOW()),
    (21, 3, 'DL-40', '[{"key": "尺码", "value": "40"}]', 799, 999, 150, NOW(), NOW()),
    (22, 3, 'DL-41', '[{"key": "尺码", "value": "41"}]', 799, 999, 130, NOW(), NOW()),
    (23, 3, 'DL-42', '[{"key": "尺码", "value": "42"}]', 799, 999, 110, NOW(), NOW()),
    (24, 3, 'DL-43', '[{"key": "尺码", "value": "43"}]', 799, 999, 90, NOW(), NOW()),
    (25, 3, 'DL-44', '[{"key": "尺码", "value": "44"}]', 799, 999, 70, NOW(), NOW()),
    (26, 3, 'DL-45', '[{"key": "尺码", "value": "45"}]', 799, 999, 40, NOW(), NOW()),
    (27, 3, 'DL-46', '[{"key": "尺码", "value": "46"}]', 799, 999, 20, NOW(), NOW()),

    -- 产品4: Air Jordan 1 (价格: 1699)
    (28, 4, 'AJ1-38', '[{"key": "尺码", "value": "38"}]', 1699, 1999, 30, NOW(), NOW()),
    (29, 4, 'AJ1-39', '[{"key": "尺码", "value": "39"}]', 1699, 1999, 50, NOW(), NOW()),
    (30, 4, 'AJ1-40', '[{"key": "尺码", "value": "40"}]', 1699, 1999, 80, NOW(), NOW()),
    (31, 4, 'AJ1-41', '[{"key": "尺码", "value": "41"}]', 1699, 1999, 70, NOW(), NOW()),
    (32, 4, 'AJ1-42', '[{"key": "尺码", "value": "42"}]', 1699, 1999, 60, NOW(), NOW()),
    (33, 4, 'AJ1-43', '[{"key": "尺码", "value": "43"}]', 1699, 1999, 45, NOW(), NOW()),
    (34, 4, 'AJ1-44', '[{"key": "尺码", "value": "44"}]', 1699, 1999, 35, NOW(), NOW()),
    (35, 4, 'AJ1-45', '[{"key": "尺码", "value": "45"}]', 1699, 1999, 20, NOW(), NOW()),
    (36, 4, 'AJ1-46', '[{"key": "尺码", "value": "46"}]', 1699, 1999, 10, NOW(), NOW()),

    -- 产品5: Zoom Fly 5 (价格: 1199)
    (37, 5, 'ZF5-38', '[{"key": "尺码", "value": "38"}]', 1199, 1399, 40, NOW(), NOW()),
    (38, 5, 'ZF5-39', '[{"key": "尺码", "value": "39"}]', 1199, 1399, 60, NOW(), NOW()),
    (39, 5, 'ZF5-40', '[{"key": "尺码", "value": "40"}]', 1199, 1399, 90, NOW(), NOW()),
    (40, 5, 'ZF5-41', '[{"key": "尺码", "value": "41"}]', 1199, 1399, 85, NOW(), NOW()),
    (41, 5, 'ZF5-42', '[{"key": "尺码", "value": "42"}]', 1199, 1399, 75, NOW(), NOW()),
    (42, 5, 'ZF5-43', '[{"key": "尺码", "value": "43"}]', 1199, 1399, 55, NOW(), NOW()),
    (43, 5, 'ZF5-44', '[{"key": "尺码", "value": "44"}]', 1199, 1399, 45, NOW(), NOW()),
    (44, 5, 'ZF5-45', '[{"key": "尺码", "value": "45"}]', 1199, 1399, 25, NOW(), NOW()),
    (45, 5, 'ZF5-46', '[{"key": "尺码", "value": "46"}]', 1199, 1399, 15, NOW(), NOW()),

    -- 产品6: Blazer Mid (价格: 799)
    (46, 6, 'BM77-38', '[{"key": "尺码", "value": "38"}]', 799, 999, 60, NOW(), NOW()),
    (47, 6, 'BM77-39', '[{"key": "尺码", "value": "39"}]', 799, 999, 90, NOW(), NOW()),
    (48, 6, 'BM77-40', '[{"key": "尺码", "value": "40"}]', 799, 999, 110, NOW(), NOW()),
    (49, 6, 'BM77-41', '[{"key": "尺码", "value": "41"}]', 799, 999, 100, NOW(), NOW()),
    (50, 6, 'BM77-42', '[{"key": "尺码", "value": "42"}]', 799, 999, 85, NOW(), NOW()),
    (51, 6, 'BM77-43', '[{"key": "尺码", "value": "43"}]', 799, 999, 65, NOW(), NOW()),
    (52, 6, 'BM77-44', '[{"key": "尺码", "value": "44"}]', 799, 999, 50, NOW(), NOW()),
    (53, 6, 'BM77-45', '[{"key": "尺码", "value": "45"}]', 799, 999, 30, NOW(), NOW()),
    (54, 6, 'BM77-46', '[{"key": "尺码", "value": "46"}]', 799, 999, 15, NOW(), NOW()),

    -- 产品7: React Infinity Run 3 (价格: 1099)
    (55, 7, 'RIR3-38', '[{"key": "尺码", "value": "38"}]', 1099, 1299, 45, NOW(), NOW()),
    (56, 7, 'RIR3-39', '[{"key": "尺码", "value": "39"}]', 1099, 1299, 70, NOW(), NOW()),
    (57, 7, 'RIR3-40', '[{"key": "尺码", "value": "40"}]', 1099, 1299, 95, NOW(), NOW()),
    (58, 7, 'RIR3-41', '[{"key": "尺码", "value": "41"}]', 1099, 1299, 80, NOW(), NOW()),
    (59, 7, 'RIR3-42', '[{"key": "尺码", "value": "42"}]', 1099, 1299, 70, NOW(), NOW()),
    (60, 7, 'RIR3-43', '[{"key": "尺码", "value": "43"}]', 1099, 1299, 55, NOW(), NOW()),
    (61, 7, 'RIR3-44', '[{"key": "尺码", "value": "44"}]', 1099, 1299, 40, NOW(), NOW()),
    (62, 7, 'RIR3-45', '[{"key": "尺码", "value": "45"}]', 1099, 1299, 25, NOW(), NOW()),
    (63, 7, 'RIR3-46', '[{"key": "尺码", "value": "46"}]', 1099, 1299, 12, NOW(), NOW()),

    -- 产品8: Pegasus 40 (价格: 999)
    (64, 8, 'PG40-38', '[{"key": "尺码", "value": "38"}]', 999, 1199, 80, NOW(), NOW()),
    (65, 8, 'PG40-39', '[{"key": "尺码", "value": "39"}]', 999, 1199, 120, NOW(), NOW()),
    (66, 8, 'PG40-40', '[{"key": "尺码", "value": "40"}]', 999, 1199, 150, NOW(), NOW()),
    (67, 8, 'PG40-41', '[{"key": "尺码", "value": "41"}]', 999, 1199, 140, NOW(), NOW()),
    (68, 8, 'PG40-42', '[{"key": "尺码", "value": "42"}]', 999, 1199, 120, NOW(), NOW()),
    (69, 8, 'PG40-43', '[{"key": "尺码", "value": "43"}]', 999, 1199, 90, NOW(), NOW()),
    (70, 8, 'PG40-44', '[{"key": "尺码", "value": "44"}]', 999, 1199, 70, NOW(), NOW()),
    (71, 8, 'PG40-45', '[{"key": "尺码", "value": "45"}]', 999, 1199, 45, NOW(), NOW()),
    (72, 8, 'PG40-46', '[{"key": "尺码", "value": "46"}]', 999, 1199, 25, NOW(), NOW());

-- 查看结果
SELECT p.id, p.name, p.cover, COUNT(s.id) as sku_count
FROM mall_product p
    LEFT JOIN mall_product_sku s ON p.id = s.product_id
GROUP BY p.id;
