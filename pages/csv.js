import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { readString, jsonToCSV } from "react-papaparse";
import { Loading, Button, Text } from "@nextui-org/react";

import styles from "../styles/csv.module.css";
import dayjs from "dayjs";

const Csv = ({ data, token, label, updateUrl }) => {
  const router = useRouter();
  const [csvData, setCsvData] = useState();
  const [originalCsvData, setOriginalCsvData] = useState();
  const [update, setUpdated] = useState(false);
  const [csvString, setCsvString] = useState("");
  const [saving, setSaving] = useState(false);
  const [newId, setNewId] = useState(0);
  const [success, setSuccess] = useState();
  const [addEnabled, setAddEnabled] = useState(false);
  const [removeEnabled, setRemoveEnabled] = useState(false);

  useEffect(() => {
    readString(data, {
      worker: true,
      complete: (results) => {
        setCsvData(results.data);
        setOriginalCsvData(results.data);
        setCsvString(jsonToCSV(JSON.stringify(results.data)));
      },
    });

    const pagesThatNeedAddRow = [
      "archivos_hypothetical-10k-growth",
      "archivos_nav-price-evolution",
      "archivos_portfolio-credit-quality",
      "archivos_portfolio-country",
      "archivos_portfolio-industry",
    ];
    const pagesThatNeedDeleteBtn = ["archivos_portfolio-credit-quality"];
    if (pagesThatNeedAddRow.includes(label)) {
      setAddEnabled(true);
    }
    if (pagesThatNeedDeleteBtn.includes(label)) {
      setRemoveEnabled(true);
    }
  }, []);

  // console.log("CSVDATA:", csvData);
  // console.log("CSVSTRING:", csvString);

  const removeRow = (rowNum) => {
    const arrData = csvData.filter((row, i) => {
      if (i !== rowNum) {
        return row;
      }
    });
    setCsvData(arrData);
  };

  const removeBtn = (x) => (
    <div
      className={styles.removeContainer}
      onClick={() => {
        removeRow(x);
      }}
    >
      X
    </div>
  );

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
          {i !== 0 && setRemoveEnabled && removeBtn(i)}
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
    console.log("%cABOUT TO:", "font-size: 20px; color: blue;");
    console.log("%c1) Upload csv file", "color: brown;");
    console.log("%c2) Relate file to WP page", "color: brown;");
    axios
      .post(`https://azimuthim.com/wp-json/wp/v2/media`, formData, config)
      .then((x) => {
        //Success Uploading
        console.log(
          "%cDEBUG:" + "%c Success at 1) uploading FILE to WPR",
          "background: black; color: limegreen",
          "background: white; color: blue"
        );
        console.log(
          "New File Id: " + x.data.id,
          "background: black; color: limegreen"
        );
        setSaving(false);
        axios
          .post(
            updateUrl,
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
            console.log(
              "%c DEBUG:" + "%c Success at 2) relating file to webpage",
              "background: black; color: limegreen",
              "background: white; color: blue"
            );
            console.log(x);
            setSuccess(true);
            setSaving(false);
          })
          .catch((x) => {
            console.error("ERROR AT RELATING DATA");
            console.log(x);
          });
      })
      .catch((x) => {
        console.error("ERROR AT POSTING DATA");
        console.log(x);
      });
  };

  const addNewRow = () => {
    let newRow = csvData[0];
    newRow = newRow.map((v) => "");
    setCsvData([...csvData, newRow]);
  };

  const addRow = (
    <div className={styles.addRow}>
      Agregar fila{" "}
      <span style={{ width: "50px" }}>
        <Button color="success" shadow auto onClick={addNewRow}>
          +
        </Button>
      </span>
    </div>
  );

  if (data === "nopassword") {
    return (
      <div
        style={{
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Text h1 size={60} color="error" weight="bold">
          contraseña incorrecta
        </Text>
        <Button onClick={() => router.push("/")} shadow color="primary" auto>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.main}>
      <Text h2>Archivo: {label}</Text>
      <br />
      {!csvData ? (
        <Loading>Cargando</Loading>
      ) : (
        <div className={styles.tableContainer}>{csvTable}</div>
      )}
      <br />
      {addEnabled && addRow}

      <div className={styles.btnContainer}>
        <div className={styles.dataBtn}>
          <Button
            shadow
            color="warning"
            onClick={() => {
              setCsvData(originalCsvData);
            }}
          >
            Restablecer Data
          </Button>
        </div>
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
  console.log(process.env.localPass);
  console.log(context.query.pass);
  if (context.query.pass !== process.env.localPass) {
    return {
      props: {
        data: "nopassword",
      },
    };
  }
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
      updateUrl: context.query.updateUrl,
    },
  };
}
