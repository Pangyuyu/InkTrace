import initSqlJs, { Database } from 'sql.js'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, writeFileSync, readFileSync } from 'fs'
import { BUILTIN_CONTENT_TYPES, DB_VERSION } from '../types'

let db: Database | null = null

function getDbPath(): string {
  return join(app.getPath('userData'), 'inktrace.db')
}

/**
 * 初始化数据库
 */
export async function initDatabase(): Promise<Database> {
  const DB_PATH = getDbPath()
  const SQL = await initSqlJs({
    // 使用本地 wasm 文件路径（从构建输出目录加载）
    locateFile: (file) => {
      if (file.endsWith('.wasm')) {
        const path = require('path')
        return path.join(__dirname, file)
      }
      return `https://sql.js.org/dist/${file}`
    }
  })

  // 如果数据库文件存在，加载它
  if (existsSync(DB_PATH)) {
    const fileBuffer = readFileSync(DB_PATH)
    db = new SQL.Database(fileBuffer)
  } else {
    // 创建新数据库
    db = new SQL.Database()
    createTables()
    saveDatabase()
  }

  return db
}

/**
 * 创建表结构
 */
function createTables(): void {
  if (!db) return

  // 内容类型表
  db.run(`
    CREATE TABLE IF NOT EXISTS content_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      is_built_in INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 文件夹表
  db.run(`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES folders(id)
    )
  `)

  // 标签表
  db.run(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT,
      usage_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 写作内容表
  db.run(`
    CREATE TABLE IF NOT EXISTS writing_items (
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
    )
  `)

  // 写作项 - 标签关联表
  db.run(`
    CREATE TABLE IF NOT EXISTS writing_item_tags (
      writing_item_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (writing_item_id, tag_id),
      FOREIGN KEY (writing_item_id) REFERENCES writing_items(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `)

  // 插入内置内容类型
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO content_types (id, name, icon, color, is_built_in, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  BUILTIN_CONTENT_TYPES.forEach((type, index) => {
    insertStmt.run([`type_${index}`, type.name, type.icon, type.color, 1, type.sortOrder])
  })
  insertStmt.free()
}

/**
 * 保存数据库到文件
 */
export function saveDatabase(): void {
  if (!db) return
  const data = db.export()
  const buffer = Buffer.from(data)
  writeFileSync(getDbPath(), buffer)
}

/**
 * 获取数据库实例
 */
export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized')
  }
  return db
}

/**
 * 关闭数据库
 */
export function closeDatabase(): void {
  if (db) {
    saveDatabase()
    db.close()
    db = null
  }
}
