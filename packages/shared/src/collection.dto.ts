export enum CollectionType {
  PRODUCT = 'product',
  CATEGORY = 'category',
  TOPIC = 'topic',
  BRAND = 'brand',
  ARTICLE = 'article',
}

export enum CollectionLayout {
  GRID = 'grid',
  CAROUSEL = 'carousel',
  SINGLE_HERO = 'single_hero',
  WATERFALL = 'waterfall',
  SPLIT_SCREEN = 'split_screen',
}

export interface CollectionInfo {
  id: number;
  code: string;
  type: CollectionType;
  title: string;
  subtitle?: string;
  description?: string;
  coverImage?: string;
  layoutType: CollectionLayout;
  bgColor?: string;
  metadata?: Record<string, any>;
  status: number;
  sort: number;
  startAt?: Date;
  endAt?: Date;
  items?: CollectionItemInfo[];
}

export interface CollectionItemInfo {
  id: number;
  collectionId: number;
  targetId: number; // Multipurpose ID (product_id, category_id, etc.)
  titleOverride?: string;
  imageOverride?: string;
  extraTag?: string;
  sort: number;
}
