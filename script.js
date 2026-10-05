/* Portfólio — Jussielson Júnior Xavier Ribeiro
   JS mínimo: ano no rodapé, tema claro/escuro, menu mobile e entrada suave. */

(function () {
  'use strict';

  // ano no rodapé
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = String(new Date().getFullYear());

  // ── tema (claro é o padrão; a escolha fica salva no navegador) ──
  var CHAVE = 'tema-portfolio';
  var raiz = document.documentElement;
  var botaoTema = document.getElementById('tema-btn');

  function aplicarTema(tema) {
    raiz.setAttribute('data-tema', tema);
    if (botaoTema) {
      botaoTema.setAttribute(
        'aria-label',
        tema === 'escuro' ? 'Mudar para tema claro' : 'Mudar para tema escuro'
      );
    }
    try { localStorage.setItem(CHAVE, tema); } catch (e) { /* modo privado */ }
  }

  var atual = raiz.getAttribute('data-tema') === 'escuro' ? 'escuro' : 'claro';
  if (botaoTema) {
    botaoTema.addEventListener('click', function () {
      aplicarTema(atual === 'escuro' ? 'claro' : 'escuro');
      atual = raiz.getAttribute('data-tema');
    });
  }

  // ── menu mobile ──
  var botao = document.querySelector('.menu-btn');
  var menu = document.getElementById('nav-mobile');
  if (botao && menu) {
    botao.addEventListener('click', function () {
      var aberto = menu.classList.toggle('aberto');
      botao.classList.toggle('aberto', aberto);
      botao.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('aberto');
        botao.classList.remove('aberto');
        botao.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── rolagem suave com easing + destaque da seção ──
  var semMovimento = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var ALTURA_TOPO = 78;   // top bar fixa (64) + folga
  var animId = 0;        // identification da animação em curso
  var quadroAtual = 0;   // rAF pendente, para cancelar

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function posicaoAlvo(destino) {
    return Math.max(0, Math.round(destino.getBoundingClientRect().top + window.pageYOffset - ALTURA_TOPO));
  }

  function rolarPara(destino) {
    var inicio = window.pageYOffset;
    var fim = posicaoAlvo(destino);
    var diferenca = fim - inicio;

    if (semMovimento || Math.abs(diferenca) < 2) {
      window.scrollTo(0, fim);
      return;
    }

    // Um novo clique durante a animação NÃO é descartado: assume a direção.
    // (Antes, o segundo clique caía no "animando" e não fazia nada — era
    //  o que fazia parecer que a rolagem "não funcionava".)
    animId++;
    var meuId = animId;
    if (quadroAtual) window.cancelAnimationFrame(quadroAtual);

    // desliga o scroll-behavior: smooth do CSS (ver html.rolando no CSS)
    document.documentElement.classList.add('rolando');

    var duracao = Math.max(520, Math.min(1200, 480 + Math.abs(diferenca) * 0.35));
    var comecou = null;

    function passo(agora) {
      if (meuId !== animId) return;            // animação Cancelada por outra
      if (comecou === null) comecou = agora;
      var p = Math.min(1, (agora - comecou) / duracao);
      window.scrollTo(0, Math.round(inicio + diferenca * easeInOutCubic(p)));
      if (p < 1) {
        quadroAtual = window.requestAnimationFrame(passo);
      } else {
        document.documentElement.classList.remove('rolando');
        quadroAtual = 0;
      }
    }
    quadroAtual = window.requestAnimationFrame(passo);
  }

  function piscar(destino) {
    destino.classList.remove('chegou');
    void destino.offsetWidth;          // reinicia a animação
    destino.classList.add('chegou');
    window.setTimeout(function () { destino.classList.remove('chegou'); }, 1600);
  }

  function irPara(hash, suave) {
    var destino;
    try { destino = document.querySelector(hash); } catch (e) { return false; }
    if (!destino) return false;

    if (suave) {
      rolarPara(destino);
    } else {
      window.scrollTo({ top: posicaoAlvo(destino), behavior: 'auto' });
    }
    piscar(destino);
    return true;
  }

  // cliques nos links internos (menu da top bar e botões)
  document.addEventListener('click', function (e) {
    var alvo = e.target;
    if (!alvo || !alvo.closest) return;
    var link = alvo.closest('a[href^="#"]');
    if (!link) return;
    var hash = link.getAttribute('href');
    if (!hash || hash === '#') return;
    if (!irPara(hash, true)) return;
    e.preventDefault();
    // replaceState pode lançar SecurityError em file:// e iframe sandboxed —
    // a rolagem já foi iniciada, então falha aqui não pode virar erro no console.
    try { history.replaceState(null, '', hash); } catch (err) { /* ignora */ }
  });

  // rolagem lenta (teclado PageDown) também marca o link ativo
  window.addEventListener('hashchange', function () {
    if (window.location.hash) irPara(window.location.hash, false);
  });

  // ── link ativo conforme a rolagem ──
  var secoes = ['sobre', 'experiencia', 'formacao', 'habilidades', 'contato'];
  var linksNav = {};
  document.querySelectorAll('.nav a[href^="#"]').forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    if (secoes.indexOf(id) !== -1) linksNav[id] = a;
  });

  function marcarAtivo() {
    var pos = window.pageYOffset + ALTURA_TOPO + 24;
    var atual = null;
    secoes.forEach(function (id) {
      var s = document.getElementById(id);
      if (s && s.offsetTop <= pos) atual = id;
    });
    Object.keys(linksNav).forEach(function (id) {
      linksNav[id].classList.toggle('ativo', id === atual);
    });
  }

  var pendente = false;
  window.addEventListener('scroll', function () {
    if (pendente) return;
    pendente = true;
    window.requestAnimationFrame(function () { marcarAtivo(); pendente = false; });
  }, { passive: true });
  marcarAtivo();

  // ── entrada suave ao rolar ──
  var alvos = document.querySelectorAll(
    '.secao .card, .hero-selo, .hero-titulo, .hero-subtitulo, .hero-info, .hero-acoes'
  );
  if (!('IntersectionObserver' in window)) return;

  alvos.forEach(function (el) { el.classList.add('aparece'); });

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visivel');
        observador.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

  alvos.forEach(function (el) { observador.observe(el); });
})();
