## Contributing

Steps to set up a development environment:

- Clone the repository
    - run `git clone https://github.com/ernesto-elsaesser/calzan.git`
- Start a shell and navigate to the webpage subfolder
    - run `cd calzan/webpage`
- Start a local HTTP server to host the page
    - run `python -m http.server`
    - on macOS and Linux, Python is pre-installed
    - on Windows, install it via https://www.python.org/ftp/python/3.9.12/python-3.9.12-amd64.exe
    - alternatively, use any other HTTP server (really doesn't matter)
- Ask for a development game in the database - you will get:
    - the name of the game (e.g. "dev1")
    - a list of players (e.g. "A", "Clara", "Mike")
- Open a browser and navigate to http://localhost:8000/?game=dev1&player=Clara (for example)
    - use the port on which your local server in listening
    - use the game and player names given to you
    - create one tab for each player so that you can solo-test the game
- Start testing
- Create a new branch to make changes
- Create merge/pull requests to have your changes merged into the `main` branch