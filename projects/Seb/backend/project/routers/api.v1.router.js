import express from 'express';
import userController from '../controllers/user.controller.js';
import matchController from '../controllers/match.controller.js';
import tournamentController from '../controllers/tournament.controller.js';
import leaderboardController from '../controllers/leaderboard.controller.js';
import commentController from '../controllers/comment.controller.js';
import gameCategoryController from '../controllers/gameCategory.controller.js';
import trophyController from '../controllers/trophy.controller.js';
import matchmakingController from '../controllers/matchmaking.controller.js';
import upload from '../config/multer.config.js';
import { attachUser, requireRole } from '../utils/auth.middleware.js';

const apiV1Router = express.Router(); // Create a new router instance for API version 1

apiV1Router.use(express.json()); // Middleware to parse JSON request bodies for all routes in this router

// Attach req.user (userType + userId) to every request from headers:
//   X-User-Type : 'anonymous' | 'registered' | 'admin'
//   X-User-Id   : the user's _id string
apiV1Router.use(attachUser);

// USERS
// GET
apiV1Router.get('/users', userController.getAllUsers);
apiV1Router.get('/users/:uid', userController.getUserById);
apiV1Router.get('/users/:uid/matches', matchController.getUserMatches);
apiV1Router.get('/users/:uid/recent-games', userController.getUserRecentGames);
apiV1Router.get('/users/:uid/stats', userController.getUserStats);
apiV1Router.get('/users/:uid/trophies', userController.getUserTrophies);
// POST
apiV1Router.post('/users', userController.createUser);
// PATCH
apiV1Router.patch('/users/:uid', requireRole('registered', 'admin'), userController.updateUser);
// DELETE
apiV1Router.delete('/users/:uid', requireRole('admin'), userController.deleteUser);

//  GAME CATEGORIES 
// GET
apiV1Router.get('/game-categories', gameCategoryController.getAllGameCategories);
apiV1Router.get('/game-categories/by-name', gameCategoryController.getGameCategoryByName);
apiV1Router.get('/game-categories/:gcid', gameCategoryController.getGameCategoryById);
// POST / PATCH / DELETE
apiV1Router.post('/game-categories', requireRole('admin'), gameCategoryController.createGameCategory);
apiV1Router.patch('/game-categories/:gcid', requireRole('admin'), gameCategoryController.updateGameCategory);
apiV1Router.delete('/game-categories/:gcid', requireRole('admin'), gameCategoryController.deleteGameCategory);

//  MATCHES 
// GET
apiV1Router.get('/matches', matchController.getAllMatches);
apiV1Router.get('/matches/:mid', matchController.getMatchById);
apiV1Router.get('/matches/:mid/spectate', matchController.spectateMatch);
apiV1Router.get('/matches/:mid/comments', commentController.getMatchComments);
// POST
apiV1Router.post('/matches', requireRole('registered', 'admin'), matchController.createMatch);
apiV1Router.post('/matches/:mid/result', requireRole('registered', 'admin'), matchController.saveResult);
apiV1Router.post('/matches/:mid/invite', requireRole('registered', 'admin'), matchController.inviteToMatch);
apiV1Router.post('/matches/:mid/join', requireRole('registered', 'admin'), matchController.joinMatch);
apiV1Router.post('/matches/:mid/comments', requireRole('registered', 'admin'), commentController.createMatchComment);
// PATCH / DELETE
apiV1Router.patch('/matches/:mid', requireRole('admin'), matchController.updateMatch);
apiV1Router.delete('/matches/:mid', requireRole('admin'), matchController.deleteMatch);

//  TOURNAMENTS 
// GET
apiV1Router.get('/tournaments', tournamentController.getAllTournaments);
apiV1Router.get('/tournaments/:tid', tournamentController.getTournamentById);
apiV1Router.get('/tournaments/:tid/standings', tournamentController.getTournamentStandings);
apiV1Router.get('/tournaments/:tid/matches', tournamentController.getTournamentMatches);
apiV1Router.get('/tournaments/:tid/comments', commentController.getTournamentComments);
// POST create
apiV1Router.post('/tournaments', requireRole('admin'), tournamentController.createTournament);
// POST join / leave
apiV1Router.post('/tournaments/:tid/join', requireRole('registered', 'admin'), tournamentController.joinTournament);
apiV1Router.post('/tournaments/:tid/leave', requireRole('registered', 'admin'), tournamentController.leaveTournament);
// POST knockout bracket
apiV1Router.post('/tournaments/:tid/pairings', requireRole('admin'), tournamentController.generatePairing);
apiV1Router.post('/tournaments/:tid/advance', requireRole('admin'), tournamentController.advanceTournament);
// POST arena
apiV1Router.post('/tournaments/:tid/arena-start', requireRole('admin'), tournamentController.startArenaTournament);
apiV1Router.post('/tournaments/:tid/arena-advance', requireRole('admin'), tournamentController.advanceArenaTournament);
// POST arena match result
apiV1Router.post('/tournaments/:tid/arena-result', requireRole('registered', 'admin'), tournamentController.recordArenaMatchResult);
// PATCH / DELETE
apiV1Router.patch('/tournaments/:tid', requireRole('admin'), tournamentController.updateTournament);
apiV1Router.delete('/tournaments/:tid', requireRole('admin'), tournamentController.deleteTournament);

//  COMMENTS -
// GET all comments
apiV1Router.get('/comments', requireRole('admin'), commentController.getAllComments);
// POST
apiV1Router.post('/tournaments/:tid/comments', requireRole('registered', 'admin'), commentController.createTournamentComment);
// DELETE own; DELETE any
apiV1Router.delete('/comments/:cid', requireRole('registered', 'admin'), commentController.deleteComment);
apiV1Router.delete('/comments/:cid/admin', requireRole('admin'), commentController.deleteCommentAdmin);

//  LEADERBOARDS 
apiV1Router.get('/leaderboards', leaderboardController.getGlobalLeaderboard);
apiV1Router.get('/leaderboards/user/:uid', leaderboardController.getUserRank);
apiV1Router.get('/leaderboards/type', leaderboardController.getLeaderboardByUserType);
apiV1Router.get('/leaderboards/weekly', leaderboardController.getWeeklyLeaderboard);
apiV1Router.get('/leaderboards/top', leaderboardController.getTopPlayers);
apiV1Router.get('/leaderboards/compare', leaderboardController.comparePlayersStats);

//  TROPHIES -
// GET
apiV1Router.get('/trophies', trophyController.getAllTrophies);
apiV1Router.get('/trophies/:tid', trophyController.getTrophyById);
// POST / DELETE
apiV1Router.post('/trophies/upload', requireRole('admin'), upload.single('image'), trophyController.uploadTrophyImage);
apiV1Router.post('/trophies', requireRole('admin'), upload.single('image'), trophyController.createTrophy);
apiV1Router.delete('/trophies/:tid', requireRole('admin'), trophyController.deleteTrophy);

//  MATCHMAKING 
// POST join
apiV1Router.post('/matchmaking/join', requireRole('registered', 'admin'), matchmakingController.joinQueue);
// DELETE leave
apiV1Router.delete('/matchmaking/leave', requireRole('registered', 'admin'), matchmakingController.leaveQueue);
// GET status (poll for match result)
apiV1Router.get('/matchmaking/status/:uid', requireRole('registered', 'admin'), matchmakingController.getQueueStatus);
// GET queue snapshot
apiV1Router.get('/matchmaking/queue', requireRole('admin'), matchmakingController.getQueueSnapshot);

//  PLATFORM STATS 
apiV1Router.get('/stats/platform', userController.getPlatformActivity);

//  ADMIN 
apiV1Router.get('/admin/users', requireRole('admin'), userController.searchUsers);
apiV1Router.patch('/admin/users/:uid/ban', requireRole('admin'), userController.banUser);

export default apiV1Router;