<script setup lang="ts">
import { computed } from 'vue'
import { useContentTypesStore } from '@renderer/store/contentTypes'
import { useFoldersStore } from '@renderer/store/folders'
import { useTagsStore } from '@renderer/store/tags'
import { useWritingItemsStore } from '@renderer/store/writingItems'

const contentTypesStore = useContentTypesStore()
const foldersStore = useFoldersStore()
const tagsStore = useTagsStore()
const writingItemsStore = useWritingItemsStore()

const selectedType = computed(() => writingItemsStore.filterTypeId)
const selectedFolder = computed(() => writingItemsStore.filterFolderId)
const selectedTag = computed(() => writingItemsStore.filterTagId)

function selectType(typeId: string | null) {
  writingItemsStore.setFilterTypeId(typeId)
}

function selectFolder(folderId: string | null) {
  writingItemsStore.setFilterFolderId(folderId)
}

function selectTag(tagId: string | null) {
  writingItemsStore.setFilterTagId(tagId)
}

function clearFilter() {
  writingItemsStore.clearFilters()
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h1>墨迹</h1>
      <span class="slogan">记录每一笔思绪</span>
    </div>

    <nav class="sidebar-nav">
      <!-- 内容类型 -->
      <section class="nav-section">
        <div class="section-header">
          <h2>类型</h2>
        </div>
        <ul class="nav-list">
          <li
            :class="{ active: !selectedType && !selectedFolder && !selectedTag }"
            @click="clearFilter()"
          >
            <span class="icon">📚</span>
            <span>全部</span>
          </li>
          <li
            v-for="type in contentTypesStore.contentTypes"
            :key="type.id"
            :class="{ active: selectedType === type.id }"
            @click="selectType(type.id)"
          >
            <span class="icon">{{ type.icon }}</span>
            <span>{{ type.name }}</span>
          </li>
        </ul>
      </section>

      <!-- 文件夹 -->
      <section class="nav-section">
        <div class="section-header">
          <h2>文件夹</h2>
        </div>
        <ul class="nav-list">
          <li
            v-for="folder in foldersStore.folders"
            :key="folder.id"
            :class="{ active: selectedFolder === folder.id }"
            @click="selectFolder(folder.id)"
          >
            <span class="icon">📁</span>
            <span>{{ folder.name }}</span>
          </li>
        </ul>
      </section>

      <!-- 标签 -->
      <section class="nav-section">
        <div class="section-header">
          <h2>标签</h2>
        </div>
        <ul class="nav-list">
          <li
            v-for="tag in tagsStore.tags"
            :key="tag.id"
            :class="{ active: selectedTag === tag.id }"
            @click="selectTag(tag.id)"
          >
            <span class="icon" :style="{ color: tag.color }">🏷️</span>
            <span>{{ tag.name }}</span>
          </li>
        </ul>
      </section>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  background-color: #1a1a2e;
  color: #eee;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #333;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #333;
}

.sidebar-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.slogan {
  display: block;
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.nav-section {
  margin-bottom: 20px;
}

.section-header {
  padding: 8px 20px;
}

.section-header h2 {
  font-size: 12px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  margin: 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-list li {
  padding: 10px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background-color 0.2s;
}

.nav-list li:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-list li.active {
  background-color: rgba(78, 205, 196, 0.2);
  border-left: 3px solid #4ecdc4;
}

.icon {
  font-size: 16px;
}
</style>
