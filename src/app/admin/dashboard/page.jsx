'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SideBar from '@/components/Admin/SideBar/SideBar'
import styles from './page.module.css'
import ContentDashboard from '@/components/Admin/ContentDashboard/ContentDashboard'
import Productos from '@/components/Admin/Productos/Productos'
import useStore from '@/app/store'
import Categorias from '@/components/Admin/Categorias/Categorias'
import Ordenes from '@/components/Admin/Ordenes/Ordenes'
import Reportes from '@/components/Admin/Reportes/Reportes'
import Users from '@/components/Admin/Users/Users'
import Caja from '@/components/Admin/Caja/Caja'
import Desperdicios from '@/components/Admin/Desperdicios/Desperdicios'
import OrdenesInternas from '@/components/Admin/OrdenesInternas/OrdenesInternas'
import Alquileres from '@/components/Admin/Alquileres/Alquileres'

const AdminDashboardPage = () => {
  const { typeDashboard, hasHydrated, currentUser } = useStore()
  const router = useRouter()

  useEffect(() => {
    if (
      hasHydrated &&
      currentUser?.user &&
      !['admin', 'superadmin'].includes(currentUser?.user?.role)
    ) {
      router.push('/')
    }
  }, [hasHydrated, currentUser, router])

  if (!hasHydrated) {
    return null
  }

  // Evita renderizar el contenido si no es admin (mientras redirige)
  if (
    !currentUser?.user ||
    !['admin', 'superadmin'].includes(currentUser?.user?.role)
  ) {
    return null
  }

  const componentsMap = {
    users: Users,
    productos: Productos,
    desperdicios: Desperdicios,
    categorias: Categorias,
    ordenes: Ordenes,
    ordenes_internas: OrdenesInternas,
    reportes: Reportes,
    caja: Caja,
    alquileres: Alquileres,
  }

  const Component = componentsMap[typeDashboard] || null

  return (
    <div className={styles.container}>
      <SideBar />
      <ContentDashboard>
        {Component && <Component type={typeDashboard} />}
      </ContentDashboard>
    </div>
  )
}

export default AdminDashboardPage
