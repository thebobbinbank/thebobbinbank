export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  created_at: string
}

export interface Pattern {
  id: string
  user_id: string
  category_id: string | null
  title: string
  slug: string
  description: string | null
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  image_url: string | null
  file_url: string
  file_name: string | null
  tags: string[]
  download_count: number
  created_at: string
  updated_at: string
  // Joined fields
  profiles?: Profile
  categories?: Category
  avg_rating?: number
  review_count?: number
}

export interface Review {
  id: string
  pattern_id: string
  user_id: string
  rating: number
  content: string | null
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Comment {
  id: string
  pattern_id: string
  user_id: string
  parent_id: string | null
  content: string
  created_at: string
  updated_at: string
  profiles?: Profile
  replies?: Comment[]
}

export interface Favorite {
  id: string
  pattern_id: string
  user_id: string
  created_at: string
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type SortOption = 'newest' | 'oldest' | 'popular' | 'rating'
