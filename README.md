# Portfólio — Jussielson Júnior Xavier Ribeiro

Site estático (HTML, CSS e JavaScript puros, sem framework e sem build).

- **Contato:** (69) 99309-6761 · jussielsonjuniorofc@gmail.com
- **LinkedIn:** <https://www.linkedin.com/in/jussielson-ribeiro-4b2478314/>

## Rodar localmente

Qualquer servidor estático serve. Opções:

```bash
# PHP (já vem com o projeto do Portal GIS)
php -S 127.0.0.1:8088 -t .

# Python
python -m http.server 8088

# Node (npx, sem instalar nada)
npx serve .
```

Depois abra <http://127.0.0.1:8088>.

## Publicar na Vercel

Pelo CLI, na pasta do projeto:

```bash
npx vercel login      # abre o navegador para autenticar
npx vercel --prod     # publica e gera a URL
```

Pelo painel do [vercel.com](https://vercel.com): **Add New → Project → importe este repositório**.
O `vercel.json` já deixa o projeto como site estático (sem comando de build).

Toda alteração publicada no repositório é republished automaticamente.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | Página única com todas as seções |
| `styles.css` | Tema claro/escuro (o escuro é o padrão) e layout responsivo |
| `script.js` | Alternador de tema, rolagem suave, menu mobile |
| `perfil.jpg` | Foto de perfil |
| `vercel.json` | Configuração de headers e cache na Vercel |

## Observações

- A escolha de tema fica salva no navegador (`localStorage`); quem entra pela
  primeira vez vê o **escuro**.
- O CSS e o JS são carregados com `?v=N` — ao mexer neles, suba o número para
  o navegador não ficar usando a versão antiga em cache.
- A foto de perfil é uma cópia local do LinkedIn (o link original é assinado e
  expira).
