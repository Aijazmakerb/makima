const CONSUMET_URI = process.env.API_URI;

async function fetchData(id, providerId, chapterId, key) {
  try {
    const res = await fetch(
      `${CONSUMET_URI}/meta/anilist-manga/read?chapterId=${chapterId}&provider=${providerId}`
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

export default async function getConsumetPages(
  mediaId,
  providerId,
  chapterId,
  key
) {
  try {
    // let cached;
    // if (redis) {
    //   cached = await redis.get(chapterId);
    // }
    // if (cached) {
    //   return JSON.parse(cached);
    // } else {
    const data = await fetchData(mediaId, providerId, chapterId, key);
    if (!data.error) {
      // if (redis) {
      //   await redis.set(chapterId, JSON.stringify(data), "EX", 60 * 10);
      // }
      return data;
    } else {
      return { message: "Manga/Novel not found :(" };
    }
    // }
  } catch (error) {
    return { error };
  }
}
