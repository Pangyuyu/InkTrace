import { getDatabase, saveDatabase } from './index'
import type { ContentType, NewContentType, Folder, NewFolder, Tag, NewTag, WritingItem, NewWritingItem, UpdateWritingItem } from '../types'

/**
 * 生成 UUID
 */
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// ==================== Content Type ====================

export function getAllContentTypes(): ContentType[] {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM content_types ORDER BY sort_order')
  const results: ContentType[] = []

  while (stmt.step()) {
    const row = stmt.getAsObject()
    results.push({
      id: row.id as string,
      name: row.name as string,
      icon: row.icon as string,
      color: row.color as string,
      isBuiltIn: (row.is_built_in as number) === 1,
      sortOrder: row.sort_order as number,
      createdAt: row.created_at as string
    })
  }
  stmt.free()

  return results
}

export function createContentType(data: NewContentType): ContentType {
  const db = getDatabase()
  const id = generateId()

  db.run(
    `INSERT INTO content_types (id, name, icon, color, is_built_in, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, data.name, data.icon, data.color, data.isBuiltIn ? 1 : 0, data.sortOrder]
  )
  saveDatabase()

  return { ...data, id, createdAt: new Date().toISOString() }
}

export function updateContentType(id: string, data: Partial<NewContentType>): void {
  const db = getDatabase()
  const fields: string[] = []
  const values: any[] = []

  if (data.name !== undefined) {
    fields.push('name = ?')
    values.push(data.name)
  }
  if (data.icon !== undefined) {
    fields.push('icon = ?')
    values.push(data.icon)
  }
  if (data.color !== undefined) {
    fields.push('color = ?')
    values.push(data.color)
  }
  if (data.sortOrder !== undefined) {
    fields.push('sort_order = ?')
    values.push(data.sortOrder)
  }

  if (fields.length > 0) {
    values.push(id)
    db.run(
      `UPDATE content_types SET ${fields.join(', ')} WHERE id = ?`,
      values
    )
    saveDatabase()
  }
}

export function deleteContentType(id: string): void {
  const db = getDatabase()
  // 检查是否是内置类型
  const stmt = db.prepare('SELECT is_built_in FROM content_types WHERE id = ?')
  stmt.bind([id])
  if (stmt.step()) {
    const row = stmt.getAsObject()
    if ((row.is_built_in as number) === 1) {
      stmt.free()
      throw new Error('Cannot delete built-in content type')
    }
  }
  stmt.free()

  db.run('DELETE FROM content_types WHERE id = ?', [id])
  saveDatabase()
}

// ==================== Folder ====================

export function getAllFolders(): Folder[] {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM folders ORDER BY sort_order')
  const results: Folder[] = []

  while (stmt.step()) {
    const row = stmt.getAsObject()
    results.push({
      id: row.id as string,
      name: row.name as string,
      parentId: row.parent_id as string | null,
      sortOrder: row.sort_order as number,
      createdAt: row.created_at as string
    })
  }
  stmt.free()

  return results
}

export function createFolder(data: NewFolder): Folder {
  const db = getDatabase()
  const id = generateId()

  db.run(
    `INSERT INTO folders (id, name, parent_id, sort_order)
     VALUES (?, ?, ?, ?)`,
    [id, data.name, data.parentId, data.sortOrder]
  )
  saveDatabase()

  return { ...data, id, createdAt: new Date().toISOString() }
}

export function updateFolder(id: string, data: Partial<NewFolder>): void {
  const db = getDatabase()
  const fields: string[] = []
  const values: any[] = []

  if (data.name !== undefined) {
    fields.push('name = ?')
    values.push(data.name)
  }
  if (data.parentId !== undefined) {
    fields.push('parent_id = ?')
    values.push(data.parentId)
  }
  if (data.sortOrder !== undefined) {
    fields.push('sort_order = ?')
    values.push(data.sortOrder)
  }

  if (fields.length > 0) {
    values.push(id)
    db.run(`UPDATE folders SET ${fields.join(', ')} WHERE id = ?`, values)
    saveDatabase()
  }
}

export function deleteFolder(id: string): void {
  const db = getDatabase()
  db.run('DELETE FROM folders WHERE id = ? OR parent_id = ?', [id, id])
  saveDatabase()
}

// ==================== Tag ====================

export function getAllTags(): Tag[] {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM tags ORDER BY name')
  const results: Tag[] = []

  while (stmt.step()) {
    const row = stmt.getAsObject()
    results.push({
      id: row.id as string,
      name: row.name as string,
      color: row.color as string,
      usageCount: row.usage_count as number,
      createdAt: row.created_at as string
    })
  }
  stmt.free()

  return results
}

export function createTag(data: NewTag): Tag {
  const db = getDatabase()
  const id = generateId()

  db.run(
    `INSERT INTO tags (id, name, color)
     VALUES (?, ?, ?)`,
    [id, data.name, data.color]
  )
  saveDatabase()

  return { ...data, id, usageCount: 0, createdAt: new Date().toISOString() }
}

export function updateTag(id: string, data: Partial<NewTag>): void {
  const db = getDatabase()
  const fields: string[] = []
  const values: any[] = []

  if (data.name !== undefined) {
    fields.push('name = ?')
    values.push(data.name)
  }
  if (data.color !== undefined) {
    fields.push('color = ?')
    values.push(data.color)
  }

  if (fields.length > 0) {
    values.push(id)
    db.run(`UPDATE tags SET ${fields.join(', ')} WHERE id = ?`, values)
    saveDatabase()
  }
}

export function deleteTag(id: string): void {
  const db = getDatabase()
  db.run('DELETE FROM tags WHERE id = ?', [id])
  saveDatabase()
}

// ==================== Writing Item ====================

export function getAllWritingItems(): WritingItem[] {
  const db = getDatabase()
  const stmt = db.prepare(`
    SELECT wi.*, ct.name as type_name
    FROM writing_items wi
    LEFT JOIN content_types ct ON wi.type_id = ct.id
    ORDER BY wi.created_at DESC
  `)
  const results: WritingItem[] = []

  while (stmt.step()) {
    const row = stmt.getAsObject()
    const tags = getItemTags(row.id as string)

    results.push({
      id: row.id as string,
      title: row.title as string,
      typeId: row.type_id as string,
      content: row.content as string,
      createdTime: row.created_time as string,
      isPreciseTime: (row.is_precise_time as number) === 1,
      background: row.background as string,
      notes: row.notes as string,
      folderId: row.folder_id as string | null,
      tags,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string
    })
  }
  stmt.free()

  return results
}

export function getWritingItemById(id: string): WritingItem | null {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM writing_items WHERE id = ?')
  stmt.bind([id])

  if (stmt.step()) {
    const row = stmt.getAsObject()
    const tags = getItemTags(id)
    stmt.free()

    return {
      id: row.id as string,
      title: row.title as string,
      typeId: row.type_id as string,
      content: row.content as string,
      createdTime: row.created_time as string,
      isPreciseTime: (row.is_precise_time as number) === 1,
      background: row.background as string,
      notes: row.notes as string,
      folderId: row.folder_id as string | null,
      tags,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string
    }
  }
  stmt.free()
  return null
}

export function createWritingItem(data: NewWritingItem): WritingItem {
  const db = getDatabase()
  const id = generateId()
  const now = new Date().toISOString()
  console.log("createWritingItem",data)
  db.run(
    `INSERT INTO writing_items 
     (id, title, type_id, content, created_time, is_precise_time, background, notes, folder_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.title,
      data.typeId,
      data.content,
      data.createdTime,
      data.isPreciseTime ? 1 : 0,
      data.background,
      data.notes,
      data.folderId,
      now,
      now
    ]
  )

  // 关联标签
  if (data.tagIds && data.tagIds.length > 0) {
    const tagStmt = db.prepare('INSERT INTO writing_item_tags (writing_item_id, tag_id) VALUES (?, ?)')
    data.tagIds.forEach(tagId => tagStmt.run([id, tagId]))
    tagStmt.free()
  }

  saveDatabase()

  return {
    ...data,
    id,
    tags: getAllTags().filter(t => data.tagIds?.includes(t.id)),
    createdAt: now,
    updatedAt: now
  }
}

export function updateWritingItem(id: string, data: UpdateWritingItem): void {
  const db = getDatabase()
  const fields: string[] = []
  const values: any[] = []

  if (data.title !== undefined) {
    fields.push('title = ?')
    values.push(data.title)
  }
  if (data.typeId !== undefined) {
    fields.push('type_id = ?')
    values.push(data.typeId)
  }
  if (data.content !== undefined) {
    fields.push('content = ?')
    values.push(data.content)
  }
  if (data.createdTime !== undefined) {
    fields.push('created_time = ?')
    values.push(data.createdTime)
  }
  if (data.isPreciseTime !== undefined) {
    fields.push('is_precise_time = ?')
    values.push(data.isPreciseTime ? 1 : 0)
  }
  if (data.background !== undefined) {
    fields.push('background = ?')
    values.push(data.background)
  }
  if (data.notes !== undefined) {
    fields.push('notes = ?')
    values.push(data.notes)
  }
  if (data.folderId !== undefined) {
    fields.push('folder_id = ?')
    values.push(data.folderId)
  }

  if (fields.length > 0) {
    values.push(id, new Date().toISOString())
    fields.push('updated_at = ?')
    db.run(`UPDATE writing_items SET ${fields.join(', ')} WHERE id = ?`, values)
  }

  // 更新标签关联
  if (data.tagIds !== undefined) {
    db.run('DELETE FROM writing_item_tags WHERE writing_item_id = ?', [id])
    if (data.tagIds.length > 0) {
      const tagStmt = db.prepare('INSERT INTO writing_item_tags (writing_item_id, tag_id) VALUES (?, ?)')
      data.tagIds.forEach(tagId => tagStmt.run([id, tagId]))
      tagStmt.free()
    }
  }

  saveDatabase()
}

export function deleteWritingItem(id: string): void {
  const db = getDatabase()
  db.run('DELETE FROM writing_items WHERE id = ?', [id])
  saveDatabase()
}

function getItemTags(itemId: string): any[] {
  const db = getDatabase()
  const stmt = db.prepare(`
    SELECT t.* FROM tags t
    INNER JOIN writing_item_tags wit ON t.id = wit.tag_id
    WHERE wit.writing_item_id = ?
  `)
  stmt.bind([itemId])
  const tags: any[] = []

  while (stmt.step()) {
    const row = stmt.getAsObject()
    tags.push({
      id: row.id as string,
      name: row.name as string,
      color: row.color as string,
      usageCount: row.usage_count as number
    })
  }
  stmt.free()

  return tags
}

export function searchWritingItems(query: string): WritingItem[] {
  const db = getDatabase()
  const stmt = db.prepare(`
    SELECT wi.* FROM writing_items wi
    WHERE wi.title LIKE ? OR wi.content LIKE ?
    ORDER BY wi.created_at DESC
  `)
  const searchPattern = `%${query}%`
  stmt.bind([searchPattern, searchPattern])

  const results: WritingItem[] = []
  while (stmt.step()) {
    const row = stmt.getAsObject()
    const tags = getItemTags(row.id as string)

    results.push({
      id: row.id as string,
      title: row.title as string,
      typeId: row.type_id as string,
      content: row.content as string,
      createdTime: row.created_time as string,
      isPreciseTime: (row.is_precise_time as number) === 1,
      background: row.background as string,
      notes: row.notes as string,
      folderId: row.folder_id as string | null,
      tags,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string
    })
  }
  stmt.free()

  return results
}

export function getItemsByTypeId(typeId: string): WritingItem[] {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM writing_items WHERE type_id = ? ORDER BY created_at DESC')
  stmt.bind([typeId])

  const results: WritingItem[] = []
  while (stmt.step()) {
    const row = stmt.getAsObject()
    const tags = getItemTags(row.id as string)

    results.push({
      id: row.id as string,
      title: row.title as string,
      typeId: row.type_id as string,
      content: row.content as string,
      createdTime: row.created_time as string,
      isPreciseTime: (row.is_precise_time as number) === 1,
      background: row.background as string,
      notes: row.notes as string,
      folderId: row.folder_id as string | null,
      tags,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string
    })
  }
  stmt.free()

  return results
}

export function getItemsByFolderId(folderId: string): WritingItem[] {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM writing_items WHERE folder_id = ? ORDER BY created_at DESC')
  stmt.bind([folderId])

  const results: WritingItem[] = []
  while (stmt.step()) {
    const row = stmt.getAsObject()
    const tags = getItemTags(row.id as string)

    results.push({
      id: row.id as string,
      title: row.title as string,
      typeId: row.type_id as string,
      content: row.content as string,
      createdTime: row.created_time as string,
      isPreciseTime: (row.is_precise_time as number) === 1,
      background: row.background as string,
      notes: row.notes as string,
      folderId: row.folder_id as string | null,
      tags,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string
    })
  }
  stmt.free()

  return results
}

export function getItemsByTagId(tagId: string): WritingItem[] {
  const db = getDatabase()
  const stmt = db.prepare(`
    SELECT wi.* FROM writing_items wi
    INNER JOIN writing_item_tags wit ON wi.id = wit.writing_item_id
    WHERE wit.tag_id = ?
    ORDER BY wi.created_at DESC
  `)
  stmt.bind([tagId])

  const results: WritingItem[] = []
  while (stmt.step()) {
    const row = stmt.getAsObject()
    const tags = getItemTags(row.id as string)

    results.push({
      id: row.id as string,
      title: row.title as string,
      typeId: row.type_id as string,
      content: row.content as string,
      createdTime: row.created_time as string,
      isPreciseTime: (row.is_precise_time as number) === 1,
      background: row.background as string,
      notes: row.notes as string,
      folderId: row.folder_id as string | null,
      tags,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string
    })
  }
  stmt.free()

  return results
}
