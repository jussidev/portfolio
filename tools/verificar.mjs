import fs from 'node:fs';
import assert from 'node:assert/strict';

const dir = 'C:/Sistemas GIS/portfolio/';
const html = fs.readFileSync(`${dir}index.html`, 'utf8');
const css = fs.readFileSync(`${dir}styles.css`, 'utf8');
const js = fs.readFileSync(`${dir}script.js`, 'utf8');

// 1) conteúdo obrigatório do CV
const conteudo = [
  ['nome completo', 'Jussielson Júnior'],
  ['sobrenome', 'Xavier Ribeiro'],
  ['cidade', 'Porto Velho'],
  ['email', 'jussielsonjuniorofc@gmail.com'],
  ['telefone', '(69) 99309-6761'],
  ['objetivo', 'Atuar como desenvolvedor'],
  ['resumo', 'Resumo profissional'],
  ['experiencia', 'Estagiário de TI'],
  ['orgao', 'SEDUC'],
  ['formacao 1', 'Engenharia da Computação'],
  ['formacao 2', 'Ensino Técnico em Informática'],
  ['carga horaria', '1.200 horas'],
  ['ingles', 'nível intermediário'],
  ['habilidade web', 'JavaScript'],
  ['habilidade php', 'PHP'],
  ['habilidade jsx', 'JSX'],
  ['ferramenta glpi', 'GLPI'],
  ['ferramenta git', 'Git'],
  ['infra', 'Windows Server'],
  ['infra virtualizacao', 'Hyper-V'],
  ['destaque sistemas internos', 'sistemas internos governamentais'],
  ['disponibilidade', 'Disponível para oportunidades como desenvolvedor'],
];

// 2) contatos clicáveis
const links = {
  'whatsapp (wa.me)': /href="https:\/\/wa\.me\/5569993096761\?text=/.test(html),
  'mailto': /href="mailto:jussielsonjuniorofc@gmail\.com/.test(html),
  'linkedin': /href="https:\/\/www\.linkedin\.com\/in\/jussielson-ribeiro-4b2478314\/"/.test(html),
};

// 3) metadados / PWA / SEO
const head = [
  ['title', /<title>Portfólio - Jussielson<\/title>/],
  ['description', /<meta name="description" content="Portf[^"]+"/],
  ['og:title', /og:title" content="Portfólio - Jussielson"/],
  ['og:description', /og:description/],
  ['og:image', /og:image" content="https:\/\/jussielson\.vercel\.app\/og-image\.png"/],
  ['og:url', /og:url" content="https:\/\/jussielson\.vercel\.app"/],
  ['twitter:card', /twitter:card/],
  ['viewport', /name="viewport"/],
  ['favicon svg', /rel="icon" href="logo\.svg"/],
  ['apple-touch-icon', /rel="apple-touch-icon"/],
  ['theme-color', /name="theme-color"/],
  ['lang pt-BR', /<html lang="pt-BR">/],
];

// 4) acessibilidade
const a11y = [
  ['skip link', /class="pular"/],
  ['aria-label na nav', /aria-label="Navegação principal"/],
  ['alt da foto', /alt="Foto de Jussielson Júnior Xavier Ribeiro"/],
  ['aria-hidden nos svg decorativos', /aria-hidden="true"/],
];
// recursos que ficam no CSS, não no HTML
const a11yCss = [
  ['focus-visible', /:focus-visible/],
  ['prefers-reduced-motion', /prefers-reduced-motion/],
];

// 5) técnica
const tech = [
  ['tema escuro padrao', /:root,\s*\[data-tema="escuro"\]/.test(css)],
  ['tema claro', /\[data-tema="claro"\]/.test(css)],
  ['toggle de tema', /id="tema-btn"/.test(html)],
  ['persiste tema', /localStorage/.test(js)],
  ['rolagem suave com easing', /easeInOutCubic/.test(js)],
  ['offset da top bar', /ALTURA_TOPO = 78/.test(js)],
  ['menu mobile', /nav-mobile/.test(html) && /menu-btn/.test(html)],
  ['scroll-padding', /scroll-padding-top/.test(css)],
  ['breakpoints', (css.match(/@media/g) || []).length >= 3],
  ['assets com versao (?v=)', /styles\.css\?v=\d+/.test(html) && /script\.js\?v=\d+/.test(html)],
];

// 6) arquivos de deploy
const arquivos = ['robots.txt', 'sitemap.xml', 'vercel.json', 'logo.svg', 'og-image.png', 'apple-touch-icon.png', 'perfil.jpg'];
const existem = arquivos.map(f => [f, fs.existsSync(dir + f)]);

let falhas = 0;
const checar = (nome, ok) => { if (!ok) falhas++; console.log(`  ${ok ? 'ok  ' : 'FALHA'} ${nome}`); };
const testar = (re) => (re instanceof RegExp ? re.test(html) : html.includes(re));

console.log('CONTEUDO');
for (const [nome, re] of conteudo) checar(nome, testar(re));
console.log('CONTATOS');
for (const [nome, ok] of Object.entries(links)) checar(nome, ok);
console.log('META / SEO');
for (const [nome, re] of head) checar(nome, testar(re));
console.log('ACESSIBILIDADE');
for (const [nome, re] of a11y) checar(nome, testar(re));
for (const [nome, re] of a11yCss) checar(nome, re.test(css));
console.log('TECNICA');
for (const [nome, ok] of tech) checar(nome, ok);
console.log('ARQUIVOS');
for (const [nome, ok] of existem) checar(nome, ok);

// caracteres corrompidos (o problema que tivemos com o PowerShell)
const moj = html.match(/Ã[\x80-\xBF]|Â[\x80-\xBF]|â€/g);
console.log('ENCODING');
checar('sem mojibake no HTML', !moj);
checar('sem BOM', html.charCodeAt(0) !== 0xFEFF);

console.log(falhas ? `\n${falhas} problema(s)` : '\nportifólio: completo, sem pendências');
process.exit(falhas ? 1 : 0);