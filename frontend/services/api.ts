// This file now acts as a client to a backend API.
// All functions make HTTP requests to endpoints that would be provided by a server
// connected to a MongoDB database.

import { User, Post, Category, PostBasis } from '../types';

// Use environment variable for production, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// --- HELPER FUNCTION ---
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      // Try to parse error message from backend, otherwise use status text
      const errorData = await response.json().catch(() => ({ message: `Request failed with status: ${response.status}` }));
      throw new Error(errorData.message || response.statusText);
    }

    if (response.status === 204) { // No Content
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error(`API fetch error: ${endpoint}`, error);
    
    // Check if it's a network error (server down, CORS, etc.)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Network error: Could not connect to the server. Please ensure the backend server is running and accessible.');
    }
    
    // Re-throw other errors (like the ones we threw manually from !response.ok)
    throw error;
  }
};


// --- AUTHENTICATION API ---
export const login = async (email: string, password: string): Promise<{ user: User, token: string }> => {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const signup = async (name: string, email: string, password: string): Promise<{ user: User, token: string }> => {
  return apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
};

export const requestPasswordReset = async (email: string): Promise<{ success: boolean }> => {
    return apiFetch('/auth/forgotpassword', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
};

export const resetPasswordWithToken = async (token: string, password: string): Promise<{ success: boolean }> => {
    return apiFetch(`/auth/resetpassword/${token}`, {
        method: 'PUT',
        body: JSON.stringify({ password }),
    });
};

export const getMe = async (): Promise<User> => {
    return apiFetch('/auth/me');
};


// --- USER API ---
export const getUserById = async (userId: string): Promise<User> => {
  return apiFetch(`/users/${userId}`);
};

export const updateProfile = async (data: { name: string; bio: string; profilePic?: string }): Promise<User> => {
    return apiFetch('/users/me', {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

export const changePassword = async (data: { currentPassword: string, newPassword: string }): Promise<{success: boolean}> => {
    return apiFetch('/users/me/password', {
        method: 'PUT',
        body: JSON.stringify(data)
    });
};

// --- POST API ---
export const getRecentPosts = async (limit: number): Promise<Post[]> => {
  return apiFetch(`/posts?limit=${limit}&sort=newest`);
};

export const getPostsByCategory = async (categoryName: string): Promise<Post[]> => {
  return apiFetch(`/posts?category=${encodeURIComponent(categoryName)}`);
};

export const getPostById = async (postId: string): Promise<Post> => {
    return apiFetch(`/posts/${postId}`);
}

export const getPostsByTag = async (tag: string): Promise<Post[]> => {
    return apiFetch(`/posts?tag=${encodeURIComponent(tag)}`);
}

export const searchPosts = async (query: string): Promise<Post[]> => {
    return apiFetch(`/posts?q=${encodeURIComponent(query)}`);
}

export const getUserPosts = async (userId: string, isPublicView: boolean = false): Promise<Post[]> => {
    return apiFetch(`/users/${userId}/posts?public=${isPublicView}`);
}

export const getSavedPosts = async (): Promise<Post[]> => {
    return apiFetch('/users/me/saved');
}

export const createPost = async (data: Omit<Post, 'id' | 'authorName' | 'authorAvgRating' | 'authorPostCount' | 'postRating' | 'ratingCount' | 'createdAt' | 'authorId'>): Promise<Post> => {
    return apiFetch('/posts', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export const ratePost = async (postId: string, rating: number): Promise<{ success: boolean }> => {
    return apiFetch(`/posts/${postId}/rate`, {
        method: 'POST',
        body: JSON.stringify({ rating }),
    });
}

export const savePost = async (postId: string): Promise<{ success: true }> => {
    return apiFetch(`/posts/${postId}/save`, { method: 'POST' });
}

export const unsavePost = async (postId: string): Promise<{ success: true }> => {
    return apiFetch(`/posts/${postId}/save`, { method: 'DELETE' });
}

export const isPostSaved = async (postId: string): Promise<boolean> => {
    const response = await apiFetch(`/posts/${postId}/issaved`);
    return response.isSaved;
}

// --- CATEGORY API ---
export const getCategories = async (): Promise<Category[]> => {
    return apiFetch('/categories');
};

export const createCategory = async (data: Omit<Category, 'id'>): Promise<Category> => {
    return apiFetch('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

// --- ADMIN API ---
export const getAdminStats = async () => {
    return apiFetch('/admin/stats');
}

export const getAllPostsAdmin = async (): Promise<Post[]> => {
    return apiFetch('/admin/posts');
}

export const deletePostAdmin = async (postId: string): Promise<{ success: boolean }> => {
    return apiFetch(`/admin/posts/${postId}`, { method: 'DELETE' });
}

export const updatePostAdmin = async (postId: string, data: Partial<Omit<Post, 'id'>>): Promise<Post> => {
    return apiFetch(`/admin/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

export const getAllUsersAdmin = async (): Promise<User[]> => {
    return apiFetch('/admin/users');
}

export const toggleUserBlockStatusAdmin = async (userId: string): Promise<{ success: boolean }> => {
    return apiFetch(`/admin/users/${userId}/toggle-block`, { method: 'POST' });
}

export const deleteUserAdmin = async (userId: string): Promise<{ success: boolean }> => {
    return apiFetch(`/admin/users/${userId}`, { method: 'DELETE' });
}

export const deleteCategoryAdmin = async (categoryId: string): Promise<{ success: boolean }> => {
    return apiFetch(`/admin/categories/${categoryId}`, { method: 'DELETE' });
}