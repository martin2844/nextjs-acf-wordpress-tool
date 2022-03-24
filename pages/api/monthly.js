// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import Cors from "cors";

const cors = Cors({
  methods: ["GET", "HEAD"],
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  try {
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
    async function getLatestFiles(page) {
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
      console.log("finished monthly function");
      return monthlyFile;
    }
    const monthlyFile = await getLatestFiles(1);
    console.log(monthlyFile);
    res.status(200).json(monthlyFile);
  } catch (error) {
    res.status(500).send(error);
  }
}
