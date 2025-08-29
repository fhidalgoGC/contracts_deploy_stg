import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { createPersonId, createBuyer, createPersonLocation } from '@/services/crm-people.service';
import type { CreateBuyerIdResponse, CreateBuyerPayload, BuyerFormData } from '../types/create-buyer';
import { environment } from '@/environment';

// Interface for the location payload
interface CreateLocationPayload {
  owner_id: string;
  type: string[];
  address_line_1: string;
  address_line_2: string;
  country_id: string;
  country: string;
  state_id: string;
  state: string;
  city_id: string;
  city: string;
  neighborhood: string;
  zip_code: string;
  latitude: string;
  longitude: string;
  elevation: string;
  _partitionKey: string;
}

export function useCreateBuyer() {
  const [idempotentBuyerId, setIdempotentBuyerId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Initialize idempotent ID when component mounts
  useEffect(() => {
    const initializeIdempotentId = async () => {
      try {
        const jwt = localStorage.getItem('jwt');
        const partitionKey = localStorage.getItem('partition_key');
        
        console.log('CreateBuyer: Calling service to create buyer ID');
        const buyerId = await createPersonId();
        setIdempotentBuyerId(buyerId);
        setError(null);
      } catch (err) {
        console.error('CreateBuyer: Failed to initialize idempotent buyer ID:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeIdempotentId();
  }, []);

  // Helper function to create location after buyer creation
  const createBuyerLocation = async (peopleId: string, formData: BuyerFormData) => {
    const jwt = localStorage.getItem('jwt');
    const partitionKey = localStorage.getItem('partition_key');
    const crmUrl = environment.CRM_BASE_URL;
    
    if (!jwt || !partitionKey || !crmUrl) {
      console.log('CreateBuyer: Missing data for location creation, skipping location step');
      return;
    }
    
    // Only create location if we have address information
    if (!formData.address || !formData.selectedCountry || !formData.selectedState || !formData.selectedCity) {
      console.log('CreateBuyer: No address information provided, skipping location creation');
      return;
    }
    
    console.log('CreateBuyer: Creating location for people_id:', peopleId);
    
    // Build the location payload
    const locationPayload: CreateLocationPayload = {
      owner_id: peopleId,
      type: ["personal"],
      address_line_1: formData.address,
      address_line_2: "",
      country_id: formData.selectedCountry._id || "",
      country: formData.selectedCountry.names.en,
      state_id: formData.selectedState._id || "",
      state: formData.selectedState.name,
      city_id: formData.selectedCity._id || "",
      city: formData.selectedCity.name,
      neighborhood: "",
      zip_code: formData.postalCode || "",
      latitude: "",
      longitude: "",
      elevation: "",
      _partitionKey: partitionKey
    };
    
    console.log('CreateBuyer: Location payload:', locationPayload);
    
    const locationResult = await createPersonLocation(locationPayload);
    return locationResult;
  };

  // Mutation for creating the buyer
  const createBuyerMutation = useMutation({
    mutationFn: async (formData: BuyerFormData) => {
      const jwt = localStorage.getItem('jwt');
      const partitionKey = localStorage.getItem('partition_key');
      
      if (!jwt || !partitionKey || !idempotentBuyerId) {
        throw new Error('Missing required data for buyer creation');
      }

      console.log('CreateBuyer: Submitting form data:', formData);

      const crmUrl = environment.CRM_BASE_URL;
      if (!crmUrl) {
        throw new Error('CRM URL not configured');
      }

      // Build the payload
      const payload: CreateBuyerPayload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: formData.person_type === 'natural_person' 
          ? `${formData.first_name} ${formData.last_name}`
          : formData.organization_name,
        roles: [{ slug: 'buyer' }],
        emails: formData.email ? [{
          value: formData.email,
          type: 'principal',
          verified: false
        }] : [],
        phones: formData.phone_number && formData.calling_code ? [{
          calling_code: formData.calling_code,
          phone_number: formData.phone_number,
          type: 'principal',
          verified: false
        }] : [],
        _partitionKey: partitionKey,
        active: true,
        person_type: formData.person_type
      };

      // Add organization_name only for juridical persons
      if (formData.person_type === 'juridical_person') {
        payload.organization_name = formData.organization_name;
      }

      const buyerResult = await createBuyer(idempotentBuyerId, payload);
      
      // Extract people_id from the response
      const peopleId = buyerResult.people_id || idempotentBuyerId;
      
      // Create location if we have address information
      await createBuyerLocation(peopleId, formData);
      
      return { ...buyerResult, people_id: peopleId };
    },
    onSuccess: () => {
      // Invalidate all buyers queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['buyers'] });
      // Also force a refetch of all buyers data
      queryClient.refetchQueries({ queryKey: ['buyers'] });
      // Don't redirect automatically - let the modal handle it
    },
  });

  return {
    idempotentBuyerId,
    isInitializing,
    initializationError: error,
    createBuyer: createBuyerMutation.mutate,
    isCreating: createBuyerMutation.isPending,
    error: createBuyerMutation.error,
    isSuccess: createBuyerMutation.isSuccess,
  };
}