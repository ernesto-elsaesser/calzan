import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

cred = credentials.Certificate('serviceAccountKey.json')

firebase_admin.initialize_app(cred, {
  'databaseURL': "https://calzan-default-rtdb.europe-west1.firebasedatabase.app/"
})

data = db.reference("/").get()

for tileData in data['tiles']:
    tileData['port'] = {
        "type": "",
        "rate": "",
        "top": False,
        "bottom": False,
        "upleft": False,
        "downleft": False,
        "upright": False,
        "downright": False,
        }
    # TODO tiles also downright

db.reference('/').set(data)
