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
   .|  \ h|  \           
  +-+ L +-+ H +-+        
  |  \ f|  \ j|  \       
  + S +-+ H +-+ W +      
   \ m|  \ i|  \ m|      
  w.+-+ L +-+ S +-+.x    
   .|  \ l|* \ p|  \.    
    + H +-+ X +-+ S +    
     \ g|  \  |  \ h|    
      +-+ E +-+ E +-+    
      |  \ i|  \ l|  \   
      + W +-+ L +-+ S +  
      .\ g|  \ n|  \ n|. 
      x.+-+ W +-+ H +-+.x
           \ j|  \ o|    
            +-+ E +-+    
             ..\ o|..    
              h +-+ l    
                         
                         
d              HLWSE
red            00000
blue           00000
purple         00000
pink           00000
"""

db.reference('/game').set(board)
