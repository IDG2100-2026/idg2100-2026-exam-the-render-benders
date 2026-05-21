import { Comment } from "../models/comments.js";

// added this in Oblig3 (needed an endpoint to get comments for match)
export async function getMatchComments(matchId) {
    return await Comment.find({ matchId });
}

export async function checkCommentExistence(cid){
    // checks if comment already exists
    const commentExists = await Comment.exists({ cid });
    if (commentExists) {
        return true;
    } else {
        throw new Error(`Comment with ${cid} does not exist`);
    }
}  

export async function getAllComments(limit, skip, filter){
    // fetches all comments from the db with pagination:
    // limit controls how many to return, skip controls how many to skip
    return await Comment.find(filter).limit(limit).skip(skip);
}

export async function createComment(commentObj){
    // creating the comment
    const comment = new Comment(commentObj);
    // saving it to the db
    const savedComment = await comment.save();
    // returning auto generated comment id
    return savedComment.cid;
}

export async function deleteComment(cid){
    return await Comment.findOneAndDelete({ cid });
}

export default {
    checkCommentExistence,
    getAllComments,
    createComment,
    deleteComment,
    getMatchComments
}
