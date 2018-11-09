const axios = require('axios');

const YouTube = function (access_token) {
  const instance = {};

  const fetcher = axios.create({
    baseURL: 'https://www.googleapis.com/youtube/v3',
    // headers: { authorization: `Bearer ${access_token}`}
  });

  instance.get = async (keywords) => {
    const base = `search?key=${process.env.YOUTUBE_TOKEN}&part=snippet&type=video&videoEmbeddable=true&maxResults=1&q=`;
    const keywords_param = keywords.reduce((keywords, keyword) => `${keywords}${keyword}+`, '');
    const first_res = await fetcher.get(base + keywords_param).catch(console.error);
    const second_res = await fetcher.get(base + keywords_param + 'mma').catch(console.error);
    return { first: first_res.data.items[0].snippet, second: second_res.data.items[0].snippet }; 
  }

  return instance;
}

module.exports = YouTube;