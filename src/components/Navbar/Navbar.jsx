'use client'
import useStore from '@/app/store'
import CustomerScreen from '@/assets/icons/CustomerScreen'
import Hamburguer from '@/assets/icons/Hamburguer'
import Kitchen from '@/assets/icons/Kitchen'
import LuLogout from '@/assets/icons/LuLogout'
import LuMenuSquare from '@/assets/icons/LuMenuSquare'
import LuMessageSquare from '@/assets/icons/LuMessageSquare'
import LuOrden from '@/assets/icons/LuOrden'
import LuUser from '@/assets/icons/LuUser'
import PedidosRealizados from '@/assets/icons/PedidosRealizados'
import UserAdmin from '@/assets/icons/UserAdmin'
import logo_nav from '@/assets/images/logos/logo.png'
import { navBarAnimate, useToggleMenuAnimation } from '@/gsap/Gsap'
import { logout } from '@/utils/logout'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Spinner from '../Spinner/Spinner'
import styles from './Navbar.module.css'
import User from './User/User'

const Navbar = () => {
  const [isReady, setIsReady] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const { currentUser, currentOrden } = useStore()
  const logo_nav_ref = useRef(null)
  const button_menu = useRef(null)
  const button_contact = useRef(null)
  const button_login = useRef(null)
  const menuRef = useRef(null)

  //hook para abrir y cerrar menus
  useToggleMenuAnimation(menuRef.current, showMenu)

  // verificar ruta
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === '/admin/dashboard') return
    navBarAnimate({
      logo_nav_ref: logo_nav_ref.current,
      button_menu: button_menu.current,
      button_contact: button_contact.current,
      button_login: button_login.current,
    })

    setIsReady(true)
  }, [])

  if (
    pathname === '/admin/dashboard' ||
    pathname === '/kitchen' ||
    pathname === '/customer'
  ) {
    return null
  }

  return (
    <header className={styles.header} id='header'>
      <nav>
        <Link
          href={'/'}
          className={styles.logo_menu}
          ref={logo_nav_ref}
          aria-label='logo'
        >
          <Image
            className={styles.logo_nav}
            src={logo_nav}
            width={180}
            height={180}
            alt='hierros los pibes logo'
          />
        </Link>
        <div className={styles.items_container}>
          <ul className={styles.items}>
            <li ref={button_menu}>
              <Link href={pathname === '/' ? '#menu' : '/#menu'}>Menu</Link>
            </li>
            <li ref={button_contact}>
              <Link href={pathname === '/' ? '#contact' : '/#contact'}>
                Contacto
              </Link>
            </li>
          </ul>
          <div className={styles.menu}>
            <button
              aria-label='boton-menu'
              ref={button_login}
              onClick={() => setShowMenu(!showMenu)}
            >
              {!currentUser && !isReady ? (
                <Spinner />
              ) : currentUser ? (
                <User />
              ) : (
                <Hamburguer color='#000000' showMenu={showMenu} />
              )}
            </button>

            <div className={styles.list_menu} ref={menuRef}>
              {currentUser?.user ? (
                <ul>
                  <li onClick={() => setShowMenu(false)}>
                    <Link href={pathname === '/' ? '#menu' : '/#menu'}>
                      <LuMenuSquare width='18px' height='18px' />
                      Menu
                    </Link>
                  </li>
                  <li onClick={() => setShowMenu(false)}>
                    <Link href={pathname === '/' ? '#contact' : '/#contact'}>
                      <LuMessageSquare width='18px' height='18px' />
                      Contacto
                    </Link>
                  </li>
                  <li onClick={() => setShowMenu(false)}>
                    <Link href={'/user_profile'}>
                      <LuUser width='18px' height='18px' />
                      Perfil
                    </Link>
                  </li>
                  {(currentUser?.user?.role === 'admin' ||
                    currentUser?.user?.role === 'superadmin') && (
                    <li onClick={() => setShowMenu(false)}>
                      <Link href={'/kitchen'}>
                        <Kitchen
                          width='20px'
                          height='20px'
                          color='var(--marron)'
                        />
                        Cocina
                      </Link>
                    </li>
                  )}
                  {(currentUser?.user?.role === 'admin' ||
                    currentUser?.user?.role === 'superadmin') && (
                    <li onClick={() => setShowMenu(false)}>
                      <Link href={'/customer'}>
                        <CustomerScreen
                          width='20px'
                          height='20px'
                          color='var(--marron)'
                        />
                        Pantalla Cliente
                      </Link>
                    </li>
                  )}
                  {(currentUser?.user?.role === 'admin' ||
                    currentUser?.user?.role === 'superadmin') && (
                    <li onClick={() => setShowMenu(false)}>
                      <Link href={'/admin/dashboard'}>
                        <UserAdmin width='20px' height='20px' />
                        Administrador
                      </Link>
                    </li>
                  )}
                  <li onClick={() => setShowMenu(false)}>
                    <Link href={'/orden'}>
                      <LuOrden width='18px' height='18px' />
                      Mis ordenes
                      {currentOrden.quantityTotal > 0 && (
                        <div className={styles.count_link}>
                          <span>{currentOrden.quantityTotal}</span>
                        </div>
                      )}
                    </Link>
                  </li>
                  <li onClick={() => setShowMenu(false)}>
                    <Link href={`/pedidos`}>
                      <PedidosRealizados width='30px' height='30px' />
                      Pedidos realizados
                    </Link>
                  </li>
                  <li onClick={() => setShowMenu(false)}>
                    <button onClick={() => logout()}>
                      <LuLogout width='18px' height='18px' />
                      Cerrar sesión
                    </button>
                  </li>
                </ul>
              ) : (
                <ul>
                  <li onClick={() => setShowMenu(false)}>
                    <Link href={pathname === '/' ? '#menu' : '/#menu'}>
                      <LuMenuSquare width='18px' height='18px' />
                      Menu
                    </Link>
                  </li>
                  <li onClick={() => setShowMenu(false)}>
                    <Link href={pathname === '/' ? '#contact' : '/#contact'}>
                      <LuMessageSquare width='18px' height='18px' />
                      Contacto
                    </Link>
                  </li>
                  {(currentUser?.user?.role === 'admin' ||
                    currentUser?.user?.role === 'superadmin') && (
                    <li onClick={() => setShowMenu(false)}>
                      <Link href={'/admin/dashboard'}>
                        <UserAdmin width='20px' height='20px' />
                        Administrador
                      </Link>
                    </li>
                  )}
                  <li onClick={() => setShowMenu(false)}>
                    <Link href={'/orden'}>
                      <LuOrden width='18px' height='18px' />
                      Mis ordenes
                      {currentOrden.quantityTotal > 0 && (
                        <div className={styles.count_link}>
                          <span>{currentOrden.quantityTotal}</span>
                        </div>
                      )}
                    </Link>
                  </li>
                  <li onClick={() => setShowMenu(false)}>
                    <Link href={'/pedidos'}>
                      <PedidosRealizados width='30px' height='30px' />
                      Pedidos realizados
                    </Link>
                  </li>
                  <li onClick={() => setShowMenu(false)}>
                    <Link href={'/login'}>
                      <LuUser width='18px' height='18px' />
                      Acceder
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
