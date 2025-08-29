import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, User, Building2, Mail, Phone, Loader2, MapPin } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PhoneInput } from '@/components/ui/phone-input';
import { CountrySelector } from '@/components/ui/country-selector-new';
import { StateSelector } from '@/components/ui/state-selector-new';
import { CitySelector } from '@/components/ui/city-selector-new';
import type { Country } from '@/features/countries/types/country';
import type { State } from '@/features/states/types/state';
import type { City } from '@/features/cities/hooks/useCities';
import { useCreateBuyer } from '@/features/buyers/hooks/useCreateBuyer';
import type { BuyerFormData } from '@/features/buyers/types/create-buyer';

// Form validation schema
const buyerSchema = z.object({
  person_type: z.enum(['natural_person', 'juridical_person']),
  first_name: z.string().min(1, 'El nombre es requerido'),
  last_name: z.string().min(1, 'El apellido es requerido'),
  organization_name: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  calling_code: z.string().optional(),
  phone_number: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
}).refine((data) => {
  if (data.person_type === 'juridical_person') {
    return data.organization_name && data.organization_name.trim().length > 0;
  }
  return true;
}, {
  message: 'El nombre de la organización es requerido para personas jurídicas',
  path: ['organization_name'],
}).refine((data) => {
  if (data.email && data.email.trim()) {
    const validDomains = ['.com', '.mx'];
    return validDomains.some(domain => data.email!.endsWith(domain));
  }
  return true;
}, {
  message: 'El email debe terminar en .com o .mx',
  path: ['email'],
}).refine((data) => {
  if (data.phone_number && data.phone_number.trim()) {
    return data.calling_code && data.calling_code.trim().length > 0;
  }
  return true;
}, {
  message: 'Código de país requerido cuando se proporciona teléfono',
  path: ['calling_code'],
});

export default function CreateBuyer() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successModal, setSuccessModal] = useState({ open: false, buyerName: "" });
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [address, setAddress] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [postalCodeError, setPostalCodeError] = useState<string>('');
  
  const {
    idempotentBuyerId,
    isInitializing,
    initializationError,
    createBuyer,
    isCreating,
    error,
    isSuccess,
  } = useCreateBuyer();

  const form = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      person_type: 'natural_person',
      first_name: '',
      last_name: '',
      organization_name: '',
      email: '',
      calling_code: '',
      phone_number: '',
      country: '',
      state: '',
    },
  });

  const personType = form.watch('person_type');

  // Postal code validation function
  const validatePostalCode = (code: string, country: Country | null): string => {
    if (!code.trim()) return ''; // Empty is valid (optional field)
    
    if (!country) return '';
    
    const countrySlug = country.slug.toUpperCase();
    
    switch (countrySlug) {
      case 'MEX': // México
        // Mexican postal codes: 5 digits
        if (!/^\d{5}$/.test(code)) {
          return t('invalidPostalCodeMexico');
        }
        break;
      case 'USA': // Estados Unidos
        // US ZIP codes: 5 digits or 5+4 format
        if (!/^\d{5}(-\d{4})?$/.test(code)) {
          return t('invalidPostalCodeUSA');
        }
        break;
      case 'COL': // Colombia
        // Colombian postal codes: 6 digits
        if (!/^\d{6}$/.test(code)) {
          return t('invalidPostalCodeColombia');
        }
        break;
      case 'GTM': // Guatemala
        // Guatemalan postal codes: 5 digits
        if (!/^\d{5}$/.test(code)) {
          return t('invalidPostalCodeGuatemala');
        }
        break;
      case 'HND': // Honduras
        // Honduran postal codes: 5 digits
        if (!/^\d{5}$/.test(code)) {
          return t('invalidPostalCodeHonduras');
        }
        break;
      default:
        // Generic validation for other countries: 3-10 alphanumeric characters
        if (!/^[A-Za-z0-9\s-]{3,10}$/.test(code)) {
          return t('invalidPostalCodeGeneric');
        }
    }
    
    return ''; // Valid
  };

  const handlePostalCodeChange = (value: string) => {
    setPostalCode(value);
    const error = validatePostalCode(value, selectedCountry);
    setPostalCodeError(error);
  };

  // Helper function to normalize text (title case) - same as in selectors
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const onSubmit = async (data: BuyerFormData) => {
    try {
      // Add location fields to the form data
      const formDataWithLocation: BuyerFormData = {
        ...data,
        address,
        postalCode,
        selectedCountry,
        selectedState,
        selectedCity,
      };
      
      console.log('CreateBuyer: Submitting form with location data:', formDataWithLocation);
      await createBuyer(formDataWithLocation);
      
      // Show success modal
      const buyerName = data.person_type === "juridical_person" 
        ? data.organization_name || `${data.first_name} ${data.last_name}`
        : `${data.first_name} ${data.last_name}`;
      
      setSuccessModal({ open: true, buyerName });
    } catch (error) {
      console.error("CreateBuyer: Form submission failed:", error);
    }
  };


  if (isInitializing) {
    return (
      <DashboardLayout title="Agregar Comprador">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{t('loading')}...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isInitializing && (!idempotentBuyerId || initializationError)) {
    return (
      <DashboardLayout title="Error">
        <div className="max-w-2xl mx-auto space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {t('initializationError')}
              {initializationError && (
                <>
                  <br />
                  <strong>{t('detail')}</strong> {initializationError}
                </>
              )}
              <br />
              {t('ensureAuthenticated')}
            </AlertDescription>
          </Alert>
          <div className="text-center">
            <Button asChild variant="outline">
              <Link href="/buyers">{t('backToList')}</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Agregar Comprador">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 -mx-6 -my-6 px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-6">
            <Button 
              asChild 
              variant="ghost" 
              size="sm" 
              className="p-3 hover:bg-white/60 dark:hover:bg-gray-800/60 rounded-xl transition-all duration-200"
            >
              <Link href="/buyers">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {t('addBuyer')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('createBuyerDescription')}
              </p>
            </div>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <Alert className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20 rounded-xl shadow-sm">
              <AlertDescription className="text-emerald-800 dark:text-emerald-200 font-medium">
                {t('buyerRegisteredSuccess')}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="rounded-xl shadow-sm">
              <AlertDescription>
                {t('buyerRegistrationError')}
              </AlertDescription>
            </Alert>
          )}

          {/* Form Container */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="p-8 sm:p-12">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Person Type Selection */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('personTypeLabel')}
                  </Label>
                  <RadioGroup
                    value={personType}
                    onValueChange={(value) => form.setValue('person_type', value as 'natural_person' | 'juridical_person')}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <div className="relative">
                      <RadioGroupItem 
                        value="natural_person" 
                        id="natural_person" 
                        className="peer sr-only" 
                      />
                      <Label 
                        htmlFor="natural_person" 
                        className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 peer-checked:border-green-500 peer-checked:bg-green-50 dark:peer-checked:bg-green-900/20 transition-all duration-200"
                      >
                        <User className="w-6 h-6 text-gray-600 dark:text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {t('naturalPerson')}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                          {t('naturalPersonDesc')}
                        </span>
                      </Label>
                    </div>
                    <div className="relative">
                      <RadioGroupItem 
                        value="juridical_person" 
                        id="juridical_person" 
                        className="peer sr-only" 
                      />
                      <Label 
                        htmlFor="juridical_person" 
                        className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 peer-checked:border-green-500 peer-checked:bg-green-50 dark:peer-checked:bg-green-900/20 transition-all duration-200"
                      >
                        <Building2 className="w-6 h-6 text-gray-600 dark:text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {t('juridicalPerson')}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                          {t('juridicalPersonDesc')}
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>
                  {form.formState.errors.person_type && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {form.formState.errors.person_type.message}
                    </p>
                  )}
                </div>

                {/* Organization Name (only for juridical persons) */}
                {personType === 'juridical_person' && (
                  <div className="space-y-3">
                    <Label htmlFor="organization_name" className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {t('organizationName')} {t('required')}
                    </Label>
                    <Input
                      id="organization_name"
                      {...form.register('organization_name')}
                      className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder={t('organizationNamePlaceholder')}
                      maxLength={90}
                    />
                    {form.formState.errors.organization_name && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {form.formState.errors.organization_name.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Name Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="first_name" className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {t('firstName')} {t('required')}
                    </Label>
                    <Input
                      id="first_name"
                      {...form.register('first_name')}
                      className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder={t('firstNamePlaceholder')}
                      maxLength={90}
                    />
                    {form.formState.errors.first_name && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {form.formState.errors.first_name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="last_name" className="text-sm font-medium text-gray-900 dark:text-white">
                      {t('lastName')} {t('required')}
                    </Label>
                    <Input
                      id="last_name"
                      {...form.register('last_name')}
                      className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder={t('lastNamePlaceholder')}
                      maxLength={90}
                    />
                    {form.formState.errors.last_name && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {form.formState.errors.last_name.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    {t('contactInformation')}
                  </h3>

                  {/* Email and Phone in same row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Email */}
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {t('email')}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register('email')}
                        className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        placeholder={t('emailPlaceholderForm')}
                        maxLength={90}
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Phone - Integrated Component */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {t('phoneLabel')}
                      </Label>
                      <PhoneInput
                        callingCode={form.watch('calling_code') || ''}
                        phoneNumber={form.watch('phone_number') || ''}
                        onCallingCodeChange={(code) => form.setValue('calling_code', code)}
                        onPhoneNumberChange={(number) => form.setValue('phone_number', number)}
                        placeholder={t('phonePlaceholder')}
                        error={!!(form.formState.errors.calling_code || form.formState.errors.phone_number)}
                      />
                      {(form.formState.errors.calling_code || form.formState.errors.phone_number) && (
                        <div className="space-y-1">
                          {form.formState.errors.calling_code && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {form.formState.errors.calling_code.message}
                            </p>
                          )}
                          {form.formState.errors.phone_number && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {form.formState.errors.phone_number.message}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    {t('addressOptional')}
                  </h3>

                  {/* Country and State Selectors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Country Selector */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">
                        {t('country')}
                      </Label>
                      <CountrySelector
                        value={selectedCountry ? (i18n.language === 'es' ? selectedCountry.names.es : selectedCountry.names.en) : ''}
                        onChange={(country) => {
                          console.log('CreateBuyer: Country change triggered:', country ? {
                            name: i18n.language === 'es' ? country.names.es : country.names.en,
                            slug: country.slug,
                            hasFlag: !!country.flag
                          } : 'null');
                          
                          setSelectedCountry(country);
                          form.setValue('country', country ? (i18n.language === 'es' ? country.names.es : country.names.en) : '');
                          
                          // Reset state and city when country changes
                          setSelectedState(null);
                          form.setValue('state', '');
                          setSelectedCity(null);
                          
                          if (country) {
                            console.log('CreateBuyer: Updated selectedCountry state, reset selectedState');
                          }
                        }}
                        placeholder={t('countrySelect')}
                        error={!!form.formState.errors.country}
                      />
                      {form.formState.errors.country && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {form.formState.errors.country.message}
                        </p>
                      )}
                    </div>

                    {/* State Selector */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">
                        {t('state')}
                      </Label>
                      <StateSelector
                        value={selectedState ? normalizeText(selectedState.name) : ''}
                        selectedCountry={selectedCountry}
                        onChange={(state) => {
                          console.log('CreateBuyer: State change triggered:', state ? {
                            name: state.name,
                            code: state.code,
                            countrySlug: state.country_slug
                          } : 'null');
                          
                          setSelectedState(state);
                          form.setValue('state', state ? state.name : '');
                          
                          // Reset city when state changes
                          setSelectedCity(null);
                          
                          if (state) {
                            console.log('CreateBuyer: Updated selectedState, reset selectedCity');
                          }
                        }}
                        placeholder={t('stateSelect')}
                        disabled={!selectedCountry}
                        error={!!form.formState.errors.state}
                      />
                      {form.formState.errors.state && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {form.formState.errors.state.message}
                        </p>
                      )}
                    </div>

                  </div>

                  {/* City Selector and Address Input */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* City Selector */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">
                        {t('city')}
                      </Label>
                      <CitySelector
                        selectedCountry={selectedCountry}
                        selectedState={selectedState}
                        selectedCity={selectedCity}
                        onCityChange={(city) => {
                          console.log('CreateBuyer: City change triggered:', city ? {
                            name: city.name,
                            id: city._id,
                            countrySlug: city.country_slug,
                            stateId: city.state
                          } : 'null');
                          
                          setSelectedCity(city);
                          
                          if (city) {
                            console.log('CreateBuyer: Updated selectedCity');
                          }
                        }}
                        disabled={!selectedCountry || !selectedState}
                      />
                    </div>

                    {/* Address Input */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">
                        {t('address')}
                      </Label>
                      <Input
                        type="text"
                        placeholder={t('enterAddress')}
                        value={address}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 200) {
                            setAddress(value);
                          }
                        }}
                        maxLength={200}
                        className="h-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]"
                      />

                    </div>
                  </div>

                  {/* Postal Code Input */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">
                        {t('postalCode')}
                      </Label>
                      <Input
                        type="text"
                        placeholder={t('enterPostalCode')}
                        value={postalCode}
                        onChange={(e) => handlePostalCodeChange(e.target.value)}
                        className={`h-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] ${
                          postalCodeError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {selectedCountry && (
                        <div className="mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {t('formatFor')} {i18n.language === 'es' ? selectedCountry.names.es : selectedCountry.names.en}
                          </span>
                        </div>
                      )}
                      {postalCodeError && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {postalCodeError}
                        </p>
                      )}
                    </div>
                    {/* Empty column to maintain grid layout */}
                    <div></div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="flex-1 h-12 rounded-lg border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Link href="/buyers">{t('cancel')}</Link>
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('registering')}
                      </>
                    ) : (
                      t('registerBuyer')
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AlertDialog
        open={successModal.open}
        onOpenChange={(open) => {
          setSuccessModal((prev) => ({ ...prev, open }));
          if (!open) {
            // Redirect to buyers list when modal is closed
            setLocation("/buyers");
          }
        }}
      >
        <AlertDialogContent className="border-green-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-700 dark:text-green-400">
              ✅ {t("buyerCreatedSuccessfully")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-green-600 dark:text-green-300">
              {t("buyerCreatedSuccessfullyDesc")} <strong>{successModal.buyerName}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
              onClick={() => {
                setSuccessModal({ open: false, buyerName: "" });
                setLocation("/buyers");
              }}
            >
              {t("continue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}