import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Folder, NewFolder } from '@renderer/types'

export const useFoldersStore = defineStore('folders', () => {
  const folders = ref<Folder[]>([])
  const loading = ref(false)

  async function loadFolders() {
    loading.value = true
    try {
      folders.value = await window.api.folders.getAll()
    } catch (error) {
      console.error('Failed to load folders:', error)
    } finally {
      loading.value = false
    }
  }

  async function createFolder(data: NewFolder) {
    const newFolder = await window.api.folders.create(data)
    folders.value.push(newFolder)
    return newFolder
  }

  async function updateFolder(id: string, data: Partial<NewFolder>) {
    await window.api.folders.update(id, data)
    const index = folders.value.findIndex((f) => f.id === id)
    if (index !== -1) {
      folders.value[index] = { ...folders.value[index], ...data }
    }
  }

  async function deleteFolder(id: string) {
    await window.api.folders.delete(id)
    folders.value = folders.value.filter((f) => f.id !== id)
  }

  return {
    folders,
    loading,
    loadFolders,
    createFolder,
    updateFolder,
    deleteFolder
  }
})
