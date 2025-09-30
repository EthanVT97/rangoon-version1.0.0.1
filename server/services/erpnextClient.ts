import axios, { AxiosInstance } from "axios";

export interface ERPNextConfig {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
}

export interface ERPNextResponse {
  success: boolean;
  data?: any;
  error?: string;
  statusCode: number;
  responseTime: number;
}

export class ERPNextClient {
  private client: AxiosInstance;
  private config: ERPNextConfig;

  constructor(config: ERPNextConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        Authorization: `Token ${config.apiKey}:${config.apiSecret}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });
  }

  async createItem(itemData: Record<string, any>): Promise<ERPNextResponse> {
    return this.makeRequest("POST", "/api/resource/Item", itemData);
  }

  async updateItem(itemCode: string, itemData: Record<string, any>): Promise<ERPNextResponse> {
    return this.makeRequest("PUT", `/api/resource/Item/${itemCode}`, itemData);
  }

  async createCustomer(customerData: Record<string, any>): Promise<ERPNextResponse> {
    return this.makeRequest("POST", "/api/resource/Customer", customerData);
  }

  async updateCustomer(customerId: string, customerData: Record<string, any>): Promise<ERPNextResponse> {
    return this.makeRequest("PUT", `/api/resource/Customer/${customerId}`, customerData);
  }

  async createSalesOrder(orderData: Record<string, any>): Promise<ERPNextResponse> {
    return this.makeRequest("POST", "/api/resource/Sales Order", orderData);
  }

  async createSalesInvoice(invoiceData: Record<string, any>): Promise<ERPNextResponse> {
    return this.makeRequest("POST", "/api/resource/Sales Invoice", invoiceData);
  }

  async createPaymentEntry(paymentData: Record<string, any>): Promise<ERPNextResponse> {
    return this.makeRequest("POST", "/api/resource/Payment Entry", paymentData);
  }

  async checkHealth(): Promise<ERPNextResponse> {
    return this.makeRequest("GET", "/api/method/ping");
  }

  private async makeRequest(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<ERPNextResponse> {
    const startTime = Date.now();

    try {
      const response = await this.client.request({
        method,
        url: endpoint,
        data,
      });

      return {
        success: true,
        data: response.data,
        statusCode: response.status,
        responseTime: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status || 500,
        responseTime: Date.now() - startTime,
      };
    }
  }
}

// Singleton instance
let erpnextClient: ERPNextClient | null = null;

export function getERPNextClient(): ERPNextClient {
  if (!erpnextClient) {
    const config: ERPNextConfig = {
      baseUrl: process.env.ERPNEXT_BASE_URL || "https://sandbox.erpnext.com",
      apiKey: process.env.ERPNEXT_API_KEY || "",
      apiSecret: process.env.ERPNEXT_API_SECRET || "",
    };
    erpnextClient = new ERPNextClient(config);
  }
  return erpnextClient;
}
