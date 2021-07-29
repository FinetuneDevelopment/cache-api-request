// This returns JSON containing the page ID, the page name and the page URL of every page on the site.
import { pageData } from "../../data/page-data";

const pageList = pageData.map((page) => ({
  id: page.id,
  name: page.name,
  url: page.url,
}));

export default function handler(req, res) {
  res.status(200).json(pageList);
}
