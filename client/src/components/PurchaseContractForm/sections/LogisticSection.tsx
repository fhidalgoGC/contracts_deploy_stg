import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Truck } from "lucide-react";
import type {
  PurchaseSaleContract,
  LogisticSchedule,
} from "@/types/purchaseSaleContract.types";
import {
  APP_CONFIG,
  CURRENCY_OPTIONS,
  NUMBER_FORMAT_CONFIG,
} from "@/environment/environment";
import { formatNumber } from "@/lib/numberFormatter";
import { FormattedNumberInput } from "../components/FormattedNumberInput";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

// Standardized data structure for freight cost type field
const FREIGHT_COST_TYPE_OPTIONS = [
  { key: "none", value: "none", label: "None" },
  { key: "fixed", value: "fixed", label: "Fixed" },
  { key: "variable", value: "variable", label: "Variable" },
];

// Remove static measurement units - now loaded from API

interface LogisticSectionProps {
  addLogisticSchedule: () => void;
  removeLogisticSchedule: (index: number) => void;
  updateLogisticSchedule: (index: number, field: string, value: any) => void;
}

export function LogisticSection({
  addLogisticSchedule,
  removeLogisticSchedule,
  updateLogisticSchedule,
}: LogisticSectionProps) {
  const { t } = useTranslation();
  const { data: measurementUnits = [], isLoading: loadingUnits } =
    useMeasurementUnits();
  const {
    formState: { errors },
    watch,
    setValue,
    control,
    clearErrors,
  } = useFormContext<PurchaseSaleContract>();

  const logisticSchedule = watch("logistic_schedule") || [];
  const currentSchedule = logisticSchedule[0] || {};

  // Watch para lógica condicional basada en state
  const watchedFreightCostType = watch("logistic_schedule.0.freight_cost.type");

  // Use centralized number formatting from environment configuration

  // Effect to clear freight cost fields when type changes
  React.useEffect(() => {
    if (watchedFreightCostType) {
      // Clear all freight cost values when type changes
      setValue("logistic_schedule.0.freight_cost.cost", 0);
      setValue("logistic_schedule.0.freight_cost.min", 0);
      setValue("logistic_schedule.0.freight_cost.max", 0);
    }
  }, [watchedFreightCostType, setValue]);

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Truck className="w-5 h-5" />
          {t("logisticContract")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logistic Schedule Fields */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Responsibility */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                {t("paymentResponsibility")}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentSchedule.logistic_payment_responsability || ""}
                onValueChange={(value) => {
                  const currentLogisticSchedule = watch(
                    "logistic_schedule",
                  ) || [{}];
                  const updatedSchedule = [...currentLogisticSchedule];
                  updatedSchedule[0] = {
                    ...updatedSchedule[0],
                    logistic_payment_responsability: value as any,
                  };
                  setValue("logistic_schedule", updatedSchedule);
                  clearErrors(
                    "logistic_schedule.0.logistic_payment_responsability",
                  );
                }}
              >
                <SelectTrigger
                  className={`h-10 ${errors.logistic_schedule?.[0]?.logistic_payment_responsability ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-green-500"}`}
                >
                  <SelectValue placeholder="Select responsibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.logistic_schedule?.[0]
                ?.logistic_payment_responsability && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {
                    errors.logistic_schedule[0].logistic_payment_responsability
                      .message
                  }
                </p>
              )}
            </div>

            {/* Coordination Responsibility */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                {t("coordinationResponsibility")}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Select
                value={
                  currentSchedule.logistic_coordination_responsability || ""
                }
                onValueChange={(value) => {
                  const currentLogisticSchedule = watch(
                    "logistic_schedule",
                  ) || [{}];
                  const updatedSchedule = [...currentLogisticSchedule];
                  updatedSchedule[0] = {
                    ...updatedSchedule[0],
                    logistic_coordination_responsability: value as any,
                  };
                  setValue("logistic_schedule", updatedSchedule);
                  clearErrors(
                    "logistic_schedule.0.logistic_coordination_responsability",
                  );
                }}
              >
                <SelectTrigger
                  className={`h-10 ${errors.logistic_schedule?.[0]?.logistic_coordination_responsability ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-green-500"}`}
                >
                  <SelectValue placeholder="Select responsibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.logistic_schedule?.[0]
                ?.logistic_coordination_responsability && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {
                    errors.logistic_schedule[0]
                      .logistic_coordination_responsability.message
                  }
                </p>
              )}
            </div>

            {/* Payment Currency */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                {t("paymentCurrency")} <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="logistic_schedule.0.payment_currency"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={(value) => {
                      field.onChange(value);
                      clearErrors("logistic_schedule.0.payment_currency");
                    }}
                  >
                    <SelectTrigger
                      className={`h-10 ${errors.logistic_schedule?.[0]?.payment_currency ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-green-500"}`}
                    >
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((currency) => (
                        <SelectItem key={currency.key} value={currency.key}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.logistic_schedule?.[0]?.payment_currency && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.logistic_schedule[0].payment_currency.message}
                </p>
              )}
            </div>

            {/* Freight Cost Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                {t("freightCostType")} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentSchedule.freight_cost?.type || "none"}
                onValueChange={(value) => {
                  const currentLogisticSchedule = watch(
                    "logistic_schedule",
                  ) || [{}];
                  const updatedSchedule = [...currentLogisticSchedule];

                  // Reset freight_cost fields based on selected type
                  let freightCost = {
                    type: value as any,
                    cost: 0,
                    min: 0,
                    max: 0,
                  };

                  // Clear measurement unit fields when type is 'none'
                  if (value === "none") {
                    updatedSchedule[0] = {
                      ...updatedSchedule[0],
                      freight_cost: freightCost,
                      freight_cost_measurement_unit_id: "",
                      freight_cost_measurement_unit: "",
                    };
                  } else {
                    updatedSchedule[0] = {
                      ...updatedSchedule[0],
                      freight_cost: freightCost,
                    };
                  }
                  setValue("logistic_schedule", updatedSchedule);
                  clearErrors("logistic_schedule.0.freight_cost.type");
                }}
              >
                <SelectTrigger
                  className={`h-10 ${errors.logistic_schedule?.[0]?.freight_cost?.type ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-green-500"}`}
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {FREIGHT_COST_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.key} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.logistic_schedule?.[0]?.freight_cost?.type && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {typeof errors.logistic_schedule[0].freight_cost.type ===
                  "object"
                    ? (errors.logistic_schedule[0].freight_cost.type as any)
                        .message
                    : String(errors.logistic_schedule[0].freight_cost.type)}
                </p>
              )}
            </div>
          </div>

          {/* Freight Cost Fields - Conditional based on state value */}
          {watchedFreightCostType && watchedFreightCostType !== "none" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column - Cost Fields */}
              <div className="space-y-4">
                {/* Cost - Only show for 'fixed' type based on state */}
                {watchedFreightCostType === "fixed" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-900 dark:text-white">
                      {t("freightCost")} <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name={`logistic_schedule.0.freight_cost.cost`}
                      control={control}
                      render={({ field }) => (
                        <FormattedNumberInput
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            clearErrors(
                              "logistic_schedule.0.freight_cost.cost",
                            );
                          }}
                          error={
                            !!errors.logistic_schedule?.[0]?.freight_cost?.cost
                          }
                        />
                      )}
                    />
                    {errors.logistic_schedule?.[0]?.freight_cost?.cost && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.logistic_schedule[0].freight_cost.cost.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Min and Max - Only show for 'variable' type based on state */}
                {watchedFreightCostType === "variable" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">
                        Freight Min Cost <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        name={`logistic_schedule.0.freight_cost.min`}
                        control={control}
                        render={({ field }) => (
                          <FormattedNumberInput
                            value={field.value}
                            onChange={(value) => {
                              const currentMax = watch(
                                "logistic_schedule.0.freight_cost.max",
                              );

                              // If min is greater than max, clear min
                              if (currentMax && value > currentMax) {
                                field.onChange(0);
                                return;
                              }

                              field.onChange(value);
                              clearErrors(
                                "logistic_schedule.0.freight_cost.min",
                              );
                            }}
                            error={
                              !!errors.logistic_schedule?.[0]?.freight_cost?.min
                            }
                          />
                        )}
                      />
                      {errors.logistic_schedule?.[0]?.freight_cost?.min && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {errors.logistic_schedule[0].freight_cost.min.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">
                        Freight Max Cost <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        name={`logistic_schedule.0.freight_cost.max`}
                        control={control}
                        render={({ field }) => (
                          <FormattedNumberInput
                            value={field.value}
                            onChange={(value) => {
                              const currentMin = watch(
                                "logistic_schedule.0.freight_cost.min",
                              );

                              // If max is less than min, clear max
                              if (currentMin && value < currentMin) {
                                field.onChange(0);
                                return;
                              }

                              field.onChange(value);
                              clearErrors(
                                "logistic_schedule.0.freight_cost.max",
                              );
                            }}
                            error={
                              !!errors.logistic_schedule?.[0]?.freight_cost?.max
                            }
                          />
                        )}
                      />
                      {errors.logistic_schedule?.[0]?.freight_cost?.max && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {errors.logistic_schedule[0].freight_cost.max.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Measurement Unit */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  {t("measurementUnit")} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={currentSchedule.freight_cost_measurement_unit_id || ""}
                  onValueChange={(value) => {
                    const currentLogisticSchedule = watch(
                      "logistic_schedule",
                    ) || [{}];
                    const updatedSchedule = [...currentLogisticSchedule];

                    // Find the selected option to get both ID and value
                    const selectedOption = measurementUnits.find(
                      (option) => option.key === value,
                    );

                    updatedSchedule[0] = {
                      ...updatedSchedule[0],
                      freight_cost_measurement_unit_id: selectedOption?.key,
                      freight_cost_measurement_unit:
                        selectedOption?.label || "",
                    };
                    setValue("logistic_schedule", updatedSchedule);
                    clearErrors(
                      "logistic_schedule.0.freight_cost_measurement_unit",
                    );
                  }}
                >
                  <SelectTrigger
                    className={`h-10 ${errors.logistic_schedule?.[0]?.freight_cost_measurement_unit ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-green-500"}`}
                  >
                    <SelectValue placeholder="Select measurement unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingUnits ? (
                      <SelectItem value="loading" disabled>
                        Loading units...
                      </SelectItem>
                    ) : (
                      measurementUnits.map((option) => (
                        <SelectItem key={option.key} value={option.key}>
                          {option.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.logistic_schedule?.[0]
                  ?.freight_cost_measurement_unit && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {
                      errors.logistic_schedule[0].freight_cost_measurement_unit
                        .message
                    }
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
