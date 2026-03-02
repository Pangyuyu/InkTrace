/**
 * 内容类型 (ContentType)
 */
export interface ContentType {
  id: string
  name: string
  icon: string
  color: string
  isBuiltIn: boolean
  sortOrder: number
  createdAt?: string
}

/**
 * 新建内容类型
 */
export interface NewContentType extends Omit<ContentType, 'id' | 'createdAt'> {}

/**
 * 文件夹 (Folder)
 */
export interface Folder {
  id: string
  name: string
  parentId: string | null
  sortOrder: number
  createdAt: string
}

/**
 * 新建文件夹
 */
export interface NewFolder extends Omit<Folder, 'id' | 'createdAt'> {}

/**
 * 标签 (Tag)
 */
export interface Tag {
  id: string
  name: string
  color: string
  usageCount: number
  createdAt?: string
}

/**
 * 新建标签
 */
export interface NewTag extends Omit<Tag, 'id' | 'usageCount' | 'createdAt'> {}

/**
 * 写作内容项 (WritingItem)
 */
export interface WritingItem {
  id: string
  title: string
  typeId: string
  content: string
  createdTime: string
  isPreciseTime: boolean
  background: string
  notes: string
  folderId: string | null
  tags: Tag[]
  createdAt: string
  updatedAt: string
}

/**
 * 新建写作项
 */
export interface NewWritingItem {
  title: string
  typeId: string
  content: string
  createdTime: string
  isPreciseTime: boolean
  background: string
  notes: string
  folderId: string | null
  tagIds?: string[]
}

/**
 * 更新写作项
 */
export interface UpdateWritingItem {
  title?: string
  typeId?: string
  content?: string
  createdTime?: string
  isPreciseTime?: boolean
  background?: string
  notes?: string
  folderId?: string | null
  tagIds?: string[]
}

/**
 * 内置内容类型
 */
export const BUILTIN_CONTENT_TYPES: Omit<ContentType, 'id' | 'createdAt'>[] = [
  { name: '诗', icon: '📝', color: '#ff6b6b', isBuiltIn: true, sortOrder: 0 },
  { name: '普通文章', icon: '📄', color: '#4ecdc4', isBuiltIn: true, sortOrder: 1 },
  { name: '技术文章', icon: '💻', color: '#45b7d1', isBuiltIn: true, sortOrder: 2 },
  { name: '时事评论', icon: '📰', color: '#96ceb4', isBuiltIn: true, sortOrder: 3 },
  { name: '散记', icon: '📔', color: '#ffeaa7', isBuiltIn: true, sortOrder: 4 },
  { name: '人生感悟', icon: '💭', color: '#dfe6e9', isBuiltIn: true, sortOrder: 5 }
]

/**
 * 数据库版本
 */
export const DB_VERSION = 1

/**
 * IPC 通道定义
 */
export const IPC_CHANNELS = {
  // Content Type
  CONTENT_TYPE_GET_ALL: 'content-type:get-all',
  CONTENT_TYPE_CREATE: 'content-type:create',
  CONTENT_TYPE_UPDATE: 'content-type:update',
  CONTENT_TYPE_DELETE: 'content-type:delete',

  // Folder
  FOLDER_GET_ALL: 'folder:get-all',
  FOLDER_CREATE: 'folder:create',
  FOLDER_UPDATE: 'folder:update',
  FOLDER_DELETE: 'folder:delete',

  // Tag
  TAG_GET_ALL: 'tag:get-all',
  TAG_CREATE: 'tag:create',
  TAG_UPDATE: 'tag:update',
  TAG_DELETE: 'tag:delete',

  // Writing Item
  WRITING_ITEM_GET_ALL: 'writing-item:get-all',
  WRITING_ITEM_GET_BY_ID: 'writing-item:get-by-id',
  WRITING_ITEM_CREATE: 'writing-item:create',
  WRITING_ITEM_UPDATE: 'writing-item:update',
  WRITING_ITEM_DELETE: 'writing-item:delete',
  WRITING_ITEM_SEARCH: 'writing-item:search',
  WRITING_ITEM_GET_BY_TYPE: 'writing-item:get-by-type',
  WRITING_ITEM_GET_BY_FOLDER: 'writing-item:get-by-folder',
  WRITING_ITEM_GET_BY_TAG: 'writing-item:get-by-tag'
} as const
