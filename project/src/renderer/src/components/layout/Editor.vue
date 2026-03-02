<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useWritingItemsStore } from '@renderer/store/writingItems'
import { useContentTypesStore } from '@renderer/store/contentTypes'
import { useTagsStore } from '@renderer/store/tags'
import { useFoldersStore } from '@renderer/store/folders'
import type { NewWritingItem, UpdateWritingItem } from '@renderer/types'

const writingItemsStore = useWritingItemsStore()
const contentTypesStore = useContentTypesStore()
const tagsStore = useTagsStore()
const foldersStore = useFoldersStore()

const isEditing = ref(false)
const title = ref('')
const content = ref('')
const typeId = ref('')
const createdTime = ref('')
const isPreciseTime = ref(false)
const background = ref('')
const notes = ref('')
const folderId = ref('')
const selectedTagIds = ref<string[]>([])

const selectedItem = computed(() => writingItemsStore.selectedItem)

watch(
  selectedItem,
  (item) => {
    if (item) {
      title.value = item.title
      content.value = item.content
      typeId.value = item.typeId
      createdTime.value = item.createdTime
      isPreciseTime.value = item.isPreciseTime
      background.value = item.background
      notes.value = item.notes
      folderId.value = item.folderId || ''
      selectedTagIds.value = item.tags.map((t) => t.id)
      isEditing.value = false
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

function resetForm() {
  title.value = ''
  content.value = ''
  typeId.value = contentTypesStore.contentTypes[0]?.id || ''
  createdTime.value = new Date().toISOString().slice(0, 16)
  isPreciseTime.value = true
  background.value = ''
  notes.value = ''
  folderId.value = ''
  selectedTagIds.value = []
  isEditing.value = true
}

function enableEdit() {
  isEditing.value = true
}

function cancelEdit() {
  if (selectedItem.value) {
    title.value = selectedItem.value.title
    content.value = selectedItem.value.content
    typeId.value = selectedItem.value.typeId
    createdTime.value = selectedItem.value.createdTime
    isPreciseTime.value = selectedItem.value.isPreciseTime
    background.value = selectedItem.value.background
    notes.value = selectedItem.value.notes
    folderId.value = selectedItem.value.folderId || ''
    selectedTagIds.value = selectedItem.value.tags.map((t) => t.id)
  }
  isEditing.value = false
}

async function saveItem() {
  // 验证标题
  if (!title.value.trim()) {
    alert('请输入标题')
    return
  }

  const data = {
    title: title.value.trim(),
    content: content.value,
    typeId: typeId.value,
    createdTime: createdTime.value,
    isPreciseTime: isPreciseTime.value,
    background: background.value,
    notes: notes.value,
    folderId: folderId.value || null,
    tagIds: selectedTagIds.value
  }

  if (selectedItem.value) {
    await writingItemsStore.updateWritingItem(selectedItem.value.id, data)
  } else {
    await writingItemsStore.createWritingItem(data)
  }
  isEditing.value = false
}

async function deleteItem() {
  if (selectedItem.value && confirm('确定要删除这篇文章吗？')) {
    await writingItemsStore.deleteWritingItem(selectedItem.value.id)
  }
}

function toggleTag(tagId: string) {
  const index = selectedTagIds.value.indexOf(tagId)
  if (index === -1) {
    selectedTagIds.value.push(tagId)
  } else {
    selectedTagIds.value.splice(index, 1)
  }
}
</script>

<template>
  <div class="editor">
    <div v-if="!selectedItem && !isEditing" class="empty-editor">
      <p>选择一篇文章或创建新文章</p>
    </div>

    <div v-else class="editor-content">
      <div class="editor-header">
        <input
          v-if="isEditing"
          v-model="title"
          type="text"
          placeholder="标题"
          class="title-input"
        />
        <h2 v-else class="title">{{ title }}</h2>

        <div class="editor-actions">
          <button v-if="!isEditing" class="btn btn-edit" @click="enableEdit">编辑</button>
          <template v-else>
            <button class="btn btn-cancel" @click="cancelEdit">取消</button>
            <button class="btn btn-save" @click="saveItem">保存</button>
          </template>
          <button
            v-if="selectedItem && !isEditing"
            class="btn btn-delete"
            @click="deleteItem"
          >
            删除
          </button>
        </div>
      </div>

      <div class="editor-meta">
        <div class="meta-row">
          <label>类型：</label>
          <select v-if="isEditing" v-model="typeId" class="meta-select">
            <option
              v-for="type in contentTypesStore.contentTypes"
              :key="type.id"
              :value="type.id"
            >
              {{ type.icon }} {{ type.name }}
            </option>
          </select>
          <span v-else class="meta-value">
            {{ contentTypesStore.contentTypes.find((t) => t.id === typeId)?.icon }}
            {{ contentTypesStore.contentTypes.find((t) => t.id === typeId)?.name }}
          </span>
        </div>

        <div class="meta-row">
          <label>时间：</label>
          <input
            v-if="isEditing"
            v-model="createdTime"
            type="datetime-local"
            class="meta-input"
          />
          <span v-else class="meta-value">{{ createdTime || '未设置' }}</span>
        </div>

        <div class="meta-row">
          <label>文件夹：</label>
          <select v-if="isEditing" v-model="folderId" class="meta-select">
            <option value="">无</option>
            <option
              v-for="folder in foldersStore.folders"
              :key="folder.id"
              :value="folder.id"
            >
              {{ folder.name }}
            </option>
          </select>
          <span v-else class="meta-value">
            {{ foldersStore.folders.find((f) => f.id === folderId)?.name || '无' }}
          </span>
        </div>

        <div class="meta-row">
          <label>标签：</label>
          <div v-if="isEditing" class="tag-selector">
            <span
              v-for="tag in tagsStore.tags"
              :key="tag.id"
              :class="['tag-option', { selected: selectedTagIds.includes(tag.id) }]"
              @click="toggleTag(tag.id)"
            >
              {{ tag.name }}
            </span>
          </div>
          <div v-else class="tags-display">
            <span
              v-for="tag in selectedItem?.tags"
              :key="tag.id"
              class="tag"
              :style="{ backgroundColor: tag.color }"
            >
              {{ tag.name }}
            </span>
            <span v-if="!selectedItem?.tags?.length" class="meta-value">无标签</span>
          </div>
        </div>
      </div>

      <div class="editor-body">
        <textarea
          v-if="isEditing"
          v-model="content"
          placeholder="开始写作..."
          class="content-editor"
        ></textarea>
        <div v-else class="content-preview">
          <pre>{{ content || '无内容' }}</pre>
        </div>
      </div>

      <div v-if="background || notes" class="editor-notes">
        <div v-if="background" class="notes-section">
          <h4>写作背景</h4>
          <p>{{ background }}</p>
        </div>
        <div v-if="notes" class="notes-section">
          <h4>注释</h4>
          <p>{{ notes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor {
  flex: 1;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.empty-editor {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 16px;
}

.editor-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.editor-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-input {
  flex: 1;
  font-size: 20px;
  font-weight: 600;
  border: none;
  padding: 8px 0;
}

.title-input:focus {
  outline: none;
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.editor-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.8;
}

.btn-edit {
  background-color: #4ecdc4;
  color: #fff;
}

.btn-cancel {
  background-color: #e0e0e0;
  color: #333;
}

.btn-save {
  background-color: #4ecdc4;
  color: #fff;
}

.btn-delete {
  background-color: #ff6b6b;
  color: #fff;
}

.editor-meta {
  padding: 15px 20px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
}

.meta-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.meta-row label {
  width: 60px;
  color: #666;
}

.meta-select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.meta-input {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.meta-value {
  color: #333;
}

.tag-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-option {
  padding: 4px 10px;
  background-color: #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tag-option.selected {
  background-color: #4ecdc4;
  color: #fff;
}

.tags-display {
  display: flex;
  gap: 4px;
}

.tag {
  font-size: 12px;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
}

.editor-body {
  flex: 1;
  overflow: hidden;
  padding: 20px;
}

.content-editor {
  width: 100%;
  height: 100%;
  border: none;
  resize: none;
  font-size: 16px;
  line-height: 1.8;
  font-family: inherit;
}

.content-editor:focus {
  outline: none;
}

.content-preview {
  height: 100%;
  overflow-y: auto;
  font-size: 16px;
  line-height: 1.8;
}

.content-preview pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: inherit;
}

.editor-notes {
  padding: 20px;
  background-color: #f9f9f9;
  border-top: 1px solid #e0e0e0;
  max-height: 200px;
  overflow-y: auto;
}

.notes-section {
  margin-bottom: 15px;
}

.notes-section:last-child {
  margin-bottom: 0;
}

.notes-section h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
}

.notes-section p {
  margin: 0;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}
</style>
