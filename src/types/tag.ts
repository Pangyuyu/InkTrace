export interface Tag {
  id: string;
  name: string;
  color?: string;
  usageCount: number;
  createdAt: string;
}

export interface NewTag {
  name: string;
  color?: string;
}