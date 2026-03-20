# Shop Manager

一个给小店使用的商品管理应用，支持商品新增、编辑、删除、搜索、分类筛选，以及商品图片上传和备注记录。

当前仓库是单体全栈结构：

- 前端：React 18 + Vite + Wouter + TanStack Query + shadcn/ui
- 后端：Express 5
- 数据库：PostgreSQL + Drizzle ORM
- 部署：Railway

## 功能

- 商品列表展示
- 按商品名称搜索
- 按分类筛选
- 新增商品
- 编辑商品
- 删除商品
- 上传商品图片
- 添加商品备注
- 动态聚合商品分类

## 技术栈

### Frontend

- React 18
- TypeScript
- Vite
- Wouter
- TanStack Query
- Tailwind CSS
- shadcn/ui
- Lucide React

### Backend

- Express 5
- TypeScript
- Drizzle ORM
- `pg`
- Zod

## 项目结构

```text
.
├── client/                # 前端应用
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── pages/
│       ├── components/
│       ├── hooks/
│       └── lib/
├── server/                # 后端服务
│   ├── index.ts           # 服务入口
│   ├── routes.ts          # API 路由
│   ├── storage.ts         # 数据访问层
│   ├── static.ts          # 生产静态资源托管
│   └── vite.ts            # 开发模式 Vite 集成
├── shared/
│   └── schema.ts          # 前后端共享 schema 和类型
├── script/
│   └── build.ts           # 构建脚本
├── drizzle.config.ts
├── vite.config.ts
├── tailwind.config.ts
└── railway.json
```

## 数据模型

当前核心数据表为 `products`：

- `id`: 自增主键
- `name`: 商品名称
- `price`: 售价
- `category`: 分类
- `image_data`: 商品图片，前端压缩后以 base64 Data URL 形式存储
- `note`: 备注

定义位置：`shared/schema.ts`

## API

### `GET /api/products`

返回商品列表，按 `id` 倒序。

### `GET /api/categories`

返回已存在商品中的去重分类列表。

### `POST /api/products`

创建商品。

请求体示例：

```json
{
  "name": "可口可乐 500ml",
  "price": 3.5,
  "category": "饮料",
  "imageData": null,
  "note": "可冰镇"
}
```

### `PUT /api/products/:id`

更新指定商品。

### `DELETE /api/products/:id`

删除指定商品。

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

项目至少需要一个 PostgreSQL 连接串：

```bash
export DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

也可以自行创建 `.env` 并通过你自己的方式注入环境变量。

可选变量：

- `PORT`: 服务监听端口，默认 `5000`
- `NODE_ENV`: 开发时由脚本自动设置为 `development`

### 3. 启动开发环境

```bash
npm run dev
```

应用会同时提供：

- 前端页面
- `/api/*` 后端接口

开发模式下由 Express 挂载 Vite 中间件，前后端共用同一个端口。

## 构建与启动

### 构建

```bash
npm run build
```

构建产物：

- 前端输出到 `dist/public`
- 后端输出到 `dist/index.cjs`

### 生产启动

```bash
npm run start
```

生产模式下 Express 会直接托管 `dist/public` 静态文件。

## 数据库说明

- 启动时会自动执行 `CREATE TABLE IF NOT EXISTS products`
- 仓库已配置 `drizzle.config.ts`
- 也提供了 `db:push` 脚本：

```bash
npm run db:push
```

注意：当前项目虽然使用了 Drizzle schema，但表初始化仍包含运行时建表逻辑，迁移体系还不算完全收敛到 migration-first。

## 路由说明

前端使用 hash 路由：

- 默认入口为 `#/`

这样部署时对服务端 history fallback 的依赖更低。

## UI 风格

- 基于 shadcn/ui 组件
- 使用 Tailwind CSS
- 默认主题是偏暖色的小店风格

主题变量定义在 `client/src/index.css`。

## 部署

仓库内已提供 `railway.json`，默认部署方式为：

- 构建命令：`npm run build`
- 启动命令：`npm run start`

## 已知注意点

- 仓库当前没有提供 `.env.example`
- 本地运行前必须先安装依赖并配置 `DATABASE_URL`
- 商品图片以 base64 形式存库，数据量增大后会推高数据库体积，不适合长期大规模使用
- 部分依赖和目录看起来属于脚手架残留，后续可以做一轮清理

## 常用脚本

```bash
npm run dev
npm run build
npm run start
npm run check
npm run db:push
```

## 后续建议

- 增加 `.env.example`
- 增加数据库 migration 文件并统一迁移流程
- 将图片改为对象存储或文件存储，而不是直接存 base64
- 清理未使用依赖
- 增加 README 中的截图和部署说明
