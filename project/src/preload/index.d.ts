import { ElectronAPI } from '@electron-toolkit/preload'
import type {
  ContentType,
  NewContentType,
  Folder,
  NewFolder,
  Tag,
  NewTag,
  WritingItem,
  NewWritingItem,
  UpdateWritingItem
} from '../main/types'

type ContentTypeAPI = {
  getAll: () => Promise<ContentType[]>
  create: (data: NewContentType) => Promise<ContentType>
  update: (id: string, data: Partial<NewContentType>) => Promise<void>
  delete: (id: string) => Promise<void>
}

type FolderAPI = {
  getAll: () => Promise<Folder[]>
  create: (data: NewFolder) => Promise<Folder>
  update: (id: string, data: Partial<NewFolder>) => Promise<void>
  delete: (id: string) => Promise<void>
}

type TagAPI = {
  getAll: () => Promise<Tag[]>
  create: (data: NewTag) => Promise<Tag>
  update: (id: string, data: Partial<NewTag>) => Promise<void>
  delete: (id: string) => Promise<void>
}

type WritingItemAPI = {
  getAll: () => Promise<WritingItem[]>
  getById: (id: string) => Promise<WritingItem | null>
  create: (data: NewWritingItem) => Promise<WritingItem>
  update: (id: string, data: UpdateWritingItem) => Promise<void>
  delete: (id: string) => Promise<void>
  search: (query: string) => Promise<WritingItem[]>
  getByType: (typeId: string) => Promise<WritingItem[]>
  getByFolder: (folderId: string) => Promise<WritingItem[]>
  getByTag: (tagId: string) => Promise<WritingItem[]>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      contentTypes: ContentTypeAPI
      folders: FolderAPI
      tags: TagAPI
      writingItems: WritingItemAPI
    }
  }
}
