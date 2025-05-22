import { log } from './vite';
import { db } from './db';

export async function initializeDatabase() {
  try {
    log("Starting database initialization...", "database");

    // Create tables if they don't exist
    await createTablesIfNotExist();

    // Check if the database has sample data
    const [countResult] = await db.query<[{ count: number }]>('SELECT COUNT(*) as count FROM clients');

    if (countResult.count === 0) {
      log("No data found in the database. Adding sample data...", "database");
      await insertSampleData();
    } else {
      log(`Database already has data (${countResult.count} clients found)`, "database");
    }

    log("Database initialization completed", "database");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`Error initializing database: ${errorMessage}`, "database");
    throw error;
  }
}

async function createTablesIfNotExist() {
  // Create users table
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      passwordHash VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create clients table
  await db.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NULL,
      company VARCHAR(255) NULL,
      address TEXT NULL,
      gst VARCHAR(50) NULL,
      notes TEXT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Create services table
  await db.query(`
    CREATE TABLE IF NOT EXISTS services (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT NULL,
      defaultPrice DECIMAL(10, 2) NOT NULL,
      defaultDuration INT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Create renewals table
  await db.query(`
    CREATE TABLE IF NOT EXISTS renewals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      clientId INT NOT NULL,
      serviceId INT NOT NULL,
      startDate DATE NOT NULL,
      endDate DATE NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      isPaid BOOLEAN DEFAULT FALSE,
      isNotified BOOLEAN DEFAULT FALSE,
      notes TEXT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (clientId) REFERENCES clients(id),
      FOREIGN KEY (serviceId) REFERENCES services(id)
    )
  `);

  // Create activities table
  await db.query(`
    CREATE TABLE IF NOT EXISTS activities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      type VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      metadata TEXT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  log("Database tables created or already exist", "database");
}


async function insertSampleData() {
  // Function to format dates for MySQL
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Function to create a date relative to today
  const createDate = (daysFromNow: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
  };

  // Insert clients
  const clients = [
    { name: "Acme Corporation", email: "contact@acme.com", phone: "555-1234", company: "Acme Corp", address: "123 Main St", gst: "ABC123456" },
    { name: "TechSolutions Inc", email: "info@techsolutions.com", phone: "555-2345", company: "TechSolutions", address: "456 Tech Ave", gst: "XYZ789012" },
    { name: "Global Media Group", email: "admin@globalmedia.com", phone: "555-3456", company: "Global Media", address: "789 Media Blvd", gst: "DEF345678" },
    { name: "Retail Innovations", email: "support@retailinnovations.com", phone: "555-4567", company: "Retail Innovations", address: "321 Shop Lane", gst: "GHI901234" },
    { name: "Healthcare Services", email: "info@healthcareservices.com", phone: "555-5678", company: "Healthcare Services", address: "654 Health Rd", gst: "JKL567890" }
  ];

  for (const client of clients) {
    await db.query(`
      INSERT INTO clients (name, email, phone, company, address, gst)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [client.name, client.email, client.phone, client.company, client.address, client.gst]);
  }

  // Insert services
  const services = [
    { name: "Website Hosting", description: "Annual web hosting service", defaultPrice: 199.99, defaultDuration: 365 },
    { name: "Domain Registration", description: "Domain name registration service", defaultPrice: 14.99, defaultDuration: 365 },
    { name: "SEO Package", description: "Monthly SEO optimization service", defaultPrice: 299.99, defaultDuration: 30 },
    { name: "Maintenance Contract", description: "Quarterly website maintenance", defaultPrice: 449.99, defaultDuration: 90 }
  ];

  for (const service of services) {
    await db.query(`
      INSERT INTO services (name, description, defaultPrice, defaultDuration)
      VALUES (?, ?, ?, ?)
    `, [service.name, service.description, service.defaultPrice, service.defaultDuration]);
  }

  // Insert renewals (some past, some upcoming, some overdue)
  const renewals = [
    { clientId: 1, serviceId: 1, startDate: createDate(-365), endDate: createDate(15), amount: 199.99, isPaid: false, notes: "Annual hosting renewal" },
    { clientId: 1, serviceId: 2, startDate: createDate(-365), endDate: createDate(30), amount: 14.99, isPaid: true, notes: "Domain renewal" },
    { clientId: 2, serviceId: 3, startDate: createDate(-30), endDate: createDate(0), amount: 299.99, isPaid: false, notes: "Monthly SEO service" },
    { clientId: 3, serviceId: 1, startDate: createDate(-365), endDate: createDate(-15), amount: 199.99, isPaid: false, notes: "Overdue hosting renewal" },
    { clientId: 4, serviceId: 4, startDate: createDate(-90), endDate: createDate(5), amount: 449.99, isPaid: false, notes: "Quarterly maintenance due soon" },
    { clientId: 5, serviceId: 1, startDate: createDate(-365), endDate: createDate(45), amount: 199.99, isPaid: true, notes: "Hosting pre-paid" },
    { clientId: 2, serviceId: 4, startDate: createDate(-90), endDate: createDate(-7), amount: 449.99, isPaid: true, notes: "Maintenance completed" },
    { clientId: 3, serviceId: 3, startDate: createDate(-30), endDate: createDate(23), amount: 299.99, isPaid: false, notes: "Monthly SEO service" }
  ];

  for (const renewal of renewals) {
    await db.query(`
      INSERT INTO renewals (clientId, serviceId, startDate, endDate, amount, isPaid, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      renewal.clientId,
      renewal.serviceId,
      formatDate(renewal.startDate),
      formatDate(renewal.endDate),
      renewal.amount,
      renewal.isPaid ? 1 : 0,
      renewal.notes
    ]);
  }

  // Insert activities
  const activities = [
    { type: "client_added", description: "New client Acme Corporation added", metadata: JSON.stringify({ clientId: 1 }) },
    { type: "renewal_created", description: "Website Hosting renewal created for Acme Corporation", metadata: JSON.stringify({ renewalId: 1, clientId: 1, serviceId: 1 }) },
    { type: "payment_received", description: "Payment received for Domain Registration", metadata: JSON.stringify({ renewalId: 2, clientId: 1, amount: 14.99 }) },
    { type: "renewal_reminder", description: "Reminder sent for SEO Package renewal", metadata: JSON.stringify({ renewalId: 3, clientId: 2, serviceId: 3 }) },
    { type: "renewal_overdue", description: "Website Hosting renewal is overdue for Global Media Group", metadata: JSON.stringify({ renewalId: 4, clientId: 3, serviceId: 1 }) }
  ];

  for (const activity of activities) {
    await db.query(`
      INSERT INTO activities (type, description, metadata)
      VALUES (?, ?, ?)
    `, [activity.type, activity.description, activity.metadata]);
  }

  log("Sample data inserted successfully", "database");
}