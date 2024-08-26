import { readdir, stat } from "node:fs/promises"

export const ssr = false;
export const prerender = true;

const models: { [name: string]: string } = {};
const blacklisted_names = ["animation", "postures", "ss", "shared", "anims", "gestures", "v_"]

async function loadModels() {
  console.log("🚀 Initializing 'models' since it doesn't exist.")

  const files = await readdir(`assets/models`, { withFileTypes: true, recursive: true })

  for (const file of files) {
    if (blacklisted_names.find((s) => file.name.includes(s))) continue
    if (!file.name.endsWith(".mdl")) continue

    const name = /(.[A-Za-z_-]+\.mdl)/gi.exec(file.name)
    if (name == null) continue
    if (!!(await stat(`${file.parentPath}/${name[1]}.mdl`).catch(e => false))) continue

    models[name[1].slice(0, -4)] = `${file.parentPath.replace("assets\\", "")}/${file.name.replace(".mdl", "")}`
  }
}

export async function load() {
  if (Object.keys(models).length == 0)
    await loadModels()

  return { models }
}