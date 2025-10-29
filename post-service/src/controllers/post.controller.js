import Post from "../models/post.models.js";

export const createPost = (req, res) => {
    try {
        
    } catch (error) {
        
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const page = parsInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const startInd = (page - 1) * limit;
        
    } catch (error) {
        
    }
}