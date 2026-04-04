import { Resource } from './mock-data';
import { AuthUser } from './auth-context';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('eduvault_token');

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: data.error || 'An error occurred' };
        }

        return { data };
    } catch (error) {
        return { error: 'Network error. Please check if the server is running.' };
    }
}

// Auth API
export const authApi = {
    register: (name: string, email: string, password: string, role: string = 'user') =>
        fetchApi<{ user: AuthUser; token: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, role }),
        }),

    login: (email: string, password: string) =>
        fetchApi<{ user: AuthUser; token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    getMe: () => fetchApi<AuthUser>('/auth/me'),
};

// Resources API
export const resourcesApi = {
    getAll: (params?: { subject?: string; type?: string; gradeLevel?: string; search?: string; page?: number; limit?: number }) => {
        const query = new URLSearchParams(params as Record<string, string>).toString();
        return fetchApi<{ resources: Resource[]; pagination: PaginationInfo }>(`/resources${query ? `?${query}` : ''}`);
    },

    getOne: (id: string) => fetchApi<Resource>(`/resources/${id}`),

    create: (data: Partial<Resource>) =>
        fetchApi<Resource>('/resources', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: Partial<Resource>) =>
        fetchApi<Resource>(`/resources/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        fetchApi<{ success: boolean }>(`/resources/${id}`, {
            method: 'DELETE',
        }),

    download: (id: string) =>
        fetchApi<{ downloadUrl: string }>(`/resources/${id}/download`, {
            method: 'POST',
        }),
};

interface Review {
    id: string;
    resourceId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
    helpful: number;
    unhelpful: number;
}

// Reviews API
export const reviewsApi = {
    getByResource: (resourceId: string) =>
        fetchApi<Review[]>(`/resources/${resourceId}/reviews`),

    create: (resourceId: string, rating: number, comment: string) =>
        fetchApi<Review>(`/resources/${resourceId}/reviews`, {
            method: 'POST',
            body: JSON.stringify({ rating, comment }),
        }),
};

interface Subject {
    id: string;
    name: string;
    resourceCount: number;
}

// Subjects API
export const subjectsApi = {
    getAll: () => fetchApi<Subject[]>('/subjects'),
};

interface StatsData {
    totalResources: number;
    totalUsers: number;
    totalDownloads: number;
    totalSubjects: number;
}

// Stats API
export const statsApi = {
    get: () => fetchApi<StatsData>('/stats'),
};

interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    status: 'active' | 'suspended';
    createdAt: string;
}

// Users API (admin only)
export const usersApi = {
    getAll: () => fetchApi<User[]>('/users'),
};

export default {
    auth: authApi,
    resources: resourcesApi,
    reviews: reviewsApi,
    subjects: subjectsApi,
    stats: statsApi,
    users: usersApi,
};
