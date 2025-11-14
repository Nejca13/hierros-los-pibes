import styles from "./../Reservations.module.css";
import { useEffect, useState } from "react";
import Spinner from "@/components/Spinner/Spinner";
import { getCourts } from "@/services/courts/court";
import {
  createReservation,
  getReservationsByCourtAndDate,
} from "@/services/reservas/reservas";
import useStore from "@/app/store";
import { time } from "../time";
const StepOne = ({ setStep, isLoading, setIsLoading }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [court, setCourt] = useState([]);
  const [curtAndDate, setCurtAndDate] = useState({});
  const [avialableTime, setAvailableTime] = useState(time);
  const { currentUser, setCurrentReservation } = useStore();

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

  const deleteTimeIsNotAvailable = async (time) => {
    if (curtAndDate.date && curtAndDate.court_id) {
      await getReservationsByCourtAndDate(
        curtAndDate.court_id,
        curtAndDate.date
      ).then((res) => {
        if (res.success) {
          const unavailableTimes = res.data
            .filter((item) => item.status === "confirmed")
            .map((item) => {
              const hours = new Date(item.date)
                .getHours()
                .toString()
                .padStart(2, "0");
              const minutes = new Date(item.date)
                .getMinutes()
                .toString()
                .padStart(2, "0");
              return `${hours}:${minutes}`;
            });

          const normalizedTime = time.map((item) => item.padStart(5, "0"));

          setAvailableTime(
            normalizedTime.filter((item) => !unavailableTimes.includes(item))
          );
        }
      });
    }
  };

  
  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    
    const formData = Object.fromEntries(new FormData(e.target));
    formData.user_id = currentUser.user.id;
    formData.duration = 60;
    formData.date = formData.date + " " + formData.horario;
   
    
    delete formData.horario;
    console.log(formData);
    await createReservation(formData)
    .then((response) => {
      if (!response.success) {
        setErrorMessage(response.message.detail);
        console.log(response.message.detail);
      } else {
        console.log(response.data);
        setCurrentReservation(response.data);
        setStep(2);
      }
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      setIsLoading(false);
    });
  };
  
  useEffect(() => {
    obtenerCanchas();
    deleteTimeIsNotAvailable(time);
  }, [curtAndDate]);


  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="court_id" id="court_id">
        Tipo de cancha
        <select
          name="court_id"
          id="court_id"
          defaultValue=""
          required
          onChange={(e) =>
            setCurtAndDate({ ...curtAndDate, court_id: e.target.value })
          }
        >
          <option value="" disabled>
            Seleccione tipo de cancha
          </option>
          {court.map((cancha, index) => (
            <option key={index} value={cancha._id}>
              {cancha.name}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor="date" id="date">
        Seleccione fecha
        <input
          type="date"
          name="date"
          id="date"
          required
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) =>
            setCurtAndDate({
              ...curtAndDate,
              date: new Date(e.target.value).toISOString(),
            })
          }
        />
      </label>
      {curtAndDate.date && curtAndDate.court_id && (
        <label htmlFor="horario" id="horario">
          Seleccione un horario
          <select name="horario" id="horario" defaultValue="" required>
            <option value="" disabled>
              seleccione un horario
            </option>
            {avialableTime.map((hora, index) => (
              <option key={index} value={hora}>
                {hora}
              </option>
            ))}
          </select>
        </label>
      )}
      <button type="submit" className={styles.button}>
        {isLoading ? <Spinner /> : "Reservar"}
      </button>
      {errorMessage && <small className={styles.error}>{errorMessage}</small>}
    </form>
  );
};

export default StepOne;
