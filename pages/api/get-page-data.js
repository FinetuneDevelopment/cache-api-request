// This accepts an ID as an input and returns the JSON data for a matching page.
import { pageData } from "../../data/page-data";

export default function handler(req, res) {
  const id = req.body.id;
  const pageDetail = pageData.filter((page) => page.id === id);
  res.status(200).json(pageDetail[0]);
}
