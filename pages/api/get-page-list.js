import { pageData } from "../../data/page-data";

// Only return the URLs and the IDs to the browser
const pageList = pageData.map((page) => ({
  url: page.url,
  id: page.id,
  name: page.name,
}));

// Example headless CMS data
export default function handler(req, res) {
  res.status(200).json(pageList);
}
