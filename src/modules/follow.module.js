import mongoose from "mongoose";
const { Schema } = mongoose;


const followSchema = new Schema({
  followerUser: { type: Schema.Types.ObjectId, ref: 'users', required: true }, // always a user
  followerCreator: { type: Schema.Types.ObjectId, ref: 'creators', default: null }, // if the follower is a creator
  followingUser: { type: Schema.Types.ObjectId, ref: 'users', required: true }, // always a user
  followingCreator: { type: Schema.Types.ObjectId, ref: 'creators', default: null }, // if the following is a creator
  createdAt: { type: Date, default: Date.now }
});

const Follow = mongoose.model('Follow', followSchema);
export default Follow;