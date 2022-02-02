import React from "react";
import { Text } from "@nextui-org/react";
import styles from "../styles/csv.module.css";
import Monthly from "../components/Monthly";
import axios from "axios";

const Charts = ({ name, token, monthlyFile }) => {
  return (
    <div className={styles.main}>
      <section>
        <Text h2>Grafico: {name}</Text>
        <br />
      </section>
      <section>
        {name === "monthly" && <Monthly file={monthlyFile} token={token} />}
      </section>
    </div>
  );
};

export default Charts;

export async function getServerSideProps(context) {
  try {
    // Id need to get the URL from context.
    //And replace the String below with that.
    if (context.query.pass !== process.env.localPass) {
      throw new Error("WRONG PASSWORD");
    }

    const token = await axios.post(
      "https://azimuthim.com/wp-json/jwt-auth/v1/token",
      {
        username: process.env.USER,
        password: process.env.PASS,
      }
    );

    let config = {
      headers: {
        Authorization: "Bearer " + token.data.data.token,
      },
    };
    const latestFilesReq = await axios.get(
      "https://azimuthim.com/wp-json/wp/v2/media?media_type=text&per_page=50",
      config
    );
    const media = latestFilesReq.data;
    const monthlyFiles = media.filter((x) => x.slug.includes("monthly"));
    let monthlyFile;
    if (monthlyFiles.length > 0) {
      const monthlyFileReq = await axios.get(
        monthlyFiles[0].source_url,
        config
      );
      monthlyFile = monthlyFileReq.data;
    }

    return {
      props: {
        ok: true,
        name: context.query.chart,
        token: token.data.data.token,
        monthlyFile,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      props: {
        ok: true,
        name: context.query.chart,
        token: "",
        monthlyFile: "",
      },
    };
  }
}
