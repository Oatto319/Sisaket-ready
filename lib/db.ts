import mongoose from 'mongoose';

// ✅ Get MongoDB URI from environment
const MONGODB_URI = process.env.MONGODB_URI;

// ✅ Validate URI exists
if (!MONGODB_URI) {
  throw new Error(
    '❌ MONGODB_URI is not defined in .env.local\n' +
    '📝 Please add: MONGODB_URI=mongodb+srv://...'
  );
}

// ✅ Type for cached connection
interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// ✅ Global variable to cache connection (for Next.js)
declare global {
  var mongoose: CachedConnection;
}

// ✅ Initialize cache
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * ✅ Connect to MongoDB
 * 
 * Usage:
 *   const db = await connectDB();
 *   const User = db.model('User');
 */
export async function connectDB() {
  // ✅ Return cached connection if exists
  if (cached.conn) {
    console.log('✅ Using cached MongoDB connection');
    return cached.conn;
  }

  // ✅ Create new connection promise if doesn't exist
  if (!cached.promise) {
    console.log('🔄 Creating new MongoDB connection...');

    const opts = {
      bufferCommands: false, // ✅ Disable buffering
      maxPoolSize: 10, // ✅ Connection pool size
      serverSelectionTimeoutMS: 5000, // ✅ 5 second timeout
    };

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully!');
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        cached.promise = null;
        throw error;
      });
  }

  // ✅ Wait for connection
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

/**
 * ✅ Disconnect from MongoDB
 * 
 * Usage:
 *   await disconnectDB();
 */
export async function disconnectDB() {
  try {
    if (cached.conn) {
      await mongoose.disconnect();
      cached.conn = null;
      cached.promise = null;
      console.log('✅ MongoDB disconnected');
    }
  } catch (error) {
    console.error('❌ Disconnect error:', error);
    throw error;
  }
}

/**
 * ✅ Get database instance
 * 
 * Usage:
 *   const db = await connectDB();
 *   const User = db.model('User');
 */
export async function getDB() {
  const db = await connectDB();
  return db.connection;
}

// ✅ Export mongoose for direct use
export default mongoose;