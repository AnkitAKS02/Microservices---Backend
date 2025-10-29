import mongoose from 'mongoose'

const PostSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    mediaIds: [
        {
            type: String,
        },
    ],
    likes: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
}, { timestamps: true });

PostSchema.index({ content: "text" });

const Post = mongoose.model("Post", PostSchema);

export default Post;