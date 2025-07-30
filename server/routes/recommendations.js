import express from 'express';
import { getRecommendations } from '../services/recommender.js';
import Event from '../Models/Event.js';
import UserModel from '../Models/Users.js';
const router = express.Router();

router.get('/recommendations/:userId', async (req, res) => {
  try {
    // 1) Get the top-5 { event_id, score } from ML
    const user = await UserModel.findById(req.params.userId).lean();
    const recs = await getRecommendations(req.params.userId);
    // 2) Pull all those event docs at once
    const ids = recs.map(r => r.event_id);
    const events = await Event.find({
     _id: { $in: ids },
      organizerEmail: { $ne: user.email }
    }).lean();
    // 3) Merge back in the score, preserving order
    const byId = Object.fromEntries(events.map(e => [e._id.toString(), e]));
    const full = recs.map(r => ({
      ...byId[r.event_id],
      score: r.score
    }));

    return res.json(full);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

export default router;
