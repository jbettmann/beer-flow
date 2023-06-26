import mongoose from "mongoose";
const { Schema } = mongoose;
// beer schema
const brewerySchema = new Schema({
  companyName: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  admin: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
  staff: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
  categories: [{ type: String, default: [] }],
});

export default mongoose.models.Brewery ||
  mongoose.model("Brewery", brewerySchema);
