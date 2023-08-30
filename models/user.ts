import mongoose from "mongoose";
const { Schema } = mongoose;
// user schema
const userSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    breweries: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Brewery", default: [] },
    ],
    image: String,
    notifications: {
      allow: { type: Boolean, default: true }, // or false
      newBeerRelease: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
      beerUpdate: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
      // ... more detailed preferences if needed
    },
  },
  {
    timestamps: true, // This will create the `createdAt` and `updatedAt` fields automatically
  }
);
const User = mongoose.models?.User || mongoose.model("User", userSchema);

export default User;
