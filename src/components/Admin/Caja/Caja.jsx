'use client'
import { useEffect, useState } from 'react'
import styles from './Caja.module.css'
import ImageAndName from '../ImageAndName/ImageAndName'
import Table from '../Table/Table'
import DollarSignIcon from '@/assets/icons/DollarSignIcon'
import CashRegisterBold from '@/assets/icons/CashRegisterBold'
import Modal from '@/components/Modal/Modal'
import FormOpenCash from './FormOpenCash/FormOpenCash'
import Close from '@/assets/icons/Close'
import FormAddExpense from './FormAddExpense/FormAddExpense'
import Swal from 'sweetalert2'
import { useCashSessions } from '@/Hooks/useSessions'
import Pagination from '../Pagination/Pagination'
import Filters from './Filters/Filters'
import UserActive from './UserActive/UserActive'
import SelectedSession from './SelectedSession/SelectedSession'
import { formatDateAR } from '@/utils/formatedDate'
import { formatCurrencyARS } from '@/utils/formatCurrency'
import EditSessionForm from './EditSessionForm/EditSessionForm'
import EditSession from '@/assets/icons/EditSession'
import InfoCloseSession from './InfoCloseSession/InfoCloseSession'
import FormCloseCash from './InfoCloseSession/FormCloseCash/FormCloseCash'

const Caja = () => {
  const [isCashSessionActive, setIsCashSessionActive] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [showFormCloseCash, setShowFormCloseCash] = useState(false)

  //hook de sessiones
  const { data, loadingData, filters, updateFilter, resetFilters, refresh } =
    useCashSessions()

  const totalOrders = data?.total || 0
  const totalPages = Math.ceil(totalOrders / filters.limit)

  //Verificamos si la caja está activa
  const cashSessionActive = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/cash-sessions/active/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error al obtener sesión de caja activa')
      }

      const data = await response.json()
      setIsCashSessionActive(data)
    } catch (err) {
      setError(err.message || 'Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  //filtramos las claves para mostrarlas en la tabla
  const filterSessions = data?.sessions?.map((session) => ({
    Usuario: (
      <ImageAndName image={session?.user_img} name={session?.user_name} />
    ),
    'Fecha de apertura': formatDateAR(session?.opened_at),
    'Fecha de cierre': !session?.closed_at
      ? 'Caja abierta'
      : formatDateAR(session?.closed_at),
    'Monto de apertura': formatCurrencyARS(session?.opening_amount),
    'Monto de cierre': formatCurrencyARS(session?.closing_amount),
    _original: session,
    _summary_user: data?.sessions_summary.find(
      (summary) => summary._id === session._id
    ),
  }))

  //funcion para ver el detalle de la tabla
  const handleRowClick = (session, _summary_user) => {
    setModalType('session')
    setSelectedSession({ session, _summary_user })
    setIsModalOpen(true)
  }

  useEffect(() => {
    cashSessionActive()
  }, [])

  return (
    <section className={styles.container}>
      <div className={styles.title_button}>
        {!loading && isCashSessionActive.length > 0 ? (
          <UserActive infoSession={isCashSessionActive[0]} />
        ) : (
          <h1 className={styles.title}>Sesión de caja</h1>
        )}
        {!loading && isCashSessionActive.length === 0 && (
          <button
            className={styles.button_open_cash}
            onClick={() => {
              setIsModalOpen(true), setModalType('open')
            }}
          >
            <CashRegisterBold
              width='20px'
              height='20px'
              color='var(--marron)'
            />
            Abrir caja
          </button>
        )}
        {!loading && isCashSessionActive.length > 0 && (
          <div className={styles.buttons}>
            <button
              onClick={() => {
                setIsModalOpen(true), setModalType('edit_session')
              }}
            >
              <i>
                <EditSession width='16px' height='16px' color='#007bff' />
              </i>
              Editar sesión
            </button>
            <button
              className={styles.button_add_expense}
              onClick={() => {
                setIsModalOpen(true), setModalType('expense')
              }}
            >
              <i>
                <DollarSignIcon width='14px' height='14px' color='#28a745' />
              </i>
              Agregar gastos
            </button>
            <button
              className={styles.button_close_cash}
              onClick={() => {
                setIsModalOpen(true), setModalType('post_close_session')
              }}
            >
              <i>
                <Close width='14px' height='14px' color='#dc3545' />
              </i>
              Cerrar Caja
            </button>
          </div>
        )}
      </div>
      <div className={styles.content}>
        <Filters updateFilter={updateFilter} resetFilters={resetFilters} />
        <Table
          data={filterSessions}
          loading={loadingData}
          onRowClick={(item) =>
            handleRowClick(item._original, item._summary_user)
          }
        />
        <Pagination
          page={filters.page}
          totalPages={totalPages}
          limit={filters.limit}
          onPageChange={(newPage) => updateFilter('page', newPage)}
          onLimitChange={(newLimit) => {
            updateFilter('limit', newLimit)
            updateFilter('page', 1)
          }}
        />
      </div>
      <Modal
        isModalOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth={
          modalType === 'session' || modalType === 'post_close_session'
            ? '90%'
            : '550px'
        }
      >
        {/* Modal para abrir caja */}
        {modalType === 'open' && (
          <FormOpenCash
            cashSessionActive={cashSessionActive}
            onClose={() => setIsModalOpen(false)}
          />
        )}
        {/* Modal para agregar gastos */}
        {modalType === 'expense' && (
          <FormAddExpense
            onClose={() => setIsModalOpen(false)}
            isCashSessionActive={isCashSessionActive}
            cashSessionActive={cashSessionActive}
          />
        )}
        {/* Modal de detalles de tabla de sesiones cerradas */}
        {modalType === 'session' && (
          <SelectedSession
            session={selectedSession?.session}
            summary={selectedSession?._summary_user}
          />
        )}

        {/* Modal de detalles antes de cerrar caja */}
        {modalType === 'post_close_session' &&
          (showFormCloseCash ? (
            <FormCloseCash
              session_id={isCashSessionActive[0]?._id}
              cashSessionActive={cashSessionActive}
              refresh={refresh}
              onClose={() => setIsModalOpen(false)}
              setShowFormCloseCash={setShowFormCloseCash}
            />
          ) : (
            <InfoCloseSession
              session_id={isCashSessionActive[0]?._id}
              setShowFormCloseCash={setShowFormCloseCash}
            />
          ))}

        {/* Modal para editar sesión */}
        {modalType === 'edit_session' && (
          <EditSessionForm
            onClose={() => setIsModalOpen(false)}
            isCashSessionActive={isCashSessionActive}
            cashSessionActive={cashSessionActive}
          />
        )}
      </Modal>
    </section>
  )
}

export default Caja
