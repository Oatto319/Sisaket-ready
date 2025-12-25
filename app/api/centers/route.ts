import { NextRequest, NextResponse } from 'next/server';

// ===== 1. ตั้งค่า Google Drive =====
const GOOGLE_DRIVE_FILE_ID = '1MyIRBrocRROyLmYVYl7bNH2Fgkcr_WUH';
const GOOGLE_DRIVE_URL = `https://drive.google.com/uc?export=download&id=${GOOGLE_DRIVE_FILE_ID}`;

// ===== 2. Cache (เก็บข้อมูล 1 ชั่วโมง) =====
let cachedData: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// ===== 3. Function ดึงข้อมูลจาก Google Drive =====
async function fetchDataFromGoogleDrive() {
  try {
    // ถ้ามี cache และยังไม่หมด ให้ใช้ cache
    if (cachedData && Date.now() - cacheTimestamp < CACHE_DURATION) {
      console.log('✅ Using cached data');
      return cachedData;
    }

    console.log('🔄 Fetching from Google Drive...');

    // ดึง JSON จาก Google Drive
    const response = await fetch(GOOGLE_DRIVE_URL);

    // ตรวจสอบว่า fetch สำเร็จหรือไม่
    if (!response.ok) {
      throw new Error(`Google Drive error: ${response.statusText}`);
    }

    // แปลง response เป็น JSON
    const data = await response.json();

    // เก็บ cache
    cachedData = data;
    cacheTimestamp = Date.now();

    console.log(`✅ Data cached. Total: ${data.data?.length || 0} centers`);

    return data;
  } catch (error) {
    console.error('❌ Error fetching from Google Drive:', error);
    throw error;
  }
}

// ===== 4. GET Endpoint (สำหรับ ดึง centers ทั้งหมด) =====
export async function GET(request: NextRequest) {
  try {
    // 4.1 ดึง parameters จาก URL
    // URL Example: http://localhost:3000/api/centers?page=1&limit=20&search=บ้าน&status=active
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    console.log(`📥 Request: page=${page}, limit=${limit}, search="${search}", status="${status}"`);

    // 4.2 Validation (ตรวจสอบค่า)
    if (page < 1) {
      return NextResponse.json(
        { success: false, message: 'Page must be >= 1' },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, message: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    // 4.3 ดึงข้อมูลจาก Google Drive (หรือ cache)
    const data = await fetchDataFromGoogleDrive();

    // 4.4 ตรวจสอบ data
    if (!data || !data.data || !Array.isArray(data.data)) {
      return NextResponse.json(
        { success: false, message: 'Invalid data format from Google Drive' },
        { status: 500 }
      );
    }

    console.log(`📊 Total data: ${data.data.length} centers`);

    // 4.5 Filter ตามสถานะ
    let filteredData = data.data;

    if (status) {
      filteredData = filteredData.filter(
        (center: any) => center.status === status
      );
      console.log(`🔍 After status filter: ${filteredData.length} centers`);
    }

    // 4.6 Filter ตามคำค้นหา
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter((center: any) =>
        center.name.toLowerCase().includes(searchLower) ||
        (center.location?.toLowerCase() || '').includes(searchLower) ||
        (center.district?.toLowerCase() || '').includes(searchLower) ||
        (center.subdistrict?.toLowerCase() || '').includes(searchLower)
      );
      console.log(`🔍 After search filter: ${filteredData.length} centers`);
    }

    // 4.7 Pagination
    const total = filteredData.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, total);

    console.log(`📄 Pagination: page ${page}/${totalPages}, items ${startIndex + 1}-${endIndex}`);

    // 4.8 ตรวจสอบหมายเลขหน้า
    if (page > totalPages && totalPages > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Page ${page} exceeds total pages ${totalPages}`,
        },
        { status: 400 }
      );
    }

    // 4.9 ดึง data เพื่อ pagination
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // 4.10 จัดรูปแบบ response data
    const formattedData = paginatedData.map((center: any) => ({
      id: center._id || center.id, // ใช้ _id หรือ id
      name: center.name || '',
      location: center.location || '',
      phone: center.phoneNumbers?.[0] || '', // ดึงเบอร์แรก
      status: center.status === 'active' ? 'active' : 'inactive',
      capacity: center.capacity || 0,
      currentItems: 0, // Default value
      district: center.district || '',
      subdistrict: center.subdistrict || '',
      shelterType: center.shelterType || '',
      createdAt: center.createdAt || new Date().toISOString(),
      updatedAt: center.updatedAt || new Date().toISOString(),
    }));

    // 4.11 Return response JSON
    const response = {
      success: true,
      message: 'Centers retrieved successfully',
      data: formattedData,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      meta: {
        source: 'Google Drive',
        cachedAt: new Date(cacheTimestamp).toISOString(),
        fetchedAt: new Date().toISOString(),
      },
    };

    console.log(`✅ Response ready with ${formattedData.length} items`);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('❌ Error in GET /api/centers:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch centers from Google Drive',
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// ===== 5. POST, PUT, DELETE (ไม่อนุญาต - read-only mode) =====
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      message: 'Creating centers is not allowed (read-only mode)',
    },
    { status: 405 }
  );
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      message: 'Updating centers is not allowed (read-only mode)',
    },
    { status: 405 }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      message: 'Deleting centers is not allowed (read-only mode)',
    },
    { status: 405 }
  );
}