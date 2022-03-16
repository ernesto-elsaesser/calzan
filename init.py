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

config = [
  ("Stroh", 4, 0, 2),
  ("Holz", 6, 0, 4),
  ("Stroh", 9, 0, 6),
  ("Lehm", 2, 1, 1),
  ("Holz", 5, 1, 3),
  ("Schafe", 12, 1, 5),
  ("Schafe", 4, 1, 7),
  ("Schafe", 9, 2, 0),
  ("Lehm", 8, 2, 2),
  ("Sand", 0, 2, 4),
  ("Granit", 8, 2, 6),
  ("Schafe", 10, 2, 8),
  ("Holz", 3, 3, 1),
  ("Granit", 5, 3, 3),
  ("Lehm", 10, 3, 5),
  ("Holz", 11, 3, 7),
  ("Stroh", 3, 4, 2),
  ("Stroh", 6, 4, 4),
  ("Granit", 11, 4, 6),
]

tiles = []

for land, num, y, x in config:
    tiles.append({
        "type": land,
        "num": num,
        "x": x,
        "y": y,
        "above": {"color": "", "city": False},
        "below": {"color": "", "city": False},
        "upright": {"color": ""},
        "right": {"color": ""},
        "lowright": {"color": ""},
    })

data = {
    'dice': 0,
    'tiles': tiles,
    'players': players,
}

db.reference('/').set(data)
