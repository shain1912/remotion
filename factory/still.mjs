// Quick still render for visual QA (bundles once, renders multiple frames):
//   node factory/still.mjs <projectId> <frame|f1,f2,f3> [outPrefix]
import fs from 'node:fs';
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { selectComposition, renderStill } from '@remotion/renderer';

const projectId = process.argv[2] || 'demo-git';
const frames = (process.argv[3] || '150').split(',').map((s) => parseInt(s.trim()));
const prefix = process.argv[4] || `factory/_verify/still_${projectId}`;
const inputProps = { projectId };

const COMP_BY_TEMPLATE = { montage: 'FactoryVideo', slides: 'SlideVideo', theory: 'TheoryVideo', gitgraph: 'GitGraphVideo' };
const project = JSON.parse(fs.readFileSync(path.resolve(`factory/projects/${projectId}/project.json`), 'utf8'));
const compId = COMP_BY_TEMPLATE[project.template || 'montage'];

const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public') });
const composition = await selectComposition({ serveUrl, id: compId, inputProps });
for (const frame of frames) {
  const out = path.resolve(`${prefix}_${frame}.png`);
  await renderStill({ composition, serveUrl, output: out, frame, inputProps });
  console.log('still ->', out, 'frame', frame, '/', composition.durationInFrames);
}
