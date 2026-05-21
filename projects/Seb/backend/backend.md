# Put here your backend for the Spanish Poker Dice Platform

The backend should largely be a copy from Oblig 2. If something is changed, mention it here.  
  
- I had to enable CORS, since it was blocking requests from my frontend    
    - See server.js (Lines: 2, 17)    
  
- Bugfix: Duplicate self join (Same player could join the same game twice (As player 1 & player 2))    
    - See match.controller.js (Lines: 692-700)  

- Bugfix: Added missing 'timePerRound' on a POST/PATCH request. Aswell as game model and game category seed
    - See POST.http (Line 85)
    - See PATCH.http (Line 106)
    - See game.js (Line 26)
    - See game-categories.json (Last line of every entry)

- Bugfix: Fixed timePerRound validation in game category validation using wrong times. Also fixed in API documention
    - See gameCategory.validator.js (Lines 50, 54, 74, 78)
    - See apiDocumentation.md (Line 123)

- Expanded user Schema to fully support the requirements for the frontend  
    - See users.js (Lines 43-51)  

- Expanded match Schema for "allow anonymous players" and min/max elo
    - See match.js (Lines 56-71)

- Updated user controller to fully support editing requirements
    - See user.controller.js (Lines 136-212)

- Updated user controller to support for oneMonthAgo
    - See user.controller.js (Lines 345-347, 353-362, 373-374)

- Updated match validator to support anonymous player toggle, and min/max elo
    - See match.validator.js (Lines 17, 36-71)

- Updated match controller to support anonymous player toggle and min/max elo
    - See match.controller.js (createMatch() -> Lines 106-111, 194-196, 207-208)
    - See match.controller.js (joinMatch() -> Lines 705-726)

- Expanded user Schema and user controller to support saving appearance settings
    - See users.js (Lines 52-70)
    - See user.controller.js (Lines 147, 194)

- Added README.md (Quick guide on how to install and run the backend)

Leave in this file any comments that you want us to read.
