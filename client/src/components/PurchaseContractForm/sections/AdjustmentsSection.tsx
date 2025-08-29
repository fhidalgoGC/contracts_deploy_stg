import React, { useState, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GenericTable } from '@/components/general/StandardTable';
import { Settings, Trash2 } from 'lucide-react';
import type { PurchaseSaleContract } from '@/types/purchaseSaleContract.types';

// Datos fake de ajustes disponibles
const FAKE_ADJUSTMENTS = [
  { _id: '1', name: 'Ajuste por Calidad', description: 'Ajuste basado en calidad del grano' },
  { _id: '2', name: 'Ajuste por Humedad', description: 'Ajuste por niveles de humedad' },
  { _id: '3', name: 'Ajuste por Impurezas', description: 'Ajuste por nivel de impurezas' },
  { _id: '4', name: 'Ajuste por Proteína', description: 'Ajuste por contenido proteico' },
  { _id: '5', name: 'Ajuste por Peso Específico', description: 'Ajuste por peso específico del grano' },
  { _id: '6', name: 'Ajuste Temporal', description: 'Ajuste por fecha de entrega' },
  { _id: '7', name: 'Ajuste por Volumen', description: 'Ajuste por cantidad total' },
  { _id: '8', name: 'Ajuste por Transporte', description: 'Ajuste por costos de transporte' }
];

interface Adjustment {
  _id: string;
  name: string;
  description: string;
}

export function AdjustmentsSection() {
  const { t } = useTranslation();
  const { watch, setValue } = useFormContext<PurchaseSaleContract>();
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  // Obtener ajustes del formulario
  const selectedAdjustments = watch('adjustments') || [];

  // Calcular ajustes disponibles (que no están ya seleccionados)
  const availableAdjustments = useMemo(() => {
    return FAKE_ADJUSTMENTS.filter(adj => 
      !selectedAdjustments.some(selected => selected._id === adj._id)
    );
  }, [selectedAdjustments]);

  // Calcular datos paginados
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return selectedAdjustments.slice(startIndex, endIndex);
  }, [selectedAdjustments, currentPage, pageSize]);

  // Calcular total de páginas
  const totalPages = Math.ceil(selectedAdjustments.length / pageSize);

  // Manejar selección del dropdown
  const handleAddAdjustment = (adjustmentId: string) => {
    if (!adjustmentId) return;
    
    const adjustment = FAKE_ADJUSTMENTS.find(adj => adj._id === adjustmentId);
    if (adjustment) {
      // Agregar solo _id y name como requiere el tipo
      const newAdjustment = {
        _id: adjustment._id,
        name: adjustment.name
      };
      
      // Verificar que no existe (prevenir duplicados)
      if (!selectedAdjustments.some(selected => selected._id === adjustment._id)) {
        setValue('adjustments', [...selectedAdjustments, newAdjustment]);
      }
      setSelectedValue(''); // Limpiar selección
    }
  };

  // Manejar eliminación de la tabla
  const handleRemoveAdjustment = (adjustment: { _id: string; name: string }) => {
    const newData = selectedAdjustments.filter(adj => adj._id !== adjustment._id);
    
    // Si eliminamos el último elemento de la página actual y no es la primera página
    // regresar a la página anterior
    const newTotalPages = Math.ceil(newData.length / pageSize);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
    
    setValue('adjustments', newData);
  };

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Configuración de columnas para GenericTable (StandardTable)
  const columns = [
    {
      key: 'name',
      titleKey: 'adjustment',
      sortable: true,
      render: (item: { _id: string; name: string }) => (
        <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
      )
    }
  ];

  // Configuración de acciones para GenericTable (StandardTable)
  const actionMenuItems = [
    {
      key: 'delete',
      labelKey: 'delete',
      action: (item: { _id: string; name: string }) => handleRemoveAdjustment(item),
      className: 'text-red-600 dark:text-red-400'
    }
  ];

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Settings className="w-5 h-5" />
          {t('contractAdjustments')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Select para agregar ajustes */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900 dark:text-white">
            {t('addAdjustment')}
          </Label>
          <Select
            value={selectedValue}
            onValueChange={(value) => {
              setSelectedValue(value);
              handleAddAdjustment(value);
            }}
          >
            <SelectTrigger className="h-10 border-gray-300 focus:border-green-500">
              <SelectValue placeholder={t('selectAdjustmentPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {availableAdjustments.length === 0 ? (
                <SelectItem value="no-options" disabled>
                  {t('noAdjustmentsAvailable', 'No hay ajustes disponibles')}
                </SelectItem>
              ) : (
                availableAdjustments.map((adjustment) => (
                  <SelectItem key={adjustment._id} value={adjustment._id}>
                    {adjustment.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Tabla de ajustes seleccionados */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900 dark:text-white">
            {t('appliedAdjustments')} ({selectedAdjustments.length})
          </Label>
          
          {selectedAdjustments.length === 0 ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
              <Settings className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">
                {t('noAdjustmentsApplied', 'No hay ajustes aplicados al contrato')}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                {t('selectAdjustmentPlaceholder')}
              </p>
            </div>
          ) : (
            <GenericTable
              data={paginatedData}
              columns={columns}
              showActionColumn={true}
              actionMenuItems={actionMenuItems}
              actionColumnTitleKey="actions"
              showActionIcons={true}
              getItemId={(item: { _id: string; name: string }) => item._id}
              showCreateButton={false}
              showFilters={false}
              totalElements={selectedAdjustments.length}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}