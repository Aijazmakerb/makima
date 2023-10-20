import ChapterSelector from "@/components/manga/chapters";
import Footer from "@/components/shared/footer";
import Head from "next/head";
import { useEffect, useState } from "react";
import { setCookie } from "nookies";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]";
import { mediaInfoQuery } from "@/lib/graphql/query";
import Modal from "@/components/modal";
import { signIn, useSession } from "next-auth/react";
import AniList from "@/components/media/aniList";
import ListEditor from "@/components/listEditor";
import MobileNav from "@/components/shared/MobileNav";
import Image from "next/image";
import DetailTop from "@/components/anime/mobile/topSection";
import Characters from "@/components/anime/charactersCard";
import Content from "@/components/home/content";
import { redis } from "@/lib/redis";
import { toast } from "sonner";
import getConsumetChapters from "@/lib/consumet/manga/getChapters";

export default function Manga({ info, chapters, color, chapterNotFound }) {
  const [domainUrl, setDomainUrl] = useState("");
  const [firstEp, setFirstEp] = useState();
  // const chaptersData = info.chapters.data;
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statuses, setStatuses] = useState(null);
  const [watch, setWatch] = useState();

  const [open, setOpen] = useState(false);

  const rec = info?.recommendations?.nodes?.map(
    (data) => data.mediaRecommendation
  );

  useEffect(() => {
    setDomainUrl(window.location.origin);
  }, []);

  useEffect(() => {
    if (chapterNotFound) {
      toast.error("Chapter not found");
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState(null, null, cleanUrl);
    }
  }, [chapterNotFound]);

  function handleOpen() {
    setOpen(true);
    document.body.style.overflow = "hidden";
  }

  function handleClose() {
    setOpen(false);
    document.body.style.overflow = "auto";
  }

  // useEffect(() => {
  //   if (chapters) {
  //     const getEpi = info?.nextAiringEpisode
  //       ? chapters.find((i) => i.number === progress + 1)
  //       : chapters[0];
  //     if (getEpi) {
  //       const watchUrl = `/en/anime/watch/${
  //         info.id
  //       }/${providerId}?id=${encodeURIComponent(getEpi.id)}&num=${
  //         getEpi.number
  //       }${isDub ? `&dub=${isDub}` : ""}`;
  //       setWatch(watchUrl);
  //     } else {
  //       setWatch(null);
  //     }
  //   }
  // }, [chapters]);

  return (
    <>
      <Head>
        <title>
          {info
            ? `Manga - ${
                info.title.romaji || info.title.english || info.title.native
              }`
            : "Getting Info..."}
        </title>
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`Moopa - ${info.title.romaji || info.title.english}`}
        />
        <meta
          name="twitter:description"
          content={`${info.description?.slice(0, 180)}...`}
        />
        <meta
          name="twitter:image"
          content={`${domainUrl}/api/og?title=${
            info.title.romaji || info.title.english
          }&image=${info.bannerImage || info.coverImage}`}
        />
        <meta
          name="title"
          data-title-romaji={info?.title?.romaji}
          data-title-english={info?.title?.english}
          data-title-native={info?.title?.native}
        />
      </Head>
      <Modal open={open} onClose={() => handleClose()}>
        <div>
          {!session && (
            <div className="flex-center flex-col gap-5 px-10 py-5 bg-secondary rounded-md">
              <div className="text-md font-extrabold font-karla">
                Edit your list
              </div>
              <button
                className="flex items-center bg-[#363642] rounded-md text-white p-1"
                onClick={() => signIn("AniListProvider")}
              >
                <h1 className="px-1 font-bold font-karla">
                  Login with AniList
                </h1>
                <div className="scale-[60%] pb-[1px]">
                  <AniList />
                </div>
              </button>
            </div>
          )}
          {session && info && (
            <ListEditor
              animeId={info?.id}
              session={session}
              stats={statuses?.value}
              prg={progress}
              max={info?.episodes}
              info={info}
              close={handleClose}
            />
          )}
        </div>
      </Modal>
      <MobileNav sessions={session} hideProfile={true} />
      <main className="w-screen min-h-screen overflow-hidden relative flex flex-col items-center gap-5">
        {/* <div className="absolute bg-gradient-to-t from-primary from-85% to-100% to-transparent w-screen h-full z-10" /> */}
        <div className="w-screen absolute">
          <div className="bg-gradient-to-t from-primary from-10% to-transparent absolute h-[280px] w-screen z-10 inset-0" />
          {info?.bannerImage && (
            <Image
              src={info?.bannerImage}
              alt="banner anime"
              height={1000}
              width={1000}
              blurDataURL={info?.bannerImage}
              className="object-cover bg-image blur-[2px] w-screen absolute top-0 left-0 h-[250px] brightness-[55%] z-0"
            />
          )}
        </div>
        <div className="w-full lg:max-w-screen-lg xl:max-w-screen-2xl z-30 flex flex-col gap-5">
          <DetailTop
            info={info}
            session={session}
            handleOpen={handleOpen}
            loading={loading}
            statuses={statuses}
            watchUrl={watch}
            progress={progress}
            color={color}
          />

          {chapters.length > 0 ? (
            <ChapterSelector
              chaptersData={chapters}
              data={info}
              setWatch={setWatch}
              setFirstEp={setFirstEp}
            />
          ) : (
            <p>No Chapter Available :(</p>
          )}

          {info?.characters?.edges && (
            <div className="w-full">
              <Characters info={info?.characters?.edges} />
            </div>
          )}

          {info && rec?.length !== 0 && (
            <div className="w-full">
              <Content
                ids="recommendAnime"
                section="Recommendations"
                type="manga"
                data={rec}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  const accessToken = session?.user?.token || null;

  const { id, chapter } = context.query;

  let chapters;
  let info;
  let chapterNotFound;

  if (chapter) {
    // create random id string
    chapterNotFound = Math.random().toString(36).substring(7);
  }

  const chapterData = await getConsumetChapters(id, redis);
  if (!chapterData) {
    return {
      notFound: true,
    };
  } else {
    chapters = chapterData;
  }

  const response = await fetch("https://graphql.anilist.co/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: JSON.stringify({
      query: mediaInfoQuery,
      variables: {
        id: parseInt(id),
        type: "MANGA",
      },
    }),
  });
  const data = await response.json();
  info = data?.data?.Media;

  const textColor = setTxtColor(info?.coverImage?.color);

  const color = {
    backgroundColor: `${info?.coverImage?.color || "#ffff"}`,
    color: textColor,
  };

  return {
    props: {
      info: info || null,
      chapterNotFound: chapterNotFound || null,
      chapters,
      color,
    },
  };
}

function getBrightness(hexColor) {
  if (!hexColor) {
    return 200;
  }
  const rgb = hexColor
    .match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
    .slice(1)
    .map((x) => parseInt(x, 16));
  return (299 * rgb[0] + 587 * rgb[1] + 114 * rgb[2]) / 1000;
}

function setTxtColor(hexColor) {
  const brightness = getBrightness(hexColor);
  return brightness < 150 ? "#fff" : "#000";
}
