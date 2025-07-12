const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const {getImage} = require('../config/query'); 
const client = require('../config/db'); 

router.get('/photo/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await getImage(parseInt(userId));
    console.log("Requested Image by: "+ parseInt(userId));
    const imageBuffer = result.photo;
    res.set('Content-Type', 'image/png');
    res.send(imageBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
