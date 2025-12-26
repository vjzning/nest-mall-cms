# 快速开始指南 - 集合内容系统

## 🚀 快速启动

### 1. 启动所有服务

在项目根目录打开 **4 个终端窗口**，分别运行：

```bash
# 终端 1: 管理后台 API
npm run dev:api-admin

# 终端 2: 管理后台前端
npm run dev:admin

# 终端 3: 前台 API
npm run dev:api-store

# 终端 4: 前台商城
npm run dev:store
```

### 2. 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 管理后台 | http://localhost:5173 | 管理集合、产品等内容 |
| 管理 API | http://localhost:3000 | 后台管理接口 |
| 前台商城 | http://localhost:4321 | 用户访问的商城页面 |
| 前台 API | http://localhost:3001 | 前台数据接口 |

## 📝 创建第一个集合

### 步骤 1: 登录管理后台
访问 http://localhost:5173 并登录

### 步骤 2: 进入集合管理
点击侧边栏 **商城管理 > 内容集合**

### 步骤 3: 创建新集合
1. 点击 **"创建集合"** 按钮
2. 填写基本信息：
   ```
   代码: SUMMER_SALE
   类型: product (产品集合)
   标题: 夏季大促
   副标题: 全场5折起
   描述: 精选夏季热销商品，限时优惠
   布局类型: grid (网格布局)
   状态: 开启
   ```

### 步骤 4: 添加产品
1. 在 **"Items"** 区域点击 **"Bulk Add"** (批量添加)
2. 从产品列表中选择 3-4 个产品
3. 点击确认

### 步骤 5: 保存
点击右上角 **"Save"** 按钮

## 🎨 查看前台效果

### 方式 1: 首页展示
访问 http://localhost:4321，你创建的集合会自动显示在首页

### 方式 2: 专题页
访问 http://localhost:4321/topic/SUMMER_SALE 查看集合详情页

## 🧪 测试 API

```bash
# 测试获取所有激活的集合
curl http://localhost:3001/collections/active | jq

# 测试获取单个集合
curl http://localhost:3001/collections/SUMMER_SALE | jq

# 测试获取产品列表
curl http://localhost:3001/mall/products | jq
```

## 🎯 不同布局类型效果

### 1. Grid (网格布局)
适合展示多个产品，4 列网格排列
```typescript
layoutType: CollectionLayout.GRID
```

### 2. Single Hero (大图英雄)
适合主推单个专题，全屏大图 + 文字
```typescript
layoutType: CollectionLayout.SINGLE_HERO
```

### 3. Split Screen (分屏)
适合品牌故事，图片 + 文字分屏展示
```typescript
layoutType: CollectionLayout.SPLIT_SCREEN
```

## 💡 高级功能

### 1. 定时发布
设置 **开始时间** 和 **结束时间**，集合会在指定时间段内显示

### 2. 元数据配置
在 **Metadata (JSON)** 中添加自定义配置：
```json
{
  "badge": "HOT",
  "theme": "summer",
  "analytics": {
    "campaign": "summer-2025"
  }
}
```

### 3. 自定义样式
设置 **背景颜色** 来匹配品牌色调：
```
bgColor: #FF6B6B
```

### 4. 覆盖产品信息
在集合项中可以覆盖：
- **标题**: 为产品设置特殊展示名称
- **图片**: 使用不同的产品图片

## 🔧 常见问题

### Q: 集合创建后前台看不到？
A: 检查以下几点：
1. 集合状态是否为 **启用** (status = 1)
2. 是否添加了产品项
3. api-store 服务是否正常运行
4. 刷新前台页面

### Q: 产品价格显示为 0？
A: 确保产品有 SKU，且 SKU 设置了价格

### Q: 如何调整集合显示顺序？
A: 在集合列表中修改 **排序** 字段，数字越小越靠前

## 📚 相关文档

- [完整集成文档](./COLLECTION_INTEGRATION.md)
- [API 文档](./API.md)
- [数据库设计](./DATABASE.md)

---

**提示**: 首次使用建议先创建几个测试集合，熟悉各种布局类型的效果。
