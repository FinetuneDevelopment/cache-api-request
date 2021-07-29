// This renders any page matching a URL found in the site content data.
import fs from "fs";
import path from "path";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Navigation from "../components/navigation";

// Path to the JSON file which holds a locally cached list of pages, URLs and their IDs
const cachePath = path.join(process.cwd(), "cache", "page-list.json");
const pageList = JSON.parse(fs.readFileSync(cachePath));
// How old the cache needs to be, before we fetch a new version of the page list
// (this can be globally changed in the .env file)
const cacheDataMaxAge = process.env.LOCAL_CACHE_MAX_AGE
  ? parseInt(process.env.LOCAL_CACHE_MAX_AGE)
  : 3600000;

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

export async function getStaticProps(context) {
  const { params } = context;
  const { slug } = params;

  let pageListData;

  // Do we have a valid, stored list of pages?
  // 1. The first element in the array will be null if this has never fetched data before
  // 2. Is the time since the last time the cache been updated less than the max cache age?
  if (!pageList[0] || Date.now() - pageList[0] > cacheDataMaxAge) {
    try {
      // Get the list of pages, so we can work out what the ID of the current page is
      const pageList = await fetch("http://localhost:3000/api/get-page-list", {
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
      pageListData = pageList[1];
    }
  }
  // Store bought data is fine
  else {
    pageListData = pageList[1];
  }

  const currentPageData = pageListData.filter((page) => page.url === slug);
  const currentPageID = currentPageData[0].id;
  let pageDetailData = {
    name: "Not found",
    url: "not-found",
    content: "Content not found.",
    img: "https://placeimg.com/800/400/people",
    id: "0000",
  };

  try {
    // Using the ID above, get the data which matches the page
    const pageDetail = await fetch("http://localhost:3000/api/get-page-data", {
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
  let pageListData;
  // Do we have a valid, stored list of pages?
  // 1. The first element in the array will be null if this has never fetched data before
  // 2. Is the time since the last time the cache been updated less than the max cache age?
  if (!pageList[0] || Date.now() - pageList[0] > cacheDataMaxAge) {
    try {
      // Get the list of pages, so we can work out what the ID of the current page is
      const pageList = await fetch("http://localhost:3000/api/get-page-list", {
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
      console.log("API not responding: loading data from cache");
      pageListData = pageList[1];
    }
  }
  // Store bought data is fine
  else {
    pageListData = pageList[1];
  }

  // This is bad practice: if you ever find yourself using fetch() inside
  // getStaticPaths(), it's better to simply grab the data you need from
  // the file system. However, I need to fake a headless CMS, for demo
  // purposes.
  /*const response = await fetch("http://localhost:3000/api/get-page-list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();*/
  let pathObject = [];
  // Building up the object to send NextJS
  pageListData.map((path) => pathObject.push({ params: { slug: path.url } }));

  return {
    paths: pathObject,
    fallback: false,
  };
}
