"use client";
import Spinner from "@/components/Spinner/Spinner";
import styles from "./page.module.css";
import OpenEye from "@/assets/icons/OpenEye";
import CloseEye from "@/assets/icons/CloseEye";
import { useState } from "react";
import { changePassword } from "@/services/login/login";
import useStore from "../store";
import Swal from "sweetalert2";

const ChangePasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useStore();
  const [errorMessage, setErrorMessage] = useState("");

  const handleTogglePassword = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const formData = Object.fromEntries(new FormData(e.target));
    console.log(formData);
    if (formData["new-password"] !== formData["confirm-new-password"]) {
      setErrorMessage("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    await changePassword(currentUser.user.id, formData["new-password"])
      .then((response) => {
        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "Contraseña cambiada correctamente",
            text: "Tu contraseña se ha actualizado con éxito.",
          });
          e.target.reset();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.message.detail || "Ocurrió un error inesperado.",
          });
        }
      })
      .catch((error) => {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un problema al cambiar la contraseña. Inténtalo nuevamente.",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <form onSubmit={handleSubmit} className={styles.container_form}>
          <label htmlFor="old-password" id="old-password">
            Contraseña actual
            <div className={styles.input_container}>
              <input
                type={showPassword ? "text" : "password"}
                name="old-password"
                id="old-password"
                placeholder="Contraseña"
                required
                minLength={8}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={handleTogglePassword}
              >
                {showPassword ? (
                  <OpenEye width="20px" height="20px" />
                ) : (
                  <CloseEye width="20px" height="20px" />
                )}
              </button>
            </div>
          </label>
          <label htmlFor="new-password" id="new-password">
            Nueva contraseña
            <div className={styles.input_container}>
              <input
                type={showPassword ? "text" : "password"}
                name="new-password"
                id="new-password"
                placeholder="Confirmar contraseña"
                required
                minLength={8}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={handleTogglePassword}
              >
                {showPassword ? (
                  <OpenEye width="20px" height="20px" />
                ) : (
                  <CloseEye width="20px" height="20px" />
                )}
              </button>
            </div>
          </label>

          <label htmlFor="confirm-new-password" id="confirm-new-password">
            Repita contraseña
            <div className={styles.input_container}>
              <input
                type={showPassword ? "text" : "password"}
                name="confirm-new-password"
                id="confirm-new-password"
                placeholder="Nueva contraseña"
                required
                minLength={8}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={handleTogglePassword}
              >
                {showPassword ? (
                  <OpenEye width="20px" height="20px" />
                ) : (
                  <CloseEye width="20px" height="20px" />
                )}
              </button>
            </div>
          </label>
          <button type="submit" className={styles.button}>
            {isLoading ? <Spinner /> : "Cambiar contraseña"}
          </button>
          {errorMessage && (
            <small className={styles.error}>{errorMessage}</small>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
