<script setup lang="ts">
import { onMounted } from 'vue'
import Sidebar from './Sidebar.vue'
import ContentList from './ContentList.vue'
import Editor from './Editor.vue'
import { useContentTypesStore } from '@renderer/store/contentTypes'
import { useFoldersStore } from '@renderer/store/folders'
import { useTagsStore } from '@renderer/store/tags'
import { useWritingItemsStore } from '@renderer/store/writingItems'

const contentTypesStore = useContentTypesStore()
const foldersStore = useFoldersStore()
const tagsStore = useTagsStore()
const writingItemsStore = useWritingItemsStore()

onMounted(async () => {
  await Promise.all([
    contentTypesStore.loadContentTypes(),
    foldersStore.loadFolders(),
    tagsStore.loadTags(),
    writingItemsStore.loadWritingItems()
  ])
})
</script>

<template>
  <div class="main-layout">
    <Sidebar />
    <ContentList />
    <Editor />
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
</style>
