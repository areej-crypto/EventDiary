import mongoose from "mongoose";
 
const InteractionSchema = new mongoose.Schema({

  userId: {

    type: mongoose.Schema.Types.ObjectId,

    ref: "User",

    required: true,

  },

  eventId: {

    type: mongoose.Schema.Types.ObjectId,

    ref: "Event",

    required: false,

  },

  interactionType: {

    type: String,

    enum: ["like", "comment", "remind"],

    required: true,

  },

  commentText: {

    type: String,

    default: "",

  },

  timestamp: {

    type: Date,

    default: Date.now,

  },

});
 
export default mongoose.model("Interaction", InteractionSchema);

 