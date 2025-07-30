import express from 'express';

import axios  from 'axios';
const router = express.Router();

router.get('/trending-events', async (req, res) => {
  const { n, alpha } = req.query;
  try {
    const resp = await axios.get(
      `${process.env.FLASK_URL || 'http://localhost:5000'}/trending-events`,
      { params: { n, alpha } }
    );
    res.json(resp.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch trending events' });
  }
});
export default router;
