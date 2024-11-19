import requests
import utils
import os
import time
from rich import print
from rich.console import Console
from dotenv import load_dotenv

load_dotenv()

SUPABASE_ACCESS_TOKEN = os.getenv("SUPABASE_ACCESS_TOKEN")
DATABASE_SLUG = None
PROJECT_SLUG = None

console = Console()


def check_db(SUPABASE_ACCESS_TOKEN, project_name, mode=None):
    global DATABASE_SLUG
    global PROJECT_SLUG

    if not (SUPABASE_ACCESS_TOKEN):
        print("Could not find Supabase access token")
        return False

    with console.status(
        f"Connecting to Supabase with key '{SUPABASE_ACCESS_TOKEN[:5]}...{SUPABASE_ACCESS_TOKEN[-5:]}'"
    ):
        organizations_response = requests.get(
            "https://api.supabase.com/v1/organizations",
            headers={"Authorization": f"Bearer {SUPABASE_ACCESS_TOKEN}"},
        )

    if not organizations_response.status_code == 200:
        print("Could not connect to Supabase; Check connection.")
        return False

    print("Successfully connected to Supabase!")

    organizations = organizations_response.json()

    existing_org_id = next(
        (org["id"] for org in organizations if org["name"] == project_name), None
    )

    if existing_org_id:
        if mode == "find":
            DATABASE_SLUG = existing_org_id
            print(f"Found organization '{DATABASE_SLUG[:5]}...'")

            with console.status(f"Searching for project in '{DATABASE_SLUG[:5]}...'"):
                projects_response = requests.get(
                    "https://api.supabase.com/v1/projects",
                    headers={"Authorization": f"Bearer {SUPABASE_ACCESS_TOKEN}"},
                )

            projects = projects_response.json()

            existing_project_id = next(
                (
                    project["id"]
                    for project in projects
                    if project["organization_id"] == DATABASE_SLUG
                    and project["name"] == project_name
                ),
                None,
            )

            PROJECT_SLUG = existing_project_id
            print(f"Found project '{PROJECT_SLUG[:5]}...'")

            return True
        if utils.confirm(
            f"A project named {project_name} already exists, continue? [y/n] "
        ):
            DATABASE_SLUG = existing_org_id
            print(f"Using organization '{DATABASE_SLUG[:5]}...'")
            return True
        else:
            return False
    else:
        return True


def create_organization():
    global DATABASE_SLUG

    with console.status("Creating Supabase organization..."):
        organization = requests.post(
            "https://api.supabase.com/v1/organizations",
            headers={
                "Authorization": f"Bearer {SUPABASE_ACCESS_TOKEN}",
            },
            json={"name": "funkyscout"},
        )

    if not organization.status_code == 201:
        print(f"An error occured: [red]{organization.status_code}")
    else:
        print(f"Created an organization: '{organization.json()["id"][:5]}...'")

    DATABASE_SLUG = organization.json()["id"]


def create_project():
    global DATABASE_SLUG
    global SUPABASE_ACCESS_TOKEN

    utils.clear()

    if not (
        utils.confirm(
            "This command will create a Supabase organization and project for Funkyscout. Continue? [y/n] "
        )
    ):
        utils.clear()
        return False

    if not (check_db(SUPABASE_ACCESS_TOKEN, "funkyscout")):
        return False

    if not DATABASE_SLUG:
        create_organization()

    print("Creating Supabase project...")

    project_password = input("Enter a password for this Funkyscout project: ")

    print("Select a region (Refer to Supabase docs for more options)")
    print("(1) us-west")
    print("(2) us-east")
    print("(3) eu-west")

    match input("Region (1-3): "):
        case "1":
            project_region = "us-west-1"
        case "2":
            project_region = "us-east-1"
        case "3":
            project_region = "eu-west-1"

    with console.status(f"Creating project in {project_region}..."):
        organization = requests.post(
            "https://api.supabase.com/v1/projects",
            headers={
                "Authorization": f"Bearer {SUPABASE_ACCESS_TOKEN}",
            },
            json={
                "name": "funkyscout",
                "organization_id": DATABASE_SLUG,
                "region": project_region,
                "db_pass": project_password,
            },
        )

    if not organization.status_code == 201:
        print(f"An error occured: [red]{organization.status_code}")
        return utils.confirm("\n Press a key to return to menu.")
    else:
        print(f"Created an project: '{organization.json()["id"][:5]}...'")
        return utils.confirm("\n Press a key to return to menu.")


def create_database():
    utils.clear()

    if not (
        utils.confirm(
            "This command will attempt to run the setup migration file, and may cause data to be lost.\nIt will also not work if you ran it already. Continue? [y/n] "
        )
    ):
        utils.clear()
        return False

    check_db(SUPABASE_ACCESS_TOKEN, "funkyscout", "find")

    if not PROJECT_SLUG:
        print("Could not find Funkyscout project, did you run setup first?")

    migration_file = open("supabase/migrations/2024_init.sql", "r").read()
    print(f"Found migration file {len(migration_file)} characters long")

    run_query(migration_file, 3)


def run_query(file, attempts):
    if not attempts > 0:
        print(
            "All attempts failed; Maybe you're being rate-limited?\n Try again later."
        )
        return

    with console.status("Running migration query..."):
        query_response = requests.post(
            f"https://api.supabase.com/v1/projects/{PROJECT_SLUG}/database/query",
            headers={
                "Authorization": f"Bearer {SUPABASE_ACCESS_TOKEN}",
            },
            json={"query": file},
        )

    if not query_response.status_code == 201:
        with console.status(
            f"Error occured: [{query_response.status_code}]; Retrying in {int((1/attempts) * 15 * 2) / 2}s"
        ):
            time.sleep((1 / attempts) * 15)
        run_query(file, attempts - 1)
    else:
        return utils.confirm("Successfully run query.\n Press a key to return.")
