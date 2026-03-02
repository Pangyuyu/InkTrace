import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WritingItem, NewWritingItem, UpdateWritingItem } from '@renderer/types'

export const useWritingItemsStore = defineStore('writingItems', () => {
  const writingItems = ref<WritingItem[]>([])
  const loading = ref(false)
  const selectedItem = ref<WritingItem | null>(null)
  const filterTypeId = ref<string | null>(null)
  const filterFolderId = ref<string | null>(null)
  const filterTagId = ref<string | null>(null)
  const searchQuery = ref('')

  const filteredItems = computed(() => {
    let items = writingItems.value

    if (filterTypeId.value) {
      items = items.filter((item) => item.typeId === filterTypeId.value)
    }

    if (filterFolderId.value) {
      items = items.filter((item) => item.folderId === filterFolderId.value)
    }

    if (filterTagId.value) {
      items = items.filter((item) =>
        item.tags.some((tag) => tag.id === filterTagId.value)
      )
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query)
      )
    }

    return items
  })

  async function loadWritingItems() {
    loading.value = true
    try {
      writingItems.value = await window.api.writingItems.getAll()
    } catch (error) {
      console.error('Failed to load writing items:', error)
    } finally {
      loading.value = false
    }
  }

  async function loadWritingItemById(id: string) {
    const item = await window.api.writingItems.getById(id)
    if (item) {
      selectedItem.value = item
    }
    return item
  }

  async function createWritingItem(data: NewWritingItem) {
    // 确保只传递可序列化的数据（解包 Vue 响应式代理）
    const tagIdsArray = Array.isArray(data.tagIds) ? [...data.tagIds] : []
    const serializedData = {
      title: String(data.title || ''),
      typeId: String(data.typeId || ''),
      content: String(data.content || ''),
      createdTime: String(data.createdTime || ''),
      isPreciseTime: Boolean(data.isPreciseTime),
      background: String(data.background || ''),
      notes: String(data.notes || ''),
      folderId: data.folderId === '' ? null : (data.folderId || null),
      tagIds: tagIdsArray
    }
    const newItem = await window.api.writingItems.create(serializedData)
    writingItems.value.unshift(newItem)
    selectedItem.value = newItem
    return newItem
  }

  async function updateWritingItem(id: string, data: UpdateWritingItem) {
    // 确保只传递可序列化的数据（解包 Vue 响应式代理）
    const serializedData: Record<string, any> = {}
    if (data.title !== undefined) serializedData.title = data.title
    if (data.typeId !== undefined) serializedData.typeId = data.typeId
    if (data.content !== undefined) serializedData.content = data.content
    if (data.createdTime !== undefined) serializedData.createdTime = data.createdTime
    if (data.isPreciseTime !== undefined) serializedData.isPreciseTime = data.isPreciseTime
    if (data.background !== undefined) serializedData.background = data.background
    if (data.notes !== undefined) serializedData.notes = data.notes
    if (data.folderId !== undefined) serializedData.folderId = data.folderId === '' ? null : data.folderId
    if (data.tagIds !== undefined) serializedData.tagIds = Array.isArray(data.tagIds) ? [...data.tagIds] : []

    await window.api.writingItems.update(id, serializedData)
    const index = writingItems.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      writingItems.value[index] = {
        ...writingItems.value[index],
        ...data,
        updatedAt: new Date().toISOString()
      }
    }
    if (selectedItem.value?.id === id) {
      selectedItem.value = {
        ...selectedItem.value,
        ...data,
        updatedAt: new Date().toISOString()
      }
    }
  }

  async function deleteWritingItem(id: string) {
    await window.api.writingItems.delete(id)
    writingItems.value = writingItems.value.filter((item) => item.id !== id)
    if (selectedItem.value?.id === id) {
      selectedItem.value = null
    }
  }

  async function searchItems(query: string) {
    loading.value = true
    try {
      writingItems.value = await window.api.writingItems.search(query)
    } catch (error) {
      console.error('Failed to search items:', error)
    } finally {
      loading.value = false
    }
  }

  function setFilterTypeId(typeId: string | null) {
    filterTypeId.value = typeId
    filterFolderId.value = null
    filterTagId.value = null
  }

  function setFilterFolderId(folderId: string | null) {
    filterFolderId.value = folderId
    filterTypeId.value = null
    filterTagId.value = null
  }

  function setFilterTagId(tagId: string | null) {
    filterTagId.value = tagId
    filterTypeId.value = null
    filterFolderId.value = null
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function clearFilters() {
    filterTypeId.value = null
    filterFolderId.value = null
    filterTagId.value = null
    searchQuery.value = ''
  }

  function selectItem(item: WritingItem | null) {
    selectedItem.value = item
  }

  return {
    writingItems,
    loading,
    selectedItem,
    filteredItems,
    filterTypeId,
    filterFolderId,
    filterTagId,
    searchQuery,
    loadWritingItems,
    loadWritingItemById,
    createWritingItem,
    updateWritingItem,
    deleteWritingItem,
    searchItems,
    setFilterTypeId,
    setFilterFolderId,
    setFilterTagId,
    setSearchQuery,
    clearFilters,
    selectItem
  }
})
