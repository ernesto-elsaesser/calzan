import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

cred = credentials.Certificate('serviceAccountKey.json')

firebase_admin.initialize_app(cred, {
    'databaseURL': "https://calzan-default-rtdb.europe-west1.firebasedatabase.app/"
})

board = r"""
                                x                
                                . .              
                                + - +            
                              /     |            
                    e . + - +   W   + - + . s    
                    . /     |   4 /     | .      
                + - +   L   + - +   H   + - +    
              /     |   2 /     |   6 /     |    
            +   S   + - +   H   + - +   W   +    
            |   9 /     |   5 /     |   9 /      
        w . + - +   L   + - +   S   + - + . x    
        . /     |   8 /  *  |  12 /     | .      
        +   H   + - +   X   + - +   S   +        
        |   3 /     |     /     |   4 /          
        + - +   E   + - +   E   + - +            
      /     |   5 /     |   8 /     |            
    +   W   + - +   L   + - +   S   +            
  . |   3 /     |  10 /     |  10 / .            
x . + - +   W   + - +   H   + - + . x            
        |   6 /     |  11 /                      
        + - +   E   + - +                        
        . . |  11 / . .                          
        h   + - +   l                            
                                                 
                                                 
  HLWSE
1#00000
2 00000
3 00000
4 00000
"""

db.reference('/state').set(board[1:])
