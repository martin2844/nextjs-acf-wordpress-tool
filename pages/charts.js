import React from "react";
import { Text } from "@nextui-org/react";
import styles from "../styles/csv.module.css";
import Monthly from "../components/Monthly";
import axios from "axios";

const Charts = ({ name, token, monthlyFile, error }) => {
  if (error) {
    console.log(error);
  }

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
  try {
    async function getLatestFiles(page) {
      console.log("runnning function");
      const latestFilesReq = await axios.get(
        `https://azimuthim.com/wp-json/wp/v2/media?media_type=text&per_page=25&page=${page}`,
        config
      );
      const media = latestFilesReq.data;
      let monthlyFiles = media.filter((x) => x.slug.includes("monthly"));
      let monthlyFile;
      if (monthlyFiles.length > 0) {
        const monthlyFileReq = await axios.get(
          monthlyFiles[0].source_url,
          config
        );
        monthlyFile = monthlyFileReq.data;
      }
      if (!monthlyFile) {
        return getLatestFiles(page + 1);
      }
      return monthlyFile;
    }

    const monthlyFile = await getLatestFiles(1);
    return {
      props: {
        ok: true,
        name: context.query.chart,
        token: token.data.data.token,
        monthlyFile: monthlyFile,
      },
    };
  } catch (error) {
    console.log(error);
  }
}
