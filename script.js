/* ================================================================
   AK Projetos e Consultoria — script.js
   Interatividade, animações e navegação do site
   Autor: Desenvolvedor AK Projetos | Versão: 1.0.0

   ESTRUTURA:
   1. Utilitários
   2. Header com scroll
   3. Navegação (scroll suave + seção ativa)
   4. Menu mobile
   5. Scroll Reveal
   6. Barra de progresso de leitura
   7. Formulário de contato (contador + envio seguro)
   8. WhatsApp
   9. Footer: ano atual
   10. Inicialização
   ================================================================ */

(function () {
  'use strict';

  /* ================================================================
     1. UTILITÁRIOS
  ================================================================ */

  /**
   * Rola suavemente até uma seção pelo ID,
   * compensando a altura do header fixo.
   * @param {string} sectionId
   */
  function scrollToSection(sectionId) {
    var el = document.getElementById(sectionId);
    if (!el) return;
    var header = document.querySelector('#site-header');
    var headerH = header ? header.offsetHeight : 80;
    var top = el.getBoundingClientRect().top + window.pageYOffset - headerH;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  /* ================================================================
     2. HEADER COM SCROLL
     Adiciona classe .ak-scrolled ao passar de 60px de scroll,
     alternando entre logo branca (topo) e logo preta (scrolled).
  ================================================================ */

  function initHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;

    function updateHeader() {
      if (window.scrollY > 60) {
        header.classList.add('ak-scrolled');
      } else {
        header.classList.remove('ak-scrolled');
      }
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader(); // executa na carga inicial
  }

  /* ================================================================
     3. NAVEGAÇÃO — SCROLL SUAVE + SEÇÃO ATIVA
  ================================================================ */

  /**
   * Vincula todos os elementos com [data-target] ao scroll suave.
   * Funciona para <button> e <a>.
   */
  function initNavigation() {
    document.querySelectorAll('[data-target]').forEach(function (el) {
      el.addEventListener('click', function () {
        var target = el.getAttribute('data-target');
        scrollToSection(target);
        closeMobileNav(); // fecha o menu mobile se estiver aberto
      });
    });

    // Logo → volta ao topo
    var logoHome = document.getElementById('logo-home');
    if (logoHome) {
      logoHome.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /**
   * Indica no nav desktop qual seção está visível (classe .ak-nav-active).
   */
  function initActiveNav() {
    var sections = ['servicos', 'sobre', 'contato'];
    var navBtns = document.querySelectorAll('#site-header nav .nav-btn[data-target]');

    function updateActive() {
      var scrollY = window.scrollY + 130;
      var active = '';

      sections.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) active = id;
      });

      navBtns.forEach(function (btn) {
        var target = btn.getAttribute('data-target');
        btn.classList.toggle('ak-nav-active', !!active && target === active);
      });
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  }

  /* ================================================================
     4. MENU MOBILE
  ================================================================ */

  var mobileNavEl = null;

  function closeMobileNav() {
    var nav = document.getElementById('mobile-nav');
    if (!nav) return;
    nav.classList.remove('ak-mobile-nav--open');
    nav.setAttribute('aria-hidden', 'true');
  }

  function initMobileMenu() {
    var menuBtn = document.getElementById('mobile-menu-btn');
    var nav = document.getElementById('mobile-nav');
    if (!menuBtn || !nav) return;

    menuBtn.addEventListener('click', function () {
      var isOpen = nav.classList.contains('ak-mobile-nav--open');
      if (isOpen) {
        closeMobileNav();
      } else {
        nav.classList.add('ak-mobile-nav--open');
        nav.setAttribute('aria-hidden', 'false');
      }
    });

    // Clique no overlay (fora do menu) fecha
    nav.addEventListener('click', function (e) {
      if (e.target === nav) closeMobileNav();
    });

    // Tecla ESC fecha o menu
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMobileNav();
    });
  }

  /* ================================================================
     5. SCROLL REVEAL
     Observa elementos .ak-reveal e aplica .ak-revealed
     quando entram na viewport.
  ================================================================ */

  function initScrollReveal() {
    var targets = document.querySelectorAll('.ak-reveal');
    if (!targets.length) return;

    // IntersectionObserver: mais performático que eventos de scroll
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('ak-revealed');
          observer.unobserve(entry.target); // revela apenas uma vez
        }
      });
    }, { threshold: 0.08 });

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ================================================================
     6. BARRA DE PROGRESSO DE LEITURA
  ================================================================ */

  function initProgressBar() {
    var bar = document.getElementById('ak-progress');
    if (!bar) return;

    window.addEventListener('scroll', function () {
      var scrollTop = window.scrollY;
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (docH > 0 ? (scrollTop / docH) * 100 : 0) + '%';
    }, { passive: true });
  }

  /* ================================================================
     7. FORMULÁRIO DE CONTATO
     - Contador de caracteres no textarea
     - Envio via fetch (AJAX) para o Formspree (HTTPS/TLS)
     - Validação client-side básica
     - Feedback visual de sucesso/erro
     - Proteção anti-spam (honeypot no HTML)

     SEGURANÇA:
     Os dados trafegam via HTTPS (TLS) entre o navegador e o Formspree.
     O Formspree entrega no e-mail configurado; nunca expõe credenciais
     no código front-end. Para máxima segurança, configure no painel
     do Formspree: reCAPTCHA, lista de domínios permitidos e notificações.
  ================================================================ */

  function initForm() {
    /* ── Contador de caracteres ── */
    var textarea = document.getElementById('mensagem');
    var counter  = document.getElementById('char-count');
    if (textarea && counter) {
      textarea.addEventListener('input', function () {
        counter.textContent = this.value.length + '/500';
      });
    }

    /* ── Envio via fetch (AJAX seguro) ── */
    var form       = document.getElementById('contact-form');
    var feedback   = document.getElementById('form-feedback');
    var submitBtn  = document.getElementById('form-submit-btn');
    var submitLabel   = document.getElementById('submit-label');
    var submitLoading = document.getElementById('submit-loading');

    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Validação básica client-side */
      var nome     = form.querySelector('#nome');
      var telefone = form.querySelector('#telefone');
      var servico  = form.querySelector('#servico');
      var msg      = form.querySelector('#mensagem');

      if (!nome.value.trim() || !telefone.value.trim() || !servico.value || !msg.value.trim()) {
        showFeedback('error', 'Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      /* Estado de carregamento */
      submitBtn.disabled = true;
      submitLabel.classList.add('hidden');
      submitLoading.classList.remove('hidden');
      hideFeedback();

      /* Fetch seguro (HTTPS) */
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
      .then(function (response) {
        submitBtn.disabled = false;
        submitLabel.classList.remove('hidden');
        submitLoading.classList.add('hidden');

  if (response.ok) {

  // Evento Google Analytics
  if (typeof gtag === 'function') {
    gtag('event', 'formulario_enviado', {
      form_name: 'contato_ak_projetos',
      page_location: window.location.href
    });
  }

  form.reset();
  if (counter) counter.textContent = '0/500';
  showFeedback('success', '✓ Mensagem enviada com sucesso! Retornaremos em breve.');

} else {

  return response.json().then(function (data) {
    var errorMsg = (data && data.errors)
      ? data.errors.map(function (err) {
          return err.message;
        }).join(', ')
      : 'Erro ao enviar. Tente novamente ou entre em contato pelo WhatsApp.';

    showFeedback('error', errorMsg);
  });

}
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitLabel.classList.remove('hidden');
        submitLoading.classList.add('hidden');
        showFeedback('error', 'Falha de conexão. Verifique sua internet e tente novamente.');
      });
    });

    /* Helpers de feedback */
    function showFeedback(type, message) {
      if (!feedback) return;
      feedback.className = type; // 'success' ou 'error'
      feedback.textContent = message;
      feedback.classList.remove('hidden');
      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideFeedback() {
      if (!feedback) return;
      feedback.classList.add('hidden');
      feedback.className = 'hidden';
    }
  }

  /* ================================================================
     8. Botão flutuante WHATSAPP
  ================================================================ */

  function initWhatsApp() {
    /* SUBSTITUA pelo número real da AK Projetos (formato: 55 + DDD + número) */
    var WHATSAPP_NUMBER = '554599831231';
    var WHATSAPP_MSG    = encodeURIComponent('Olá! Gostaria de solicitar um orçamento da AK Projetos e Consultoria.');
    var WHATSAPP_URL    = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + WHATSAPP_MSG;

    /* Atualiza o link flutuante */
    var floatLink = document.getElementById('whatsapp-float');
    if (floatLink) floatLink.href = WHATSAPP_URL;

    /* Botão "Falar com Especialista" no hero card */
    var heroBtn = document.getElementById('whatsapp-hero-btn');
    if (heroBtn) {
      heroBtn.addEventListener('click', function () {
        window.open(WHATSAPP_URL, '_blank', 'noopener,noreferrer');
      });
    }
  }

  /* ================================================================
     9. FOOTER: ANO ATUAL
  ================================================================ */

  function initFooterYear() {
    var el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ================================================================
     10. INICIALIZAÇÃO
     Aguarda o DOM estar pronto para executar todas as funções.
  ================================================================ */

  function init() {
    initHeader();
    initNavigation();
    initActiveNav();
    initMobileMenu();
    initScrollReveal();
    initProgressBar();
    initForm();
    initWhatsApp();
    initFooterYear();
  }

  /* Garante execução após carregamento do DOM */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

  document.querySelectorAll('a[href*="wa.me"]').forEach(function (botao) {
  botao.addEventListener('click', function () {

    if (typeof gtag === 'function') {
      gtag('event', 'clique_whatsapp', {
        link_url: botao.href,
        page_location: window.location.href
      });
    }

  });
});