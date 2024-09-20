require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({extended:false}))

const urlDatabase = []; // To store original and short URLs
let urlCount = 0;  

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const extractHostname = (inputUrl) => {
  try {
    const myUrl = new URL(inputUrl);
    return myUrl.hostname;
  } catch (err) {
    return null;
  }
};

// Your first API endpoint

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl' ,(req,res)=>{
  const inputUrl = req.body.url
  const i=urlDatabase.indexOf(inputUrl)
  if( i !== -1)
    return res.json({'origina_url': urlDatabase[i], 'short_url':i})
  const hostname=extractHostname(inputUrl)
  try{
    dns.lookup(hostname , (err ,address , family) =>{
      if(err)
        return res.json({'error' : 'invalid url'})
      urlDatabase[urlCount]=inputUrl
      return res.json({'original_url' : inputUrl , 'short_url' : urlCount++ })
    })
  }
  catch(err){
    return res.json({ 'error' : 'invalid url'})
  }
})

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    return res.redirect(originalUrl);
  } else {
    return res.json({ error: 'invalid url' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
