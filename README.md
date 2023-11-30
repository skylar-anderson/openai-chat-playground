# Basic chat + function calling playground

## Getting started

First, install dependencies
`npm install`

Next, setup appropriate values in your `.env.local` file:

```
# From OpenAI
OPENAI_API_KEY=

# From Supabase (only necessary if you are creating embeddings)
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_PASSWORD=
ANON_PUBLIC_KEY=
SERVICE_ROLE_SECRET=

# From GitHub
GITHUB_PAT=
```

If you want to play with semantic code search, you can optionally download and index the vercel/swr library by running the following:

`set -a && source .env.local && npm run embed`

Start your local dev server with

`npm run dev`

### Creating new functions

Add new functions to the `app/api/chat/functions` directory. Then update `app/api/chat/functions.ts` to include your newly added functions to the `availableFunctions` set **and** update the `runFunction` function to invoke your function with the correct arguments.
