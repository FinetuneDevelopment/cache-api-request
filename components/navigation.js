// This component generates a navigation bar from the page list API
import React, { useEffect, useState } from "react";
import Link from "next/link";

const currentURL = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "http://localhost:3000";

export default function Navigation() {
  const [pageList, setPageList] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${currentURL}/api/get-page-list`);
        const json = await response.json();
        setPageList(json);
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchData();
  }, []);

  return (
    <nav aria-label="Main">
      <p>
        {pageList.map((page) => (
          <React.Fragment key={page.id}>
            <Link href={`/${page.url}`}>{page.name}</Link>{" "}
          </React.Fragment>
        ))}
      </p>
    </nav>
  );
}
