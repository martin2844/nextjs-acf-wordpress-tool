import React from "react";
import { Text } from "@nextui-org/react";
import axios from "axios";
import styles from "../styles/Home.module.css";
import { Link } from "@nextui-org/react";
import { Spacer } from "@nextui-org/react";

const Index = (props) => {
  const listData = Object.keys(props);

  const listJsx = listData.map((link, i) => {
    return (
      <div key={i}>
        <div>
          Editar:
          <Link block href={`/csv?file=${props[link].url}&label=${link}`}>
            {link}
          </Link>
        </div>
        <Spacer />
      </div>
    );
  });

  return (
    <div className={styles.main}>
      <Text h1>Archivos en la home</Text>

      {listJsx}

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
      "https://azimuthim.com/wp-json/acf/v3/pages/415"
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
