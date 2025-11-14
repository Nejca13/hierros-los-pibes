"use client";
import styles from "./Reservas.module.css";
import {
  getReservation,
  reservationByDate,
} from "@/services/reservas/reservas";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getCourts } from "@/services/courts/court";

const Reservas = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [court, setCourt] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState("");

  const obtenerTodasLasReservas = async (date) => {
    await reservationByDate(date)
      .then((res) => {
        if (res.success) {
          setReservations(res.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const obtenerCanchas = async () => {
    await getCourts()
      .then((res) => {
        if (res.success) {
          setCourt(res.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const filtrarReservas = () => {
    const filtradas = reservations.filter((res) => {
      const coincideCancha = selectedCourt
        ? res.court.name === selectedCourt
        : true;
      return coincideCancha;
    });
    setFilteredReservations(filtradas);
  };

  useEffect(() => {
    obtenerCanchas();
    obtenerTodasLasReservas(date);
  }, [date]);

  useEffect(() => {
    filtrarReservas();
  }, [reservations, selectedCourt]);

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <label htmlFor="date" id="date">
          <span>Seleccione fecha</span>
          <input
            type="date"
            name="date"
            id="date"
            placeholder="Fecha"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
            }}
          />
        </label>
        <label htmlFor="court" id="court">
          <span>Tipo de cancha</span>
          <select
            name="court"
            id="court"
            defaultValue=""
            required
            onChange={(e) => setSelectedCourt(e.target.value)}
          >
            <option value="">Todas las canchas</option>
            {court.map((cancha, index) => (
              <option key={index} value={cancha.name}>
                {cancha.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Fecha y horario</th>
            <th>Cancha</th>
            <th>Deporte</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {filteredReservations.length > 0 ? (
            filteredReservations.map((reservation, index) => (
              <tr key={index}>
                <td
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Image
                    src={reservation.user.img}
                    alt={reservation.user.name}
                    width={30}
                    height={30}
                    style={{ borderRadius: "50%" }}
                  />
                  {reservation.user.name} {reservation.user.last_name}
                </td>
                <td>{reservation.date}</td>
                <td
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Image
                    src={reservation.court.image}
                    alt={reservation.court.name}
                    width={30}
                    height={30}
                  />
                  {reservation.court.name}
                </td>
                <td>{reservation.court.sport_type}</td>
                <td>{reservation.status}</td>
              </tr>
            ))
          ) : (
            <tr className={styles.no_reservations}>
              <td colSpan="5">
                <p>Sin reservas disponibles</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Reservas;
