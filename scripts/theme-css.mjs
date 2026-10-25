import fs from 'node:fs';
const source=fs.readFileSync('src/theme/tokens.ts','utf8');
const parse=name=>JSON.parse(source.match(new RegExp('export const '+name+' = ([\\s\\S]*?) as const'))[1]);
const colors=parse('colors'),layout=parse('layout'),type=parse('typography');
const entries=[...Object.entries(colors).map(([k,v])=>'  --color-'+k+': '+v+';'),...Object.entries(type).map(([k,v])=>'  --type-'+k+': '+v+'px;'),...layout.spacing.map(n=>'  --space-'+n+': '+n+'px;'),'  --control-target: '+layout.target+'px;','  --panel-radius: '+layout.radius+'px;','  --safe-margin: '+layout.safe+'px;','  --overlay-layer: '+layout.overlay+';'];
const css='/* Generated from src/theme/tokens.ts. Run node scripts/theme-css.mjs. */\n:root {\n'+entries.join('\n')+'\n}\n';
if(process.argv.includes('--check')) {if(fs.readFileSync('src/styles/tokens.css','utf8')!==css)throw Error('Theme CSS is stale');}else fs.writeFileSync('src/styles/tokens.css',css);
