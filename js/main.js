document.addEventListener('DOMContentLoaded', () => {
  const byId = (id) => document.getElementById(id);
  const mobileMenu = byId('mobile-menu');
  const menuButton = byId('mobile-menu-button');
  const video = byId('clinical-video');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const limitedConnection = Boolean(connection?.saveData || ['slow-2g', '2g'].includes(connection?.effectiveType));

  if (!prefersReducedMotion) requestAnimationFrame(() => document.body.classList.add('page-ready'));
  else document.body.classList.add('page-ready');

  function setMenuOpen(open) {
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.inert = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menuButton.querySelector('.material-symbols-outlined').textContent = open ? 'close' : 'menu';
  }

  menuButton.addEventListener('click', () => {
    setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
  });
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });
  document.addEventListener('click', (event) => {
    if (!mobileMenu.contains(event.target) && !menuButton.contains(event.target)) setMenuOpen(false);
  });
  window.matchMedia('(min-width: 1280px)').addEventListener('change', (event) => {
    if (event.matches) setMenuOpen(false);
  });

  let videoInView = false;
  let pausedByUser = false;
  let pausedByViewport = false;

  function setVideoState(playing, ended = false) {
    const overlay = byId('video-overlay');
    overlay.classList.toggle('opacity-0', playing);
    overlay.classList.toggle('pointer-events-none', playing);
    byId('play-icon').textContent = playing ? 'pause' : 'play_arrow';
    byId('btn-video-label').textContent = ended ? 'Assistir novamente' : playing ? 'Pausar' : 'Assistir';
  }

  function setSoundState() {
    const soundOn = !video.muted;
    byId('video-sound-button').setAttribute('aria-pressed', String(soundOn));
    byId('video-sound-button').setAttribute('aria-label', soundOn ? 'Desativar som do vídeo' : 'Ativar som do vídeo');
    byId('video-sound-icon').textContent = soundOn ? 'volume_up' : 'volume_off';
    byId('video-sound-label').textContent = soundOn ? 'Desativar som' : 'Ativar som';
  }

  async function playVideo(automatic = false) {
    if (automatic) {
      video.muted = true;
      setSoundState();
    }
    if (video.ended) video.currentTime = 0;
    try {
      await video.play();
      if (automatic && !videoInView) video.pause();
    } catch {
      if (!automatic) byId('video-error').classList.remove('hidden');
    }
  }

  document.querySelectorAll('[data-video-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      if (video.paused) {
        pausedByUser = false;
        playVideo();
      } else {
        pausedByUser = true;
        video.pause();
      }
    });
  });
  byId('video-sound-button').addEventListener('click', () => {
    video.muted = !video.muted;
    setSoundState();
  });
  video.addEventListener('volumechange', setSoundState);
  video.addEventListener('play', () => {
    pausedByUser = false;
    setVideoState(true);
    byId('play-button').classList.remove('play-pulse');
  });
  video.addEventListener('pause', () => {
    if (videoInView && !pausedByViewport && !video.ended) pausedByUser = true;
    setVideoState(false);
  });
  video.addEventListener('ended', () => setVideoState(false, true));
  video.addEventListener('error', () => byId('video-error').classList.remove('hidden'));
  if (!prefersReducedMotion) byId('play-button').classList.add('play-pulse');
  setSoundState();

  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver(([entry]) => {
      videoInView = entry.isIntersecting && entry.intersectionRatio >= 0.3;
      if (videoInView) {
        pausedByViewport = false;
        if (!prefersReducedMotion && !limitedConnection && !pausedByUser && !video.ended && video.paused) playVideo(true);
      } else {
        pausedByViewport = true;
        if (!video.paused) video.pause();
      }
    }, { threshold: [0, 0.3, 0.75] });
    videoObserver.observe(video);
  }

  const caseRange = byId('case-range');
  const caseComparison = byId('case-comparison');
  const updateCaseComparison = (value) => caseComparison?.style.setProperty('--comparison', `${value}%`);
  let caseWasInteracted = false;
  let caseHintPlayed = false;
  caseRange?.addEventListener('input', (event) => {
    caseWasInteracted = true;
    updateCaseComparison(event.target.value);
  });
  if (!prefersReducedMotion && caseComparison && caseRange && 'IntersectionObserver' in window) {
    const hintObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || caseHintPlayed || caseWasInteracted) return;
      caseHintPlayed = true;
      caseComparison.classList.add('is-hinting');
      requestAnimationFrame(() => updateCaseComparison(38));
      window.setTimeout(() => {
        if (!caseWasInteracted) updateCaseComparison(50);
        window.setTimeout(() => caseComparison.classList.remove('is-hinting'), 620);
      }, 620);
      hintObserver.unobserve(caseComparison);
    }, { threshold: 0.45 });
    hintObserver.observe(caseComparison);
  }

  document.querySelectorAll('[data-treatment]').forEach((link) => {
    link.addEventListener('click', () => {
      byId('treatment').value = link.dataset.treatment;
    });
  });

  const dateInput = byId('date-pref');
  const today = new Date();
  dateInput.min = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
  const lastDate = new Date(today);
  lastDate.setMonth(lastDate.getMonth() + 3);
  dateInput.max = [lastDate.getFullYear(), String(lastDate.getMonth() + 1).padStart(2, '0'), String(lastDate.getDate()).padStart(2, '0')].join('-');

  function isClinicDay(value) {
    if (!value) return true;
    const day = new Date(`${value}T12:00:00`).getDay();
    return day >= 3 && day <= 6;
  }

  dateInput.addEventListener('change', () => {
    if (isClinicDay(dateInput.value)) {
      dateInput.setCustomValidity('');
      return;
    }
    dateInput.setCustomValidity('Atendemos de quarta-feira a sábado. Escolha outro dia.');
    dateInput.reportValidity();
  });
  byId('appointment-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const phone = byId('phone').value.trim();
    const digits = phone.replace(/\D/g, '');
    const error = byId('form-error');
    if (!isClinicDay(dateInput.value)) {
      error.textContent = 'Escolha uma data entre quarta-feira e sábado para o atendimento.';
      error.classList.remove('hidden');
      dateInput.focus();
      return;
    }
    dateInput.setCustomValidity('');
    if (digits.length < 10 || digits.length > 11) {
      error.textContent = 'Informe um telefone com DDD válido para continuar.';
      error.classList.remove('hidden');
      byId('phone').focus();
      return;
    }
    error.classList.add('hidden');
    const treatment = byId('treatment');
    const period = byId('period');
    const lines = [
      'Olá! Gostaria de solicitar uma avaliação com a Dra. Gabriela Ramos.',
      `Nome: ${byId('name').value.trim()}`,
      `Telefone: ${phone}`,
      `Interesse: ${treatment.selectedOptions[0].textContent}`,
      `Dia preferencial: ${period.selectedOptions[0].textContent}`
    ];
    if (dateInput.value) lines.push(`Data pretendida: ${dateInput.value.split('-').reverse().join('/')}`);
    const notes = byId('notes').value.trim();
    if (notes) lines.push(`Observações: ${notes}`);
    const url = `https://wa.me/5519999278245?text=${encodeURIComponent(lines.join('\n'))}`;
    byId('whatsapp-continue').href = url;
    const inputs = byId('form-inputs');
    const showContinue = () => {
      inputs.classList.add('hidden');
      inputs.classList.remove('is-leaving');
      byId('form-success').classList.remove('hidden');
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) showContinue();
    else {
      inputs.classList.add('is-leaving');
      window.setTimeout(showContinue, 180);
    }
    window.open(url, '_blank', 'noopener');
  });
  byId('edit-request').addEventListener('click', () => {
    const success = byId('form-success');
    const showInputs = () => {
      success.classList.add('hidden');
      success.classList.remove('is-leaving');
      byId('form-inputs').classList.remove('hidden');
      byId('form-inputs').classList.add('is-entering');
      byId('name').focus();
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) showInputs();
    else {
      success.classList.add('is-leaving');
      window.setTimeout(showInputs, 180);
    }
  });
  byId('current-year').textContent = String(new Date().getFullYear());

  const header = byId('site-header');
  const heroPhoto = document.querySelector('.hero-photo');
  const protocolTimeline = byId('protocol-timeline');
  let scrollTimer;
  const updateScrollEffects = () => {
    const scrollY = window.scrollY;
    header?.classList.toggle('is-condensed', scrollY > 24);
    if (!prefersReducedMotion && heroPhoto) heroPhoto.style.transform = `translateY(${Math.min(scrollY * 0.055, 22)}px)`;
    if (protocolTimeline) {
      const bounds = protocolTimeline.getBoundingClientRect();
      const progress = prefersReducedMotion ? 1 : Math.max(0, Math.min(1, (window.innerHeight * 0.82 - bounds.top) / (bounds.height * 0.72)));
      protocolTimeline.style.setProperty('--timeline-progress', progress.toFixed(3));
    }
  };
  window.addEventListener('scroll', () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(updateScrollEffects, 16);
  }, { passive: true });
  updateScrollEffects();

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      if (prefersReducedMotion) return;
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      window.setTimeout(() => {
        target.classList.remove('anchor-flash');
        void target.offsetWidth;
        target.classList.add('anchor-flash');
      }, 420);
    });
  });

  const counters = [...document.querySelectorAll('[data-count]')];
  const setCounterFinal = (element) => {
    const decimals = Number(element.dataset.decimals || 0);
    element.textContent = Number(element.dataset.count).toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };
  const countUp = (element) => {
    const end = Number(element.dataset.count);
    const decimals = Number(element.dataset.decimals || 0);
    const started = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - started) / 780, 1);
      const value = end * (1 - Math.pow(1 - progress, 3));
      element.textContent = value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (prefersReducedMotion || !('IntersectionObserver' in window)) counters.forEach(setCounterFinal);
  else {
    const counterObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      countUp(entry.target);
      counterObserver.unobserve(entry.target);
    }), { threshold: 0.65 });
    counters.forEach((counter) => counterObserver.observe(counter));
  }

  const testimonialsTrack = byId('testimonials-track');
  const testimonialsDots = byId('testimonials-dots');
  let carouselPages = 1;
  const getCarouselPage = () => Math.min(carouselPages - 1, Math.max(0, Math.round((testimonialsTrack?.scrollLeft || 0) / Math.max(1, testimonialsTrack?.clientWidth || 1))));
  const syncCarouselDots = () => {
    const activePage = getCarouselPage();
    testimonialsDots?.querySelectorAll('button').forEach((dot, index) => dot.setAttribute('aria-current', String(index === activePage)));
  };
  const renderCarouselDots = () => {
    if (!testimonialsTrack || !testimonialsDots) return;
    carouselPages = Math.max(1, Math.ceil((testimonialsTrack.scrollWidth - testimonialsTrack.clientWidth) / Math.max(1, testimonialsTrack.clientWidth)) + 1);
    testimonialsDots.replaceChildren();
    for (let page = 0; page < carouselPages; page += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'testimonial-dot';
      dot.setAttribute('aria-label', `Ver grupo ${page + 1} de ${carouselPages} dos depoimentos`);
      dot.addEventListener('click', () => testimonialsTrack.scrollTo({ left: page * testimonialsTrack.clientWidth, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));
      testimonialsDots.append(dot);
    }
    syncCarouselDots();
  };
  const scrollTestimonials = (direction) => testimonialsTrack?.scrollBy({ left: direction * testimonialsTrack.clientWidth, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  byId('testimonials-prev')?.addEventListener('click', () => scrollTestimonials(-1));
  byId('testimonials-next')?.addEventListener('click', () => scrollTestimonials(1));
  testimonialsTrack?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') scrollTestimonials(-1);
    if (event.key === 'ArrowRight') scrollTestimonials(1);
  });
  let carouselScrollTimer;
  testimonialsTrack?.addEventListener('scroll', () => {
    window.clearTimeout(carouselScrollTimer);
    carouselScrollTimer = window.setTimeout(syncCarouselDots, 40);
  }, { passive: true });
  window.addEventListener('resize', () => window.setTimeout(renderCarouselDots, 80), { passive: true });
  renderCarouselDots();
  if (testimonialsTrack && !prefersReducedMotion) {
    let carouselTimer;
    const pauseCarousel = () => window.clearInterval(carouselTimer);
    const startCarousel = () => {
      pauseCarousel();
      carouselTimer = window.setInterval(() => {
        const atEnd = testimonialsTrack.scrollLeft + testimonialsTrack.clientWidth >= testimonialsTrack.scrollWidth - 8;
        testimonialsTrack.scrollTo({ left: atEnd ? 0 : testimonialsTrack.scrollLeft + testimonialsTrack.clientWidth, behavior: 'smooth' });
      }, 6000);
    };
    ['pointerenter', 'focusin'].forEach((event) => testimonialsTrack.addEventListener(event, pauseCarousel));
    ['pointerleave', 'focusout'].forEach((event) => testimonialsTrack.addEventListener(event, startCarousel));
    startCarousel();
  }

  if (!prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach((element) => {
      element.addEventListener('pointermove', (event) => {
        const bounds = element.getBoundingClientRect();
        element.style.transform = `translate(${(event.clientX - bounds.left - bounds.width / 2) * 0.09}px, ${(event.clientY - bounds.top - bounds.height / 2) * 0.11}px)`;
      });
      element.addEventListener('pointerleave', () => { element.style.transform = ''; });
    });
    document.querySelectorAll('#tratamentos .group').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        card.style.transform = `perspective(900px) translateY(-4px) rotateX(${(0.5 - y) * 5}deg) rotateY(${(x - 0.5) * 6}deg)`;
        card.style.setProperty('--tilt-glow-x', `${x * 100}%`);
        card.style.setProperty('--tilt-glow-y', `${y * 100}%`);
        card.classList.add('is-tilting');
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
        card.classList.remove('is-tilting');
      });
    });
  }

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const staggerItems = [...document.querySelectorAll('#tratamentos .group, #testimonials-track > div')];
    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const siblings = [...entry.target.parentElement.querySelectorAll('.stagger-item')];
        entry.target.style.transitionDelay = `${siblings.indexOf(entry.target) * 85}ms`;
        entry.target.classList.add('is-visible');
        staggerObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -18px 0px' });
    staggerItems.forEach((item) => {
      item.classList.add('stagger-item');
      staggerObserver.observe(item);
    });

    const targets = [...document.querySelectorAll('main section:not(#inicio) h2, main section:not(#inicio) .grid > div')]
      .filter((target) => !target.querySelector('img') && !target.closest('#tratamentos, #testimonials-track'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    targets.forEach((target) => {
      target.classList.add('reveal');
      observer.observe(target);
    });

    const mediaFrames = [...document.querySelectorAll('main img')]
      .map((image) => image.parentElement);
    const mediaObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-in-view', entry.isIntersecting && entry.intersectionRatio >= 0.12);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -20px 0px' });
    mediaFrames.forEach((frame) => {
      frame.classList.add('media-reveal');
      mediaObserver.observe(frame);
    });
    document.documentElement.classList.add('has-motion');
  }
});
