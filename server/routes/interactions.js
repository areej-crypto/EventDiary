import express from 'express';
import Interaction from '../Models/Interaction.js';
import Event from '../Models/Event.js';


const router = express.Router();

router.post('/interactions', async (req, res) => {
  try {
    const { userId, eventId, interactionType, commentText = "" } = req.body;
    const interaction = await Interaction.create({
      userId,
      eventId,
      interactionType,
      commentText
    });
    await Event.findByIdAndUpdate(eventId, {
      $inc: {
        likeCount:   interactionType === 'like'   ? 1 : 0,
        remindCount: interactionType === 'remind' ? 1 : 0,
        commentCount: interactionType === 'comment' ? 1 : 0
      }
    });

    res.status(201).json(interaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record interaction' });
  }
});

export default router;
