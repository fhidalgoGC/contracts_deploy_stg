import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import {  usePageTracking, useNavigationHandler } from '@/hooks/usePageState';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/ui/data-table';
import { useBuyers } from '@/features/buyers/hooks/useBuyers';
import { Buyer } from '@/features/buyers/types';
import BuyerDetailsCard from '@/components/buyers/BuyerDetailsCard';
import { formatBuyerId } from '@/lib/formatters';

export default function Buyers() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { handleNavigateToPage } = useNavigationHandler();
  
  usePageTracking('/buyers');
  
  // Notificar navegación jerárquica al cargar la página
  useEffect(() => {
    console.log('🔄 BUYERS PAGE: Cargando página y ejecutando navegación jerárquica');
    handleNavigateToPage('buyers');
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
  } = useBuyers();

  console.log('Buyers component render:', { data, isLoading, currentPage });

  const handleAddBuyer = () => {
    setLocation('/buyers/create');
  };

  const columns: Column<Buyer>[] = [
    {
      key: 'details',
      title: '',
      render: (buyer) => <BuyerDetailsCard buyer={buyer} />,
      sortable: false,
      width: '60px',
    },
    {
      key: 'id',
      title: t('buyerId'),
      render: (buyer) => formatBuyerId(buyer._id),
      sortable: false,
    },
    {
      key: 'full_name',
      title: t('fullName'),
      render: (buyer) => buyer.full_name || '-',
      sortable: true,
      sortKey: 'full_name',
    },
    {
      key: 'email',
      title: t('email'),
      render: (buyer) => {
        const email = buyer.emails && buyer.emails.length > 0 ? buyer.emails[0].value : null;
        return email || '-';
      },
      sortable: true,
      sortKey: 'emails.value',
    },
    {
      key: 'phone',
      title: t('phoneNumber'),
      render: (buyer) => {
        if (buyer.phones && buyer.phones.length > 0) {
          const phone = buyer.phones[0];
          return `${phone.calling_code} ${phone.phone_number}`;
        }
        return '-';
      },
      sortable: true,
      sortKey: 'phones.calling_code',
    },
  ];

  return (
    <DashboardLayout title={t('buyers')}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {t('buyers')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('buyersDescription')}
          </p>
        </div>

        <DataTable
          columns={columns}
          data={data}
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
          onAddNew={handleAddBuyer}
          getItemId={(buyer) => buyer._id}
        />
      </div>
    </DashboardLayout>
  );
}