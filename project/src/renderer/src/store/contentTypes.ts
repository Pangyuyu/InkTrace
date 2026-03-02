import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ContentType, NewContentType } from '@renderer/types'

export const useContentTypesStore = defineStore('contentTypes', () => {
  const contentTypes = ref<ContentType[]>([])
  const loading = ref(false)

  const builtInTypes = computed(() =>
    contentTypes.value.filter((t) => t.isBuiltIn)
  )

  const customTypes = computed(() =>
    contentTypes.value.filter((t) => !t.isBuiltIn)
  )

  async function loadContentTypes() {
    loading.value = true
    try {
      contentTypes.value = await window.api.contentTypes.getAll()
    } catch (error) {
      console.error('Failed to load content types:', error)
    } finally {
      loading.value = false
    }
  }

  async function createContentType(data: NewContentType) {
    const newType = await window.api.contentTypes.create(data)
    contentTypes.value.push(newType)
    return newType
  }

  async function updateContentType(id: string, data: Partial<NewContentType>) {
    await window.api.contentTypes.update(id, data)
    const index = contentTypes.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      contentTypes.value[index] = { ...contentTypes.value[index], ...data }
    }
  }

  async function deleteContentType(id: string) {
    await window.api.contentTypes.delete(id)
    contentTypes.value = contentTypes.value.filter((t) => t.id !== id)
  }

  return {
    contentTypes,
    loading,
    builtInTypes,
    customTypes,
    loadContentTypes,
    createContentType,
    updateContentType,
    deleteContentType
  }
})
