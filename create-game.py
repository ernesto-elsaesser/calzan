import sys
import json
import random
from firebase_admin import initialize_app, credentials, db

cred = credentials.Certificate('creds.json') # NOTE: not checked in
app = initialize_app(cred, {'databaseURL': "https://calzan-default-rtdb.europe-west1.firebasedatabase.app/"})

game = sys.argv[1]
players = sys.argv[2].split(',')
if len(sys.argv) > 3:
    random.shuffle(players)

seed = random.randrange(2 ** 32)

with open("board.json") as json_file:
    board = json.load(json_file)

db.reference(game).set({
    'seed': seed,
    'players': players,
    'board': board,
})

print(f"created game {game} with players {players} and seed {seed}")
