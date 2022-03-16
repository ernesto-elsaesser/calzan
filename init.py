import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

COLORS = ['red', 'blue', 'yellow', 'green']

cred = credentials.Certificate('serviceAccountKey.json')

firebase_admin.initialize_app(cred, {
  'databaseURL': "https://calzan-default-rtdb.europe-west1.firebasedatabase.app/"
})

players = {}
for color in COLORS:
  players[color] = {
    "Holz": 0,
    "Lehm": 0,
    "Stroh": 0,
    "Schafe": 0,
    "Granit": 0,
    "Siegpunkte": 0,
  }

lands = [
  "Stroh", "num": 4, "y": 0, "x": 2 },
  "Holz", "num": 6, "y": 0, "x": 4 },
  "Stroh", "num": 9, "y": 0, "x": 6 },
  "Lehm", "num": 2, "y": 1, "x": 1 },
  "Holz", "num": 5, "y": 1, "x": 3 },
  "Schafe", "num": 12, "y": 1, "x": 5 },
  "Schafe", "num": 4, "y": 1, "x": 7 },
  "Schafe", "num": 9, "y": 2, "x": 0 },
  "Lehm", "num": 8, "y": 2, "x": 2 },
  "Sand", "num": None, "y": 2, "x": 4 },
  "Granit", "num": 8, "y": 2, "x": 6 },
  "Schafe", "num": 10, "y": 2, "x": 8 },
  "Holz", "num": 3, "y": 3, "x": 1 },
  "Granit", "num": 5, "y": 3, "x": 3 },
  "Lehm", "num": 10, "y": 3, "x": 5 },
  "Holz", "num": 11, "y": 3, "x": 7 },
  "Stroh", "num": 3, "y": 4, "x": 2 },
  "Stroh", "num": 6, "y": 4, "x": 4 },
  "Granit", "num": 11, "y": 4, "x": 6 },
]

tiles = []

for land, num in zip(lands, nums):
    tiles.append({
        "type": land,
        "num": num,

tiles = [
  { "type": "Stroh", "num": 4, "y": 0, "x": 2 },
  { "type": "Holz", "num": 6, "y": 0, "x": 4 },
  { "type": "Stroh", "num": 9, "y": 0, "x": 6 },
  { "type": "Lehm", "num": 2, "y": 1, "x": 1 },
  { "type": "Holz", "num": 5, "y": 1, "x": 3 },
  { "type": "Schafe", "num": 12, "y": 1, "x": 5 },
  { "type": "Schafe", "num": 4, "y": 1, "x": 7 },
  { "type": "Schafe", "num": 9, "y": 2, "x": 0 },
  { "type": "Lehm", "num": 8, "y": 2, "x": 2 },
  { "type": "Sand", "num": None, "y": 2, "x": 4 },
  { "type": "Granit", "num": 8, "y": 2, "x": 6 },
  { "type": "Schafe", "num": 10, "y": 2, "x": 8 },
  { "type": "Holz", "num": 3, "y": 3, "x": 1 },
  { "type": "Granit", "num": 5, "y": 3, "x": 3 },
  { "type": "Lehm", "num": 10, "y": 3, "x": 5 },
  { "type": "Holz", "num": 11, "y": 3, "x": 7 },
  { "type": "Stroh", "num": 3, "y": 4, "x": 2 },
  { "type": "Stroh", "num": 6, "y": 4, "x": 4 },
  { "type": "Granit", "num": 11, "y": 4, "x": 6 },
]

data = {
    'dice': 0,
    'tiles': tiles,
    'players': players,
}

db.reference('/').set(data)
