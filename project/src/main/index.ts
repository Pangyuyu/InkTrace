import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'
import { initDatabase, closeDatabase } from './db'
import * as repo from './db/repository'
import { IPC_CHANNELS } from './types'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(async () => {
  console.log("========whenReady========")
  // 初始化数据库
  await initDatabase()

  // Set app user model id for windows
  app.setAppUserModelId('com.electron')

  // 开发模式下自动打开 DevTools
  if (process.env.NODE_ENV === 'development' || process.env.ELECTRON_RENDERER_URL) {
    app.on('browser-window-created', (_, window) => {
      window.webContents.openDevTools()
    })
  }

  // ==================== IPC Handlers ====================

  // Content Type
  ipcMain.handle(IPC_CHANNELS.CONTENT_TYPE_GET_ALL, () => repo.getAllContentTypes())
  ipcMain.handle(IPC_CHANNELS.CONTENT_TYPE_CREATE, (_, data) => repo.createContentType(data))
  ipcMain.handle(IPC_CHANNELS.CONTENT_TYPE_UPDATE, (_, id, data) => repo.updateContentType(id, data))
  ipcMain.handle(IPC_CHANNELS.CONTENT_TYPE_DELETE, (_, id) => repo.deleteContentType(id))

  // Folder
  ipcMain.handle(IPC_CHANNELS.FOLDER_GET_ALL, () => repo.getAllFolders())
  ipcMain.handle(IPC_CHANNELS.FOLDER_CREATE, (_, data) => repo.createFolder(data))
  ipcMain.handle(IPC_CHANNELS.FOLDER_UPDATE, (_, id, data) => repo.updateFolder(id, data))
  ipcMain.handle(IPC_CHANNELS.FOLDER_DELETE, (_, id) => repo.deleteFolder(id))

  // Tag
  ipcMain.handle(IPC_CHANNELS.TAG_GET_ALL, () => repo.getAllTags())
  ipcMain.handle(IPC_CHANNELS.TAG_CREATE, (_, data) => repo.createTag(data))
  ipcMain.handle(IPC_CHANNELS.TAG_UPDATE, (_, id, data) => repo.updateTag(id, data))
  ipcMain.handle(IPC_CHANNELS.TAG_DELETE, (_, id) => repo.deleteTag(id))

  // Writing Item
  ipcMain.handle(IPC_CHANNELS.WRITING_ITEM_GET_ALL, () => repo.getAllWritingItems())
  ipcMain.handle(IPC_CHANNELS.WRITING_ITEM_GET_BY_ID, (_, id) => repo.getWritingItemById(id))
  ipcMain.handle(IPC_CHANNELS.WRITING_ITEM_CREATE, (_, data) => repo.createWritingItem(data))
  ipcMain.handle(IPC_CHANNELS.WRITING_ITEM_UPDATE, (_, id, data) => repo.updateWritingItem(id, data))
  ipcMain.handle(IPC_CHANNELS.WRITING_ITEM_DELETE, (_, id) => repo.deleteWritingItem(id))
  ipcMain.handle(IPC_CHANNELS.WRITING_ITEM_SEARCH, (_, query) => repo.searchWritingItems(query))
  ipcMain.handle(IPC_CHANNELS.WRITING_ITEM_GET_BY_TYPE, (_, typeId) => repo.getItemsByTypeId(typeId))
  ipcMain.handle(IPC_CHANNELS.WRITING_ITEM_GET_BY_FOLDER, (_, folderId) => repo.getItemsByFolderId(folderId))
  ipcMain.handle(IPC_CHANNELS.WRITING_ITEM_GET_BY_TAG, (_, tagId) => repo.getItemsByTagId(tagId))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // 关闭数据库
  closeDatabase()

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 应用退出前关闭数据库
app.on('before-quit', () => {
  closeDatabase()
})
