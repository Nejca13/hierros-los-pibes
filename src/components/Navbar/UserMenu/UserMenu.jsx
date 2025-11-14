"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./UserMenu.module.css";
import Menu from "@/assets/icons/Menu";
import Link from "next/link";
import useStore from "@/app/store";
import { logout } from "@/utils/logout";
import Calendar from "@/assets/icons/Calendar";
import CalendarCheck from "@/assets/icons/CalendarCheck";
import Logout from "@/assets/icons/Logout";
import { usePathname, useRouter } from "next/navigation";
import Home from "@/assets/icons/Home";
import ChangePasswordIcon from "@/assets/icons/ChangePasswordIcon";
import PanelAdmin from "@/assets/icons/PanelAdmin";

const UserMenu = ({ currentUser }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const { clearCurrentUser } = useStore();
  const router = useRouter();

  const toggleMenu = () => setShowMenu(!showMenu);

  const cerrarSesion = () => {
    logout();
    clearCurrentUser();
    router.push("/");
  };

  const pathname = usePathname();

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setShowMenu(false);
    }
  };

  useEffect(() => {
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className={styles.user} ref={menuRef}>
      <div className={styles.menu_button_user}>
        <button aria-label="menu" onClick={toggleMenu}>
          <Menu width="40px" height="40px" />
        </button>
      </div>
      <ul className={`${styles.user_list} ${showMenu ? styles.show : ""}`}>
        {pathname !== "/" && (
          <li>
            <Link href="/" onClick={toggleMenu} className={styles.login_button}>
              <Home />
              Inicio
            </Link>
          </li>
        )}

        {currentUser.user.role === "admin" && (
          <li>
            <Link
              href="/admin/dashboard"
              onClick={toggleMenu}
              className={styles.login_button}
            >
              <PanelAdmin /> Administración
            </Link>
          </li>
        )}

        <li>
          <Link
            href="/reservations"
            onClick={toggleMenu}
            className={styles.login_button}
          >
            <Calendar /> Hacer reservas
          </Link>
        </li>
        <li>
          <Link
            href="/my_reservations"
            onClick={toggleMenu}
            className={styles.login_button}
          >
            <CalendarCheck />
            Mis reservas
          </Link>
        </li>
        <li>
          <Link
            href="/change-password"
            onClick={toggleMenu}
            className={styles.login_button}
          >
            <ChangePasswordIcon /> Cambiar contraseña
          </Link>
        </li>
        <li>
          <button onClick={cerrarSesion}>
            <Logout />
            Cerrar sesión
          </button>
        </li>
      </ul>
    </div>
  );
};

export default UserMenu;
