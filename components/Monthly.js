import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import styles from "../styles/month.module.css";
import axios from "axios";
import { useRouter } from "next/router";
import { Loading, Button } from "@nextui-org/react";

const Monthly = ({ token, file }) => {
  const [lastMonths, setLastMonths] = useState([]);
  const [stringifiedMonths, setStringifiedMonths] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const today = dayjs(new Date());
  const router = useRouter();
  useEffect(() => {
    //On first load first search for all files and check if there is a monthly file available.
    if (file) {
      console.log(
        "%c@@@@@@@@ FILE LOADED OK @@@@@@@@@",
        "background: black; color: limegreen"
      );
      setLastMonths(file);
    } else {
      console.log("@@@@@@@@ No file loaded @@@@@@@@@");
      console.log("TOKEN: ", token);
      const last12Months = [];
      for (let i = 0; i < 12; i++) {
        let dateToPush = dayjs(today).subtract(i, "month");
        dateToPush = dateToPush.format("MMM-YY");
        last12Months.push([dateToPush, 0]);
      }
      setLastMonths(last12Months);
    }
  }, []);

  const addMonth = () => {
    const newMonths = [...lastMonths];
    newMonths.pop();
    const latestMonthInArr = dayjs("01" + newMonths[0][0]);
    newMonths.unshift([latestMonthInArr.add(1, "month").format("MMM-YY"), "0"]);
    setLastMonths(newMonths);
  };

  console.log(lastMonths);

  let csvTable;
  //Create a MATRIX in order to modify the values
  //First array determines the amount of rows
  //Second Array, any determines the amount of cols.
  if (lastMonths) {
    csvTable = lastMonths.map((csArray, i) => {
      const y = i;
      return (
        <div className={styles.inputContainer} key={JSON.stringify(y)}>
          {csArray.map((data, i) => {
            const x = i;
            return (
              <input
                name={JSON.stringify({ x: x, y: y })}
                className={styles.inputs}
                key={JSON.stringify({ x: x, y: y })}
                value={data}
                onChange={(e) => updateCsvData(e)}
              />
            );
          })}
        </div>
      );
    });
  }

  const updateCsvData = (e) => {
    const coordinates = JSON.parse(e.target.name);
    const { x, y } = coordinates;
    const newData = lastMonths;
    newData[y][x] = e.target.value;
    setLastMonths(newData);
    setStringifiedMonths(JSON.stringify(newData));
  };

  const exportCsv = () => {
    setSaving(true);
    const date = dayjs(Date.now()).format("DD-MM-YY--HHmm");
    const formData = new FormData();
    const myCsvData = new Blob([stringifiedMonths], { type: "text/csv" });
    formData.append("file", myCsvData, `MONTHLY-${date}.csv`);
    let config = {
      headers: {
        Authorization: "Bearer " + token,
      },
    };
    axios
      .post(`https://azimuthim.com/wp-json/wp/v2/media`, formData, config)
      .then((x) => {
        //Success Uploading
        console.log("New File Id:", x.data.id);
        setSaving(false);
        setSaved(true);
        setTimeout(() => {
          setSaved(false);
        }, 6000);
      })
      .catch((x) => console.log(x));
  };

  return (
    <div className={styles.parent}>
      <div className={styles.clarify}>
        Cargar porcentaje en decimos es decir, 2.5% seria 250, -0.47% seria -047
      </div>
      <div className={styles.table}>
        {!lastMonths ? (
          <Loading>Cargando</Loading>
        ) : (
          <div className={styles.tableContainer}>{csvTable}</div>
        )}

        <Button
          onClick={() => {
            addMonth();
          }}
          shadow
          color="success"
          auto
        >
          Agregar Mes
        </Button>

        <section
          style={{
            minWidth: "200px",
            display: "flex",
            justifyContent: "space-around",
            marginTop: "40px",
          }}
        >
          <Button onClick={() => router.push("/")} shadow color="primary" auto>
            Volver
          </Button>
          <Button
            loading={saving}
            onClick={() => {
              exportCsv();
            }}
            shadow
            color="secondary"
            auto
          >
            Guardar
          </Button>
        </section>
        {saved && (
          <strong style={{ color: "green", marginTop: "20px" }}>
            Archivo Guardado
          </strong>
        )}
      </div>
    </div>
  );
};

export default Monthly;
