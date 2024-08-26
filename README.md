# hl2models

It is based on `source-engine-model-loader` example with some additions and fixes that allowed to use Half-Life 2 models
in `three.js` and parsing it through `source-engine-model-loader`, it still has some quirks with some models for unknown
to me reasons.

## Why?

[Sound Browser](https://hl2sounds.ceifa.dev/) from [ceifa](https://github.com/ceifa) exists, why [Model Browser](https://github.com/xoderton/hl2models) doesn't.

It was just also a random idea from back of my brain, and I thought it would be useful for people *(i.e. Garry's Mod mappers, developers)*

## Installation

- `materials` and `models` size combined is roughly 800MiB+, so you must install it by yourself.

  1. Install [GCFScape](https://developer.valvesoftware.com/wiki/GCFScape)
  2. Extract `models` folder to `assets/` from `hl2_misc_dir.vpk`
  3. Extract `materials/models` folder to `assets/` from `hl2_textures_dir.vpk`

- `npm install` to install [Vite](https://vitejs.dev/) and [SvelteKit](https://kit.svelte.dev/)
- `npm run dev` and your server should be running at `localhost:5173`

## Tips

- It is not required to use only Half-Life 2 models/textures, you can always put Team Fortress 2 or other Source Engine games, but it was not tested, do it at your own risk!