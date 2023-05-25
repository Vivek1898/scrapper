
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));


app.post('/scrape', async (req, res) => {
  console.log('API Called');
  const { urls } = req.body;

  try {
    const urlArray = urls.split(',');
    const scrapedData = [];
    const errorLog = [];

    for (const url of urlArray) {
      let options = {
        url: url.trim(),
        headers: {
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "accept-language": "en-US,en;q=0.9,ko;q=0.8",
          "cache-control": "no-cache",
          "pragma": "no-cache",
          'X-Requested-With': 'XMLHttpRequest',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
        },
      };

      try {
        const response = await axios.get(options.url, {
          headers: options.headers,
        });

        const html = response.data;

        const $ = cheerio.load(html);

        const ogTitle = $('meta[property="og:title"]').attr('content');
        const ogImage = $('meta[property="og:image"]').attr('content');
        const title = $('title').text().trim();
        const description = $('meta[name="description"]').attr('content');

        scrapedData.push({ ogTitle, ogImage, title, description });
      } catch (error) {
        console.error(`Error scraping URL: ${options.url}`, error);
        errorLog.push({ url: options.url, error: error.message });
      }
    }


    if (errorLog.length > 0) {
      const logText = errorLog.map(({ url, error }) => `${url}: ${error}`).join('\n');
      fs.writeFileSync('error-log.txt', logText);
    }

    res.json(scrapedData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});




app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
