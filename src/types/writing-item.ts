import type { Tag } from './tag';

export interface WritingItem {
  id: string;
  title: string;
  typeId: string;
  content?: string;
  createdTime?: string;
  isPreciseTime: boolean;
  background?: string;
  notes?: string;
  folderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WritingItemWithTags extends WritingItem {
  tags: Tag[];
}

export interface NewWritingItem {
  title: string;
  typeId: string;
  content?: string;
  createdTime?: string;
  isPreciseTime: boolean;
  background?: string;
  notes?: string;
  folderId?: string;
  tagIds: string[];
}