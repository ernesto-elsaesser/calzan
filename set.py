import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

cred = credentials.Certificate('serviceAccountKey.json')

firebase_admin.initialize_app(cred, {
    'databaseURL': "https://calzan-default-rtdb.europe-west1.firebasedatabase.app/"
})

board = r"""
    x                  
    ..                 
    +-+                
    |  \               
e.+-+ W +-+ s          
 .|  \3-|  \           
+-+ L +-+ H +-+        
|  \5-|  \1-|  \       
+ S +-+ H +-+ W +      
 \2 |  \2-|  \2 |      
w.+-+ L +-+ S +-+.x    
 .|  \1 | *\5 |  \.    
  + H +-+   +-+ S +    
   \4-|  \  |  \3-|    
    +-+ E +-+ E +-+    
    |  \2-|  \1 |  \   
    + W +-+ L +-+ S +  
    .\4-|  \3 |  \3 |. 
    x.+-+ W +-+ H +-+.x
         \1-|  \4 |    
          +-+ E +-+    
           ..\4 |..    
            h +-+ l    
0              HLWSE
red            00000
blue           00000
purple         00000
pink           00000
"""

db.reference('/game').set(board)
