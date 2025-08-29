import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, Printer, Edit, Trash2, Check, Loader2 } from "lucide-react";
// Placeholder for number formatting - will use real formatNumber when available
const formatNumber = (value: number | undefined | null) => {
  if (value === undefined || value === null || isNaN(value)) {
    return "0.00";
  }
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export interface FieldConfig {
  key: string;
  label: string;
  color: "black" | "blue" | "green" | "gray";
  isCalculated?: boolean;
  calculation?: (data: any) => number;
  unit?: string;
  format?: "currency" | "number";
}

export interface ProgressBarConfig {
  settledField: string; // Campo que contiene el valor settled
  reservedField: string; // Campo que contiene el valor reserved
  totalField: string; // Campo que contiene el total para calcular porcentajes
  label?: string; // Label del progress bar (por defecto "Progress")
  colorPriority?: "settled" | "reserved"; // Color prioritario en caso de empate (por defecto 'settled' = verde)
}

export interface SubContract {
  id: string;
  contractNumber: string;
  quantity: number;
  unit: string;
  thresholds: {
    min: number;
    max: number;
  };
  basis: number;
  price: number;
  delivered: number;
  balance: number;
  totalPayment: number;
  borderColor: string;
  dotColor: string;
  textColor: string;
  [key: string]: any; // Para campos dinámicos
}

interface SubContractCardProps {
  subContract: SubContract;
  fields: FieldConfig[]; // Configuración de campos a mostrar
  progressBar?: ProgressBarConfig; // Configuración del progress bar
  onView?: (id: string) => void;
  onPrint?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSettle?: (id: string) => void;
  isPrinting?: boolean; // Indica si este sub-contrato se está imprimiendo
}

export default function SubContractCard({
  subContract,
  fields,
  progressBar,
  onView,
  onPrint,
  onEdit,
  onDelete,
  onSettle,
  isPrinting = false,
}: SubContractCardProps) {
  const { t } = useTranslation();

  const debugCardData = () => {
    console.log("🐛 DEBUG SubContractCard Data:", {
      contractNumber: subContract.contractNumber,
      unit: subContract.unit,
      measurement_unit: subContract.measurement_unit,
      measurement_unit_id: subContract.measurement_unit_id,
      quantity: subContract.quantity,
      fullSubContract: subContract,
      fields: fields,
    });
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case "blue":
        return "text-blue-600";
      case "green":
        return "text-green-600";
      case "gray":
        return "text-gray-600";
      default:
        return "text-black dark:text-white";
    }
  };

  const formatValue = (value: any, format?: string, unit?: string) => {
    const formattedValue =
      typeof value === "number" ? formatNumber(value) : value;
    const prefix = format === "currency" ? "$ " : "";
    const suffix = unit ? ` ${unit}` : "";
    return `${prefix}${formattedValue}${suffix}`;
  };

  return (
    <Card className={`border-l-4 ${subContract.borderColor}`}>
      <CardContent className="p-4">
        <div className="mb-2">
          {/* Primera línea: ID Contract y Status */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded ${subContract.dotColor}`}></div>
              <span className={`font-medium ${subContract.textColor}`}>
                ID Contract#{subContract.contractNumber}
              </span>
            </div>
            <div className="text-base">
              <span className="font-bold text-gray-700 dark:text-gray-300">Status:</span>{' '}
              <span className="font-medium text-gray-600 dark:text-gray-400">
                {subContract.status || 'created'}
              </span>
            </div>
          </div>

          {/* Segunda línea: Quantity alineado a la izquierda */}
          <div className="flex justify-start">
            <div className="text-base">
              <span className="font-bold text-gray-700 dark:text-gray-300">
                {t("contractDetail.quantity")}:
              </span>{" "}
              <span className="font-medium text-yellow-600">
                {formatNumber(subContract.quantity)} {subContract.unit}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-2 text-xs mb-3">
          {fields.map((field, index) => {
            let value;
            if (field.isCalculated && field.calculation) {
              value = field.calculation(subContract);
            } else {
              value = subContract[field.key];
            }

            // Determinar la unidad a usar: prioridad field.unit, luego subContract.unit
            const unitToUse = field.unit || (field.key === 'reserved' || field.key === 'unreserved' || field.key === 'delivered' ? subContract.unit : undefined);

            return (
              <div key={index}>
                <p className="font-bold text-gray-700 dark:text-gray-300">
                  {field.label}:
                </p>
                <p className={getColorClass(field.color)}>
                  {formatValue(value, field.format, unitToUse)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Dynamic Progress bar */}
        {progressBar && (
          <div className="mb-3">
            {(() => {
              // Cálculos internos del componente usando configuración
              const settledValue = subContract[progressBar.settledField] || 0;
              const reservedValue = subContract[progressBar.reservedField] || 0;
              const totalValue = subContract[progressBar.totalField] || 1;

              // Calcular porcentajes
              const settledPercentage = (settledValue / totalValue) * 100;
              const reservedPercentage = (reservedValue / totalValue) * 100;

              // Determinar color dominante considerando prioridad en caso de empate
              const isSettledDominant =
                settledValue > reservedValue ||
                (settledValue === reservedValue &&
                  (progressBar.colorPriority || "settled") === "settled");

              // El porcentaje mostrado será del valor absoluto mayor o prioritario
              const displayPercentage = isSettledDominant
                ? Math.round(settledPercentage)
                : Math.round(reservedPercentage);

              // Color del texto según el valor absoluto dominante o prioritario
              const percentageColor = isSettledDominant
                ? "text-green-600"
                : "text-blue-600";

              return (
                <>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">
                      {progressBar.label || t("contractDetail.progress")}
                    </span>
                    <span className={`font-medium ${percentageColor}`}>
                      {displayPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 relative overflow-hidden">
                    {/* Progress bar con dos colores: verde (settled) y azul (reserved) */}
                    {settledPercentage > 0 && (
                      <div
                        className="absolute left-0 bg-green-500 h-full transition-all duration-300"
                        style={{
                          width: `${Math.min(settledPercentage, 100)}%`,
                        }}
                      ></div>
                    )}
                    {reservedPercentage > settledPercentage && (
                      <div
                        className="absolute bg-blue-500 h-full transition-all duration-300"
                        style={{
                          left: `${Math.min(settledPercentage, 100)}%`,
                          width: `${Math.min(reservedPercentage - settledPercentage, 100 - settledPercentage)}%`,
                        }}
                      ></div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Total Payment and Action buttons on same row */}
        <div className="pt-2 border-t flex justify-between items-center">
          <p className="text-sm">
            <span className="text-gray-500">
              {t("contractDetail.totalPayment")}:
            </span>{" "}
            <span className="font-bold text-green-600">
              $ {formatNumber(subContract.totalPayment)}
            </span>
          </p>

          <div className="flex space-x-1">
            {/* 1. Imprimir */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className="h-8 w-8 p-0 bg-gray-500 hover:bg-gray-600 text-white"
                    onClick={() => onPrint?.(subContract.id)}
                    disabled={isPrinting}
                  >
                    {isPrinting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Printer className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("print")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* 2. Ver */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => onView?.(subContract.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("view")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* 3. Editar y 4. Eliminar - solo visibles cuando el status del sub-contrato es 'created' */}
            {subContract.status === "created" && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        className="h-8 w-8 p-0 bg-yellow-500 hover:bg-yellow-600 text-white"
                        onClick={() => onEdit?.(subContract.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("edit")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        className="h-8 w-8 p-0 bg-red-500 hover:bg-red-600 text-white"
                        onClick={() => onDelete?.(subContract.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("delete")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}

            {/* Botón de settle - solo visible cuando el status del sub-contrato es 'in-progress' */}
            {subContract.status === "in-progress" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => onSettle?.(subContract.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("settle")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
