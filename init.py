import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

COLORS = ['red', 'blue', 'purple', 'pink']

cred = credentials.Certificate('serviceAccountKey.json')

firebase_admin.initialize_app(cred, {
    'databaseURL': "https://calzan-default-rtdb.europe-west1.firebasedatabase.app/"
})

players = {}
for color in COLORS:
    players[color] = {
        'res': {'Holz': 0, 'Lehm': 0, 'Stroh': 0, 'Schafe': 0, 'Erz': 0},
        'towns': [],
        'roads': [],
    }

  # TODO remove
players['red']['towns'].append({'x': , 'y':, 'city': False})

  (0, 0, 'town', {'color': 'red'}),
  (0, 0, 'city', {'color': 'blue'}),
roads = [
  (0, 0, 'road', {'color': 'purple', }),
  (0, 0, 'road', {'color': 'pink'}),
]

  }

config = [
  (0, 0, 'tile', {'res': 'Sand'}),
  (0, 0, 'bandit', {}),

  (1, -1, 'tile', {'res': 'Schafe', 'roll': 12}),
  (2, 1, 'tile', {'res': 'Erz', 'roll': 8}),
  (1, 2, 'tile', {'res': 'Lehm', 'roll': 10}),
  (-1, 1, 'tile', {'res': 'Erz', 'roll': 5}),
  (-2, -1, 'tile', {'res': 'Lehm', 'roll': 8}),
  (-1, -2, 'tile', {'res': 'Holz', 'roll': 5}),

  (2, -2, 'tile', {'res': 'Stroh', 'roll': 9}),
  (3, 0, 'tile', {'res': 'Schafe', 'roll': 4}),
  (4, 2, 'tile', {'res': 'Schafe', 'roll': 10}),
  (3, 3, 'tile', {'res': 'Holz', 'roll': 11}),
  (2, 4, 'tile', {'res': 'Erz', 'roll': 11}),
  (0, 3, 'tile', {'res': 'Stroh', 'roll': 6}),
  (-2, 2, 'tile', {'res': 'Stroh', 'roll': 3}),
  (-3, 0, 'tile', {'res': 'Holz', 'roll': 3}),
  (-4, -2, 'tile', {'res': 'Schafe', 'roll': 9}),
  (-3, -3, 'tile', {'res': 'Lehm', 'roll': 2}),
  (-2, -4, 'tile', {'res': 'Stroh', 'roll': 4}),
  (0, -3, 'tile', {'res': 'Holz', 'roll': 6}),

  (-2, -5, 'port', {}),
  (-3, -5, 'port', {}),
  (-3, -6, 'trade', {'rate': 3}),

  (0, -4, 'port', {}),
  (1, -3, 'port', {}),
  (1, -4, 'trade', {'rate': 2, 'res': 'Schafe'}),

  (3, -1, 'port', {}),
  (4, 0, 'port', {}),
  (4, -1, 'trade', {'rate': 3}),

  (5, 2, 'port', {}),
  (5, 3, 'port', {}),
  (6, 3, 'trade', {'rate': 3}),

  (3, 4, 'port', {}),
  (4, 4, 'port', {}),
  (4, 5, 'trade', {'rate': 2, 'res': 'Lehm'}),

  (0, 4, 'port', {}),
  (1, 4, 'port', {}),
  (1, 5, 'trade', {'rate': 2, 'res': 'Holz'}),

  (-3, 2, 'port', {}),
  (-2, 3, 'port', {}),
  (-3, 3, 'trade', {'rate': 3}),

  (-4, 0, 'port', {}),
  (-4, -1, 'port', {}),
  (-5, -1, 'trade', {'rate': 2, 'res': 'Stroh'}),

  (-4, -3, 'port', {}),
  (-4, -4, 'port', {}),
  (-5, -4, 'trade', {'rate': 2, 'res': 'Erz'}),
]

tokens = [{"x": x, "y": y, "t": t, "a": a} for x, y, t, a in config]

data = {
    'players': players,
    'dice': 0,
    'tokens': tokens,
}

db.reference('/').set(data)
