import React, { useState, useEffect } from "react";
import { Text } from "@nextui-org/react";
import axios from "axios";
import styles from "../styles/Home.module.css";
import { Link } from "@nextui-org/react";
import { Spacer, Switch } from "@nextui-org/react";
import { useRouter } from "next/router";

const Index = (props) => {
  const router = useRouter();

  const [pageSelected, setPageSelected] = useState("home");
  const [production, isProduction] = useState(false);
  const [updateUrl, setUpdateUrl] = useState(
    "https://azimuthim.com/wp-json/acf/v3/pages/431"
  );
  const [listData, setListData] = useState(Object.keys(props));
  const [rawData, setRawData] = useState(props);

  useEffect(() => {
    console.log(production);
    if (production) {
      switch (pageSelected) {
        case "home":
          setUpdateUrl("https://azimuthim.com/wp-json/acf/v3/pages/7");
          break;
        default:
          break;
      }
    } else {
      switch (pageSelected) {
        case "home":
          setUpdateUrl("https://azimuthim.com/wp-json/acf/v3/pages/431");
          break;
        default:
          break;
      }
    }
  }, [production, pageSelected]);

  useEffect(() => {
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
    });
  }, [updateUrl]);

  let listJsx = listData?.map((link, i) => {
    console.log(link);
    console.log(listData);
    return (
      <div key={i}>
        <div>
          Editar:
          <Link
            block
            href={`/csv?file=${rawData[link]?.url}&label=${link}&updateUrl=${updateUrl}`}
          >
            {link}
          </Link>
        </div>
        <Spacer />
      </div>
    );
  });

  const changePage = (e) => {
    setPageSelected(e.target.value);
  };

  return (
    <div className={styles.main}>
      <header className={styles.header}>
        <Text h1>Azi Tool</Text>
        <Text p>Una herramienta para editar los csvs del sitio</Text>
        <hr />
        <div className={styles.switchContainer}>
          <select onChange={(e) => changePage(e)} value={pageSelected}>
            <option value="home">Home - Spanish</option>
            <option value="home2">Home - English</option>
          </select>
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

      {/* <pre>
        <code>{JSON.stringify(props, null, 4)}</code>
      </pre> */}
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
