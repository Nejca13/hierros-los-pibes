'use client'
import { useEffect, useState } from 'react'
import styles from './Reportes.module.css'
import { getReports } from '@/services/orders/orders'
import Table from '../Table/Table'
import ImageAndName from '../ImageAndName/ImageAndName'
import FormDate from './FormDate/FormDate'
import ShoppingCartIcon from '@/assets/icons/ShoppingCartIcon'
import DollarSignIcon from '@/assets/icons/DollarSignIcon'
import PackageIcon from '@/assets/icons/PackageIcon'
import XCircleIcon from '@/assets/icons/XCircleIcon'
import useStore from '@/app/store'

const Reportes = () => {
  const [reportData, setReportData] = useState(null)
  const [loading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { currentUser } = useStore()

  const obtenerReportes = async (from_date, to_date, attended_by_user_id) => {
    setIsLoading(true)
    try {
      const response = await getReports(from_date, to_date, attended_by_user_id)

      if (!response.success) {
        console.error('Error al obtener los reportes', response.error)
        setError(response.error?.detail || 'Error desconocido')
        return
      }

      setReportData(response.data)
      setError(null)
      console.log('Reportes obtenidos correctamente', response.data)
    } catch (error) {
      console.error('Error inesperado al obtener los reportes', error)
      setError('Ocurrió un error al obtener los reportes')
    } finally {
      setIsLoading(false)
    }
  }

  const products_sold = reportData?.products_sold?.map((product) => ({
    Nombre: <ImageAndName image={product?.image} name={product?.name} />,
    Precio: product?.price,
    'Cantidad vendida': product?.quantity_sold,
    Total: product?.total_sales,
  }))

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  useEffect(() => {
    const today = getTodayDate()
    obtenerReportes(today)
  }, [])

  const exampleReportData = {
    from_date: '2025-06-05T00:00:00',
    to_date: '2025-06-05T23:59:59.999999',
    total_orders: 2,
    total_revenue: 10000,
    cash_revenue: 3000,
    transfer_revenue: 7000,
    cash_expense: 0,
    transfer_expense: 5000,
    net_cash_revenue: 3000,
    net_transfer_revenue: 2000,
    pending_count: 0,
    failed_count: 0,
    products_sold: [
      {
        product_id: '683614aa665a523270718ef2',
        name: 'Cafe 1',
        image:
          'http://localhost:3000/api/media/products/Cafe/57e2f21a-e06e-42cd-b451-5143ebf70035.webp',
        price: 5000,
        quantity_sold: 2,
        total_sales: 10000,
      },
    ],
    total_expenses: 5000,
  }

  return (
    <section className={styles.container}>
      <div className={styles.title_button}>
        <h1 className={styles.title}>Reportes</h1>

        {currentUser?.user?.role === 'superadmin' && (
          <FormDate obtenerReportes={obtenerReportes} />
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.reports_products}>
          <div className={styles.card}>
            <div>
              <span>Total vendidos</span>
              <i>
                <ShoppingCartIcon color='rgb(59 130 246)' />
              </i>
            </div>
            <p>{reportData?.total_orders}</p>
          </div>

          <div className={styles.card}>
            <div>
              <span>Ingresos totales</span>
              <i>
                <DollarSignIcon color='rgb(34 197 94)' />
              </i>
            </div>
            <p>${reportData?.total_revenue}</p>
          </div>

          <div className={styles.card}>
            <div>
              <span>Ingresos totales efectivo</span>
              <i>
                <DollarSignIcon color='rgb(34 197 94)' />
              </i>
            </div>
            <p>${reportData?.cash_revenue}</p>
          </div>
          <div className={styles.card}>
            <div>
              <span>Ingresos totales transferencia</span>
              <i>
                <DollarSignIcon color='rgb(34 197 94)' />
              </i>
            </div>
            <p>${reportData?.transfer_revenue}</p>
          </div>

          <div className={styles.card}>
            <div>
              <span>Gastos totales</span>
              <i>
                <DollarSignIcon color='rgb(239 68 68)' />
              </i>
            </div>
            <p>${reportData?.total_expenses}</p>
          </div>

          <div className={styles.card}>
            <div>
              <span>Gastos totales efectivo</span>
              <i>
                <DollarSignIcon color='rgb(239 68 68)' />
              </i>
            </div>
            <p>${reportData?.cash_expense}</p>
          </div>
          <div className={styles.card}>
            <div>
              <span>Gastos totales transferencia</span>
              <i>
                <DollarSignIcon color='rgb(239 68 68)' />
              </i>
            </div>
            <p>${reportData?.transfer_expense}</p>
          </div>

          <div className={styles.card}>
            <div>
              <span>Neto efectivo</span>
              <i>
                <DollarSignIcon color='rgb(59 130 246)' />
              </i>
            </div>
            <p>${reportData?.net_cash_revenue}</p>
          </div>

          <div className={styles.card}>
            <div>
              <span>Neto transferencia</span>
              <i>
                <DollarSignIcon color='rgb(59 130 246)' />
              </i>
            </div>
            <p>${reportData?.net_transfer_revenue}</p>
          </div>

          <div className={styles.card}>
            <div>
              <span>Pedidos pendientes</span>
              <i>
                <PackageIcon color='rgb(245 158 11)' />
              </i>
            </div>
            <p>{reportData?.pending_count}</p>
          </div>

          <div className={styles.card}>
            <div>
              <span>Pedidos fallidos</span>
              <i>
                <XCircleIcon color='rgb(239 68 68)' />
              </i>
            </div>
            <p>{reportData?.failed_count}</p>
          </div>
        </div>
        <Table data={products_sold} loading={loading} />
      </div>
    </section>
  )
}

export default Reportes
