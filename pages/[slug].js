// This renders any page matching a URL found in the site content data.
import fs from "fs";
import path from "path";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Navigation from "../components/navigation";

// Unfortunately, what Vercel reports as the public URL via environmental variables
// isn't what it tells me the URL is, hence this hard-coded value.
const currentURL = process.env.NEXT_PUBLIC_VERCEL_URL
  ? "https://cache-api-request-jet.vercel.app"
  : "http://localhost:3000";

// Path to the JSON file which holds a locally cached list of pages, URLs and their IDs
const cachePath = path.join(process.cwd(), "cache", "page-list.json");
const pageList = JSON.parse(fs.readFileSync(cachePath));
// How old the cache needs to be, before we fetch a new version of the page list
// (this can be globally changed in the .env file)
const cacheDataMaxAge = process.env.LOCAL_CACHE_MAX_AGE
  ? parseInt(process.env.LOCAL_CACHE_MAX_AGE)
  : 3600000;

const getPageListData = async () => {
  let pageListData;

  // Do we have a valid, stored list of pages?
  // 1. The first element in the array will be null if this has never fetched data before
  // 2. Is the time since the last time the cache been updated less than the max cache age?
  if (!pageList[0] || Date.now() - pageList[0] > cacheDataMaxAge) {
    try {
      const pageList = await fetch(`${currentURL}/api/get-page-list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      pageListData = await pageList.json();
      // Update the cache
      const newPageList = [Date.now(), pageListData];
      fs.writeFileSync(cachePath, JSON.stringify(newPageList));
    } catch {
      // API not responding: pull data from cache
      pageListData = pageList[1];
    }
  }
  // Store bought data is fine
  else {
    pageListData = pageList[1];
  }
  return pageListData;
};

const Page = (props) => {
  return (
    <main>
      <Head>
        <title>{props.name}</title>
        <meta name="description" content={props.content} />
      </Head>
      <Navigation />
      <Link href="/" title="Return to the home page">
        <a>
          <Image src={props.img} width="800" height="400" alt={props.name} />
        </a>
      </Link>
      <h1>{props.name}</h1>
      <p>{props.content}</p>
    </main>
  );
};

export default Page;

export async function getStaticProps({ params }) {
  const { slug } = params;
  const pageListData = await getPageListData();
  const currentPageData = pageListData.filter((page) => page.url === slug);
  const currentPageID = currentPageData[0].id;
  let pageDetailData = {
    name: "Not found",
    url: "not-found",
    content: "Content not found.",
    img: "/img/about.jpg",
    id: "0000",
  };

  try {
    // Using the ID above, get the data which matches the page
    const pageDetail = await fetch(`${currentURL}/api/get-page-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: currentPageID }),
    });
    pageDetailData = await pageDetail.json();
  } catch {
    console.log("API not responding");
  }

  return {
    props: pageDetailData,
    revalidate: 1000,
  };
}

export async function getStaticPaths() {
  const pageListData = await getPageListData();
  let pathObject = [];
  pageListData.map((path) => pathObject.push({ params: { slug: path.url } }));

  return {
    paths: pathObject,
    fallback: false,
  };
}
