<template>
  <div class="writing-items-view">
    <div class="header">
      <h1>写作内容管理</h1>
      <button class="new-item-btn" @click="showCreateDialog = true">
        新建写作项
      </button>
    </div>

    <div class="content">
      <div v-if="isLoading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="fetchItems">重试</button>
      </div>
      <div v-else-if="items.length === 0" class="empty-state">
        <p>暂无写作内容</p>
        <button @click="showCreateDialog = true">创建第一个写作项</button>
      </div>
      <div v-else class="items-list">
        <div class="items-grid">
          <div
            v-for="item in items"
            :key="item.id"
            class="item-card"
            @click="selectItem(item)"
          >
            <div class="item-header">
              <span class="item-type" :style="{ backgroundColor: getTypeColor(item.typeId) }">
                {{ getTypeName(item.typeId) }}
              </span>
              <div class="item-actions">
                <button @click.stop="editItem(item)">编辑</button>
                <button @click.stop="deleteItem(item)" class="delete-btn">删除</button>
              </div>
            </div>
            <h3 class="item-title">{{ item.title }}</h3>
            <p class="item-content-preview">
              {{ getContentPreview(item.content) }}
            </p>
            <div class="item-footer">
              <div class="item-tags">
                <span
                  v-for="tag in item.tags"
                  :key="tag.id"
                  class="tag"
                  :style="{ backgroundColor: tag.color || '#e0e0e0' }"
                >
                  {{ tag.name }}
                </span>
              </div>
              <div class="item-date">
                {{ formatDate(item.createdAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建/编辑对话框 -->
    <div v-if="showCreateDialog || showEditDialog" class="dialog-overlay">
      <div class="dialog">
        <h2>{{ isEditing ? '编辑写作项' : '新建写作项' }}</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="title">标题 *</label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              required
              placeholder="请输入标题"
            />
          </div>

          <div class="form-group">
            <label for="typeId">内容类型</label>
            <select id="typeId" v-model="formData.typeId" required>
              <option value="">请选择类型</option>
              <option
                v-for="type in contentTypes"
                :key="type.id"
                :value="type.id"
                :style="{ color: type.color }"
              >
                {{ type.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>内容</label>
            <MarkdownEditor
              v-model="formData.content"
              :placeholder="'请输入Markdown内容...'"
              :rows="6"
            />
          </div>

          <div class="form-group">
            <label for="createdTime">创建时间</label>
            <input
              id="createdTime"
              v-model="formData.createdTime"
              type="datetime-local"
            />
          </div>

          <div class="form-group">
            <label>
              <input
                v-model="formData.isPreciseTime"
                type="checkbox"
              />
              精确时间
            </label>
          </div>

          <div class="form-group">
            <label for="background">背景</label>
            <input
              id="background"
              v-model="formData.background"
              type="text"
              placeholder="背景信息"
            />
          </div>

          <div class="form-group">
            <label for="notes">备注</label>
            <textarea
              id="notes"
              v-model="formData.notes"
              rows="3"
              placeholder="备注信息..."
            ></textarea>
          </div>

          <div class="dialog-actions">
            <button type="button" @click="closeDialog">取消</button>
            <button type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? '提交中...' : (isEditing ? '更新' : '创建') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteConfirm" class="dialog-overlay">
      <div class="dialog">
        <h2>确认删除</h2>
        <p>确定要删除 "{{ selectedItem?.title }}" 吗？此操作不可恢复。</p>
        <div class="dialog-actions">
          <button @click="showDeleteConfirm = false">取消</button>
          <button @click="confirmDelete" class="delete-btn">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useWritingItemStore } from '../store';
import { useContentTypeStore } from '../store';
import MarkdownEditor from '../components/MarkdownEditor.vue';
import type { WritingItemWithTags, NewWritingItem } from '../types';

const writingItemStore = useWritingItemStore();
const contentTypeStore = useContentTypeStore();

const items = computed(() => writingItemStore.getItems);
const isLoading = computed(() => writingItemStore.isLoading);
const error = computed(() => writingItemStore.error);
const contentTypes = computed(() => contentTypeStore.getContentTypes);

const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showDeleteConfirm = ref(false);
const isSubmitting = ref(false);

const selectedItem = ref<WritingItemWithTags | null>(null);
const formData = ref<NewWritingItem>({
  title: '',
  typeId: '',
  content: '',
  createdTime: undefined,
  isPreciseTime: false,
  background: '',
  notes: '',
  folderId: undefined,
  tagIds: [],
});

const isEditing = computed(() => !!selectedItem.value);

onMounted(async () => {
  await fetchItems();
  await contentTypeStore.fetchContentTypes();
});

async function fetchItems() {
  try {
    await writingItemStore.fetchWritingItems();
  } catch (err) {
    console.error('Failed to fetch items:', err);
  }
}

function getTypeColor(typeId: string): string {
  const type = contentTypes.value.find(t => t.id === typeId);
  return type?.color || '#e0e0e0';
}

function getTypeName(typeId: string): string {
  const type = contentTypes.value.find(t => t.id === typeId);
  return type?.name || '未知类型';
}

function getContentPreview(content?: string): string {
  if (!content) return '无内容';
  const preview = content.substring(0, 100);
  return content.length > 100 ? preview + '...' : preview;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
}

function selectItem(item: WritingItemWithTags) {
  // 未来可以用于查看详情
  console.log('Selected item:', item);
}

function editItem(item: WritingItemWithTags) {
  selectedItem.value = item;
  formData.value = {
    title: item.title,
    typeId: item.typeId,
    content: item.content || '',
    createdTime: item.createdTime || undefined,
    isPreciseTime: item.isPreciseTime,
    background: item.background || '',
    notes: item.notes || '',
    folderId: item.folderId || undefined,
    tagIds: item.tags.map(tag => tag.id),
  };
  showEditDialog.value = true;
}

function deleteItem(item: WritingItemWithTags) {
  selectedItem.value = item;
  showDeleteConfirm.value = true;
}

async function confirmDelete() {
  if (!selectedItem.value) return;
  
  try {
    await writingItemStore.deleteWritingItem(selectedItem.value.id);
    showDeleteConfirm.value = false;
    selectedItem.value = null;
  } catch (err) {
    console.error('Failed to delete item:', err);
  }
}

async function handleSubmit() {
  if (isSubmitting.value) return;
  
  isSubmitting.value = true;
  try {
    if (isEditing.value && selectedItem.value) {
      await writingItemStore.updateWritingItem(selectedItem.value.id, formData.value);
    } else {
      await writingItemStore.createWritingItem(formData.value);
    }
    closeDialog();
    resetForm();
  } catch (err) {
    console.error('Failed to save item:', err);
  } finally {
    isSubmitting.value = false;
  }
}

function closeDialog() {
  showCreateDialog.value = false;
  showEditDialog.value = false;
  selectedItem.value = null;
  resetForm();
}

function resetForm() {
  formData.value = {
    title: '',
    typeId: '',
    content: '',
    createdTime: undefined,
    isPreciseTime: false,
    background: '',
    notes: '',
    folderId: undefined,
    tagIds: [],
  };
}
</script>

<style scoped>
.writing-items-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.new-item-btn {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.new-item-btn:hover {
  background-color: #45a049;
}

.loading,
.error,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error p {
  color: #f44336;
  margin-bottom: 10px;
}

.empty-state p {
  margin-bottom: 10px;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.item-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-type {
  padding: 4px 8px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  font-weight: 500;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.item-actions button {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  cursor: pointer;
}

.item-actions .delete-btn {
  color: #f44336;
  border-color: #f44336;
}

.item-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.item-content-preview {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #888;
}

.item-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tag {
  padding: 2px 6px;
  border-radius: 3px;
  color: white;
  font-size: 11px;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.dialog h2 {
  margin: 0 0 20px 0;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.dialog-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.dialog-actions button:first-child {
  background: #f5f5f5;
  color: #333;
}

.dialog-actions button:last-child {
  background: #4CAF50;
  color: white;
}

.dialog-actions .delete-btn {
  background: #f44336;
  color: white;
}
</style>