[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/cGnXdH64)
# IDG2100 2026 Obligatory Assignment #3: Front-End Development

This document describes the task of the obligatory assignment #3 for IDG2100, year 2026.

## Goals

Demonstrate that you:

- Understand the principles and best practices of front-end Web development
- Can choose a suitable architecture for a front-end of a Web app
- Can develop a Web application front-end using the `React` library
- Know the principles and best practices of `React` development, including
  - Appropriate break-down of User Interfaces in `React` components
  - Creating components that are re-usable, including styling them appropriately
  - Structuring a `React` app in appropriate layers, modules, and consequently, folders
  - Passing data in components using props, context, and if necessary, global state libraries (e.g., `Redux`)
  - Appropriately storing and updating component state
  - Robustly handling data fetching and saving to backend, including network delays and errors
  - Appropriately responding to user actions and other events
- Understand client-side routing with the `React Router` library

## Context

This is an **individual assignment** and a continuation of the task presented in the Obligatory Assignment #2. The `backend` folder should contain the API you developed earlier for Oblig 2. If you modify the backend code, the modifications should be clearly acknowledged in the backend `readme.txt` and be visible as separate Git commits (on top of the 'baseline' version you delivered in Oblig 2).

This assignment has two parts: **a coding component** and an **on campus oral presentation**. You must submit your code via both GitHub and Blackboard. The details regarding the dates and requirements for the physical oral presentation will be posted on Blackboard. Not attending the physical oral presentation will result in a non-passing grade.

Although, you may utilize snippets of code from tutorials or official documentation, you must clearly acknowledge the sources in the comments of your code. Plagiarism or cheating will be deemed to have taken place if the submitted code shows substantial similarities to other students' assignments or projects found online. In such cases, the matter will be reported to the NTNU appeals committee for further examination. If you have any doubts regarding the use of materials for your project, please reach out to the instructor for clarification.

If the assignment is graded as "not approved" you will have an additional opportunity based on the following conditions:

- The first version of the project must have been delivered within the set deadline (never after);
- The project must consist on a significant piece of work (i.e.: do not deliver an empty assignment);

For the second attempt you will receive a very short deadline to fix your project.

## Delivery

This assignment must be delivered in two different places: GitHub classroom and Blackboard.

- To deliver the assignment in GitHub Classroom, you only need to make sure all your changes and commits are pushed to your Git repository.
  - A Pull request is created automatically when the repository is cloned. Feedback will be included there if needed. Do not remove or close that Pull Request.
  - Only the changes in the "main" branch will be considered for giving feedback or grading the assignment.

- It is imperative that you work exclusively with this Git repository to ensure that all modifications are trackable and your code is backed up on a regular basis. Hence, you should commit your progress directly to this repository each time you make advancements.

- Before delivering the assignment in Blackboard, make sure your project has all the files it needs. Delete all files and folders that are not needed (this is `.git/` folder, `node_modules`, etc.). Zip the project and upload the file to Blackboard. 

- Don't forget to add/update all the `API` specs in `documentation` and your query collection in the `REST scripts` folder, if needed.

- Remember you will have to present your project orally and on campus (the date to be posted on BB).

## Project: Front-End for an Online Platform to Play Spanish Poker Dice

### Scenario

Imagine that you are the team working on the front-end for the Spanish poker dice platform. The back-end team started working on the API for it before user research and design was finished and did their best to create endpoints that you might need, but now they are no longer available to modify their code. If you need endpoints modified or added, you will have to do it yourself.

The upcoming project sprint requires you to implement the UI for **anonymous** and **regular** logged-in users, but not for platform **moderators**, which means that you do **not** need to implement:

- tournament creation
- platform performance overview
- reviewing suspected cheater cases
- reviewing and moderating comments on games and tournaments
- user banning
- creation of posts for the `news` section

Authentication (logging in and registration) should only be partially implemented: the pages and components should be implemented, but cookie/token verification and refreshing do **not** have to be implemented (login always succeeds).

The functionality for real-time playing games, real-time watching games, and real-time seeing comments on games and tournaments (i.e., everything that requires [Web Sockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) to implement properly) does **not** have to be implemented in this sprint.

Each game (and game-related tournament) are presumed to be one of 18 variants, based on three options: best of 3/5/7 (how many rounds per game), straights allowed/not allowed, and 3/10/30 seconds per round.

### Platform Structure

The platform should have the following pages:

- **Homepage** introduces the 1st-time visitors to the game, shows an overview of platform activity, and allows for quickly starting a game. It should contain:
  - brief message describing the game and platform (no more than a couple of sentences)
  - prominent button (or a set of suitable controls) to create a new game
  - lobby preview: a list of N games available for joining (the N is customizable). Clicking on a game should open the game's page and automatically have the user join it. Each record in the list should detail the game's variant and show other player(s) username(s) and average Elo rating.
  - top 5 games: a list of currently running 5 games with the highest average Elo of players. Clicking on a game should open the game's page. Each record in the list should detail the game's variant and show players' usernames and average Elo rating. If less than 5 games are currently running, the component should include past games (most recent).
  - tournament list preview: a list of 5 upcoming tournaments (5 tournaments closest to the current date/time). Clicking on a tournament should open the tournament's page. Each record in the list should detail the tournament's date/time and game variant, and show how many players have signed up.
- **Lobby** page lists games that the player can join, i.e., the games that have not started yet because they do not have enough players and are available for the viewing user to join. Only the games that the user can join should be shown: anonymous users should not see the games they can't join (if it was created by a registered user and the user chose to not allow anonymous users to join); registered users should not see the games not suitable for their Elo rating. The appearance of the list can be similar to the Lobby Preview components on the Homepage, but can also be more detailed.
- **Create game** page allows for creating a game. A newly created game is automatically added into the lobby and the player is matched with an appropriate another player (or players as some games may require more than 1 player). The page contains a single form that allows for choosing the variant of the game (three different sub-components), allowing/not-allowing for anonymous users to join the game (only available to registered users), and desired Elo of the opponent.
- **Individual game** page is the central piece of the platform. If the user created this game, they are automatically added as one of the players. If not enough players have joined the game, its status is shown as "waiting for other players" (e.g., as an overlay on top of the dice board area). The page is refreshed every 15 seconds to check if somebody joined the game (no Web Sockets in this sprint - unless you choose to implement them). Non-participating users can view the game and leave/view comments. The page should include:
  - Game board, with names and Elo ratings of participating players. The area for the actual game should be reserved, but not implemented yet in this sprint.
  - Side bar with comments and text field with a button to leave a comment. Each comment shows the name of the user, date/time, and comment text.
- **Tournament list** page lists upcoming tournaments. The list can be implemented as a table, grid or tiles. The info on the list should include all the info from the Tournament Preview component on the homepage, and potentially, extra information (e.g., tournament full title and what kind of trophies are awarded).
- **Individual tournament** page details a tournament. The info should include:
  - Full title
  - Full description
  - Date/Time
  - Tournament format (game variant and any other rule, e.g., if it's open to specific geographic areas only and/or only certain Elo ranges)
  - Tournament trophies (an image/title of a trophy/badge that will be shown on the winner's profile page)
  - List of participants that clicked "join tournament"
  - The list of comments and controls to leave comments should be at the bottom of the page.
- **Logging in** page should include a form to log in: username, password, and "forgot password" button to reset the password (resetting password does not have to be implemented in this sprint).
- **Registration** page should include a form to register: username, password, password repeat, data of birth (adults only), email, and "I agree to terms and conditions" checkbox.
- **Individual user profile** page should show - and allow for editing - a user profile image, username (not editable), email (to the user themselves only), and about me description. The user's password should be editable, but not shown. The page should also show:
  - list of user's trophies (and other awards if the system has them)
  - user stats: Elo rating in the three time controls, number of played games, number of losses/wins in the last month
  - list of user's last 10 games
  - link to another page to view all user's games
- **About Us** page should introduce the platform. Feel free to be imaginative and make up the history of the platform.
- **About Spanish Dice** page should describe the game. Texts should not be copy-pasted directly. Images can be borrowed without copyright violations.
- **Terms and Conditions** and **Privacy Policy** pages can be generated using one of existing free generators online.

### Extra Components

All pages (with a possible exception of Login/Registration) should have a header and footer. The header should include a platform logo, a navigation menu (e.g., with links to Lobby, Tournaments, and About Spanish Poker Dice), a component to customize platform appearance, a greeting component, and other suitable components.

The platform appearance component (e.g., as an expandable menu, whole-page overlay, or something else) should allow for customizing platform appearance. This info - user preferences on platform appearance - should be saved to both backend (for registered users) and browser's [local storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) (for both registered and anonymous users). The appearance preferences have to be applied to all pages. Appearance features should include at least:

- light/dark theme toggle
- color picker (a predefined, limited set of colors is okay) for the background of game board
- sound on/off toggle (having the sound itself does not have to be implemented in this iteration)
- slider (can also be radio buttons) to adjust the number of in-lobby games shown on the homepage

The greeting component should - for registered users - say "Hello, [username]", show a profile icon (a small version of user's profile image or default icon if none was uploaded), have a link to the user profile page and a button to log out. For anonymous users, the component should show the links to log in and registration.

The footer should have the links to the about us, privacy policy, and terms and conditions pages, and a component with the name of the platform, © symbol, and years the platform has existed (from - to).

## Task

- Understand the requirements: Review and understand the project description to ensure you have a clear understanding of what needs to be built.

- Define the User Interface: Sketch out the UI layout (consider creating wireframes in this step), and split it in components. Consider the design and content, the types of components to be used, and the flow of the user interactions.

- Decide if the UI requires you to add or modify the endpoints you've developed for Oblig 2, backend REST API; modify your backend API accordingly.

- Build a functional prototype of the platform using React components. Start with the homepage and continue to build out the other pages. Ensure that the design is responsive, user-friendly, and meets the requirements of the project. Ensure that all components work as expected, and the platform is fully functional.

- Write a good readme file explaining how to install and deploy the application on a local machine. Include a script in the backend to seed the database with some dummy data for testing purposes.

Note: this assignment must include the code of both the front-end and the back-end.
