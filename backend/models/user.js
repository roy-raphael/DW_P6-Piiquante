import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const userSchema = new mongoose.Schema({
    // e-mail adress of the user [unique]
    email: { type: String, required: true, unique: true },
    // user hashed password
    password: { type: String, required: true }
    }, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

userSchema.plugin(uniqueValidator);

export default mongoose.model('User', userSchema);