import mongoose from "mongoose";
const { Schema } = mongoose;
// user schema
const userSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  breweries: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Brewery", default: [] },
  ],
});
const User = mongoose.models?.User || mongoose.model("User", userSchema);

export default User;
