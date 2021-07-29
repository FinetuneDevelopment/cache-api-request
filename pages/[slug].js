// This renders any page matching a URL found in the site content data.
import Head from "next/head";
import Link from "next/link";
import Navigation from "../components/navigation";

const Page = (props) => {
  return (
    <main>
      <Head>
        <title>{props.name}</title>
        <meta name="description" content={props.content} />
      </Head>
      <Navigation/>
      <p>
        <Link href="/" title="Return to the home page">
          <a>
            <img src={props.img} alt={props.name} />
          </a>
        </Link>
      </p>
      <h1>{props.name}</h1>
      <p>{props.content}</p>
    </main>
  );
};

export default Page;

export async function getStaticProps(context) {
  const { params } = context;
  const { slug } = params;

  // Get the list of pages, so we can work out what the ID of the current page is
  const pageList = await fetch("http://localhost:3000/api/get-page-list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const pageListData = await pageList.json();
  const currentPageData = pageListData.filter((page) => page.url === slug);
  const currentPageID = currentPageData[0].id;

  // Using the ID above, get the data which matches the page
  const pageDetail = await fetch("http://localhost:3000/api/get-page-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: currentPageID }),
  });
  const pageDetailData = await pageDetail.json();

  return {
    props: pageDetailData,
    revalidate: 1000,
  };
}

export async function getStaticPaths() {
  // This is bad practice: if you ever find yourself using fetch() inside
  // getStaticPaths(), it's better to simply grab the data you need from
  // the file system. However, I need to fake a headless CMS, for demo
  // purposes.
  const response = await fetch("http://localhost:3000/api/get-page-list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  let pathObject = [];
  // Building up the object to send NextJS
  data.map((path) => pathObject.push({ params: { slug: path.url } }));
  return {
    paths: pathObject,
    fallback: false,
  };
}
