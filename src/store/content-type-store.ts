import { defineStore } from 'pinia';
import type { ContentType } from '../types';

interface ContentTypeState {
  contentTypes: ContentType[];
  isLoading: boolean;
  error: string | null;
}

export const useContentTypeStore = defineStore('contentType', {
  state: (): ContentTypeState => ({
    contentTypes: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    getContentTypes: (state) => state.contentTypes,
    getContentTypeById: (state) => (id: string) => {
      return state.contentTypes.find(type => type.id === id);
    },
    getBuiltInContentTypes: (state) => {
      return state.contentTypes.filter(type => type.isBuiltIn);
    },
    getUserContentTypes: (state) => {
      return state.contentTypes.filter(type => !type.isBuiltIn);
    },
  },

  actions: {
    // 由于内容类型是通过数据库初始化的，暂时从内存中提供内置类型
    // 未来可以从后端API获取
    async fetchContentTypes() {
      this.isLoading = true;
      this.error = null;
      try {
        // 模拟内置内容类型数据
        const builtinTypes: ContentType[] = [
          {
            id: 'poem-type',
            name: '诗',
            icon: 'poem',
            color: '#4CAF50',
            isBuiltIn: true,
            sortOrder: 0,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'article-type',
            name: '普通文章',
            icon: 'article',
            color: '#2196F3',
            isBuiltIn: true,
            sortOrder: 1,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'tech-type',
            name: '技术文章',
            icon: 'tech',
            color: '#FF9800',
            isBuiltIn: true,
            sortOrder: 2,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'comment-type',
            name: '时事评论',
            icon: 'comment',
            color: '#F44336',
            isBuiltIn: true,
            sortOrder: 3,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'note-type',
            name: '散记',
            icon: 'note',
            color: '#9C27B0',
            isBuiltIn: true,
            sortOrder: 4,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'reflection-type',
            name: '人生感悟',
            icon: 'reflection',
            color: '#607D8B',
            isBuiltIn: true,
            sortOrder: 5,
            createdAt: new Date().toISOString(),
          },
        ];
        
        this.contentTypes = builtinTypes;
        return builtinTypes;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch content types';
        console.error('Error fetching content types:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    clearError() {
      this.error = null;
    },
  },
});