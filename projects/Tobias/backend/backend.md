# Put here your backend for the Spanish Poker Dice Platform

The backend should largely be a copy from Oblig 2. If something is changed, mention it here.

Leave in this file any comments that you want us to read.

## Changes:
- Added CORS middleware to allow requests from the frontend
- Increased rate limit from 100 to 1000 requests per 15 minutes (for development)
- Added includeStraights filter support to GET /matches endpoint
- Fixed bug where a user could join their own match (match.services.js)
- Added GET /matches/:mid/comments endpoint to fetch comments for a match
- Added aboutMe field to user model and validateUserUpdate validator
- Added profilePicture field to user model
- Added PATCH /users/:uid/image endpoint for profile picture upload (multer)
- Added express.static middleware to serve uploaded images from uploads/ folder
- Updated seed.js with 6 users, 10 finished matches with automatic ELO updates via saveMatchResult, and 12 pending matches for lobby testing
- Seed uses random winner selection (50/50) per match so ELO ratings vary between runs
- Added appearance field to user model (darkMode, boardColor, soundOn, lobbyCount)
- Added appearance fields to validateUserUpdate validator
- Added GET /users/:uid/stats endpoint returning wins and losses for the last 30 days
- Added getUserMatchStats function to match.services.js and getMatchStats to match.controller.js
- Changed timeControl enum from [3, 5, 7] to [3, 10, 30] in Match model, Tournament model, match validator, and seed.js to match assignment specification
- Added allowAnonymous field (Boolean, default: true) to Match model and match validator
- Added eloMin and eloMax fields (Number, default: null) to Match model and match validator for desired opponent ELO filtering (±100 range)
- Fixed bug in createMatch (match.services.js) where alreadyActive variable was declared inside an if-block but used outside, causing a ReferenceError
- Updated getAllMatches in match.services.js to accept a uid parameter: registered users only see matches within their ELO range, anonymous users only see matches where allowAnonymous is not false
- Updated getAllMatches in match.controller.js to parse uid from query params and pass to service
- Added isGuest field (Boolean, default: false) to User model to distinguish guest users from registered users
- Added createGuestUser function to user.services.js that creates a user with generated username (Guest_XXXXX) and dummy credentials
- Added createGuestUser to user.controller.js to handle the HTTP request
- Added POST /users/guest endpoint to user.router.js allowing anonymous users to join games that allow anonymous players

