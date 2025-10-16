export interface User {
  id: string;
  name: string;
  email: string;
  profilePic: string;
  bio: string;
  isAdmin: boolean;
  isBlocked: boolean;
  joinDate: string;
  postCount: number;
  avgRating: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  basis: PostBasis;
  tags: string[];
  anonymous: boolean;
  authorId: string;
  authorName: string;
  authorAvgRating: number;
  authorPostCount: number;
  postRating: number;
  ratingCount: number;
  createdAt: string;
  userRating?: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error';
}

export enum PostBasis {
  PERSONAL = 'My personal experience',
  PROFESSIONAL = 'My professional knowledge',
  RESEARCHED = 'A researched source',
  OPINION = 'My opinion/perspective',
  OTHER = 'Something else',
}