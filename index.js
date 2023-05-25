// npm i
// npm start
// http://localhost:3000

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));


app.post('/scrape', async (req, res) => {
 

  try {
    let options = {
        url:  req.body.url,
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,ko;q=0.8",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
        }
        
    };
    const response = await axios.get(options.url,{
        headers: options.headers
      });
    const html = response.data;

    const $ = cheerio.load(html);

    const ogTitle = $('meta[property="og:title"]').attr('content');


    const ogImage = $('meta[property="og:image"]').attr('content');


    const title = $('title').text().trim();

   
    const description = $('meta[name="description"]').attr('content');

    res.json({ ogTitle, ogImage, title, description });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

