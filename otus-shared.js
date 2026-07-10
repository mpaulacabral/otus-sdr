/* ============================================================
   otus-shared.js — Otus Engenharia | Funcionalidades compartilhadas
   ============================================================ */
(function () {
  'use strict';

  /* ── 1. Highlight current document in cross-nav ── */
  var page = (location.pathname.split('/').pop() || 'index.html').replace(/%20/g, ' ');
  document.querySelectorAll('.cross-nav a').forEach(function (a) {
    var href = (a.getAttribute('href') || '').replace(/%20/g, ' ');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('current');
    }
  });


  /* ── Back button in cross-nav ── */
  var crossNav = document.querySelector('.cross-nav');
  if (crossNav && history.length > 1) {
    var backBtn = document.createElement('a');
    backBtn.href = 'javascript:void(0)';
    backBtn.textContent = '← Voltar';
    backBtn.style.cssText = 'color:rgba(255,255,255,0.55);font-size:11.5px;font-weight:600;padding:4px 10px;border-radius:4px;text-decoration:none;flex-shrink:0;cursor:pointer;margin-right:4px;';
    backBtn.addEventListener('click', function() { history.back(); });
    var sep = crossNav.querySelector('.cross-sep');
    if (sep) {
      crossNav.insertBefore(backBtn, sep);
    } else {
      crossNav.insertBefore(backBtn, crossNav.firstChild);
    }
  }

  /* ── 2. Hamburger injection ── */
  var nav = document.querySelector('nav');
  if (nav) {
    var hamBtn = document.createElement('button');
    hamBtn.className = 'hamburger-btn';
    hamBtn.setAttribute('aria-label', 'Abrir menu');
    hamBtn.setAttribute('aria-expanded', 'false');
    hamBtn.innerHTML = '<span></span><span></span><span></span>';

    hamBtn.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('mobile-open');
      hamBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });


    /* Accordion: toggle individual nav-item dropdowns on mobile */
    nav.querySelectorAll('.nav-item > a').forEach(function(link) {
      link.addEventListener('click', function(e) {
        if (window.innerWidth <= 700 && nav.classList.contains('mobile-open')) {
          var item = this.closest('.nav-item');
          if (item && item.querySelector('.dropdown')) {
            e.preventDefault();
            var wasExpanded = item.classList.contains('expanded');
            nav.querySelectorAll('.nav-item').forEach(function(i) { i.classList.remove('expanded'); });
            if (!wasExpanded) item.classList.add('expanded');
          }
        }
      });
    });

    /* Auto-hide nav on scroll */
    var lastScrollY = 0;
    window.addEventListener('scroll', function() {
      var cur = window.pageYOffset;
      if (cur > lastScrollY && cur > 80) {
        nav.classList.add('nav-hidden');
        if (nav.classList.contains('mobile-open')) {
          nav.classList.remove('mobile-open');
          hamBtn.setAttribute('aria-expanded', 'false');
        }
      } else {
        nav.classList.remove('nav-hidden');
      }
      lastScrollY = cur;
    }, { passive: true });

    /* Close nav when a section link inside is clicked on mobile */
    nav.addEventListener('click', function (e) {
      if (window.innerWidth <= 700) {
        var target = e.target.closest('a[href^="#"]');
        if (target) {
          nav.classList.remove('mobile-open');
          hamBtn.setAttribute('aria-expanded', 'false');
        }
      }
    });

    var h1 = nav.querySelector('h1');
    if (h1) {
      h1.insertAdjacentElement('afterend', hamBtn);
    } else {
      nav.insertBefore(hamBtn, nav.firstChild);
    }
  }

  /* ── 3. Scroll-to-top button ── */
  var topBtn = document.createElement('a');
  topBtn.id = 'scroll-top-btn';
  topBtn.href = '#top';
  topBtn.setAttribute('aria-label', 'Voltar ao topo');
  topBtn.innerHTML = '&#8679;';
  document.body.appendChild(topBtn);

  window.addEventListener('scroll', function () {
    topBtn.classList.toggle('visible', window.pageYOffset > 400);
  }, { passive: true });

  /* ── 4. Copy buttons ── */
  function makeCopyBtn(el, light) {
    if (!el || el.querySelector('.copy-btn')) return;
    el.style.position = 'relative';

    var btn = document.createElement('button');
    btn.className = light ? 'copy-btn copy-btn-light' : 'copy-btn';
    btn.textContent = '⎘ Copiar';

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();

      /* Clone and strip the button before copying text */
      var clone = el.cloneNode(true);
      var oldBtn = clone.querySelector('.copy-btn');
      if (oldBtn) oldBtn.remove();
      var text = (clone.innerText || clone.textContent || '').trim();

      var self = this;

      function onDone() {
        self.textContent = '✓ Copiado!';
        self.classList.add('ok');
        setTimeout(function () {
          self.textContent = '⎘ Copiar';
          self.classList.remove('ok');
        }, 2200);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(onDone, onDone);
      } else {
        /* Fallback for older browsers / file:// protocol */
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try { document.execCommand('copy'); } catch (err) { /* silent */ }
        document.body.removeChild(ta);
        onDone();
      }
    });

    el.appendChild(btn);
  }

  /* Dark background (pitch blocks) */
  document.querySelectorAll('.pitch').forEach(function (el) {
    makeCopyBtn(el, false);
  });

  /* Light background (message boxes and SDR speech) */
  document.querySelectorAll('.msg-box, .fala-sdr').forEach(function (el) {
    makeCopyBtn(el, true);
  });

  /* ── 5. Scroll spy — highlight active section in nav ── */
  var sections = document.querySelectorAll('h2[id], h3[id]');
  var navLinks = document.querySelectorAll('nav a[href^="#"]');

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    var activeId = null;

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          activeId = '#' + entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === activeId);
          });
        }
      });
    }, { rootMargin: '-10% 0px -78% 0px' });

    sections.forEach(function (s) { spy.observe(s); });
  }

})();
