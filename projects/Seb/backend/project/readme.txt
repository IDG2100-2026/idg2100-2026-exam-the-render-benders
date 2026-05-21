## .ENV ##
If you use the Github version, .env is not included.
I wasn't sure if I was supposed to push it or not, however it is included in the .zip uploaded to Blackboard.

If you use your own .env file, make sure it's located under `project/.env` (Same location as this readme.txt file).
Make sure it also has the following variables:
- SERVER_PORT
- DB_HOST
- DB_PORT
- DB_NAME


## Copied code from Wikipedia ##
In the `project/controllers/tournament.controller.js` file, there's a code snipped that I have copied from Wikipedia.
Lines in question: 490-499
As mentioned as comments, this shuffle function was copied from:
https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#JavaScript_implementation
