import React, { useState, useEffect } from "react";
import { Button, Text } from "@nextui-org/react";
import axios from "axios";
import styles from "../styles/Home.module.css";
import { Link } from "@nextui-org/react";
import { Spacer, Switch, Modal, Input } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useSavePassToLocalStorage } from "../hook/savePass";

const Index = (props) => {
  const router = useRouter();
  const [newPass, setNewPass] = useState("");
  const [loading, setLoading] = useState(true);
  const [pass, setPass] = useSavePassToLocalStorage();
  const [listJsx, setListJsx] = useState("");
  const [chartJsx, setChartJsx] = useState("");
  const [visible, setVisible] = useState(false);
  const [pageSelected, setPageSelected] = useState("home");
  const [production, isProduction] = useState(false);
  const [updateUrl, setUpdateUrl] = useState(
    "https://azimuthim.com/wp-json/acf/v3/pages/486"
  );
  const [viewUrl, setViewUrl] = useState("https://azimuthim.com/home-copy/");
  const [listData, setListData] = useState(Object.keys(props));
  const [rawData, setRawData] = useState(props);

  useEffect(() => {
    if (production) {
      switch (pageSelected) {
        case "home":
          setUpdateUrl("https://azimuthim.com/wp-json/acf/v3/pages/7");
          setViewUrl("https://azimuthim.com/");
          break;
        case "homeA":
          setUpdateUrl("https://azimuthim.com/wp-json/acf/v3/pages/97");
          setViewUrl("https://azimuthim.com/a/");
          break;
        case "homeSP":
          setUpdateUrl("https://azimuthim.com/wp-json/acf/v3/pages/477");
          setViewUrl("https://azimuthim.com/es/");
          break;
        case "homeASP":
          setUpdateUrl("https://azimuthim.com/wp-json/acf/v3/pages/127");
          setViewUrl("https://azimuthim.com/es/a-2/");
          break;
        default:
          break;
      }
    } else {
      switch (pageSelected) {
        case "home":
          setUpdateUrl("https://azimuthim.com/wp-json/acf/v3/pages/486");
          setViewUrl("https://azimuthim.com/home-copy/");
          break;
        case "homeA":
          setUpdateUrl("https://azimuthim.com/wp-json/acf/v3/pages/483");
          setViewUrl("https://azimuthim.com/a-copia-eng/");
          break;
        case "homeSP":
          setUpdateUrl("https://azimuthim.com/wp-json/acf/v3/pages/123");
          setViewUrl("https://azimuthim.com/es/pagina-principal/");
          break;
        case "homeASP":
          setUpdateUrl("https://azimuthim.com/wp-json/acf/v3/pages/478");
          setViewUrl("https://azimuthim.com/a-copia-esp/");
          break;
        default:
          break;
      }
    }
  }, [production, pageSelected]);

  console.log(pageSelected, viewUrl);

  useEffect(() => {
    console.log("FETCHING DATA");
    setLoading(true);
    axios.post("/api/getData", { url: updateUrl }).then((data) => {
      const keys = Object.keys(data.data.acf);
      //Filter keys to only keys that have a csv file
      const filteredKeys = keys.filter((key) => {
        return data.data.acf[key].subtype === "csv";
      });
      //Build new object
      const fileBlocks = {};
      filteredKeys.forEach((key) => {
        fileBlocks[key] = data.data.acf[key];
      });
      setRawData(fileBlocks);
      setListData(Object.keys(fileBlocks));
      setTimeout(() => {
        setLoading(false);
      }, 200);
    });
  }, [updateUrl, pageSelected]);

  const changePage = (e) => {
    setPageSelected(e.target.value);
  };

  const closeHandler = () => {
    setPass(newPass);
    setVisible(false);
  };

  // console.log("PASS", pass);
  // console.log(rawData)

  useEffect(() => {
    if (loading) {
      setListJsx(
        <Text h1 size={60} color="success" weight="bold">
          Cargando...
        </Text>
      );
      setChartJsx(
        <Text h1 size={60} color="success" weight="bold">
          Cargando...
        </Text>
      );
    } else {
      setListJsx(
        listData?.map((link, i) => {
          // console.log(link);
          // console.log(listData);
          // console.log(rawData[link]?.url)
          return (
            <div key={i}>
              <div>
                Editar:
                <Link
                  block
                  href={`/csv?pass=${pass}&file=${rawData[link]?.url}&label=${link}&updateUrl=${updateUrl}`}
                >
                  {link} -{" "}
                  <span style={{ color: "red" }}>
                    [
                    {rawData[link]?.url.substr(
                      rawData[link]?.url.lastIndexOf("/") + 1,
                      rawData[link]?.url.length
                    )}
                    ]
                  </span>
                </Link>
              </div>
              <Spacer />
            </div>
          );
        })
      );

      setChartJsx(
        <>
          Editar:
          <Link block href={`/charts?pass=${pass}&chart=monthly`}>
            Monthly
          </Link>
        </>
      );
    }
  }, [pass, rawData, loading]);

  return (
    <div className={styles.main}>
      <header className={styles.header}>
        <Text h1>Azi Tool</Text>
        <div className={styles.subHeader}>
          <Text p>Una herramienta para editar los csvs del sitio</Text>
          <Text
            style={{ cursor: "pointer" }}
            onClick={() => setVisible(true)}
            color={pass ? "primary" : "warning"}
          >
            {pass ? "Cambiar contraseña" : "Setear contraseña"}
          </Text>
        </div>
        <hr />
        <div className={styles.switchContainer}>
          <select onChange={(e) => changePage(e)} value={pageSelected}>
            <option value="home">Home B - English</option>
            <option value="homeSP">Home B - Spanish</option>
            <option value="homeA">Home A - English</option>
            <option value="homeASP">Home A- Spanish</option>
          </select>
          <div>
            <span style={{ fontWeight: "bold", marginRight: "8px" }}>
              Editando:
            </span>
            <a href={viewUrl} target="_blank" rel="noreferrer">
              {viewUrl}
            </a>
          </div>
          <div className={styles.switchOn}>
            <span>Produccion</span>
            <Switch
              squared
              color="success"
              checked={production}
              onChange={() => isProduction(!production)}
            />
          </div>
        </div>
      </header>
      <section className={styles.files}>{listJsx}</section>
      <section className={styles.extras}>
        <Text h1>Gráficos JS</Text>
        <div>{chartJsx}</div>
      </section>

      {/* <pre>
        <code>{JSON.stringify(props, null, 4)}</code>
      </pre> */}
      <Modal
        closeButton
        aria-labelledby="modal-title"
        open={visible}
        onClose={closeHandler}
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            Ingresa la contraseña para editar
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Input
            clearable
            bordered
            fullWidth
            color="primary"
            placeholder="Password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button auto onClick={closeHandler}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Index;

export async function getServerSideProps(context) {
  try {
    const data = await axios.get(
      "https://azimuthim.com/wp-json/acf/v3/pages/431"
    );

    //Map keys to array, to be able to filter them
    const keys = Object.keys(data.data.acf);
    //Filter keys to only keys that have a csv file
    const filteredKeys = keys.filter((key) => {
      return data.data.acf[key].subtype === "csv";
    });
    //Build new object
    const fileBlocks = {};
    filteredKeys.forEach((key) => {
      fileBlocks[key] = data.data.acf[key];
    });

    return {
      props: {
        ...fileBlocks,
      },
    };
  } catch (error) {
    return {
      props: {
        error: "error",
      },
    };
  }
}
