import mongoose from 'mongoose';

const sauceSchema = new mongoose.Schema({
    // unique MongoDB ID of the user who created the sauce
    userId: { type: String, required: true },
    // name of he sauce
    name: { type: String, required: true },
    // manufacturer of the sauce
    manufacturer: { type: String, required: true },
    // description of the sauce
    description: { type: String, required: true },
    // main ingredient of the sauce
    mainPepper: { type: String, required: true },
    // URL of the sauce image uploaded by the user
    imageUrl: { type: String, required: true },
    // number between 1 and 10 describing the sauce
    heat: { type: Number, required: true, min: [1, 'Must be at least 1, got {VALUE}'], max: [10, 'Must be at most 10, got {VALUE}'] },
    // number of users liking the sauce
    likes: { type: Number, required: true, min: [0, 'Must be at least 0, got {VALUE}'] },
    // number of users disliking the sauce
    dislikes: { type: Number, required: true, min: [0, 'Must be at least 0, got {VALUE}'] },
    // IDs array of users who liked the sauce
    usersLiked: { type: [String], required: true },
    // IDs array of users who disliked the sauce
    usersDisliked: { type: [String], required: true }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

export default mongoose.model('Sauce', sauceSchema);