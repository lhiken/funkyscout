def confirm(message):
    response = input(f"{message}").strip().lower()
    if response in ("y"):
        return True
    elif response in ("n"):
        return False
    else:
        confirm(message)
        
        