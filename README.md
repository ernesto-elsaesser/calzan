## Contributing

Steps to set up a development environment:

- Clone the repository
- Start a shell and navigate to the '/webpage' subfolder
- Run `python -m http.server` to start a local HTTP server
- Ask for a development game in the database - you will get:
    - the name of the game (e.g. "dev1")
    - a list of players (e.g. "John", "Clara", "Mike")
- Open a browser and navigate to http://localhost:8000/?game=dev1&player=Clara (for example)
    - if the Python command prints out a different port, use that port instead
    - create one tab for each player so that you can solo-test the game
- Start testing and making changes
- To have changes merged into the master branch, create merge requests