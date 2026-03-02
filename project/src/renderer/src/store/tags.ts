import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Tag, NewTag } from '@renderer/types'

export const useTagsStore = defineStore('tags', () => {
  const tags = ref<Tag[]>([])
  const loading = ref(false)

  async function loadTags() {
    loading.value = true
    try {
      tags.value = await window.api.tags.getAll()
    } catch (error) {
      console.error('Failed to load tags:', error)
    } finally {
      loading.value = false
    }
  }

  async function createTag(data: NewTag) {
    const newTag = await window.api.tags.create(data)
    tags.value.push(newTag)
    return newTag
  }

  async function updateTag(id: string, data: Partial<NewTag>) {
    await window.api.tags.update(id, data)
    const index = tags.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      tags.value[index] = { ...tags.value[index], ...data }
    }
  }

  async function deleteTag(id: string) {
    await window.api.tags.delete(id)
    tags.value = tags.value.filter((t) => t.id !== id)
  }

  return {
    tags,
    loading,
    loadTags,
    createTag,
    updateTag,
    deleteTag
  }
})
