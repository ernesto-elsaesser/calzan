import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

COLORS = ['red', 'blue', 'yellow', 'lime']

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
    "Erz": 0,
    "Siegpunkte": 0,
  }

config = [
  ("Meer", 0, 0, 3),
  ("Meer", 0, 0, 5),
  ("Meer", 0, 0, 7),
  ("Meer", 0, 0, 9),

  ("Meer", 0, 1, 2),
  ("Stroh", 4, 1, 4),
  ("Holz", 6, 1, 6),
  ("Stroh", 9, 1, 8),
  ("Meer", 0, 1, 10),

  ("Meer", 0, 2, 1),
  ("Lehm", 2, 2, 3),
  ("Holz", 5, 2, 5),
  ("Schafe", 12, 2, 7),
  ("Schafe", 4, 2, 9),
  ("Meer", 0, 2, 11),

  ("Meer", 0, 3, 0),
  ("Schafe", 9, 3, 2),
  ("Lehm", 8, 3, 4),
  ("Sand", 0, 3, 6),
  ("Erz", 8, 3, 8),
  ("Schafe", 10, 3, 10),
  ("Meer", 0, 3, 12),

  ("Meer", 0, 4, 1),
  ("Holz", 3, 4, 3),
  ("Erz", 5, 4, 5),
  ("Lehm", 10, 4, 7),
  ("Holz", 11, 4, 9),
  ("Meer", 0, 4, 11),

  ("Meer", 0, 5, 2),
  ("Stroh", 3, 5, 4),
  ("Stroh", 6, 5, 6),
  ("Erz", 11, 5, 8),
  ("Meer", 0, 5, 10),

  ("Meer", 0, 6, 3),
  ("Meer", 0, 6, 5),
  ("Meer", 0, 6, 7),
  ("Meer", 0, 6, 9),
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
        "bandit": land == 'Sand',
    })

data = {
    'dice': 0,
    'tiles': tiles,
    'players': players,
}

db.reference('/').set(data)
