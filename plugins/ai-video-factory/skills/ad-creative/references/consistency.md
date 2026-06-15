# consistency — making 5 cards (or 3 beats) read as ONE set

A carousel that looks like five unrelated images fails. Consistency is the deliverable.
Three levers, cheapest first.

## Lever 1 — the shared `style.imageSuffix` (free, always do this)

`build.mjs` appends `style.imageSuffix` to every scene's prompt:
`const prompt = \`${sc.imagePrompt}, ${project.style.imageSuffix}\``. So the suffix is your
brand lock. Put EVERYTHING that must be identical across cards there:

```
"imageSuffix": "clean premium product photography, soft studio gradient background,
 single hero product centered, consistent teal-and-charcoal palette (#0a0e14 base, #22d3a6 accent),
 soft directional key light from upper left, 50mm lens shallow depth of field,
 no text, no logo, no watermark, ultra detailed"
```

Then each `imagePrompt` only describes what CHANGES per card (the scene/action), not the look.
This alone gets a carousel ~80% of the way to looking like one set.

## Lever 2 — write the product the same way every card (free)

The image model has no memory between calls. If card 1 says "sleek wireless earbud" and card 3
says "earphones", you get two different products. Pick ONE canonical noun phrase for the product
and paste it verbatim into every `imagePrompt`: e.g. always
"a sleek matte-charcoal wireless earbud with a teal LED ring". Same words → same object.

## Lever 3 — true identity lock via subject_reference (costs an edit)

`generateImage` supports `subjectReference` (a URL or `data:image/jpeg;base64,...` dataURL) which
MiniMax uses for character/style consistency:
`subject_reference: [{ type: 'character', image_file: <ref> }]`. `build.mjs` does NOT pass it by
default. To lock the EXACT product across a carousel:

1. Generate or pick a single clean hero shot of the product (card 1's image is a fine seed).
2. In the image stage of a copy of `build.mjs` (or a one-off script), read that jpg, make a
   dataURL, and pass it:
   ```js
   const ref = `data:image/jpeg;base64,${fs.readFileSync(refJpgPath).toString('base64')}`;
   const buf = await generateImage({ prompt, aspectRatio: '16:9', subjectReference: ref });
   ```
3. Now cards 2–5 carry card 1's product identity. Use sparingly — it constrains composition.

For a real product (a client's actual SKU), the seed should be a photo of THAT product, so the
ad shows the real thing rather than an AI invention. That photo lives anywhere readable; pass it
as a public URL or a dataURL.

## For the 3-beat ad

Same rules: the three beats share one `imageSuffix` and one product noun phrase. Additionally,
keep the camera language consistent — all three `video.prompt`s in the same lighting world so the
dissolves feel like one continuous film, e.g. all "dramatic teal rim light, charcoal studio".
The head/tail fade in `FactoryVideo.tsx` does the dissolve; matching palettes make it seamless.

## QA check before full build

At the still smoke stage (`node factory/still.mjs <id> 30`), look at the first card and ask:
would card 3 and card 5, generated from the same suffix + same product phrase, sit beside this one
without looking like a different brand? If not, fix the suffix — not the individual prompts — so
the fix propagates to all cards at once.
