import * as mysql from 'mysql2/promise';
import { log } from './vite';

// Configure database connection with the provided credentials
const config = {
  host: '217.21.74.127',
  port: 3306,
  user: 'u856729253_renew_user',
  password: 'Coinage@1790', // Using the correct password
  database: 'u856729253_renew'
};

// Create a connection pool with more specific options
const pool = mysql.createPool({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  database: config.database,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 5000 // 5 seconds connection timeout
});

// Helper function to execute SQL queries
async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`Database error: ${errorMessage}`, 'database');
    throw error;
  }
}

// Testing database connection with timeout
export async function testConnection(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    // Set a timeout to reject the connection attempt
    const timeout = setTimeout(() => {
      log('Database connection timed out', 'database');
      resolve(false);
    }, 3000); // 3 second timeout
    
    // Try to connect
    pool.execute('SELECT 1')
      .then(() => {
        clearTimeout(timeout);
        resolve(true);
      })
      .catch((error) => {
        clearTimeout(timeout);
        const errorMessage = error instanceof Error ? error.message : String(error);
        log(`Failed to connect to database: ${errorMessage}`, 'database');
        resolve(false);
      });
  });
}

export const db = {
  query,
  testConnection
};