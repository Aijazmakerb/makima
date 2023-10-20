import Head from "next/head";
import { parseCookies } from "nookies";

export default function Home() {
  return (
    <>
      <Head>
        <meta
          name="twitter:title"
          content="Makima - Free Anime and Manga Streaming"
        />
        <meta
          name="twitter:description"
          content="Discover your new favorite anime or manga title! Makima offers a vast library of high-quality content, accessible on multiple devices and without any interruptions. Start using Makima today!"
        />
        <meta name="twitter:image" content="/preview.png" />
        <meta
          name="description"
          content="Discover your new favorite anime or manga title! Makima offers a vast library of high-quality content, accessible on multiple devices and without any interruptions. Start using Makima today!"
        />
      </Head>
    </>
  );
}

export async function getServerSideProps(context) {
  const cookie = parseCookies(context);

  if (cookie.lang === "en") {
    return {
      redirect: {
        destination: "/en",
        permanent: false,
      },
    };
  } else if (cookie.lang === "id") {
    return {
      redirect: {
        destination: "/id",
        permanent: false,
      },
    };
  } else {
    return {
      redirect: {
        destination: "/en",
        permanent: false,
      },
    };
  }
}
