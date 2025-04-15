import { 
  clients, 
  services, 
  renewals, 
  activities,
  type Client, 
  type InsertClient, 
  type Service, 
  type InsertService, 
  type Renewal, 
  type InsertRenewal, 
  type Activity, 
  type InsertActivity,
  type RenewalWithRelations,
  type DashboardStats
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // Client operations
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  
  // Service operations
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
  // Renewal operations
  getRenewals(): Promise<Renewal[]>;
  getRenewal(id: number): Promise<Renewal | undefined>;
  getRenewalsByClient(clientId: number): Promise<Renewal[]>;
  getRenewalsByService(serviceId: number): Promise<Renewal[]>;
  getRenewalsWithRelations(): Promise<RenewalWithRelations[]>;
  getRenewalWithRelations(id: number): Promise<RenewalWithRelations | undefined>;
  getUpcomingRenewals(days: number): Promise<RenewalWithRelations[]>;
  createRenewal(renewal: InsertRenewal): Promise<Renewal>;
  updateRenewal(id: number, renewal: Partial<InsertRenewal>): Promise<Renewal | undefined>;
  updateRenewalNotificationStatus(id: number, status: boolean): Promise<void>;
  deleteRenewal(id: number): Promise<boolean>;
  
  // Activity operations
  getActivities(limit?: number): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Dashboard operations
  getDashboardStats(): Promise<DashboardStats>;
  getMonthlyRevenue(months: number): Promise<{month: string, amount: number}[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private clients: Map<number, Client>;
  private services: Map<number, Service>;
  private renewals: Map<number, Renewal>;
  private activities: Map<number, Activity>;
  
  private clientId: number;
  private serviceId: number;
  private renewalId: number;
  private activityId: number;
  
  constructor() {
    this.clients = new Map();
    this.services = new Map();
    this.renewals = new Map();
    this.activities = new Map();
    
    this.clientId = 1;
    this.serviceId = 1;
    this.renewalId = 1;
    this.activityId = 1;
    
    // Initialize with some sample data
    this.initializeSampleData();
  }
  
  private initializeSampleData() {
    // Add sample services
    const services = [
      { name: "Website AMC", description: "Annual maintenance contract for website", defaultDuration: 12, defaultPrice: 24000 },
      { name: "Domain Renewal", description: "Domain name registration renewal", defaultDuration: 12, defaultPrice: 1200 },
      { name: "Hosting", description: "Web hosting services", defaultDuration: 12, defaultPrice: 8400 },
      { name: "Business Email", description: "Professional email services", defaultDuration: 12, defaultPrice: 6500 }
    ];
    
    services.forEach(service => this.createService(service));
    
    // Add sample clients
    const clients = [
      { name: "Global Tech Solutions", email: "contact@globaltechsolutions.com", phone: "9876543210", company: "Global Tech Solutions", address: "123 Tech Park, Bangalore", gst: "29ABCDE1234F1Z5" },
      { name: "Acme Corp.", email: "info@acmecorp.com", phone: "8765432109", company: "Acme Corporation", address: "456 Business Avenue, Mumbai", gst: "27FGHIJ5678K2Z6" },
      { name: "Sunshine Industries", email: "contact@sunshineindustries.com", phone: "7654321098", company: "Sunshine Industries Ltd.", address: "789 Industrial Estate, Delhi", gst: "07KLMNO9012P3Z7" },
      { name: "TechNova Solutions", email: "support@technovasolutions.com", phone: "6543210987", company: "TechNova Solutions Pvt Ltd", address: "101 Innovation Hub, Hyderabad", gst: "36PQRST3456U4Z8" },
      { name: "XYZ Enterprises", email: "info@xyzenterprises.com", phone: "5432109876", company: "XYZ Enterprises", address: "202 Corporate Park, Chennai", gst: "33UVWXY7890Z5Z9" }
    ];
    
    clients.forEach(client => this.createClient(client));
    
    // Add sample renewals (creating realistic dates)
    const today = new Date();
    const createDate = (daysFromNow: number): Date => {
      const date = new Date(today);
      date.setDate(date.getDate() + daysFromNow);
      return date;
    };
    
    const renewals = [
      { clientId: 1, serviceId: 2, startDate: createDate(-335), endDate: createDate(5), amount: 1200, isPaid: false, notes: "Domain renewal for globaltechsolutions.com" },
      { clientId: 2, serviceId: 1, startDate: createDate(-355), endDate: createDate(13), amount: 24000, isPaid: false, notes: "Annual website maintenance" },
      { clientId: 3, serviceId: 4, startDate: createDate(-345), endDate: createDate(18), amount: 6500, isPaid: false, notes: "5 business email accounts" },
      { clientId: 5, serviceId: 3, startDate: createDate(-340), endDate: createDate(25), amount: 8400, isPaid: false, notes: "Web hosting renewal" },
      { clientId: 4, serviceId: 1, startDate: createDate(-180), endDate: createDate(180), amount: 12500, isPaid: true, notes: "Half-yearly website maintenance" }
    ];
    
    renewals.forEach(renewal => this.createRenewal(renewal));
    
    // Add sample activities
    const activities = [
      { type: "payment_received", description: "Payment of ₹12,500 received from TechNova Solutions for Website AMC", metadata: JSON.stringify({ clientId: 4, amount: 12500, serviceId: 1 }) },
      { type: "client_added", description: "Added Glow Beauty Products to the client list", metadata: JSON.stringify({ clientId: 6 }) },
      { type: "renewal_reminder", description: "Sent reminder email to Global Tech Solutions about Domain Renewal due on Nov 02", metadata: JSON.stringify({ clientId: 1, renewalId: 1 }) },
      { type: "service_updated", description: "Updated pricing for Business Email Hosting service", metadata: JSON.stringify({ serviceId: 4 }) }
    ];
    
    activities.forEach(activity => this.createActivity(activity));
  }
  
  // Client operations
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }
  
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }
  
  async createClient(client: InsertClient): Promise<Client> {
    const id = this.clientId++;
    const now = new Date();
    const newClient: Client = {
      id,
      ...client,
      createdAt: now
    };
    
    this.clients.set(id, newClient);
    
    // Create activity record
    await this.createActivity({
      type: "client_added",
      description: `Added ${client.name} to the client list`,
      metadata: JSON.stringify({ clientId: id }),
    });
    
    return newClient;
  }
  
  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const existingClient = this.clients.get(id);
    
    if (!existingClient) {
      return undefined;
    }
    
    const updatedClient: Client = {
      ...existingClient,
      ...client,
    };
    
    this.clients.set(id, updatedClient);
    
    // Create activity record
    await this.createActivity({
      type: "client_updated",
      description: `Updated client information for ${updatedClient.name}`,
      metadata: JSON.stringify({ clientId: id }),
    });
    
    return updatedClient;
  }
  
  async deleteClient(id: number): Promise<boolean> {
    const client = this.clients.get(id);
    if (!client) {
      return false;
    }
    
    // Check if client has renewals
    const clientRenewals = await this.getRenewalsByClient(id);
    if (clientRenewals.length > 0) {
      return false; // Can't delete client with renewals
    }
    
    const deleted = this.clients.delete(id);
    
    if (deleted) {
      // Create activity record
      await this.createActivity({
        type: "client_deleted",
        description: `Deleted client ${client.name}`,
        metadata: JSON.stringify({ clientId: id }),
      });
    }
    
    return deleted;
  }
  
  // Service operations
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }
  
  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }
  
  async createService(service: InsertService): Promise<Service> {
    const id = this.serviceId++;
    const now = new Date();
    const newService: Service = {
      id,
      ...service,
      createdAt: now
    };
    
    this.services.set(id, newService);
    
    // Create activity record
    await this.createActivity({
      type: "service_added",
      description: `Added new service: ${service.name}`,
      metadata: JSON.stringify({ serviceId: id }),
    });
    
    return newService;
  }
  
  async updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined> {
    const existingService = this.services.get(id);
    
    if (!existingService) {
      return undefined;
    }
    
    const updatedService: Service = {
      ...existingService,
      ...service,
    };
    
    this.services.set(id, updatedService);
    
    // Create activity record
    await this.createActivity({
      type: "service_updated",
      description: `Updated service: ${updatedService.name}`,
      metadata: JSON.stringify({ serviceId: id }),
    });
    
    return updatedService;
  }
  
  async deleteService(id: number): Promise<boolean> {
    const service = this.services.get(id);
    if (!service) {
      return false;
    }
    
    // Check if service has renewals
    const serviceRenewals = await this.getRenewalsByService(id);
    if (serviceRenewals.length > 0) {
      return false; // Can't delete service with renewals
    }
    
    const deleted = this.services.delete(id);
    
    if (deleted) {
      // Create activity record
      await this.createActivity({
        type: "service_deleted",
        description: `Deleted service: ${service.name}`,
        metadata: JSON.stringify({ serviceId: id }),
      });
    }
    
    return deleted;
  }
  
  // Renewal operations
  async getRenewals(): Promise<Renewal[]> {
    return Array.from(this.renewals.values());
  }
  
  async getRenewal(id: number): Promise<Renewal | undefined> {
    return this.renewals.get(id);
  }
  
  async getRenewalsByClient(clientId: number): Promise<Renewal[]> {
    return Array.from(this.renewals.values()).filter(
      (renewal) => renewal.clientId === clientId
    );
  }
  
  async getRenewalsByService(serviceId: number): Promise<Renewal[]> {
    return Array.from(this.renewals.values()).filter(
      (renewal) => renewal.serviceId === serviceId
    );
  }
  
  async getRenewalsWithRelations(): Promise<RenewalWithRelations[]> {
    const renewals = Array.from(this.renewals.values());
    return Promise.all(
      renewals.map(async (renewal) => this.enrichRenewalWithRelations(renewal))
    );
  }
  
  async getRenewalWithRelations(id: number): Promise<RenewalWithRelations | undefined> {
    const renewal = this.renewals.get(id);
    if (!renewal) {
      return undefined;
    }
    
    return this.enrichRenewalWithRelations(renewal);
  }
  
  async getUpcomingRenewals(days: number = 30): Promise<RenewalWithRelations[]> {
    const today = new Date();
    const future = new Date(today);
    future.setDate(future.getDate() + days);
    
    const renewals = Array.from(this.renewals.values()).filter(
      (renewal) => {
        const endDate = new Date(renewal.endDate);
        return endDate >= today && endDate <= future && !renewal.isPaid;
      }
    );
    
    return Promise.all(
      renewals.map(async (renewal) => this.enrichRenewalWithRelations(renewal))
    );
  }
  
  async createRenewal(renewal: InsertRenewal): Promise<Renewal> {
    const id = this.renewalId++;
    const now = new Date();
    const newRenewal: Renewal = {
      id,
      ...renewal,
      notificationSent: false,
      createdAt: now
    };
    
    this.renewals.set(id, newRenewal);
    
    // Get client and service info for activity
    const client = await this.getClient(renewal.clientId);
    const service = await this.getService(renewal.serviceId);
    
    // Create activity record
    await this.createActivity({
      type: "renewal_created",
      description: `Created renewal for ${client?.name} - ${service?.name}`,
      metadata: JSON.stringify({ renewalId: id, clientId: renewal.clientId, serviceId: renewal.serviceId }),
    });
    
    return newRenewal;
  }
  
  async updateRenewal(id: number, renewal: Partial<InsertRenewal>): Promise<Renewal | undefined> {
    const existingRenewal = this.renewals.get(id);
    
    if (!existingRenewal) {
      return undefined;
    }
    
    const updatedRenewal: Renewal = {
      ...existingRenewal,
      ...renewal,
    };
    
    this.renewals.set(id, updatedRenewal);
    
    // Create activity record for payment if status changed to paid
    if (renewal.isPaid === true && !existingRenewal.isPaid) {
      const client = await this.getClient(existingRenewal.clientId);
      const service = await this.getService(existingRenewal.serviceId);
      
      await this.createActivity({
        type: "payment_received",
        description: `Payment of ₹${existingRenewal.amount} received from ${client?.name} for ${service?.name}`,
        metadata: JSON.stringify({ 
          renewalId: id, 
          clientId: existingRenewal.clientId, 
          serviceId: existingRenewal.serviceId,
          amount: existingRenewal.amount
        }),
      });
    }
    
    return updatedRenewal;
  }
  
  async updateRenewalNotificationStatus(id: number, status: boolean): Promise<void> {
    const existingRenewal = this.renewals.get(id);
    
    if (!existingRenewal) {
      return;
    }
    
    const updatedRenewal: Renewal = {
      ...existingRenewal,
      notificationSent: status,
    };
    
    this.renewals.set(id, updatedRenewal);
    
    if (status) {
      // Create activity record for notification
      const client = await this.getClient(existingRenewal.clientId);
      const service = await this.getService(existingRenewal.serviceId);
      const endDate = new Date(existingRenewal.endDate);
      
      await this.createActivity({
        type: "renewal_reminder",
        description: `Sent reminder email to ${client?.name} about ${service?.name} due on ${endDate.toLocaleDateString()}`,
        metadata: JSON.stringify({ 
          renewalId: id, 
          clientId: existingRenewal.clientId, 
          serviceId: existingRenewal.serviceId
        }),
      });
    }
  }
  
  async deleteRenewal(id: number): Promise<boolean> {
    const renewal = this.renewals.get(id);
    if (!renewal) {
      return false;
    }
    
    const deleted = this.renewals.delete(id);
    
    if (deleted) {
      // Get client and service info for activity
      const client = await this.getClient(renewal.clientId);
      const service = await this.getService(renewal.serviceId);
      
      // Create activity record
      await this.createActivity({
        type: "renewal_deleted",
        description: `Deleted renewal for ${client?.name} - ${service?.name}`,
        metadata: JSON.stringify({ 
          renewalId: id, 
          clientId: renewal.clientId, 
          serviceId: renewal.serviceId 
        }),
      });
    }
    
    return deleted;
  }
  
  // Activity operations
  async getActivities(limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (limit) {
      return activities.slice(0, limit);
    }
    
    return activities;
  }
  
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const now = new Date();
    const newActivity: Activity = {
      id,
      ...activity,
      createdAt: now
    };
    
    this.activities.set(id, newActivity);
    return newActivity;
  }
  
  // Dashboard operations
  async getDashboardStats(): Promise<DashboardStats> {
    const totalClients = this.clients.size;
    const activeServices = this.services.size;
    
    // Calculate revenue
    const allRenewals = await this.getRenewals();
    const paidRenewals = allRenewals.filter(r => r.isPaid);
    
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    const mtdRevenue = paidRenewals
      .filter(r => new Date(r.createdAt) >= startOfMonth)
      .reduce((sum, r) => sum + r.amount, 0);
    
    const ytdRevenue = paidRenewals
      .filter(r => new Date(r.createdAt) >= startOfYear)
      .reduce((sum, r) => sum + r.amount, 0);
    
    // Projected revenue: Simple projection based on YTD + pending renewals
    const pendingRenewalsAmount = allRenewals
      .filter(r => !r.isPaid && new Date(r.endDate) <= new Date(today.getFullYear(), 11, 31))
      .reduce((sum, r) => sum + r.amount, 0);
    
    const projectedRevenue = ytdRevenue + pendingRenewalsAmount;
    
    // Get upcoming renewals
    const upcomingRenewals = await this.getUpcomingRenewals(30);
    
    // Get recent activities
    const recentActivities = await this.getActivities(10);
    
    // Get monthly revenue
    const monthlyRevenue = await this.getMonthlyRevenue(6);
    
    return {
      totalClients,
      activeServices,
      pendingRenewals: upcomingRenewals.length,
      revenue: {
        mtd: mtdRevenue,
        ytd: ytdRevenue,
        projected: projectedRevenue
      },
      upcomingRenewals,
      recentActivities,
      monthlyRevenue
    };
  }
  
  async getMonthlyRevenue(months: number = 6): Promise<{month: string, amount: number}[]> {
    const today = new Date();
    const result: {month: string, amount: number}[] = [];
    
    // Get all paid renewals
    const paidRenewals = Array.from(this.renewals.values()).filter(r => r.isPaid);
    
    // Create monthly buckets
    for (let i = 0; i < months; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
      
      const monthName = month.toLocaleString('default', { month: 'short' });
      
      // Sum renewals for this month
      const amount = paidRenewals
        .filter(r => {
          const date = new Date(r.createdAt);
          return date >= month && date <= monthEnd;
        })
        .reduce((sum, r) => sum + r.amount, 0);
      
      result.unshift({ month: monthName, amount });
    }
    
    return result;
  }
  
  // Helper method to enrich renewal with client and service data
  private async enrichRenewalWithRelations(renewal: Renewal): Promise<RenewalWithRelations> {
    const client = await this.getClient(renewal.clientId);
    const service = await this.getService(renewal.serviceId);
    
    if (!client || !service) {
      throw new Error(`Related client or service not found for renewal ${renewal.id}`);
    }
    
    return {
      ...renewal,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        company: client.company,
      },
      service: {
        id: service.id,
        name: service.name,
      }
    };
  }
}

// Import storage implementations
import { DatabaseStorage } from './database-storage';
import { testConnection } from './db';

// Use database storage if connection is successful, otherwise fall back to in-memory storage
let databaseStorageInstance: DatabaseStorage | null = null;
let memoryStorageInstance: MemStorage | null = null;

async function setupStorage() {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      console.log('Connected to MySQL database. Using DatabaseStorage.');
      databaseStorageInstance = new DatabaseStorage();
      return databaseStorageInstance;
    } else {
      console.log('Could not connect to MySQL database. Using MemStorage as fallback.');
      memoryStorageInstance = new MemStorage();
      return memoryStorageInstance;
    }
  } catch (error) {
    console.error('Error setting up storage:', error);
    console.log('Using MemStorage as fallback after error.');
    memoryStorageInstance = new MemStorage();
    return memoryStorageInstance;
  }
}

// Initialize with MemStorage and then try to switch to DatabaseStorage
export const storage = new MemStorage();
