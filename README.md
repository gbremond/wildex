# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.17.0 create --template minimal --types ts --add prettier eslint vitest="usages:unit,component" tailwindcss="plugins:typography,forms" sveltekit-adapter="adapter:static" --install npm wildex
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Rebuilding the bird list

`static/birds.json` is generated from a [TAXREF release](https://inpn.mnhn.fr/telechargement/referentielEspece/taxref) plus live Wikipedia/IUCN lookups. Get a free token at https://api.iucnredlist.org/, then:

```sh
IUCN_API_TOKEN=<token> node scripts/build-birds.mjs ~/Downloads/TAXREF_v18_2025
```

## PWA icons

Icons in `static/` are generated from `static/favicon.svg` with [`@vite-pwa/assets-generator`](https://vite-pwa-org.netlify.app/assets-generator/). Regenerate them after changing the source SVG:

```sh
npx @vite-pwa/assets-generator --preset minimal-2023 static/favicon.svg
```

## TODOs

- [ ] Add a bottom navbar for navigation between pages
- [ ] Separate downloads to a dedicated page
- [ ] Add game "Guess the Bird" from picture page
- [ ] Find a better database than localStorage for list of birds
- [ ] Add observations (species, location, date, proof) feature (page + button)
- [ ] Experiment with BirdNet sound recognition to create observations
- [ ] Find a model for picture recognition of animals to create observations
