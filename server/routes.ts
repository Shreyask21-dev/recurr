import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertClientSchema, 
  insertServiceSchema, 
  insertRenewalSchema,
  insertActivitySchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes - prefix all routes with /api
  
  // Dashboard routes
  app.get("/api/dashboard", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });
  
  // Clients routes
  app.get("/api/clients", async (req: Request, res: Response) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });
  
  app.get("/api/clients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client" });
    }
  });
  
  app.post("/api/clients", async (req: Request, res: Response) => {
    try {
      const result = insertClientSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ error: errorMessage });
      }
      
      const client = await storage.createClient(result.data);
      res.status(201).json(client);
    } catch (error) {
      res.status(500).json({ error: "Failed to create client" });
    }
  });
  
  app.put("/api/clients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertClientSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ error: errorMessage });
      }
      
      const updatedClient = await storage.updateClient(id, result.data);
      
      if (!updatedClient) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      res.json(updatedClient);
    } catch (error) {
      res.status(500).json({ error: "Failed to update client" });
    }
  });
  
  app.delete("/api/clients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteClient(id);
      
      if (!success) {
        return res.status(404).json({ 
          error: "Client not found or cannot be deleted because it has associated renewals" 
        });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete client" });
    }
  });
  
  // Services routes
  app.get("/api/services", async (req: Request, res: Response) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });
  
  app.get("/api/services/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getService(id);
      
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service" });
    }
  });
  
  app.post("/api/services", async (req: Request, res: Response) => {
    try {
      const result = insertServiceSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ error: errorMessage });
      }
      
      const service = await storage.createService(result.data);
      res.status(201).json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to create service" });
    }
  });
  
  app.put("/api/services/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertServiceSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ error: errorMessage });
      }
      
      const updatedService = await storage.updateService(id, result.data);
      
      if (!updatedService) {
        return res.status(404).json({ error: "Service not found" });
      }
      
      res.json(updatedService);
    } catch (error) {
      res.status(500).json({ error: "Failed to update service" });
    }
  });
  
  app.delete("/api/services/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteService(id);
      
      if (!success) {
        return res.status(404).json({ 
          error: "Service not found or cannot be deleted because it has associated renewals" 
        });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete service" });
    }
  });
  
  // Renewals routes
  app.get("/api/renewals", async (req: Request, res: Response) => {
    try {
      const withRelations = req.query.withRelations === 'true';
      
      if (withRelations) {
        const renewals = await storage.getRenewalsWithRelations();
        return res.json(renewals);
      }
      
      const renewals = await storage.getRenewals();
      res.json(renewals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch renewals" });
    }
  });
  
  app.get("/api/renewals/upcoming", async (req: Request, res: Response) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const renewals = await storage.getUpcomingRenewals(days);
      res.json(renewals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch upcoming renewals" });
    }
  });
  
  app.get("/api/renewals/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const withRelations = req.query.withRelations === 'true';
      
      if (withRelations) {
        const renewal = await storage.getRenewalWithRelations(id);
        
        if (!renewal) {
          return res.status(404).json({ error: "Renewal not found" });
        }
        
        return res.json(renewal);
      }
      
      const renewal = await storage.getRenewal(id);
      
      if (!renewal) {
        return res.status(404).json({ error: "Renewal not found" });
      }
      
      res.json(renewal);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch renewal" });
    }
  });
  
  app.get("/api/clients/:clientId/renewals", async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const renewals = await storage.getRenewalsByClient(clientId);
      res.json(renewals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client renewals" });
    }
  });
  
  app.post("/api/renewals", async (req: Request, res: Response) => {
    try {
      const result = insertRenewalSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ error: errorMessage });
      }
      
      // Verify client and service exist
      const client = await storage.getClient(result.data.clientId);
      if (!client) {
        return res.status(400).json({ error: "Client not found" });
      }
      
      const service = await storage.getService(result.data.serviceId);
      if (!service) {
        return res.status(400).json({ error: "Service not found" });
      }
      
      const renewal = await storage.createRenewal(result.data);
      res.status(201).json(renewal);
    } catch (error) {
      res.status(500).json({ error: "Failed to create renewal" });
    }
  });
  
  app.put("/api/renewals/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertRenewalSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ error: errorMessage });
      }
      
      // Verify client and service exist if they're being updated
      if (result.data.clientId) {
        const client = await storage.getClient(result.data.clientId);
        if (!client) {
          return res.status(400).json({ error: "Client not found" });
        }
      }
      
      if (result.data.serviceId) {
        const service = await storage.getService(result.data.serviceId);
        if (!service) {
          return res.status(400).json({ error: "Service not found" });
        }
      }
      
      const updatedRenewal = await storage.updateRenewal(id, result.data);
      
      if (!updatedRenewal) {
        return res.status(404).json({ error: "Renewal not found" });
      }
      
      res.json(updatedRenewal);
    } catch (error) {
      res.status(500).json({ error: "Failed to update renewal" });
    }
  });
  
  app.put("/api/renewals/:id/notification", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { notificationSent } = req.body;
      
      if (typeof notificationSent !== 'boolean') {
        return res.status(400).json({ error: "notificationSent must be a boolean" });
      }
      
      await storage.updateRenewalNotificationStatus(id, notificationSent);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to update notification status" });
    }
  });
  
  app.delete("/api/renewals/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteRenewal(id);
      
      if (!success) {
        return res.status(404).json({ error: "Renewal not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete renewal" });
    }
  });
  
  // Activities routes
  app.get("/api/activities", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });
  
  app.post("/api/activities", async (req: Request, res: Response) => {
    try {
      const result = insertActivitySchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ error: errorMessage });
      }
      
      const activity = await storage.createActivity(result.data);
      res.status(201).json(activity);
    } catch (error) {
      res.status(500).json({ error: "Failed to create activity" });
    }
  });
  
  // Revenue routes
  app.get("/api/revenue/monthly", async (req: Request, res: Response) => {
    try {
      const months = req.query.months ? parseInt(req.query.months as string) : 6;
      const revenue = await storage.getMonthlyRevenue(months);
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monthly revenue" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
