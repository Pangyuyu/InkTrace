# 墨迹 (InkTrace) - 项目规划

## 项目概述
墨迹是一款个人写作内容管理桌面应用，支持管理诗、文章、技术文档等多种类型的写作内容。

**Slogan**: 记录每一笔思绪

## 技术栈
- **前端框架**: Vue 3
- **桌面框架**: Tauri 2.0
- **数据库**: SQLite
- **备份方案**: 可选的文件备份

## 技术决策说明

### 为什么选择 Tauri 而非 Electron？
| 对比项 | Tauri | Electron |
|--------|-------|----------|
| 安装包大小 | ~3-10 MB | ~50-150 MB |
| 内存占用 | 低 (~50MB) | 高 (~150MB+) |
| 安全性 | Rust 后端，更安全 | Node.js 后端 |
| 系统集成 | 原生 Rust API | Node.js API |

### 为什么选择 SQLite？
- **零配置**: 无需安装数据库服务器
- **单文件存储**: 便于备份和迁移
- **高性能**: 适合本地应用的读写模式
- **可靠性**: ACID 事务支持
- **全文搜索**: 内置 FTS5 扩展

### 为什么选择 Vue 3？
- **组合式 API**: 更好的代码组织和复用
- **TypeScript 支持**: 原生类型支持
- **性能提升**: 相比 Vue 2 更快的渲染
- **生态成熟**: Pinia、Vue Router 等配套完善

## 数据模型

### 写作内容项 (WritingItem)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识 |
| title | string | 标题 |
| typeId | string | 类型ID（关联 ContentType） |
| content | string | 正文内容 |
| createdTime | string | 书写时间（支持模糊时间） |
| isPreciseTime | boolean | 是否精确时间 |
| background | string | 写作背景/情境 |
| notes | string | 个人解释/注释 |
| tags | string[] | 标签数组 |
| folderId | string | 文件夹ID（可选） |
| createdAt | string | 软件录入时间 |
| updatedAt | string | 最后修改时间 |

### 内容类型 (ContentType)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识 |
| name | string | 类型名称 |
| icon | string | 图标标识 |
| color | string | 颜色标识 |
| isBuiltIn | boolean | 是否内置类型 |
| sortOrder | number | 排序顺序 |

### 内置类型
- 诗
- 普通文章
- 技术文章
- 时事评论
- 散记
- 人生感悟

### 文件夹/作品集 (Folder)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识 |
| name | string | 文件夹名称 |
| parentId | string | 父文件夹ID（支持嵌套） |
| sortOrder | number | 排序顺序 |
| createdAt | string | 创建时间 |

### 标签 (Tag)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识 |
| name | string | 标签名称 |
| color | string | 颜色标识 |
| usageCount | number | 使用次数 |

## 功能模块

### 1. 内容管理
- 新建写作项
- 编辑写作项
- 删除写作项
- Markdown 编辑器
- 预览模式

### 2. 内容类型管理
- 查看内置类型
- 添加自定义类型
- 编辑类型（名称、图标、颜色）
- 删除自定义类型
- 类型排序

### 3. 浏览与筛选
- 列表视图
- 卡片视图
- 按类型筛选
- 按文件夹筛选
- 按标签筛选
- 按时间范围筛选
- 全文搜索

### 4. 时间管理
- 精确时间选择（年月日时分）
- 模糊时间输入（如"2020年夏"、"大学时期"）
- 时间线视图

### 5. 组织与分类
- 文件夹/作品集管理
- 标签系统
- 内容关联（可选进阶）

### 6. 导出功能
- 导出为 Markdown
- 导出为 PDF
- 导出为 HTML
- 批量导出

### 7. 数据备份
- 自动备份（定时）
- 手动备份
- 数据导入
- SQLite 文件直接备份

### 8. 设置
- 主题切换（深色/浅色）
- 编辑器设置
- 备份设置
- 数据存储路径

## 数据库设计

### SQLite 表结构

```sql
-- 内容类型表
CREATE TABLE content_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    is_built_in INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 文件夹表
CREATE TABLE folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES folders(id)
);

-- 标签表
CREATE TABLE tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 写作内容表
CREATE TABLE writing_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type_id TEXT NOT NULL,
    content TEXT,
    created_time TEXT,
    is_precise_time INTEGER DEFAULT 0,
    background TEXT,
    notes TEXT,
    folder_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (type_id) REFERENCES content_types(id),
    FOREIGN KEY (folder_id) REFERENCES folders(id)
);

-- 写作项-标签关联表
CREATE TABLE writing_item_tags (
    writing_item_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (writing_item_id, tag_id),
    FOREIGN KEY (writing_item_id) REFERENCES writing_items(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- 备份记录表
CREATE TABLE backups (
    id TEXT PRIMARY KEY,
    backup_path TEXT NOT NULL,
    backup_type TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## UI/UX 设计

### 主界面布局
- **左侧边栏**: 导航面板
  - 内容类型列表
  - 文件夹树
  - 标签云
- **中间区域**: 内容列表
  - 列表视图 / 卡片视图切换
  - 搜索和筛选栏
- **右侧区域**: 编辑器/阅读器
  - Markdown 编辑器
  - 预览模式
  - 属性面板

### 界面风格
- 简洁、专注的写作环境
- 支持深色/浅色主题切换
- 沉浸式写作模式（全屏）

## 开发优先级

### v1.0 版本规划（首个正式版本）

v1.0 的目标是提供一个**完整可用的个人写作管理工具**，用户可以：
- 创建、编辑、管理各类写作内容
- 通过标签和文件夹组织内容
- 搜索和筛选内容
- 导出内容为 Markdown
- 切换深色/浅色主题

#### 功能清单

| 模块 | 功能 | 优先级 | 说明 |
|------|------|--------|------|
| **基础架构** | 项目初始化 | P0 | Tauri 2.0 + Vue 3 + TypeScript |
| | SQLite 数据库集成 | P0 | 数据持久化 |
| | 基础数据模型 | P0 | WritingItem, ContentType, Tag, Folder |
| **内容管理** | 写作项创建 | P0 | 标题、内容、类型、时间等 |
| | 写作项编辑 | P0 | Markdown 编辑器 |
| | 写作项删除 | P0 | 支持软删除或确认删除 |
| | 写作项列表 | P0 | 列表视图展示 |
| | 写作项详情 | P0 | 预览模式 |
| **内容类型** | 内置类型 | P0 | 诗、文章、技术文章、评论、散记、感悟 |
| | 自定义类型 | P1 | 添加、编辑、删除自定义类型 |
| | 类型图标/颜色 | P1 | 可自定义图标和颜色 |
| **标签系统** | 创建标签 | P1 | 标签名称、颜色 |
| | 标签关联 | P1 | 为写作项添加/移除标签 |
| | 标签筛选 | P1 | 按标签筛选内容 |
| | 标签管理 | P1 | 编辑、删除标签 |
| **文件夹管理** | 创建文件夹 | P1 | 支持嵌套文件夹 |
| | 文件夹操作 | P1 | 重命名、删除、移动 |
| | 文件夹筛选 | P1 | 按文件夹筛选内容 |
| **搜索筛选** | 全文搜索 | P1 | 搜索标题和内容 |
| | 类型筛选 | P1 | 按内容类型筛选 |
| | 时间筛选 | P2 | 按创建时间/写作时间筛选 |
| **导出功能** | 导出 Markdown | P1 | 单篇导出 |
| | 批量导出 | P2 | 多篇合并导出 |
| **主题设置** | 深色/浅色主题 | P1 | 主题切换 |
| | 编辑器设置 | P2 | 字体大小、行高等 |
| **数据备份** | 手动备份 | P2 | 导出 SQLite 文件 |
| | 数据恢复 | P2 | 导入备份文件 |

#### v1.0 不包含的功能（留待后续版本）
- 时间线视图
- PDF/HTML 导出
- 内容关联
- 写作统计
- 自动备份
- 国际化
- 内容加密

#### 开发里程碑

```
Week 1-2: 基础架构
├── 项目初始化
├── 数据库设计与集成
└── 基础数据模型

Week 3-4: 内容管理核心
├── 写作项 CRUD
├── Markdown 编辑器集成
└── 列表视图

Week 5-6: 组织功能
├── 标签系统
├── 文件夹管理
└── 筛选功能

Week 7-8: 完善与发布
├── 搜索功能
├── 导出功能
├── 主题切换
├── 测试与修复
└── 打包发布
```

---

### Phase 1: MVP (最小可用产品)
- [ ] 项目初始化（Tauri 2.0 + Vue 3）
- [ ] SQLite 数据库集成
- [ ] 基础数据模型
- [ ] 写作项的增删改查
- [ ] Markdown 编辑器
- [ ] 内置内容类型
- [ ] 基础列表视图

### Phase 2: 核心功能
- [ ] 自定义内容类型管理
- [ ] 标签系统
- [ ] 文件夹管理
- [ ] 搜索与筛选
- [ ] 时间线视图
- [ ] 导出功能（Markdown）

### Phase 3: 完善与进阶
- [ ] 数据备份与恢复
- [ ] 主题切换
- [ ] 更多导出格式（PDF、HTML）
- [ ] 批量操作
- [ ] 内容关联
- [ ] 写作统计

## 目录结构规划

```
InkTrace/
├── src/                    # 前端源码
│   ├── components/        # Vue 组件
│   ├── views/             # 页面视图
│   ├── store/             # 状态管理（Pinia）
│   ├── composables/       # Composables
│   ├── utils/             # 工具函数
│   ├── types/             # TypeScript 类型定义
│   ├── assets/            # 静态资源
│   └── App.vue
├── src-tauri/             # Tauri 后端
│   ├── src/               # Rust 源码
│   │   ├── db/            # 数据库操作
│   │   ├── commands/      # Tauri commands
│   │   └── models/        # 数据模型
│   └── Cargo.toml
├── PROJECT_PLAN.md        # 本文件
└── README.md              # 项目说明文档
```

## 测试策略

### 单元测试
| 层级 | 测试框架 | 覆盖目标 |
|------|----------|----------|
| 前端 | Vitest + Vue Test Utils | 组件、Composables、工具函数 |
| 后端 | Rust 内置测试 | 数据库操作、业务逻辑 |

### 集成测试
- Tauri 命令测试：验证前后端通信
- 数据库迁移测试：确保版本升级兼容性
- 导入导出测试：验证数据完整性

### 端到端测试
- 使用 Playwright 或 WebdriverIO
- 覆盖核心用户流程：
  - 创建/编辑/删除写作项
  - 标签管理
  - 文件夹操作
  - 数据备份与恢复

### 测试覆盖率目标
- 单元测试：≥ 80%
- 关键业务逻辑：100%

## 安全考虑

### 数据安全
- **本地存储**: 所有数据存储在用户本地，不上传云端
- **敏感内容**: 支持对单个写作项设置密码保护（可选功能）
- **备份加密**: 可选的备份文件加密（AES-256）

### 应用安全
- **输入验证**: 前后端双重验证用户输入
- **SQL 注入防护**: 使用参数化查询
- **XSS 防护**: Markdown 渲染时过滤危险标签
- **文件访问**: 限制文件系统访问范围

### 安全最佳实践
```rust
// 示例：参数化查询防止 SQL 注入
let items = sqlx::query_as!(
    WritingItem,
    "SELECT * FROM writing_items WHERE title LIKE ?",
    format!("%{}%", search_term)
)
.fetch_all(&pool)
.await?;
```

## 错误处理策略

### 错误分类
| 错误类型 | 处理方式 | 用户提示 |
|----------|----------|----------|
| 数据库错误 | 记录日志 + 回滚事务 | "数据操作失败，请重试" |
| 文件操作错误 | 记录日志 + 降级处理 | "文件操作失败" |
| 网络错误（导出） | 重试机制 | "网络连接失败" |
| 验证错误 | 即时反馈 | 具体验证错误信息 |

### 日志记录
```rust
// 使用 tracing 进行结构化日志记录
use tracing::{info, warn, error, instrument};

#[instrument(skip(pool))]
pub async fn create_item(pool: &SqlitePool, item: NewItem) -> Result<Item, AppError> {
    info!("Creating new item: {}", item.title);
    // ...
}
```

### 前端错误处理
```typescript
// 全局错误处理
const errorHandler: ErrorHandler = (error) => {
  console.error('[App Error]', error)
  // 显示用户友好的错误提示
  showErrorToast(error.userMessage || '操作失败，请稍后重试')
}
```

## 数据迁移策略

### 版本控制
- 数据库使用语义化版本号（如 1.0.0）
- 每个版本记录在 `schema_version` 表中

### 迁移流程
```
应用启动 → 检查当前版本 → 执行增量迁移 → 更新版本号
```

### 迁移脚本示例
```sql
-- migrations/v2_add_fulltext_search.sql
CREATE VIRTUAL TABLE IF NOT EXISTS writing_items_fts USING fts5(
    title,
    content,
    content='writing_items',
    content_rowid='rowid'
);

-- 触发器保持 FTS 索引同步
CREATE TRIGGER IF NOT EXISTS writing_items_ai AFTER INSERT ON writing_items BEGIN
    INSERT INTO writing_items_fts(rowid, title, content) 
    VALUES (new.rowid, new.title, new.content);
END;
```

### 迁移最佳实践
- 迁移脚本不可变，已发布的迁移不再修改
- 每个迁移都有对应的回滚脚本
- 迁移前自动备份数据库

## 性能指标

### 目标性能
| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| 应用启动时间 | < 2 秒 | 冷启动计时 |
| 列表加载（1000条） | < 100ms | 渲染完成时间 |
| 搜索响应时间 | < 50ms | 输入到结果展示 |
| 编辑器输入延迟 | < 16ms (60fps) | 帧率监控 |
| 内存占用（空闲） | < 100MB | 任务管理器 |
| 安装包大小 | < 15MB | 发布包大小 |

### 性能优化策略
- **虚拟列表**: 大数据量列表使用虚拟滚动
- **懒加载**: 编辑器组件按需加载
- **索引优化**: 为常用查询字段建立索引
- **缓存策略**: 缓存常用数据和计算结果
- **防抖节流**: 搜索输入、自动保存等操作

## 国际化计划

### 支持语言
- 简体中文（默认）
- 繁体中文
- English

### 实现方案
使用 Vue I18n 进行国际化：

```typescript
// src/locales/index.ts
import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

export const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})
```

### 需要国际化的内容
- UI 文本（按钮、标签、提示等）
- 错误消息
- 内置内容类型名称
- 日期时间格式
- 数字格式

## 发布计划

### 版本命名规范
- **主版本号**: 重大架构变更或不兼容更新
- **次版本号**: 新功能添加
- **修订号**: Bug 修复和小改进

### 发布渠道
| 渠道 | 说明 | 更新频率 |
|------|------|----------|
| Stable | 稳定版本 | 每月 |
| Beta | 测试版本 | 每周 |
| Nightly | 开发版本 | 每日 |

### 自动更新
- 使用 Tauri 内置更新机制
- 支持静默更新和提示更新
- 更新前自动备份用户数据
```

