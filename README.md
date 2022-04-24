## Contributing

Steps to set up a development environment:

- Clone the repository
    - run `git clone https://github.com/ernesto-elsaesser/calzan.git`
- Start a shell and navigate to the webpage subfolder
    - run `cd calzan/webpage`
- Start a local HTTP server to host the page
    - run `python -m http.server`
    - on macOS and Linux Python is pre-install
    - on Windows, install it from https://www.python.org/ (or use any other HTTP server)
- Ask for a development game in the database - you will get:
    - the name of the game (e.g. "dev1")
    - a list of players (e.g. "John", "Clara", "Mike")
- Open a browser and navigate to http://localhost:8000/?game=dev1&player=Clara (for example)
    - use the port on which your local server in listening
    - use the game and player names given to you
    - create one tab for each player so that you can solo-test the game
- Start testing
- Create a new branch to make changes
- Create a merge request to have your changes merged into the master branch