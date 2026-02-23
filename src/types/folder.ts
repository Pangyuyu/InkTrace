export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  sortOrder: number;
  createdAt: string;
}

export interface NewFolder {
  name: string;
  parentId?: string;
  sortOrder: number;
}