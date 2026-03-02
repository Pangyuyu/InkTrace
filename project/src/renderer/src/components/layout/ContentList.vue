<script setup lang="ts">
import { computed } from 'vue'
import { useWritingItemsStore } from '@renderer/store/writingItems'
import { useContentTypesStore } from '@renderer/store/contentTypes'

const writingItemsStore = useWritingItemsStore()
const contentTypesStore = useContentTypesStore()

const items = computed(() => writingItemsStore.filteredItems)

function getTypeName(typeId: string): string {
  const type = contentTypesStore.contentTypes.find((t) => t.id === typeId)
  return type?.name || '未知类型'
}

function selectItem(id: string) {
  writingItemsStore.loadWritingItemById(id)
}

function createNewItem() {
  writingItemsStore.selectItem(null)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="content-list">
    <div class="content-list-header">
      <h2>文章列表</h2>
      <button class="btn-new" @click="createNewItem">+ 新建</button>
    </div>

    <div class="search-bar">
      <input
        v-model="writingItemsStore.searchQuery"
        type="text"
        placeholder="搜索标题或内容..."
        class="search-input"
      />
    </div>

    <div class="items-container">
      <div v-if="items.length === 0" class="empty-state">
        <p>暂无内容</p>
      </div>

      <div
        v-for="item in items"
        :key="item.id"
        :class="['item', { selected: writingItemsStore.selectedItem?.id === item.id }]"
        @click="selectItem(item.id)"
      >
        <div class="item-header">
          <h3 class="item-title">{{ item.title }}</h3>
          <span class="item-type">{{ getTypeName(item.typeId) }}</span>
        </div>
        <p class="item-preview">{{ item.content.substring(0, 100) || '无内容' }}</p>
        <div class="item-footer">
          <span class="item-time">{{ formatDate(item.createdAt) }}</span>
          <div class="item-tags">
            <span v-for="tag in item.tags" :key="tag.id" class="tag" :style="{ backgroundColor: tag.color }">
              {{ tag.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-list {
  width: 350px;
  background-color: #f5f5f5;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.content-list-header {
  padding: 20px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-list-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.btn-new {
  padding: 8px 16px;
  background-color: #4ecdc4;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-new:hover {
  background-color: #45b7d1;
}

.search-bar {
  padding: 10px 20px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #4ecdc4;
}

.items-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.item {
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item.selected {
  box-shadow: 0 2px 8px rgba(78, 205, 196, 0.3);
  border: 1px solid #4ecdc4;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  flex: 1;
}

.item-type {
  font-size: 12px;
  color: #888;
  background-color: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
}

.item-preview {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.item-time {
  font-size: 12px;
  color: #999;
}

.item-tags {
  display: flex;
  gap: 4px;
}

.tag {
  font-size: 11px;
  color: #fff;
  padding: 2px 6px;
  border-radius: 3px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}
</style>
