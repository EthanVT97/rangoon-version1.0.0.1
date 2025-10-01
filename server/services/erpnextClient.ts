import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { storage } from '../storage.js';

export interface ERPNextResponse {
  success: boolean;
  data?: any;
  error?: string;
  responseTime: number;
}

export interface ERPNextHealthStatus {
  success: boolean;
  data?: {
    message: string;
    version?: string;
  };
  error?: string;
  statusCode: number;
  responseTime: number;
}

class ERPNextClient {
  private client: AxiosInstance | null = null;
  private baseURL: string = '';
  private apiKey: string = '';
  private apiSecret: string = '';
  public initialized: boolean = false;

  async initialize() {
    // Reset initialization state and client before attempting to re-initialize
    this.initialized = false;
    this.client = null;
    this.baseURL = '';
    this.apiKey = '';
    this.apiSecret = '';

    try {
      // Prioritize fetching credentials from the database
      const dbBaseUrl = await storage.getConfiguration("erpnext_base_url");
      const dbApiKey = await storage.getConfiguration("erpnext_api_key");
      const dbApiSecret = await storage.getConfiguration("erpnext_api_secret");

      // Use database values if available, otherwise fallback to environment variables
      this.baseURL = dbBaseUrl || process.env.ERPNEXT_BASE_URL || '';
      this.apiKey = dbApiKey || process.env.ERPNEXT_API_KEY || '';
      this.apiSecret = dbApiSecret || process.env.ERPNEXT_API_SECRET || '';

      if (this.baseURL && this.apiKey && this.apiSecret) {
        // Ensure baseURL doesn't end with slash
        this.baseURL = this.baseURL.replace(/\/$/, '');
        
        // Validate URL format
        try {
          new URL(this.baseURL);
        } catch (urlError) {
          console.error('Invalid ERPNext base URL format provided:', this.baseURL, urlError);
          return; 
        }
        
        this.client = axios.create({
          baseURL: this.baseURL,
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `token ${this.apiKey}:${this.apiSecret}`
          }
        });
        
        console.log('ERPNext client initialized successfully');
        this.initialized = true; 
      } else {
        console.log('ERPNext credentials not fully configured in database or environment variables. Client remains uninitialized.');
      }
    } catch (error) {
      console.error('Failed to initialize ERPNext client due to an unexpected error:', error);
    }
  }

  async checkHealth(): Promise<ERPNextHealthStatus> {
    const startTime = Date.now();
    try {
      // Ensure client is initialized before making a request
      if (!this.initialized || !this.client) {
        await this.initialize(); // Attempt to initialize
        if (!this.initialized || !this.client) { // Re-check after initialization attempt
          return {
            success: false,
            error: 'ERPNext client not configured. Please add your API credentials in Settings.',
            statusCode: 500,
            responseTime: Date.now() - startTime
          };
        }
      }

      const response = await this.client.get('/api/method/ping');
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        data: {
          message: response.data.message || 'pong',
          version: response.data.version
        },
        statusCode: response.status,
        responseTime
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        success: false,
        error: error.message || 'Connection failed',
        statusCode: error.response?.status || 500,
        responseTime
      };
    }
  }

  async createItem(data: Record<string, any>): Promise<ERPNextResponse> {
    return this.createRecord('Item', data);
  }

  async createCustomer(data: Record<string, any>): Promise<ERPNextResponse> {
    return this.createRecord('Customer', data);
  }

  async createSalesOrder(data: Record<string, any>): Promise<ERPNextResponse> {
    return this.createRecord('Sales Order', data);
  }

  async createSalesInvoice(data: Record<string, any>): Promise<ERPNextResponse> {
    return this.createRecord('Sales Invoice', data);
  }

  async createPaymentEntry(data: Record<string, any>): Promise<ERPNextResponse> {
    return this.createRecord('Payment Entry', data);
  }

  private async createRecord(doctype: string, data: Record<string, any>): Promise<ERPNextResponse> {
    const startTime = Date.now();
    try {
      // Ensure client is initialized before making a request
      if (!this.initialized || !this.client) {
        await this.initialize();
        if (!this.initialized || !this.client) { // Re-check after attempt to initialize
          return {
            success: false,
            error: 'ERPNext client not configured. Please add your API credentials in Settings.',
            responseTime: Date.now() - startTime
          };
        }
      }

      const response = await this.client.post(`/api/resource/${doctype}`, data);
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        data: response.data,
        responseTime
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Creation failed',
        responseTime
      };
    }
  }

  // Method to force reinitialization (called when config changes)
  forceReinit() {
    this.initialized = false;
    this.client = null;
    this.baseURL = '';
    this.apiKey = '';
    this.apiSecret = '';
    console.log('ERPNext client forced to reinitialize on next request.');
  }
}

let client: ERPNextClient | null = null;

export function getERPNextClient(): ERPNextClient {
  if (!client) {
    client = new ERPNextClient();
  }
  return client;
}
