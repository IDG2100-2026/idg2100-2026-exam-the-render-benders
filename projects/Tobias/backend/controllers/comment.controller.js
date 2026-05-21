import commentServices from "../services/comment.services.js";
import { matchedData } from "express-validator";

// "/comments"
export async function getAllComments(req, res){
    // read limit and skip from query params (with fallback)
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    const filter = {};
    if (req.query.search) filter.text = { $regex: req.query.search, $options: "i" };
    const allComments = await commentServices.getAllComments(limit, skip, filter);
    res.json({ allComments });
}

// "/matches/:mid/comments"
export async function leaveMatchComment(req, res){
    // get validated uid and text from body
    const data = matchedData(req);
    // add the mid from the URL to the comment data
    data.matchId = req.params.mid;
    // save the comment and get back the auto generated cid
    const newCommentId = await commentServices.createComment(data);
    res.status(201).json({msg: "Comment created", newCommentId });
}

// "/tournaments/:tid/comments"
export async function leaveTournamentComment(req, res){
    const data = matchedData(req);
    data.tournamentId = req.params.tid;
    const newCommentId = await commentServices.createComment(data);
    res.status(201).json({msg: "Comment created", newCommentId });
}

// "/matches/:mid/comments/:cid"
export async function deleteMatchComment(req, res){
    // delete comment using cid from the URL
    const deletedComment = await commentServices.deleteComment(req.params.cid);
    res.json({ deletedComment });
}

// "/tournaments/:tid/comments/:cid"
export async function deleteTournamentComment(req, res){
    // delete comment using cid from the URL
    const deletedComment = await commentServices.deleteComment(req.params.cid);
    res.json({ deletedComment });
}

// addded this in Oblig 3
export async function getMatchComments(req, res){
    const comments = await commentServices.getMatchComments(req.params.mid);
    res.json({ comments });
}

export default {
    getAllComments,
    leaveMatchComment,
    leaveTournamentComment,
    deleteMatchComment,
    deleteTournamentComment,
    getMatchComments
}
