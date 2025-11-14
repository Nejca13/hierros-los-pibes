'use client'
import { useState } from 'react'
import useStore from '@/app/store'
import styles from './SideBar.module.css'
import Image from 'next/image'
import { logout } from '@/utils/logout'
import LuCoffe from '@/assets/icons/LuCoffe'
import LuOrden from '@/assets/icons/LuOrden'
import LuMenuSquare from '@/assets/icons/LuMenuSquare'
import LuLogout from '@/assets/icons/LuLogout'
import ArrowDropright from '@/assets/icons/ArrowDropright'
import Swal from 'sweetalert2'
import Graph from '@/assets/icons/Graph'
import FaUser from '@/assets/icons/FaUser'
import Home from '@/assets/icons/Home'
import { useRouter } from 'next/navigation'
import CashRegister from '@/assets/icons/CashRegister'
import Waste from '@/assets/icons/Waste'
import OrderInternal from '@/assets/icons/OrderInternal'
import Court from '@/assets/icons/Court'

const SideBar = () => {
  const router = useRouter()
  const { currentUser, typeDashboard, setTypeDashboard } = useStore()
  const [isCollapsed, setIsCollapsed] = useState(true)

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev)
  }

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Seguro que querés cerrar sesión?',
      text: 'Vas a salir del panel de administración.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8B5E3C',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
    })

    if (result.isConfirmed) {
      logout()
    }
  }

  const options = [
    {
      label: 'Usuarios',
      value: 'users',
      icon: <FaUser color='var(--marron)' width='18px' height='18px' />,
    },
    {
      label: 'Productos',
      value: 'productos',
      icon: <LuCoffe color='var(--marron)' width='20px' height='20px' />,
    },
    {
      label: 'Desperdicios (Productos)',
      value: 'desperdicios',
      icon: <Waste color='var(--marron)' width='20px' height='20px' />,
    },
    {
      label: 'Categorias',
      value: 'categorias',
      icon: <LuMenuSquare color='var(--marron)' width='18px' height='18px' />,
    },
    {
      label: 'Ordenes',
      value: 'ordenes',
      icon: <LuOrden color='var(--marron)' width='18px' height='18px' />,
    },
    {
      label: 'Ordenes internas',
      value: 'ordenes_internas',
      icon: <OrderInternal color='var(--marron)' width='18px' height='18px' />,
    },
    {
      label: 'Reportes',
      value: 'reportes',
      icon: <Graph color='var(--marron)' width='18px' height='18px' />,
    },
    {
      label: 'Caja',
      value: 'caja',
      icon: <CashRegister color='var(--marron)' width='20px' height='20px' />,
    },
    {
      label: 'Alquileres',
      value: 'alquileres',
      icon: <Court color='var(--marron)' width='20px' height='20px' />,
    },
    {
      label: 'Volver al inicio',
      value: 'inicio',
      icon: <Home color='var(--marron)' width='20px' height='20px' />,
    },
    {
      label: 'Cerrar sesión',
      value: 'logout',
      icon: <LuLogout color='var(--marron)' width='18px' height='18px' />,
    },
  ]

  const filterOptions = options.filter(
    (item) =>
      !(item.value === 'users' && currentUser?.user?.role !== 'superadmin')
  )

  return (
    <aside
      className={`${styles.sideBar} ${isCollapsed ? styles.collapsed : ''}`}
    >
      <nav>
        <div className={styles.userInfo}>
          {currentUser?.user?.img && (
            <button onClick={toggleSidebar} className={styles.buttonImg}>
              <Image
                src={currentUser?.user?.img}
                width={45}
                height={45}
                alt='user'
              />
            </button>
          )}
          {!isCollapsed && (
            <div className={styles.dataUser}>
              <p>
                {currentUser?.user?.name} {currentUser?.user?.last_name}
              </p>
              <span>{currentUser?.user?.role}</span>
            </div>
          )}
          <button className={styles.btnArrow} onClick={toggleSidebar}>
            <ArrowDropright width='18' height='18' color='grey' />
          </button>
        </div>
        <div className={styles.menu_container}>
          <span className={styles.title_ul}>MENU</span>
          <ul className={styles.menu}>
            {filterOptions.map((item, index) => (
              <li
                key={index}
                onClick={() => {
                  if (item.value === 'logout') {
                    handleLogout()
                    return
                  }
                  if (item.value === 'inicio') {
                    router.push('/')
                    return
                  }

                  setTypeDashboard(item.value)
                }}
                className={typeDashboard === item.value ? styles.active : ''}
              >
                {item.icon}
                {!isCollapsed && item.label}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  )
}

export default SideBar
