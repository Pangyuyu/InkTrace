export interface ContentType {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  isBuiltIn: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface NewContentType {
  name: string;
  icon?: string;
  color?: string;
  isBuiltIn: boolean;
  sortOrder: number;
}