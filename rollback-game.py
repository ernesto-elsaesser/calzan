import sys
from firebase_admin import initialize_app, credentials, db

cred = credentials.Certificate('creds.json') # NOTE: not checked in
app = initialize_app(cred, {'databaseURL': "https://calzan-default-rtdb.europe-west1.firebasedatabase.app/"})

game = sys.argv[1]
eventId = int(sys.argv[2])

ref = db.reference(game + "/events")

if eventId == 0:
    ref.delete()
    print(f"deleted all events from game {game}")
else:
    events = ref.get()
    events = events[:eventId]
    ref.set(events)
    print(f"deleted events after #{eventId} from game {game}")