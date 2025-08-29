import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { usePageTracking, useNavigationHandler } from "@/hooks/usePageState";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/ui/data-table";
import { Seller } from "@/features/sellers/types";
import SellerDetailsCard from "@/components/sellers/SellerDetailsCard";
import { formatSellerId } from "@/lib/formatters";
import { useSellers } from "@/features/sellers/hooks/useSellers";
export default function Sellers() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { handleNavigateToPage } = useNavigationHandler();

  usePageTracking("/sellers");

  // Notificar navegación jerárquica al cargar la página
  useEffect(() => {
    console.log(
      "🔄 SELLER PAGE: Cargando página y ejecutando navegación jerárquica",
    );
    handleNavigateToPage("sellers");
  }, []);
  const {
    data,
    isLoading,
    currentPage,
    pageSize,
    sortKey,
    sortDirection,
    searchValue,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleSearchChange,
  } = useSellers();

  console.log("Sellers component render:", { data, isLoading, currentPage });

  const handleAddSeller = () => {
    setLocation("/sellers/create");
  };

  const columns: Column<Seller>[] = [
    {
      key: "details",
      title: "",
      render: (seller) => <SellerDetailsCard seller={seller} />,
      sortable: false,
      width: "60px",
    },
    {
      key: "id",
      title: t("sellerId"),
      render: (seller) => formatSellerId(seller._id),
      sortable: false,
    },
    {
      key: "full_name",
      title: t("fullName"),
      render: (seller) => seller.full_name || "-",
      sortable: true,
      sortKey: "full_name",
    },
    {
      key: "email",
      title: t("email"),
      render: (seller) => {
        const email =
          seller.emails && seller.emails.length > 0
            ? seller.emails[0].value
            : null;
        return email || "-";
      },
      sortable: true,
      sortKey: "emails.value",
    },
    {
      key: "phone",
      title: t("phoneNumber"),
      render: (seller) => {
        if (seller.phones && seller.phones.length > 0) {
          const phone = seller.phones[0];
          return `${phone.calling_code} ${phone.phone_number}`;
        }
        return "-";
      },
      sortable: true,
      sortKey: "phones.calling_code",
    },
  ];

  return (
    <DashboardLayout title={t("sellers")}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {t("sellers")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t("sellersDescription")}
          </p>
        </div>

        <DataTable
          columns={columns}
          data={data || null}
          loading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          sortKey={sortKey}
          sortDirection={sortDirection}
          searchValue={searchValue}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSortChange={handleSortChange}
          onSearchChange={handleSearchChange}
          onAddNew={handleAddSeller}
          addButtonLabel={t("addSeller")}
          getItemId={(seller) => seller._id}
        />
      </div>
    </DashboardLayout>
  );
}
