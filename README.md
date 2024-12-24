# Funkyscout

Team 846's scouting app for the 2025 season

---

## Preface

Funkyscout is a React app with a desktop data analysis dashboard and mobile PWA
written in Typescript. Supabase hosts the database and handles authentication.

## Development

You can run your own instance of Funkyscout in a few relatively simple steps.

### Setting up the database

Only do this if you are starting from scratch and are planning on running your
own instance of Funkyscout.

Create a Supabase account and create an access token, then in the `/setup`
folder, create a `.env` file (see the example), and run the `main.py` setup
script.

If this does not work for you, you can also set up a new project for Funkyscout
through the Supabase CLI by running the following command in the `/supabase`
folder, which will run the `init.sql` migration.

```
supabase db reset --linked --noseed
```

After you create the project, either through the setup script or through the
Supabase CLI, you will need to create a custom auth token hook by going to the
Supabase dashboard, `Authentication > Hooks` and adding a new hook for the
function of the same name.

### Pre-existing DB

Do this if a Supabase project for Funkyscout is already setup. Run the following
commands once Node.js is installed in the `/client` folder.

```
npm install
npm run dev
```

You will now need to create a .env (see the example) file in `/client` with the
database URL and anon key, which can be found on the Supabase dashboard.
