import os

def confirm(message):
    response = input(f"{message}").strip().lower()
    if response in ("y"):
        return True
    else:
        return False
        
def clear():
    os.system('cls||echo -e \\\\033c')
        