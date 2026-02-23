import { defineStore } from 'pinia';
import { invoke } from '@tauri-apps/api/core';
import type { WritingItemWithTags, NewWritingItem } from '../types';

interface WritingItemState {
  items: WritingItemWithTags[];
  isLoading: boolean;
  error: string | null;
}

export const useWritingItemStore = defineStore('writingItem', {
  state: (): WritingItemState => ({
    items: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    getItems: (state) => state.items,
    getItemById: (state) => (id: string) => {
      return state.items.find(item => item.id === id);
    },
    getItemsByType: (state) => (typeId: string) => {
      return state.items.filter(item => item.typeId === typeId);
    },
    getItemsByFolder: (state) => (folderId: string | undefined) => {
      if (!folderId) return state.items.filter(item => !item.folderId);
      return state.items.filter(item => item.folderId === folderId);
    },
  },

  actions: {
    async fetchWritingItems() {
      this.isLoading = true;
      this.error = null;
      try {
        const items = await invoke<WritingItemWithTags[]>('get_writing_items');
        this.items = items;
        return items;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch writing items';
        console.error('Error fetching writing items:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchWritingItem(id: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const item = await invoke<WritingItemWithTags | null>('get_writing_item', { id });
        if (item) {
          const index = this.items.findIndex(i => i.id === id);
          if (index !== -1) {
            this.items[index] = item;
          } else {
            this.items.push(item);
          }
        }
        return item;
      } catch (error) {
        this.error = error instanceof Error ? error.message : `Failed to fetch writing item ${id}`;
        console.error(`Error fetching writing item ${id}:`, error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async createWritingItem(newItem: NewWritingItem) {
      this.isLoading = true;
      this.error = null;
      try {
        const id = await invoke<string>('create_writing_item', { newItem });
        const item = await this.fetchWritingItem(id);
        return item;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to create writing item';
        console.error('Error creating writing item:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateWritingItem(id: string, updates: NewWritingItem) {
      this.isLoading = true;
      this.error = null;
      try {
        await invoke('update_writing_item', { id, updates });
        const item = await this.fetchWritingItem(id);
        return item;
      } catch (error) {
        this.error = error instanceof Error ? error.message : `Failed to update writing item ${id}`;
        console.error(`Error updating writing item ${id}:`, error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteWritingItem(id: string) {
      this.isLoading = true;
      this.error = null;
      try {
        await invoke('delete_writing_item', { id });
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
          this.items.splice(index, 1);
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : `Failed to delete writing item ${id}`;
        console.error(`Error deleting writing item ${id}:`, error);
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