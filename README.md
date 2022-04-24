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
- Open a browser and navigate to http://localhost:8000
    - 8000 is the default port for Python's built-in HTTP server, adjust accordingly
- Create a new game using the presented form
- Open one tab for each player to solo-test the game
    - the easiest way is to shift-click the undelined player names in the top left corner
- Start testing!

To contribute, create a new branch and commit your changes to it.
When done, create a pull/merge request to have the changes merged into the `main` branch.