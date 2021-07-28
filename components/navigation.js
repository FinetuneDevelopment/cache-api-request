import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navigation() {
  const [pageList, setPageList] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/get-page-list");
        const json = await response.json();
        setPageList(json);
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchData();
  }, []);

  return (
    <ul>
      {pageList.map((page) => (
        <li key={page.id}>
          <Link href={`/${page.url}`}>{page.name}</Link>
        </li>
      ))}
    </ul>
  );
}
