
import React, { useCallback } from "react";
import { FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { usePurchaseContractForm } from "./hooks/usePurchaseContractForm";
import { PurchaseSaleContract } from "@/types/purchaseSaleContract.types";
import { ContractInfoSection } from "./sections/ContractInfoSection";
import { PriceSection } from "./sections/PriceSection";
import { LogisticSection } from "./sections/LogisticSection";
import { AdjustmentsSection } from "./sections/AdjustmentsSection";
import { ShipmentSection } from "./sections/ShipmentSection";
import { RemarksSection } from "./sections/RemarksSection";

export interface PurchaseContractFormProps {
  contractType: "purchase" | "sale";
  mode: "create" | "edit" | "view";
  contractId?: string; // Para modo edit/view y create (generated ID)
  representativeRole?:
    | "buyer"
    | "seller"
    | "trader"
    | "contactVendor"
    | "purchase"
    | "sale";
  initialContract?: Partial<PurchaseSaleContract>; // Datos iniciales del contrato
  onSuccess?: () => void;
  onCancel?: () => void;
  onSubmitContract?: (contractId: string, data: any) => Promise<void>;
}

export function PurchaseContractForm({
  contractType,
  mode,
  contractId,
  representativeRole = "buyer",
  initialContract,
  onSuccess,
  onCancel: onCancelProp,
  onSubmitContract,
}: PurchaseContractFormProps) {
  // Determinar datos iniciales según el modo
  const getInitialData = () => {
    // Para cualquier modo: usar initialContract o valores por defecto
    return initialContract || {};
  };

  // Manejar success personalizado
  const handleSuccess = () => {
    // La página padre maneja la limpieza del draft
    if (onSuccess) {
      onSuccess();
    }
  };

  const { t } = useTranslation();
  const {
    form,
    isSubmitting,
    onSubmit,
    onCancel,
    generateContractJSON, // Add this for debug button
    // Participant methods
    addParticipant,
    removeParticipant,
    updateParticipant,
    // Price schedule methods
    addPriceSchedule,
    removePriceSchedule,
    updatePriceSchedule,
    // Logistic schedule methods
    addLogisticSchedule,
    removeLogisticSchedule,
    updateLogisticSchedule,
    // Remarks methods
    addRemark,
    removeRemark,
    updateRemark,
  } = usePurchaseContractForm({
    initialData: getInitialData(),
    contractType,
    contractId,
    mode,
    representativeRole,
    // Sin auto-save de drafts
    onSuccess: handleSuccess,
    onSubmitContract: onSubmitContract,
  });

  // Generar títulos dinámicamente
  const getTitle = () => {
    if (mode === "create") {
      return contractType === "purchase"
        ? t("createPurchaseContract")
        : t("createSaleContract");
    } else if (mode === "edit") {
      return contractType === "purchase"
        ? t("editPurchaseContract")
        : t("editSaleContract");
    } else {
      return contractType === "purchase"
        ? t("viewPurchaseContract")
        : t("viewSaleContract");
    }
  };

  // Generar texto del botón dinámicamente
  const getButtonText = () => {
    if (mode === "create") {
      return contractType === "purchase"
        ? t("createContract")
        : t("createSaleContract");
    } else {
      return t("saveChanges");
    }
  };

  // Manejar cancel - solo limpiar state del componente
  const handleCancel = () => {
    console.log("🧹 PurchaseContractForm: Limpiando form state");

    try {
      // Solo limpiar el estado del formulario
      onCancel();
    } catch (error) {
      console.warn("Form already reset:", error);
    }

    // Ejecutar callback del padre (delegará resto de responsabilidades)
    if (onCancelProp) {
      onCancelProp();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with title and debug button */}
      {mode !== "view" && (
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {getTitle()}
          </h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                const formValues = form.getValues();

                // Use the same function as Submit to generate the exact final JSON
                const finalJSON = generateContractJSON(formValues);

                console.log(
                  "🔍 DEBUG: Final JSON (same as Submit):",
                  JSON.stringify(finalJSON, null, 2),
                );
                console.log("📋 DEBUG: Final JSON Object:", finalJSON);
              }}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              🔍 Debug JSON
            </button>
            <button
              type="button"
              onClick={() => {
                const formValues = form.getValues();
                console.log(
                  "📄 FORM STATE (Raw):",
                  JSON.stringify(formValues, null, 2),
                );
                console.log("📊 FORM STATE Object:", formValues);
              }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              📄 Form State
            </button>
          </div>
        </div>
      )}

      <FormProvider {...form}>
        <form
          onSubmit={(e) => {
            console.log("📝 FORM submit event triggered");
            console.log("🔍 Form errors:", form.formState.errors);
            console.log("🔍 Form is valid:", form.formState.isValid);
            onSubmit(e);
          }}
          className={`space-y-8 ${mode === "view" ? "view-only-form" : ""}`}
        >
          {/* Section 1: Contract Info */}
          <ContractInfoSection 
            representativeRole={representativeRole} 
            contractType={contractType}
            disabled={mode === "view"}
          />

          {/* Section 2: Price Contract Per (Bushel 56) */}
          <PriceSection
            addPriceSchedule={addPriceSchedule}
            removePriceSchedule={removePriceSchedule}
            updatePriceSchedule={updatePriceSchedule}
            disabled={mode === "view"}
          />

          {/* Section 3: Logistic Contract */}
          <LogisticSection
            addLogisticSchedule={addLogisticSchedule}
            removeLogisticSchedule={removeLogisticSchedule}
            updateLogisticSchedule={updateLogisticSchedule}
            disabled={mode === "view"}
          />

          {/* Section 4: Contract Adjustments */}
          <AdjustmentsSection disabled={mode === "view"} />

          {/* Section 5: Shipment & Delivery */}
          <ShipmentSection disabled={mode === "view"} />

          {/* Section 6: Remarks & Observation */}
          <RemarksSection
            addRemark={addRemark}
            removeRemark={removeRemark}
            updateRemark={updateRemark}
            addComment={addRemark}
            disabled={mode === "view"}
          />

          {/* Form Actions */}
          {mode !== "view" && (
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-8"
              >
                {t("cancel")}
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {getButtonText()}...
                  </>
                ) : (
                  getButtonText()
                )}
              </Button>
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  );
}
