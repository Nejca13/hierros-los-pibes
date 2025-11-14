import { useEffect, useState } from 'react'
import FaCirclePlus from '@/assets/icons/FaCirclePlus'
import styles from './Users.module.css'
import { getUsers } from '@/services/user/user'
import Table from '../Table/Table'
import ImageAndName from '../ImageAndName/ImageAndName'
import Badge from '@/components/Badge/Badge'
import DeleteUser from './DeleteUser/DeleteUser'
import Modal from '@/components/Modal/Modal'
import CreateUserForm from './CreateUserForm/CreateUserForm'

const Users = () => {
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const obtenerUsuarios = async () => {
    setLoading(true)
    const result = await getUsers({ role: null })
    if (result.success) {
      setUsers(result.data)
      setError(null)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }
  const getActiveBadge = (active) =>
    active ? (
      <Badge bg='#81D8AE'>Activo</Badge>
    ) : (
      <Badge bg='#F3A6A6'>No Activo</Badge>
    )

  const getVerifiedBadge = (verified) =>
    verified ? (
      <Badge bg='#81D8AE'>Verificado</Badge>
    ) : (
      <Badge bg='#F6DD72'>No Verificado</Badge>
    )

  const filteredData = users
    ?.filter((user) => ['admin', 'empleado'].includes(user.role))
    .map((user) => ({
      'Nombre completo': (
        <ImageAndName
          image={user?.img}
          name={user?.name + ' ' + user?.last_name}
        />
      ),
      'Correo electrónico': user?.email,
      Teléfono: user?.phone_number,
      Rol: user?.role,
      Activo: getActiveBadge(user?.is_active),
      Verificado: getVerifiedBadge(user?.is_verified),
      Acciones: <DeleteUser _id={user?.id} refresh={obtenerUsuarios} />,
      _original: user,
    }))

  const handleRowClick = (user) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  useEffect(() => {
    obtenerUsuarios()
  }, [])

  return (
    <section className={styles.container}>
      <div className={styles.title_button}>
        <h1 className={styles.title}>Usuarios</h1>
        <button onClick={() => setIsModalOpen(!isModalOpen)}>
          <FaCirclePlus width='20px' height='20px' color='var(--marron)' />
          Crear Usuario
        </button>
      </div>
      <div className={styles.content}>
        <Table
          data={filteredData}
          loading={loading}
          onRowClick={(item) => handleRowClick(item._original)}
        />
      </div>
      <Modal isModalOpen={isModalOpen} onClose={closeModal} maxWidth='700px'>
        <CreateUserForm
          refresh={obtenerUsuarios}
          closeModal={closeModal}
          selectedUser={selectedUser}
        />
      </Modal>
    </section>
  )
}

export default Users
