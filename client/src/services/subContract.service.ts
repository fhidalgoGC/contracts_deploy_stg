import { authenticatedFetch } from '@/utils/apiInterceptors';
import { environment } from '@/environment/environment';

export interface SubContractKeyResponse {
  key: string;
  location: string;
}

export interface CreateSubContractPayload {
  contract_id: string;
  contract_folio: string;
  measurement_unit: string;
  total_price: number;
  created_by_id: string;
  created_by_name: string;
  price_schedule: Array<{
    pricing_type: string;
    price: number;
    basis: number;
    future_price: number;
    basis_operation: string;
    option_month: string;
    option_year: number;
    exchange: string;
    payment_currency: string;
  }>;
  quantity: number;
  sub_contract_date: string;
  measurement_unit_id: string;
  thresholds: {
    max_thresholds_percentage: number;
    max_thresholds_weight: number;
    min_thresholds_percentage: number;
    min_thresholds_weight: number;
  };
}

export class SubContractService {
  private static readonly BASE_URL = `${environment.TRM_BASE_URL}/contracts/sp-sub-contracts`;

  /**
   * Obtiene una clave única para crear un nuevo sub-contrato
   * @returns Promise con la respuesta que contiene la clave del sub-contrato
   */
  public static async getSubContractKey(): Promise<SubContractKeyResponse> {
    try {
      console.log('🔑 Fetching sub-contract key...');
      
      const response = await authenticatedFetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sub-contract key: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Sub-contract key response:', result);
      
      // La clave está anidada en result.data.key basado en la respuesta de la API
      if (result.data?.key) {
        return {
          key: result.data.key,
          location: result.data.location || this.BASE_URL
        };
      } else if (result.key) {
        return {
          key: result.key,
          location: result.location || this.BASE_URL
        };
      } else {
        throw new Error('No key found in response');
      }
      
    } catch (error) {
      console.error('❌ Error fetching sub-contract key:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo sub-contrato usando la clave obtenida previamente
   * @param key - La clave del sub-contrato obtenida del método getSubContractKey
   * @param payload - Los datos del sub-contrato a crear
   * @returns Promise con la respuesta de la creación del sub-contrato
   */
  public static async createSubContract(key: string, payload: CreateSubContractPayload): Promise<any> {
    try {
      console.log('📤 Creating sub-contract with API payload:', payload);
      console.log('🔗 Using sub-contract key:', key);
      
      const response = await authenticatedFetch(`${this.BASE_URL}/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API call failed with status ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Sub-contract created successfully:', result);
      
      return result;
      
    } catch (error) {
      console.error('❌ Error creating sub-contract:', error);
      throw error;
    }
  }

  /**
   * Método de conveniencia que obtiene la clave y crea el sub-contrato en una sola operación
   * @param payload - Los datos del sub-contrato a crear
   * @returns Promise con la respuesta de la creación del sub-contrato
   */
  public static async getKeyAndCreateSubContract(payload: CreateSubContractPayload): Promise<any> {
    const keyResponse = await this.getSubContractKey();
    return await this.createSubContract(keyResponse.key, payload);
  }
}