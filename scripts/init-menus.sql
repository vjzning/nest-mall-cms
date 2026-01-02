-- 菜单与权限初始化脚本
-- 这里的 ID 使用了假设值，实际导入时请根据数据库自增情况调整，或者使用 UUID/雪花 ID
-- 表名: sys_menu
-- type: 1-目录, 2-菜单, 3-按钮

-- 清空旧数据 (可选，请谨慎操作)
-- TRUNCATE TABLE sys_menu;

-- 1. 系统管理 (目录)
INSERT INTO sys_menu (id, parent_id, name, code, type, path, component, icon, sort) VALUES (1, 0, '系统管理', 'system', 1, '/system', 'Layout', 'Settings', 100);

-- 1.1 用户管理 (菜单)
INSERT INTO sys_menu (id, parent_id, name, code, type, path, component, icon, sort) VALUES (11, 1, '用户管理', 'system:user:list', 2, '/system/user', 'system/user/index', 'User', 1);
-- 1.1 按钮权限
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (11, '用户查询', 'system:user:query', 3, 1);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (11, '用户新增', 'system:user:create', 3, 2);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (11, '用户修改', 'system:user:update', 3, 3);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (11, '用户删除', 'system:user:delete', 3, 4);

-- 1.2 角色管理 (菜单)
INSERT INTO sys_menu (id, parent_id, name, code, type, path, component, icon, sort) VALUES (12, 1, '角色管理', 'system:role:list', 2, '/system/role', 'system/role/index', 'Shield', 2);
-- 1.2 按钮权限
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (12, '角色查询', 'system:role:query', 3, 1);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (12, '角色新增', 'system:role:create', 3, 2);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (12, '角色修改', 'system:role:update', 3, 3);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (12, '角色删除', 'system:role:delete', 3, 4);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (12, '分配权限', 'system:role:assign', 3, 5);

-- 1.3 菜单管理 (菜单)
INSERT INTO sys_menu (id, parent_id, name, code, type, path, component, icon, sort) VALUES (13, 1, '菜单管理', 'system:menu:list', 2, '/system/menu', 'system/menu/index', 'Menu', 3);
-- 1.3 按钮权限
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (13, '菜单查询', 'system:menu:query', 3, 1);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (13, '菜单新增', 'system:menu:create', 3, 2);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (13, '菜单修改', 'system:menu:update', 3, 3);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (13, '菜单删除', 'system:menu:delete', 3, 4);

-- 1.4 字典管理 (菜单)
INSERT INTO sys_menu (id, parent_id, name, code, type, path, component, icon, sort) VALUES (14, 1, '字典管理', 'system:dict:list', 2, '/system/dict', 'system/dict/index', 'Book', 4);
-- 1.4 按钮权限
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (14, '字典查询', 'system:dict:query', 3, 1);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (14, '字典新增', 'system:dict:create', 3, 2);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (14, '字典修改', 'system:dict:update', 3, 3);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (14, '字典删除', 'system:dict:delete', 3, 4);

-- 1.5 系统配置 (菜单)
INSERT INTO sys_menu (id, parent_id, name, code, type, path, component, icon, sort) VALUES (15, 1, '系统配置', 'system:config:list', 2, '/system/config', 'system/config/index', 'Settings2', 5);
-- 1.5 按钮权限
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (15, '配置新增', 'system:config:create', 3, 1);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (15, '配置修改', 'system:config:update', 3, 2);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (15, '配置删除', 'system:config:delete', 3, 3);

-- 1.6 操作日志 (菜单)
INSERT INTO sys_menu (id, parent_id, name, code, type, path, component, icon, sort) VALUES (16, 1, '操作日志', 'system:log:list', 2, '/system/log', 'system/log/index', 'ClipboardList', 6);
-- 1.6 按钮权限
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (16, '日志查询', 'system:log:query', 3, 1);

-- 2. 内容管理 (目录)
INSERT INTO sys_menu (id, parent_id, name, code, type, path, component, icon, sort) VALUES (2, 0, '内容管理', 'cms', 1, '/cms', 'Layout', 'FileText', 200);

-- 2.1 文章管理 (菜单)
INSERT INTO sys_menu (id, parent_id, name, code, type, path, component, icon, sort) VALUES (21, 2, '文章管理', 'cms:article:list', 2, '/cms/article', 'cms/article/index', 'FileText', 1);
-- 2.1 按钮权限
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (21, '文章查询', 'cms:article:query', 3, 1);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (21, '文章新增', 'cms:article:create', 3, 2);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (21, '文章修改', 'cms:article:update', 3, 3);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (21, '文章审核', 'cms:article:audit', 3, 4);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (21, '文章删除', 'cms:article:delete', 3, 5);

-- 2.2 分类管理 (菜单)
INSERT INTO sys_menu (id, parent_id, name, code, type, path, component, icon, sort) VALUES (22, 2, '分类管理', 'cms:category:list', 2, '/cms/category', 'cms/category/index', 'FolderTree', 2);
-- 2.2 按钮权限
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (22, '分类查询', 'cms:category:query', 3, 1);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (22, '分类新增', 'cms:category:create', 3, 2);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (22, '分类修改', 'cms:category:update', 3, 3);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (22, '分类删除', 'cms:category:delete', 3, 4);

-- 2.3 标签管理 (菜单)
INSERT INTO sys_menu (id, parent_id, name, code, type, path, component, icon, sort) VALUES (23, 2, '标签管理', 'cms:tag:list', 2, '/cms/tag', 'cms/tag/index', 'Tag', 3);
-- 2.3 按钮权限
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (23, '标签查询', 'cms:tag:query', 3, 1);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (23, '标签新增', 'cms:tag:create', 3, 2);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (23, '标签修改', 'cms:tag:update', 3, 3);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (23, '标签删除', 'cms:tag:delete', 3, 4);

-- 2.4 评论管理 (菜单)
INSERT INTO sys_menu (id, parent_id, name, code, type, path, component, icon, sort) VALUES (24, 2, '评论管理', 'cms:comment:list', 2, '/cms/comment', 'cms/comment/index', 'MessageSquare', 4);
-- 2.4 按钮权限
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (24, '评论审核', 'cms:comment:audit', 3, 1);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (24, '评论删除', 'cms:comment:delete', 3, 2);

-- 2.5 资源管理 (菜单)
INSERT INTO sys_menu (id, parent_id, name, code, type, path, component, icon, sort) VALUES (25, 2, '资源管理', 'cms:resource:list', 2, '/cms/resource', 'cms/resource/index', 'Image', 5);
-- 2.5 按钮权限
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (25, '资源上传', 'cms:resource:upload', 3, 1);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (25, '资源删除', 'cms:resource:delete', 3, 2);

-- 3. 商城管理 (目录)
INSERT INTO sys_menu (id, parent_id, name, code, type, path, component, icon, sort) VALUES (3, 0, '商城管理', 'mall', 1, '/mall', 'Layout', 'ShoppingCart', 300);

-- 3.1 商品管理 (菜单)
INSERT INTO sys_menu (id, parent_id, name, code, type, path, component, icon, sort) VALUES (31, 3, '商品管理', 'mall:product:list', 2, '/mall/product', 'mall/product/index', 'Package', 1);
-- 3.1 按钮权限
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (31, '商品查询', 'mall:product:query', 3, 1);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (31, '商品新增', 'mall:product:create', 3, 2);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (31, '商品修改', 'mall:product:update', 3, 3);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (31, '商品删除', 'mall:product:delete', 3, 4);

-- 3.2 商品分类 (菜单)
INSERT INTO sys_menu (id, parent_id, name, code, type, path, component, icon, sort) VALUES (32, 3, '商品分类', 'mall:category:list', 2, '/mall/category', 'mall/category/index', 'Grid', 2);
-- 3.2 按钮权限
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (32, '分类查询', 'mall:category:query', 3, 1);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (32, '分类新增', 'mall:category:create', 3, 2);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (32, '分类修改', 'mall:category:update', 3, 3);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (32, '分类删除', 'mall:category:delete', 3, 4);

-- 3.3 订单管理 (菜单)
INSERT INTO sys_menu (id, parent_id, name, code, type, path, component, icon, sort) VALUES (33, 3, '订单管理', 'mall:order:list', 2, '/mall/order', 'mall/order/index', 'FileText', 3);
-- 3.3 按钮权限
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (33, '订单查询', 'mall:order:query', 3, 1);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (33, '订单发货', 'mall:order:delivery', 3, 2);

-- 3.4 会员管理 (菜单)
INSERT INTO sys_menu (id, parent_id, name, code, type, path, component, icon, sort) VALUES (34, 3, '会员管理', 'mall:member:list', 2, '/mall/member', 'mall/member/index', 'Users', 4);
-- 3.4 按钮权限
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (34, '会员查询', 'mall:member:query', 3, 1);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (34, '会员修改', 'mall:member:update', 3, 2);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (34, '会员删除', 'mall:member:delete', 3, 3);

-- 3.5 优惠券管理 (菜单)
INSERT INTO sys_menu (id, parent_id, name, code, type, path, component, icon, sort) VALUES (35, 3, '优惠券管理', 'mall:coupon:list', 2, '/mall/coupon', 'mall/coupon/index', 'Ticket', 5);
-- 3.5 按钮权限
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (35, '优惠券查询', 'mall:coupon:query', 3, 1);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (35, '优惠券新增', 'mall:coupon:create', 3, 2);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (35, '优惠券修改', 'mall:coupon:update', 3, 3);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (35, '优惠券删除', 'mall:coupon:delete', 3, 4);

-- 3.6 售后管理 (菜单)
INSERT INTO sys_menu (id, parent_id, name, code, type, path, component, icon, sort) VALUES (36, 3, '售后管理', 'mall:after-sale:list', 2, '/mall/after-sale', 'mall/after-sale/index', 'RotateCcw', 6);
-- 3.6 按钮权限
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (36, '售后查询', 'mall:after-sale:query', 3, 1);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (36, '售后审核', 'mall:after-sale:audit', 3, 2);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (36, '售后收货', 'mall:after-sale:receipt', 3, 3);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (36, '售后补发', 'mall:after-sale:resend', 3, 4);

-- 3.7 运费模板 (菜单)
INSERT INTO sys_menu (id, parent_id, name, code, type, path, component, icon, sort) VALUES (37, 3, '运费模板', 'mall:shipping-template:list', 2, '/mall/shipping-template', 'mall/shipping-template/index', 'Truck', 7);
-- 3.7 按钮权限
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (37, '模板查询', 'mall:shipping-template:query', 3, 1);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (37, '模板新增', 'mall:shipping-template:create', 3, 2);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (37, '模板修改', 'mall:shipping-template:update', 3, 3);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (37, '模板删除', 'mall:shipping-template:delete', 3, 4);

-- 3.8 合集管理 (菜单)
INSERT INTO sys_menu (id, parent_id, name, code, type, path, component, icon, sort) VALUES (38, 3, '合集管理', 'mall:collection:list', 2, '/mall/collection', 'mall/collection/index', 'Layers', 8);
-- 3.8 按钮权限
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (38, '合集查询', 'mall:collection:query', 3, 1);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (38, '合集新增', 'mall:collection:create', 3, 2);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (38, '合集修改', 'mall:collection:update', 3, 3);
INSERT INTO sys_menu (parent_id, name, code, type, sort) VALUES (38, '合集删除', 'mall:collection:delete', 3, 4);

-- 4. 控制面板 (菜单 - 特殊)
INSERT INTO sys_menu (id, parent_id, name, code, type, path, component, icon, sort) VALUES (4, 0, '控制面板', 'dashboard:view', 2, '/dashboard', 'dashboard/index', 'LayoutDashboard', 0);
