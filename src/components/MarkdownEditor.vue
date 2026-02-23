<template>
  <div class="markdown-editor">
    <div class="editor-tabs">
      <button
        :class="{ active: activeTab === 'write' }"
        @click="activeTab = 'write'"
      >
        编辑
      </button>
      <button
        :class="{ active: activeTab === 'preview' }"
        @click="activeTab = 'preview'"
      >
        预览
      </button>
      <button
        :class="{ active: activeTab === 'both' }"
        @click="activeTab = 'both'"
      >
        分屏
      </button>
    </div>

    <div class="editor-content">
      <div v-if="activeTab === 'write' || activeTab === 'both'" class="editor-write">
        <textarea
          ref="textareaRef"
          v-model="localValue"
          :placeholder="placeholder"
          :rows="rows"
          class="editor-textarea"
          @input="handleInput"
          @keydown.tab.prevent="handleTab"
        ></textarea>
      </div>

      <div v-if="activeTab === 'preview' || activeTab === 'both'" class="editor-preview">
        <div
          v-if="localValue"
          class="preview-content"
          v-html="renderedHtml"
        ></div>
        <div v-else class="preview-empty">
          {{ previewEmptyText }}
        </div>
      </div>
    </div>

    <div class="editor-footer">
      <div class="editor-help">
        <button @click="showHelp = !showHelp">Markdown语法帮助</button>
        <div v-if="showHelp" class="help-content">
          <ul>
            <li><code># 标题</code> - 一级标题</li>
            <li><code>## 标题</code> - 二级标题</li>
            <li><code>**粗体**</code> - <strong>粗体</strong></li>
            <li><code>*斜体*</code> - <em>斜体</em></li>
            <li><code>[链接](http://example.com)</code> - 链接</li>
            <li><code>- 列表项</code> - 无序列表</li>
            <li><code>1. 列表项</code> - 有序列表</li>
            <li><code>```代码块```</code> - 代码块</li>
            <li><code>> 引用</code> - 引用块</li>
          </ul>
        </div>
      </div>
      <div class="editor-stats">
        字符数: {{ charCount }} | 行数: {{ lineCount }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import MarkdownIt from 'markdown-it';

interface Props {
  modelValue: string | undefined;
  placeholder?: string;
  rows?: number;
  previewEmptyText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '输入Markdown内容...',
  rows: 10,
  previewEmptyText: '无内容可预览',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'change': [value: string];
}>();

const activeTab = ref<'write' | 'preview' | 'both'>('write');
const localValue = ref(props.modelValue);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const showHelp = ref(false);

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const renderedHtml = computed(() => {
  if (!localValue.value.trim()) return '';
  return md.render(localValue.value);
});

const charCount = computed(() => {
  return localValue.value.length;
});

const lineCount = computed(() => {
  if (!localValue.value) return 0;
  return localValue.value.split('\n').length;
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== localValue.value) {
      localValue.value = newVal;
    }
  }
);

function handleInput() {
  emit('update:modelValue', localValue.value);
  emit('change', localValue.value);
}

function handleTab(event: KeyboardEvent) {
  if (!textareaRef.value) return;
  
  event.preventDefault();
  const textarea = textareaRef.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  
  const newValue = localValue.value.substring(0, start) + '  ' + localValue.value.substring(end);
  localValue.value = newValue;
  
  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + 2;
    textarea.focus();
    handleInput();
  });
}

function insertText(before: string, after: string = '') {
  if (!textareaRef.value) return;
  
  const textarea = textareaRef.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = localValue.value.substring(start, end);
  
  const newValue = localValue.value.substring(0, start) + 
                  before + selectedText + after + 
                  localValue.value.substring(end);
  localValue.value = newValue;
  
  nextTick(() => {
    const newStart = start + before.length;
    const newEnd = end + before.length;
    textarea.selectionStart = selectedText ? newStart : newEnd;
    textarea.selectionEnd = selectedText ? newEnd : newEnd;
    textarea.focus();
    handleInput();
  });
}

function insertHeader(level: number) {
  const prefix = '#'.repeat(level) + ' ';
  insertText(prefix);
}

function insertBold() {
  insertText('**', '**');
}

function insertItalic() {
  insertText('*', '*');
}

function insertLink() {
  insertText('[', '](http://)');
}

function insertList(ordered: boolean = false) {
  const prefix = ordered ? '1. ' : '- ';
  insertText(prefix);
}

function insertCodeBlock() {
  insertText('```\n', '\n```');
}

function insertQuote() {
  insertText('> ');
}

defineExpose({
  insertHeader,
  insertBold,
  insertItalic,
  insertLink,
  insertList,
  insertCodeBlock,
  insertQuote,
});
</script>

<style scoped>
.markdown-editor {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.editor-tabs {
  display: flex;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.editor-tabs button {
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
}

.editor-tabs button:hover {
  background: #e9e9e9;
}

.editor-tabs button.active {
  background: white;
  color: #333;
  border-bottom: 2px solid #4CAF50;
}

.editor-content {
  display: flex;
  min-height: 300px;
}

.editor-write,
.editor-preview {
  flex: 1;
}

.editor-textarea {
  width: 100%;
  height: 100%;
  min-height: 300px;
  padding: 12px;
  border: none;
  resize: vertical;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.editor-textarea:focus {
  outline: none;
}

.editor-preview {
  padding: 12px;
  overflow-y: auto;
  background: white;
  border-left: 1px solid #ddd;
}

.preview-content {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  line-height: 1.6;
}

.preview-content :deep(h1) {
  font-size: 2em;
  margin: 0.67em 0;
}

.preview-content :deep(h2) {
  font-size: 1.5em;
  margin: 0.75em 0;
}

.preview-content :deep(h3) {
  font-size: 1.17em;
  margin: 0.83em 0;
}

.preview-content :deep(p) {
  margin: 1em 0;
}

.preview-content :deep(ul),
.preview-content :deep(ol) {
  margin: 1em 0;
  padding-left: 2em;
}

.preview-content :deep(blockquote) {
  margin: 1em 0;
  padding-left: 1em;
  border-left: 4px solid #ddd;
  color: #666;
}

.preview-content :deep(code) {
  background: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.preview-content :deep(pre) {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

.preview-content :deep(a) {
  color: #4CAF50;
  text-decoration: none;
}

.preview-content :deep(a:hover) {
  text-decoration: underline;
}

.preview-empty {
  color: #999;
  text-align: center;
  padding: 40px 0;
  font-style: italic;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f5f5;
  border-top: 1px solid #ddd;
  font-size: 12px;
  color: #666;
}

.editor-help button {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  color: #666;
}

.editor-help button:hover {
  background: #f0f0f0;
}

.help-content {
  position: absolute;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px;
  margin-top: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-width: 300px;
}

.help-content ul {
  margin: 0;
  padding-left: 16px;
}

.help-content li {
  margin: 4px 0;
}

.help-content code {
  background: #f5f5f5;
  padding: 1px 4px;
  border-radius: 3px;
  font-family: monospace;
}
</style>