import { pageData } from "../../data/page-data";

// Returns the page data for the matching ID
export default function handler(req, res) {
  const id = req.body.id;
  const pageDetail = pageData.filter((page) => page.id === id);
  res.status(200).json(pageDetail[0]);
}
