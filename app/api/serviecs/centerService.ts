// app/services/centerService.ts

export interface Center {
  id: string;
  name: string;
  location: string;
  phone: string;
  status: 'active' | 'inactive';
  capacity: number;
  currentItems: number;
  district: string;
  subdistrict: string;
  shelterType: string;
  createdAt: string;
  updatedAt: string;
}

export interface CentersResponse {
  success: boolean;
  message: string;
  data: Center[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  meta: {
    source: string;
    cachedAt: string;
    fetchedAt: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getCenters(
  page: number = 1,
  limit: number = 20,
  search: string = '',
  status: string = ''
): Promise<CentersResponse> {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const url = `${API_URL}/api/centers?${params.toString()}`;

    console.log('📥 Fetching from:', url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const data: CentersResponse = await response.json();

    console.log('✅ Data received:', data.pagination);

    return data;
  } catch (error) {
    console.error('❌ Error fetching centers:', error);
    throw error;
  }
}

export async function getCenterById(id: string): Promise<{ data: Center }> {
  try {
    const url = `${API_URL}/api/centers/${id}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching center:', error);
    throw error;
  }
}