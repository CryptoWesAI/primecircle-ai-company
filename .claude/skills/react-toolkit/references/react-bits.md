# React Bits — reference

Vetted animated-component library. First entry in the PrimeCircle React toolkit.

- **Site:** https://reactbits.dev
- **Repo:** https://github.com/DavidHDev/react-bits (~43.7k★, David Haz / @DavidHDev)
- **Reach:** 140+ components, 500k+ devs/month. Ports: Vue → vue-bits.dev, Svelte → sveltebits.xyz.

## What it is

An open-source collection of **animated, interactive, fully customizable React components**
for building "statement" sites — striking hero text, animated backgrounds, WebGL effects.
Philosophy: **no lock-in**. You don't `npm install` a black box — you pull the component's
**source code into your project** (copy-paste or CLI) and own it. Different components use
whatever animation tech fits: `gsap`, `framer-motion` / `motion`, `react-spring`, or
`three.js` (e.g. the `Ballpit` 3D-physics background).

## Categories

1. **Text Animations** — split / scramble / gradient / decrypt text (e.g. `SplitText`).
2. **Animations** — general motion & interaction wrappers.
3. **Components** — ready-made animated UI elements.
4. **Backgrounds** — animated / WebGL / Three.js backgrounds.

Browse the live gallery on reactbits.dev to pick — each has a preview + tweakable props.

## Variants

Every component ships in **4 flavours**: JavaScript or TypeScript × plain CSS or Tailwind.
Pick the pair that matches the target project.

## Install (copy the EXACT command from the component's page)

The install command + the correct variant token are shown **on each component's page** —
copy it from there rather than hand-building it (tokens/paths change). Shapes:

```bash
# jsrepo (variant = JavaScript-CSS | JavaScript-Tailwind | TypeScript-CSS | TypeScript-Tailwind)
npx jsrepo add https://reactbits.dev/<VARIANT>/TextAnimations/SplitText

# shadcn registry
npx shadcn@latest add @react-bits/<component-name>

# manual — copy the source from the component page straight into your project
```

Only the component you add pulls in its own animation dep (tree-shakeable, minimal).

## License — READ BEFORE LEANING ON IT

**MIT + Commons Clause.** Free for personal and commercial use, with ONE restriction:
you may not **sell React Bits itself** (can't repackage the library and sell it as a product).

Decision rule for PrimeCircle:
- ✅ **Fine:** use the components inside a client site/app you build and bill as a
  *service/website* (Belvanger-style trades sites, client projects). You're selling your
  work, not the library.
- ❌ **Not fine:** reselling React Bits (or a thin wrapper of it) as its own product.

It is therefore NOT plain MIT — note this before it becomes a dependency of a paid product.

## Extra free tools on the site

- **Background Studio** — build an animated background, export as video / image / code.
- **Shape Magic** — rounded-corner shapes, export SVG / React.
- **Texture Lab** — 20+ image/video texture effects.

Useful even when you don't take a component: generate a background asset, then serve it as
a static file (works in any stack, including a plain-HTML site).

## Fit with PrimeCircle stack

- **Belvanger today = plain HTML/CSS/JS, NOT React** → React Bits is not drop-in there.
  Options: (a) adapt the *technique* to vanilla CSS/JS by hand, or (b) use Background
  Studio to export a background asset and drop the file in.
- **Future client sites in React / Next.js** → this is a real accelerator. A couple of
  approved "statement" effects give a plain tradesperson site a premium feel without
  hand-animating everything. Stance: **Integrate**, not Build.
