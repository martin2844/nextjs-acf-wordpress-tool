import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { readString, jsonToCSV } from "react-papaparse";
import { Loading, Button, Text } from "@nextui-org/react";

import styles from "../styles/csv.module.css";
import dayjs from "dayjs";

const Csv = ({ data, token, label }) => {
  const router = useRouter();
  const [csvData, setCsvData] = useState();
  const [update, setUpdated] = useState(false);
  const [csvString, setCsvString] = useState("");
  const [saving, setSaving] = useState(false);
  const [newId, setNewId] = useState(0);
  const [success, setSuccess] = useState();

  useEffect(() => {
    readString(data, {
      worker: true,
      complete: (results) => {
        setCsvData(results.data);
        setCsvString(jsonToCSV(JSON.stringify(results.data)));
      },
    });
  }, []);

  let csvTable;
  //Create a MATRIX in order to modify the values
  //First array determines the amount of rows
  //Second Array, any determines the amount of cols.
  if (csvData) {
    csvTable = csvData.map((csArray, i) => {
      const y = i;
      return (
        <div key={JSON.stringify(y)}>
          {csArray.map((data, i) => {
            const x = i;
            return (
              <input
                name={JSON.stringify({ x: x, y: y })}
                className={styles.input}
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
    const newData = csvData;
    newData[y][x] = e.target.value;
    setCsvData(newData);
    setUpdated(Date.now());
    //Basically after doing this I need to convert it back to JSON format to be able to send it as CSV
    setCsvString(jsonToCSV(JSON.stringify(csvData)));
  };

  const exportCsv = () => {
    setSaving(true);
    const date = dayjs(Date.now()).format("DD-MM-YY--HHmm");
    const formData = new FormData();
    const myCsvData = new Blob([csvString], { type: "text/csv" });
    formData.append("file", myCsvData, `${label}-${date}.csv`);
    let config = {
      headers: {
        Authorization: "Bearer " + token,
      },
    };
    axios
      .post(`https://azimuthim.com/wp-json/wp/v2/media`, formData, config)
      .then((x) => {
        //Success Uploading
        console.log(x.data.id);
        setSaving(false);
        axios
          .post(
            "https://azimuthim.com/wp-json/acf/v3/pages/415",
            {
              fields: {
                [label]: {
                  ID: x.data.id,
                },
              },
            },
            config
          )
          .then((x) => {
            //Success reposting new data
            console.log(x);
            setSuccess(true);
            setSaving(false);
          })
          .catch((x) => console.log(x));
      })
      .catch((x) => console.log(x));
  };

  return (
    <div className={styles.main}>
      <Text h2>Archivo: {label}</Text>
      <br />
      {!csvData ? <Loading>Cargando</Loading> : csvTable}
      <br />
      <br />
      <div className={styles.btnContainer}>
        <Button onClick={() => router.push("/")} shadow color="primary" auto>
          Volver
        </Button>
        <Button
          loading={saving}
          onClick={() => exportCsv()}
          shadow
          color="secondary"
          auto
        >
          Guardar
        </Button>
      </div>
    </div>
  );
};

export default Csv;

export async function getServerSideProps(context) {
  // Id need to get the URL from context.
  //And replace the String below with that.
  const csvString = await axios.get(context.query.file);
  const token = await axios.post(
    "https://azimuthim.com/wp-json/jwt-auth/v1/token",
    {
      username: process.env.USER,
      password: process.env.PASS,
    }
  );
  return {
    props: {
      data: csvString.data,
      token: token.data.data.token,
      label: context.query.label,
    },
  };
}
