import requests
import utils


def setup(SUPABASE_ACCESS_TOKEN, project_name):
    organizations_response = requests.get(
    "https://api.supabase.com/v1/organizations",
    headers={"Authorization": f"Bearer {SUPABASE_ACCESS_TOKEN}"},
)

    if organizations_response.status_code == 200:
        print("Successfully connected to supabase")

        organizations = organizations_response.json()

        target_organization = next(
        (org["slug"] for org in organizations if org["name"] == "funkyscout"), None
        )
    
        if (utils.confirm(f"A project named {project_name} already exists, continue? [y/n] ")):
            print('yes')
        else:
            print('no')

    else:
        print(
        f"Failed to connect to Supabase: Status code {organizations_response.status_code}"
    )