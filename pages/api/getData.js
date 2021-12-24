// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";

//Make home Update logic into this.
//Fabricate URL at home, send it here, return data of said fetch and proxy it.
export default async function handler(req, res) {
  const request = await axios.get(req.body.url);
  res.status(200).json(request.data);
}
