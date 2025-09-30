
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { storage } from '../storage';

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
    if (this.initialized) return;

    try {
      // Try environment variables first (for backward compatibility)
      this.baseURL = process.env.ERPNEXT_BASE_URL || '';
      this.apiKey = process.env.ERPNEXT_API_KEY || '';
      this.apiSecret = process.env.ERPNEXT_API_SECRET || '';

      // If not in env, try database
      if (!this.baseURL || !this.apiKey || !this.apiSecret) {
        const baseUrl = await storage.getConfiguration("erpnext_base_url");
        const apiKey = await storage.getConfiguration("erpnext_api_key");
        const apiSecret = await storage.getConfiguration("erpnext_api_secret");

        this.baseURL = baseUrl || this.baseURL;
        this.apiKey = apiKey || this.apiKey;
        this.apiSecret = apiSecret || this.apiSecret;
      }

      if (this.baseURL && this.apiKey && this.apiSecret) {
        // Ensure baseURL doesn't end with slash
        this.baseURL = this.baseURL.replace(/\/$/, '');
        
        this.client = axios.create({
          baseURL: this.baseURL,
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `token ${this.apiKey}:${this.apiSecret}`
          }
        });
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize ERPNext client:', error);
      this.initialized = true; // Still mark as initialized to avoid infinite loops
    }
  }

  async checkHealth(): Promise<ERPNextHealthStatus> {
    const startTime = Date.now();
    try {
      await this.initialize();
      
      if (!this.client) {
        return {
          success: false,
          error: 'ERPNext client not configured. Please add your API credentials in Settings.',
          statusCode: 500,
          responseTime: Date.now() - startTime
        };
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
      await this.initialize();
      
      if (!this.client) {
        return {
          success: false,
          error: 'ERPNext client not configured. Please add your API credentials in Settings.',
          responseTime: Date.now() - startTime
        };
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
}

let client: ERPNextClient | null = null;

export function getERPNextClient(): ERPNextClient {
  if (!client) {
    client = new ERPNextClient();
  }
  return client;
}
