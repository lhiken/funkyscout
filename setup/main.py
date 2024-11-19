import setup
from rich import print
from rich.panel import Panel

def selectAction():
    print(
        Panel.fit(
            "[red](1) [white]Setup Supabase Project \n[red](2) [white]Setup Supabase DB\n[red](3) [white]Quit",
            title="Funkyscout Setup Utility",
            padding=(1, 3),
        )
    )

    match input("Perform an action (1-2): "):
        case "1":
            setup.create_project()
            selectAction()
        case "2":
            setup.create_database()
            selectAction()
        case "3":
            exit()


selectAction()
