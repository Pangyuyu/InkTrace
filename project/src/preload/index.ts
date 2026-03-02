import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC_CHANNELS } from '../main/types'
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

// 数据库 API
const dbAPI = {
  // Content Type
  contentTypes: {
    getAll: () => ipcRenderer.invoke(IPC_CHANNELS.CONTENT_TYPE_GET_ALL) as Promise<ContentType[]>,
    create: (data: NewContentType) =>
      ipcRenderer.invoke(IPC_CHANNELS.CONTENT_TYPE_CREATE, data) as Promise<ContentType>,
    update: (id: string, data: Partial<NewContentType>) =>
      ipcRenderer.invoke(IPC_CHANNELS.CONTENT_TYPE_UPDATE, id, data) as Promise<void>,
    delete: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.CONTENT_TYPE_DELETE, id) as Promise<void>
  },

  // Folder
  folders: {
    getAll: () => ipcRenderer.invoke(IPC_CHANNELS.FOLDER_GET_ALL) as Promise<Folder[]>,
    create: (data: NewFolder) =>
      ipcRenderer.invoke(IPC_CHANNELS.FOLDER_CREATE, data) as Promise<Folder>,
    update: (id: string, data: Partial<NewFolder>) =>
      ipcRenderer.invoke(IPC_CHANNELS.FOLDER_UPDATE, id, data) as Promise<void>,
    delete: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FOLDER_DELETE, id) as Promise<void>
  },

  // Tag
  tags: {
    getAll: () => ipcRenderer.invoke(IPC_CHANNELS.TAG_GET_ALL) as Promise<Tag[]>,
    create: (data: NewTag) =>
      ipcRenderer.invoke(IPC_CHANNELS.TAG_CREATE, data) as Promise<Tag>,
    update: (id: string, data: Partial<NewTag>) =>
      ipcRenderer.invoke(IPC_CHANNELS.TAG_UPDATE, id, data) as Promise<void>,
    delete: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.TAG_DELETE, id) as Promise<void>
  },

  // Writing Item
  writingItems: {
    getAll: () => ipcRenderer.invoke(IPC_CHANNELS.WRITING_ITEM_GET_ALL) as Promise<WritingItem[]>,
    getById: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.WRITING_ITEM_GET_BY_ID, id) as Promise<WritingItem | null>,
    create: (data: NewWritingItem) =>
      ipcRenderer.invoke(IPC_CHANNELS.WRITING_ITEM_CREATE, data) as Promise<WritingItem>,
    update: (id: string, data: UpdateWritingItem) =>
      ipcRenderer.invoke(IPC_CHANNELS.WRITING_ITEM_UPDATE, id, data) as Promise<void>,
    delete: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.WRITING_ITEM_DELETE, id) as Promise<void>,
    search: (query: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.WRITING_ITEM_SEARCH, query) as Promise<WritingItem[]>,
    getByType: (typeId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.WRITING_ITEM_GET_BY_TYPE, typeId) as Promise<WritingItem[]>,
    getByFolder: (folderId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.WRITING_ITEM_GET_BY_FOLDER, folderId) as Promise<WritingItem[]>,
    getByTag: (tagId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.WRITING_ITEM_GET_BY_TAG, tagId) as Promise<WritingItem[]>
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', dbAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = dbAPI
}
