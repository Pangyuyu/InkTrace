# 墨迹 (InkTrace)

> 记录每一笔思绪

一个用于个人写作内容管理的桌面应用，基于 Tauri 2.0 + Vue 3 + SQLite 构建。

## 项目状态

![Version](https://img.shields.io/badge/version-0.1.0--dev-blue)
![Tauri](https://img.shields.io/badge/Tauri-2.0-green)
![Vue](https://img.shields.io/badge/Vue-3.x-brightgreen)
![License](https://img.shields.io/badge/license-MIT-yellow)

## 功能特性

- 支持多种写作类型（诗、普通文章、技术文章、时事评论、散记、人生感悟）
- 支持自定义添加内容类型
- 标签系统
- 文件夹管理
- SQLite 本地存储
- 数据备份
- Markdown 编辑器
- 深色/浅色主题切换

## 技术栈

| 层级 | 技术 | 版本要求 | 说明 |
|------|------|----------|------|
| 前端框架 | Vue 3 | ^3.3.0 | 渐进式 JavaScript 框架 |
| 状态管理 | Pinia | ^2.1.0 | Vue 官方状态管理库 |
| 类型支持 | TypeScript | ^5.0.0 | 静态类型检查 |
| 桌面框架 | Tauri | ^2.0.0 | 轻量级跨平台桌面应用框架 |
| 后端语言 | Rust | ^1.70.0 | 高性能系统编程语言 |
| 数据库 | SQLite | ^3.0 | 嵌入式关系数据库 |

## 开发指南

### 前置要求

在开始开发之前，请确保已安装以下工具：

| 工具 | 版本要求 | 安装指南 |
|------|----------|----------|
| Node.js | v18+ (推荐 v20+) | [nodejs.org](https://nodejs.org/) |
| Rust | 1.70+ | [rust-lang.org](https://www.rust-lang.org/tools/install) |
| pnpm/npm/yarn | 最新版 | `npm install -g pnpm` |

> **Windows 用户注意**: 还需要安装 [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm (推荐)
pnpm install
```

### 开发模式

```bash
npm run tauri dev
```

### 构建生产版本

```bash
npm run tauri build
```

构建产物位于 `src-tauri/target/release/bundle/` 目录下。

## 项目结构

```
Project-Template/
├── src/                    # 前端源码
│   ├── components/        # Vue 组件
│   ├── views/             # 页面视图
│   ├── store/             # Pinia 状态管理
│   ├── composables/       # 组合式函数
│   ├── utils/             # 工具函数
│   ├── types/             # TypeScript 类型定义
│   ├── assets/            # 静态资源
│   └── App.vue
├── src-tauri/             # Tauri 后端
│   ├── src/               # Rust 源码
│   │   ├── db/            # 数据库操作
│   │   ├── commands/      # Tauri 命令
│   │   └── models/        # 数据模型
│   └── Cargo.toml
├── PROJECT_PLAN.md        # 项目规划文档
└── README.md              # 本文件
```

## 故障排除

### 常见问题

<details>
<summary><b>Rust 编译错误</b></summary>

确保已正确安装 Rust 和相关工具链：

```bash
# 检查 Rust 版本
rustc --version

# 更新 Rust
rustup update
```

Windows 用户请确保已安装 Visual Studio Build Tools。
</details>

<details>
<summary><b>Tauri 开发服务器启动失败</b></summary>

1. 检查端口是否被占用（默认 1420）
2. 清除缓存后重试：
```bash
rm -rf node_modules
rm -rf src-tauri/target
npm install
npm run tauri dev
```
</details>

<details>
<summary><b>SQLite 数据库问题</b></summary>

数据库文件默认存储在应用数据目录下：
- Windows: `%APPDATA%/写作管理器/`
- macOS: `~/Library/Application Support/写作管理器/`
- Linux: `~/.local/share/写作管理器/`
</details>

## 贡献指南

欢迎贡献代码！请查看 [PROJECT_PLAN.md](./PROJECT_PLAN.md) 了解项目规划。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

本项目采用 [MIT License](./LICENSE) 开源协议。

## 致谢

- [Tauri](https://tauri.app/) - 轻量级桌面应用框架
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [SQLite](https://www.sqlite.org/) - 嵌入式数据库
