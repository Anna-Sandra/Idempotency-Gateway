const express = require('express');
const bodyParser = require('body-parser');
const CryptoJS = require('crypto-js');

require('dotenv').config();
const PORT = process.env.PORT;


const app = express();
app.use(bodyParser.json());


const store = new Map();

app.post('/process-payment', async (req, res) => {
  const key = req.headers['idempotency-key'];
  if (!key) return res.status(400).json({ error: 'Missing Idempotency-Key' });

  const body = req.body;
  if (!body.amount || !body.currency) return res.status(400).json({ error: 'Invalid body' });

  const bodyHash = CryptoJS.SHA256(JSON.stringify(body)).toString();

  if (!store.has(key)) {

    store.set(key, { status: 'processing' });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const responseBody = { message: `Charged ${body.amount} ${body.currency}` };
    store.set(key, { hash: bodyHash, response: { status: 201, body: responseBody }, status: 'done' });

    return res.status(201).json(responseBody);
  }

  const existing = store.get(key);


if (existing.status === 'processing') {
  while (store.get(key).status === 'processing') {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const finalData = store.get(key);
  res.set('X-Cache-Hit', 'true');
  return res.status(finalData.response.status).json(finalData.response.body);
}


if (existing.status === 'done') {
  
  if (existing.hash !== bodyHash) {
    return res.status(409).json({
      error: 'Idempotency key already used for a different request body.'
    });
  }

  
  res.set('X-Cache-Hit', 'true');
  return res.status(existing.response.status).json(existing.response.body);
}

});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




