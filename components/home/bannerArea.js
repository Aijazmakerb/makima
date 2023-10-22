import React, { useEffect, useState } from "react";
import DotList from "../shared/DotList";
import Link from "next/link";
import { BookmarkIcon, HeartIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import axios from "axios";

function BannerArea({description, data}) {

    const [anifyDatas, setAnifyData] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await axios.get(`https://api.anify.tv/info/${data.id}?fields=[totalEpisodes,season,format,year]`);
                const anify = res.data; // Use res.data instead of res.json()
    
                const anifyData = [`${anify.format} Series`, `${anify.totalEpisodes} Episodes`, `${anify.season} ${anify.year}`]; // Fixed the formatting of totalEpisodes
                setAnifyData(anifyData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    
        if (data) {
            fetchData();
        }
    }, [data]);

    console.log(anifyDatas)

    return (
        <div className="hidden justify-center lg:flex h-[400px]">
          <div className="absolute">
            <Image
              draggable={false}
              src={data.bannerImage}
              width={1200}
              height={1200}
              className="object-cover h-[400px] w-screen"
              alt="banner image"
            />
            <div className="hero-background-overlay absolute inset-0"></div>
          </div>

          <div className="relative w-full lg:max-w-[90%] font-karla">
            <div className="absolute bottom-0 gap-1.5 grid w-[38%] ml-5">
              <h1 className="mb-2 font-extrabold font-outfit text-4xl uppercase line-clamp-2">{data.title.english || data.title.romaji}</h1>
              {anifyDatas ? (
                <DotList items={anifyDatas}/>
              ): (
                <DotList items="Loading"/>
              )}
              <p className="line-clamp-3 text-sm font-normal text-white/40" dangerouslySetInnerHTML={{ __html: data?.description }}/>
              <DotList items={data.genres}/>
              <div className="relative mt-2 gap-2 flex">
                <Link href={`/en/anime/${data.id}`}>
                  <button className="bg-secondary px-5 py-2 text-sm font-medium rounded-sm">Watch Now</button>
                </Link>
                <button className="bg-secondary p-2 rounded-sm"><HeartIcon className="w-4 h-4" /></button>
                <button className="bg-secondary p-2 rounded-sm"><BookmarkIcon className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="absolute align-center top-1/2 left-2/3 right-0">
              <Link href={`/en/anime/${data.id}`}>
                <button className="transition duration-300 p-2 rounded-full absolute left-3 top-1/2 md:block hover:bg-white hover:text-black border-solid border-2 border-white gap-x-2">
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" className="w-16 h-16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm144.1 454.9L437.7 677.8a8.02 8.02 0 0 1-12.7-6.5V353.7a8 8 0 0 1 12.7-6.5L656.1 506a7.9 7.9 0 0 1 0 12.9z"></path></svg>
                </button>
              </Link>
            </div>
          </div>
        </div>
    );
}

export default BannerArea;