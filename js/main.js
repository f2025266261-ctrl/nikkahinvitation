/**
 * Yashfa Ali & Zain Saleem — Nikkah Wedding Invitation
 * Complete Mobile-First GSAP + ScrollTrigger + Lenis Experience
 *
 * TODO: Update RSVP_WHATSAPP_NUMBER below (and in index.html #rsvpWhatsappBtn)
 * with the host family's real WhatsApp phone number in international format.
 */

(function () {
  'use strict';

  const TARGET_ISO_DATE = '2026-11-21T14:00:00+05:00';
  // TODO: Replace placeholder phone number with the real WhatsApp number for RSVPs
  const RSVP_WHATSAPP_NUMBER = '923000000000';

  let envelopeOpened = false;
  let prefersReducedMotion = false;
  let lenis = null;

  // Audio state (OFF by default; only plays if /assets/music.mp3 exists & user enables it)
  let bgAudio = null;
  let musicAvailable = false;
  let musicEnabledByUser = false;

  document.addEventListener('DOMContentLoaded', () => {
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setupGuestPersonalization();
    setupWhatsAppLink();
    setupSlotCounterDOM();
    setupButtonGoldRippleAndCardLift();
    setupSaveTheDateICS();
    setupCopyAddressButton();
    initLenisSmoothScroll();
    setupOptionalMusicToggle();
    setupLiveCountdown();

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      hidePreloaderImmediate();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    runCinematicLoader().then(() => {
      initMainExperience();
    });
  });

  /* ========================================================================
     PERSONALIZATION (?guest=Name -> "Dear {Name},")
     Uses textContent only (never innerHTML) and sanitizes input.
     ======================================================================== */
  function setupGuestPersonalization() {
    const greetingEl = document.getElementById('guestGreeting');
    if (!greetingEl) return;

    try {
      const params = new URLSearchParams(window.location.search);
      const rawGuest = params.get('guest');
      if (!rawGuest) {
        greetingEl.hidden = true;
        return;
      }

      const sanitized = rawGuest
        .replace(/[\u0000-\u001F\u007F<>]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 60);

      if (!sanitized) {
        greetingEl.hidden = true;
        return;
      }

      greetingEl.textContent = `Dear ${sanitized},`;
      greetingEl.hidden = false;
    } catch (_) {
      greetingEl.hidden = true;
    }
  }

  function setupWhatsAppLink() {
    const btn = document.getElementById('rsvpWhatsappBtn');
    if (!btn) return;
    const msg = encodeURIComponent(
      'Assalamu Alaikum! We are delighted to RSVP for the Nikkah of Yashfa Ali & Zain Saleem on 21st November 2026.'
    );
    btn.href = `https://wa.me/${RSVP_WHATSAPP_NUMBER}?text=${msg}`;
  }

  /* ========================================================================
     GLOBAL MICRO-INTERACTIONS: Gold Ripple on Button Tap & Card Lift on Touch
     ======================================================================== */
  function setupButtonGoldRippleAndCardLift() {
    const buttons = document.querySelectorAll('.gold-ripple-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        if (prefersReducedMotion || typeof gsap === 'undefined') return;
        const rect = btn.getBoundingClientRect();
        const x = e.clientX ? e.clientX - rect.left : rect.width / 2;
        const y = e.clientY ? e.clientY - rect.top : rect.height / 2;

        const wave = document.createElement('span');
        wave.className = 'gold-ripple-wave';
        wave.style.left = `${x}px`;
        wave.style.top = `${y}px`;
        btn.appendChild(wave);

        gsap.fromTo(
          wave,
          { scale: 0, opacity: 0.85 },
          {
            scale: Math.max(rect.width, rect.height) / 8,
            opacity: 0,
            duration: 0.65,
            ease: 'power2.out',
            onComplete: () => wave.remove()
          }
        );
      });
    });

    const cards = document.querySelectorAll('.interactive-card');
    cards.forEach((card) => {
      card.addEventListener(
        'touchstart',
        () => {
          card.classList.add('is-lifted');
        },
        { passive: true }
      );
      card.addEventListener(
        'touchend',
        () => {
          setTimeout(() => card.classList.remove('is-lifted'), 260);
        },
        { passive: true }
      );
    });
  }

  /* ========================================================================
     LENIS SMOOTH SCROLL (Synced with ScrollTrigger & gsap.ticker)
     ======================================================================== */
  function initLenisSmoothScroll() {
    if (typeof Lenis === 'undefined' || prefersReducedMotion) return;

    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false
    });

    // Locked initially until the envelope opens
    lenis.stop();

    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }

    if (typeof gsap !== 'undefined') {
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  function unlockScroll() {
    document.body.classList.remove('scroll-locked');
    window.scrollTo(0, 0);
    if (lenis) {
      lenis.start();
      lenis.scrollTo(0, { immediate: true });
    }
  }

  function setTempWillChange(targets, value) {
    if (typeof gsap === 'undefined') return;
    gsap.set(targets, { willChange: value || 'transform, opacity' });
  }

  function clearTempWillChange(targets) {
    if (typeof gsap === 'undefined') return;
    gsap.set(targets, { clearProps: 'willChange' });
  }

  /* ========================================================================
     LOADER (1–2s): Arch Outline Stroke Draw + "Bismillah" Fade
     ======================================================================== */
  function runCinematicLoader() {
    const preloader = document.getElementById('preloader');
    const strokePaths = document.querySelectorAll('.preloader-stroke-path');
    const textWrap = document.getElementById('preloaderTextWrap');

    const fontsReady =
      document.fonts && document.fonts.ready
        ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2000))])
        : Promise.resolve();

    const windowLoaded =
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise((resolve) => {
            window.addEventListener('load', resolve, { once: true });
            setTimeout(resolve, 2000);
          });

    const assetsPromise = Promise.all([fontsReady, windowLoaded]);

    if (prefersReducedMotion || !preloader) {
      return assetsPromise.then(() => {
        if (preloader) {
          gsap.to(preloader, {
            opacity: 0,
            duration: 0.35,
            onComplete: () => preloader.classList.add('is-hidden')
          });
        }
      });
    }

    strokePaths.forEach((p) => {
      try {
        const len = p.getTotalLength();
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = `${len}`;
      } catch (_) {}
    });

    const loaderAnimPromise = new Promise((resolve) => {
      const tl = gsap.timeline({ onComplete: resolve });

      tl.to(
        strokePaths,
        {
          strokeDashoffset: 0,
          duration: 1.05,
          stagger: 0.08,
          ease: 'power2.out'
        },
        0
      ).to(
        textWrap,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out'
        },
        0.15
      );
    });

    return Promise.all([assetsPromise, loaderAnimPromise]).then(() => {
      return new Promise((resolve) => {
        gsap.to(preloader, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            preloader.classList.add('is-hidden');
            resolve();
          }
        });
      });
    });
  }

  function hidePreloaderImmediate() {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('is-hidden');
  }

  /* ========================================================================
     INITIALIZE MAIN EXPERIENCE & GSAP MATCHMEDIA
     ======================================================================== */
  function initMainExperience() {
    const mm = gsap.matchMedia();

    mm.add(
      {
        isMobile: '(max-width: 499px)',
        isDesktop: '(min-width: 500px)',
        reduceMotion: '(prefers-reduced-motion: reduce)'
      },
      (context) => {
        prefersReducedMotion = Boolean(context.conditions.reduceMotion);

        setupHeroInitialStates();
        setupPersistentParallaxLayers();
        setupLanternSway();
        setupLanternParallax();
        setupGoldDustCanvas();
        setupCoupleParallaxPetals();
        setupFallingRosePetals();
        setupScrollProgressBar();
        setupScrollAnimations();

        ScrollTrigger.refresh();
      }
    );

    setupEnvelopeInteraction();

    const scrollHint = document.getElementById('heroScrollHint');
    if (scrollHint) {
      scrollHint.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById('invitationSection');
        if (!target) return;
        if (lenis) {
          lenis.scrollTo(target, { duration: 1.15 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
  }

  /* ========================================================================
     PERSISTENT PARALLAX LAYERS (Grain, Continuous Rose Corners, Lanterns)
     ======================================================================== */
  function setupPersistentParallaxLayers() {
    if (prefersReducedMotion) return;

    gsap.to('#parallaxGrainLayer', {
      y: -55,
      ease: 'none',
      scrollTrigger: {
        trigger: '#invitationMain',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true
      }
    });

    gsap.to('#persistentLanternsLayer', {
      y: -38,
      ease: 'none',
      scrollTrigger: {
        trigger: '#invitationMain',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true
      }
    });

    gsap.to('#persistentRosesLayer', {
      y: -22,
      ease: 'none',
      scrollTrigger: {
        trigger: '#invitationMain',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true
      }
    });
  }

  /* ========================================================================
     HERO INITIAL STATES & ENTRANCE TIMELINE
     ======================================================================== */
  function setupHeroInitialStates() {
    const archPaths = document.querySelectorAll('.arch-stroke-path');
    archPaths.forEach((path) => {
      try {
        const len = path.getTotalLength();
        path.style.strokeDasharray = `${len}`;
        path.style.strokeDashoffset = prefersReducedMotion ? '0' : `${len}`;
      } catch (_) {}
    });

    if (prefersReducedMotion) {
      gsap.set('#bismillahArabic', { clipPath: 'inset(0 0% 0 0%)', opacity: 1 });
      gsap.set(['.p-lantern-left', '.p-lantern-center-left', '.p-lantern-center-right', '.p-lantern-right'], {
        opacity: 1,
        y: 0
      });
      return;
    }

    gsap.set('#bismillahArabic', {
      clipPath: 'inset(0 0% 0 100%)',
      opacity: 0.25
    });

    gsap.set('#roseCornerTL', { opacity: 0, scale: 0.25, rotation: -18 });
    gsap.set('#roseCornerTR', { opacity: 0, scale: 0.25, rotation: 18 });
    gsap.set('#roseCornerBL', { opacity: 0, scale: 0.25, rotation: 18 });
    gsap.set('#roseCornerBR', { opacity: 0, scale: 0.25, rotation: -18 });

    gsap.set(['.p-lantern-left', '.p-lantern-center-left', '.p-lantern-center-right', '.p-lantern-right'], {
      opacity: 0,
      y: -85
    });

    gsap.set('#guestGreeting', { opacity: 0, y: 12 });
    gsap.set('#heroMedallion', { opacity: 0, scale: 0.88, y: 14 });
    gsap.set('#heroScrollHint', { opacity: 0, y: 12 });
  }

  function playHeroArchEntrance() {
    if (prefersReducedMotion) return;

    const animatedHeroEls = [
      '#roseCornerTL',
      '#roseCornerTR',
      '#roseCornerBL',
      '#roseCornerBR',
      '.p-lantern-left',
      '.p-lantern-center-left',
      '.p-lantern-center-right',
      '.p-lantern-right',
      '#bismillahArabic',
      '#guestGreeting',
      '#heroMedallion',
      '#heroScrollHint'
    ];
    setTempWillChange(animatedHeroEls, 'transform, opacity');

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => clearTempWillChange(animatedHeroEls)
    });

    tl.to(
      '.arch-stroke-path',
      {
        strokeDashoffset: 0,
        duration: 1.4,
        stagger: 0.14,
        ease: 'power2.inOut'
      },
      0
    )
      .to(
        ['#roseCornerTL', '#roseCornerTR', '#roseCornerBL', '#roseCornerBR'],
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.95,
          stagger: 0.1,
          ease: 'back.out(1.5)',
          onComplete: startRoseCornersIdleSway
        },
        0.15
      )
      .to(
        ['.p-lantern-left', '.p-lantern-center-left', '.p-lantern-center-right', '.p-lantern-right'],
        {
          opacity: 1,
          y: 0,
          duration: 1.15,
          stagger: 0.1,
          ease: 'bounce.out'
        },
        0.22
      )
      .to(
        '#bismillahArabic',
        {
          clipPath: 'inset(0 0% 0 0%)',
          opacity: 1,
          duration: 1.25,
          ease: 'power2.inOut'
        },
        0.38
      )
      .to(
        '#guestGreeting',
        {
          opacity: 1,
          y: 0,
          duration: 0.55
        },
        0.85
      )
      .to(
        '#heroMedallion',
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.75,
          ease: 'back.out(1.4)'
        },
        1.0
      )
      .to(
        '#heroScrollHint',
        {
          opacity: 1,
          y: 0,
          duration: 0.6
        },
        1.25
      );
  }

  function startRoseCornersIdleSway() {
    if (prefersReducedMotion) return;

    const corners = ['#roseCornerTL', '#roseCornerTR', '#roseCornerBL', '#roseCornerBR'];
    corners.forEach((selector, idx) => {
      gsap.to(selector, {
        rotation: idx % 2 === 0 ? 3.2 : -3.2,
        duration: 3.2 + idx * 0.35,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });
  }

  /* ========================================================================
     ENVELOPE INTRO & ON-TAP OPENING SEQUENCE
     ======================================================================== */
  function setupEnvelopeInteraction() {
    const envelopeStage = document.getElementById('envelopeStage');
    const waxSealBtn = document.getElementById('waxSealBtn');
    const tapToOpenText = document.getElementById('tapToOpenText');
    const envelopeScene = document.getElementById('envelopeScene');

    if (!envelopeStage || !waxSealBtn) return;

    const triggerOpen = () => {
      if (envelopeOpened) return;
      envelopeOpened = true;

      waxSealBtn.disabled = true;
      waxSealBtn.classList.add('is-cracking');
      if (tapToOpenText) tapToOpenText.disabled = true;

      authorizeAndPlayMusicOnTap();

      if (prefersReducedMotion) {
        gsap.to(envelopeStage, {
          opacity: 0,
          duration: 0.35,
          onComplete: () => {
            envelopeStage.classList.add('is-dismissed');
            envelopeStage.setAttribute('aria-hidden', 'true');
            unlockScroll();
            ScrollTrigger.refresh();
          }
        });
        return;
      }

      const envelopeEls = [
        '#sealHalfLeft',
        '#sealHalfRight',
        '#envelopeFlap',
        '#envelopeCard',
        '#envelopePocket',
        '.envelope-back',
        '#stageLanternsParallax',
        '.stage-corner',
        envelopeStage
      ];
      setTempWillChange(envelopeEls, 'transform, opacity');

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' }
      });

      tl.to(
        [tapToOpenText, '#envelopePretitle'],
        {
          opacity: 0,
          y: 8,
          duration: 0.28,
          ease: 'power2.in'
        },
        0
      )
        .to('.seal-crack-edge', { opacity: 1, duration: 0.14 }, 0.04)
        .to(
          '#sealHalfLeft',
          { x: -10, y: -3, rotation: -8, duration: 0.18, ease: 'power2.out' },
          0.1
        )
        .to(
          '#sealHalfRight',
          { x: 10, y: -3, rotation: 8, duration: 0.18, ease: 'power2.out' },
          0.1
        )
        .to(
          '#sealHalfLeft',
          { x: -44, y: 95, rotation: -32, opacity: 0, duration: 0.48, ease: 'power2.in' },
          0.28
        )
        .to(
          '#sealHalfRight',
          { x: 44, y: 98, rotation: 34, opacity: 0, duration: 0.48, ease: 'power2.in' },
          0.28
        )
        .to(
          '#envelopeFlap',
          {
            rotateX: 180,
            duration: 0.78,
            ease: 'power2.inOut',
            onUpdate: function () {
              if (this.progress() > 0.48) {
                const flap = document.getElementById('envelopeFlap');
                if (flap) flap.style.zIndex = '1';
              }
            }
          },
          0.52
        )
        .to(
          '#envelopeCard',
          {
            y: -118,
            scale: 1.06,
            duration: 0.72,
            ease: 'power3.out'
          },
          0.95
        )
        .to(
          ['#envelopePocket', '.envelope-back', '#envelopeFlap', '#stageLanternsParallax', '.stage-corner'],
          {
            y: 160,
            opacity: 0,
            duration: 0.68,
            ease: 'power2.in'
          },
          1.45
        )
        .to(
          '#envelopeCard',
          {
            y: -10,
            scale: 2.85,
            opacity: 0,
            duration: 0.75,
            ease: 'power2.inOut'
          },
          1.55
        )
        .add(() => {
          triggerOpeningBurst();
          playHeroArchEntrance();
        }, 1.65)
        .to(
          envelopeStage,
          {
            opacity: 0,
            duration: 0.65,
            ease: 'power2.out',
            onComplete: () => {
              clearTempWillChange(envelopeEls);
              envelopeStage.classList.add('is-dismissed');
              envelopeStage.setAttribute('aria-hidden', 'true');
              unlockScroll();
              ScrollTrigger.refresh();
            }
          },
          1.72
        );
    };

    waxSealBtn.addEventListener('click', triggerOpen);
    if (tapToOpenText) tapToOpenText.addEventListener('click', triggerOpen);
    if (envelopeScene) envelopeScene.addEventListener('click', triggerOpen);
  }

  function triggerOpeningBurst() {
    if (prefersReducedMotion) return;

    const burstLayer = document.getElementById('openingBurstLayer');
    if (!burstLayer) return;
    burstLayer.innerHTML = '';

    const count = 22;
    const svgNS = 'http://www.w3.org/2000/svg';
    const colors = ['#C9A24B', '#F2DF9F', '#D49B9E', '#9B2D4A', '#F2D4D7'];

    for (let i = 0; i < count; i++) {
      const isPetal = i % 2 === 0;
      const el = document.createElementNS(svgNS, 'svg');
      el.classList.add('burst-particle');
      el.setAttribute('viewBox', isPetal ? '0 0 18 24' : '0 0 16 16');
      el.style.width = isPetal ? '15px' : '11px';
      el.style.height = isPetal ? '19px' : '11px';

      const path = document.createElementNS(svgNS, 'path');
      if (isPetal) {
        path.setAttribute('d', 'M9 1 C15 5, 17 12, 13 19 C10 23, 6 23, 4 18 C1 12, 3 5, 9 1 Z');
      } else {
        path.setAttribute('d', 'M8 0 L10 6 L16 8 L10 10 L8 16 L6 10 L0 8 L6 6 Z');
      }
      path.setAttribute('fill', colors[i % colors.length]);
      el.appendChild(path);
      burstLayer.appendChild(el);

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.25;
      const distance = 90 + Math.random() * 145;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - 25;

      gsap.fromTo(
        el,
        { x: 0, y: 0, scale: 0.2, rotation: 0, opacity: 1 },
        {
          x: tx,
          y: ty + 65,
          scale: 0.9 + Math.random() * 0.5,
          rotation: (Math.random() - 0.5) * 260,
          opacity: 0,
          duration: 1.15 + Math.random() * 0.55,
          ease: 'power3.out',
          onComplete: () => el.remove()
        }
      );
    }
  }

  /* ========================================================================
     SCROLL-TRIGGERED ANIMATIONS FOR THE 7 SECTIONS BELOW THE HERO
     ======================================================================== */
  function setupScrollAnimations() {
    // Prepare SVG strokes for Date/Time Connector and Dress Code Illustrations
    const strokeEls = document.querySelectorAll('#dtConnectorPath, .attire-stroke');
    strokeEls.forEach((el) => {
      try {
        const len = el.getTotalLength();
        el.style.strokeDasharray = `${len}`;
        el.style.strokeDashoffset = prefersReducedMotion ? '0' : `${len}`;
      } catch (_) {}
    });

    if (prefersReducedMotion) return;

    // ----------------------------------------------------------------------
    // 1. INVITATION SECTION:
    //    Line-by-line masked slide-up -> "NIKKAH" scales in with foil shimmer
    //    & center ornaments expanding outward -> "of beloved daughter" fades up
    // ----------------------------------------------------------------------
    gsap.set('#invitationSection .line-inner', { yPercent: 115, opacity: 0 });
    gsap.set('#nikkahHeading', { scale: 0.78, opacity: 0 });
    gsap.set('.ornament-wing', { scaleX: 0, opacity: 0 });
    gsap.set('.ornament-diamond', { scale: 0, opacity: 0 });
    gsap.set('#inviteDaughter', { y: 18, opacity: 0 });

    const inviteEls = [
      '#invitationSection .line-inner',
      '#nikkahHeading',
      '.ornament-wing',
      '.ornament-diamond',
      '#inviteDaughter'
    ];
    const inviteTl = gsap.timeline({
      onStart: () => setTempWillChange(inviteEls, 'transform, opacity'),
      onComplete: () => clearTempWillChange(inviteEls),
      scrollTrigger: {
        trigger: '#invitationSection',
        start: 'top 76%',
        toggleActions: 'play none none none',
        once: true
      }
    });

    inviteTl
      .to('#invitationSection .line-inner', {
        yPercent: 0,
        opacity: 1,
        duration: 0.72,
        stagger: 0.2,
        ease: 'power3.out'
      })
      .to(
        '.ornament-diamond',
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: 'back.out(2)'
        },
        '-=0.2'
      )
      .to(
        '.ornament-wing',
        {
          scaleX: 1,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out'
        },
        '-=0.25'
      )
      .to(
        '#nikkahHeading',
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: 'back.out(1.6)'
        },
        '-=0.55'
      )
      .to(
        '#inviteDaughter',
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          ease: 'power2.out'
        },
        '-=0.25'
      );

    // ----------------------------------------------------------------------
    // 2. COUPLE NAMES SECTION (Pinned Scene, ~150% scroll length):
    //    "Yashfa Ali" slides in from left with ink write-on clip-path;
    //    heart divider & "with" pop in; "Zain Saleem" slides from right.
    //    Drifting parallax rose petals behind them.
    // ----------------------------------------------------------------------
    gsap.set('#brideName', { x: -55, opacity: 0 });
    gsap.set('#brideInkSpan', { clipPath: 'inset(0 100% 0 0%)' });
    gsap.set('#coupleDivider', { scale: 0.2, opacity: 0 });
    gsap.set('#groomName', { x: 55, opacity: 0 });
    gsap.set('#groomInkSpan', { clipPath: 'inset(0 100% 0 0%)' });

    // Play the couple reveal when the section enters AND pin the section for ~150% scroll length
    const coupleEls = ['#brideName', '#brideInkSpan', '#coupleDivider', '#groomName', '#groomInkSpan'];
    const coupleRevealTl = gsap.timeline({
      onStart: () => setTempWillChange(coupleEls, 'transform, opacity, clip-path'),
      onComplete: () => clearTempWillChange(coupleEls),
      scrollTrigger: {
        trigger: '#coupleSection',
        start: 'top 72%',
        toggleActions: 'play none none none',
        once: true
      }
    });

    coupleRevealTl
      .to(
        '#brideName',
        {
          x: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'power3.out'
        },
        0
      )
      .to(
        '#brideInkSpan',
        {
          clipPath: 'inset(0 0% 0 0%)',
          duration: 0.95,
          ease: 'power2.inOut'
        },
        0.05
      )
      .to(
        '#coupleDivider',
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'back.out(2.2)'
        },
        0.55
      )
      .to(
        '#groomName',
        {
          x: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'power3.out'
        },
        0.72
      )
      .to(
        '#groomInkSpan',
        {
          clipPath: 'inset(0 0% 0 0%)',
          duration: 0.95,
          ease: 'power2.inOut'
        },
        0.77
      );

    // Pinned scene (~150% scroll length) with parallax petals drifting behind
    ScrollTrigger.create({
      trigger: '#coupleSection',
      start: 'top top',
      end: '+=150%',
      pin: true,
      pinSpacing: true,
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;
        gsap.set('.couple-parallax-petal', {
          y: (i) => (i % 2 === 0 ? -90 * p : 80 * p),
          rotation: (i) => (i % 2 === 0 ? 75 * p : -75 * p)
        });
      }
    });

    // ----------------------------------------------------------------------
    // 3. DATE & TIME SECTION:
    //    Two ornate cards flip in 3D, slot reels roll in, gold line draws
    // ----------------------------------------------------------------------
    gsap.set(['#dateCard', '#timeCard'], {
      opacity: 0,
      y: 30,
      rotateY: -75
    });

    const dtEls = ['#dateCard', '#timeCard', '#slotDayReel', '#slotYearReel', '#slotHourReel'];
    const dtTl = gsap.timeline({
      onStart: () => setTempWillChange(dtEls, 'transform, opacity'),
      onComplete: () => clearTempWillChange(dtEls),
      scrollTrigger: {
        trigger: '#dateTimeSection',
        start: 'top 76%',
        toggleActions: 'play none none none',
        once: true
      }
    });

    dtTl
      .to(['#dateCard', '#timeCard'], {
        opacity: 1,
        y: 0,
        rotateY: 0,
        duration: 0.9,
        stagger: 0.2,
        ease: 'back.out(1.3)'
      })
      .to(
        '#dtConnectorPath',
        {
          strokeDashoffset: 0,
          duration: 0.8,
          ease: 'power2.inOut'
        },
        0.2
      )
      .to(
        ['#slotDayReel', '#slotYearReel', '#slotHourReel'],
        {
          yPercent: -80, // 5 items in each reel -> index 4 is -80%
          duration: 1.15,
          stagger: 0.12,
          ease: 'power3.inOut'
        },
        0.15
      );

    // ----------------------------------------------------------------------
    // 4. COUNTDOWN SECTION:
    //    Four gold-bordered tiles stagger in + "Save the date" button fades up
    // ----------------------------------------------------------------------
    gsap.set('.countdown-tile', { opacity: 0, y: 28, scale: 0.92 });
    gsap.set('#saveTheDateBtn', { opacity: 0, y: 18 });

    const cdEls = ['.countdown-tile', '#saveTheDateBtn'];
    const cdTl = gsap.timeline({
      onStart: () => setTempWillChange(cdEls, 'transform, opacity'),
      onComplete: () => clearTempWillChange(cdEls),
      scrollTrigger: {
        trigger: '#countdownSection',
        start: 'top 76%',
        toggleActions: 'play none none none',
        once: true
      }
    });

    cdTl
      .to('.countdown-tile', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.68,
        stagger: 0.11,
        ease: 'back.out(1.4)'
      })
      .to(
        '#saveTheDateBtn',
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'power2.out'
        },
        '-=0.25'
      );

    // ----------------------------------------------------------------------
    // 5. VENUE REVEAL SECTION:
    //    Curtain halves part from center, gold pin drops with bounce & ripples,
    //    venue name & address fade in
    // ----------------------------------------------------------------------
    gsap.set('#mapPin', { opacity: 0, y: -68, scale: 0.8 });
    gsap.set('#mapPinShadow', { opacity: 0, scale: 0.3 });
    gsap.set('#venueDetailsText', { opacity: 0, y: 18 });

    let venueRevealed = false;
    const playVenueReveal = () => {
      if (venueRevealed) return;
      venueRevealed = true;
      const veil = document.getElementById('venueVeil');
      if (veil) veil.classList.add('is-parted');

      const venueEls = ['#veilCrest', '#veilLeft', '#veilRight', '#mapPin', '#mapPinShadow', '#venueDetailsText'];
      setTempWillChange(venueEls, 'transform, opacity');

      const venueTl = gsap.timeline({
        onComplete: () => clearTempWillChange(venueEls)
      });
      venueTl
        .to('#veilCrest', { scale: 0.8, opacity: 0, duration: 0.32, ease: 'power2.in' }, 0)
        .to('#veilLeft', { xPercent: -104, opacity: 0.15, duration: 1.0, ease: 'power3.inOut' }, 0.16)
        .to('#veilRight', { xPercent: 104, opacity: 0.15, duration: 1.0, ease: 'power3.inOut' }, 0.16)
        .to('#mapPin', { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'bounce.out' }, 0.6)
        .to('#mapPinShadow', { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' }, 0.7)
        .to('#venueDetailsText', { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' }, 0.68);
    };

    ScrollTrigger.create({
      trigger: '#venueSection',
      start: 'top 74%',
      once: true,
      onEnter: playVenueReveal
    });

    const venueVeil = document.getElementById('venueVeil');
    if (venueVeil) {
      venueVeil.addEventListener('click', playVenueReveal);
      venueVeil.addEventListener('touchstart', playVenueReveal, { passive: true });
    }

    // ----------------------------------------------------------------------
    // 6. DRESS CODE SECTION:
    //    Two tall arch-shaped cards stagger up, SVG line illustrations draw
    //    themselves via stroke animation, 6 palette circles pop in one by one
    // ----------------------------------------------------------------------
    gsap.set(['#dressCardHer', '#dressCardHim'], { opacity: 0, y: 36 });
    gsap.set('#paletteStrip', { opacity: 0, y: 24 });
    gsap.set('.swatch-item', { opacity: 0, scale: 0.2 });
    gsap.set('#dressAvoidNote', { opacity: 0, y: 10 });

    const dressEls = ['#dressCardHer', '#dressCardHim', '#paletteStrip', '.swatch-item', '#dressAvoidNote'];
    const dressTl = gsap.timeline({
      onStart: () => setTempWillChange(dressEls, 'transform, opacity'),
      onComplete: () => clearTempWillChange(dressEls),
      scrollTrigger: {
        trigger: '#dressCodeSection',
        start: 'top 76%',
        toggleActions: 'play none none none',
        once: true
      }
    });

    dressTl
      .to(['#dressCardHer', '#dressCardHim'], {
        opacity: 1,
        y: 0,
        duration: 0.78,
        stagger: 0.18,
        ease: 'power3.out'
      })
      .to(
        '.attire-stroke',
        {
          strokeDashoffset: 0,
          duration: 1.25,
          stagger: 0.08,
          ease: 'power2.inOut'
        },
        0.15
      )
      .to(
        '#paletteStrip',
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'power2.out'
        },
        0.55
      )
      .to(
        '.swatch-item',
        {
          opacity: 1,
          scale: 1,
          duration: 0.48,
          stagger: 0.09,
          ease: 'back.out(2.1)'
        },
        0.7
      )
      .to(
        '#dressAvoidNote',
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out'
        },
        1.15
      );

    // ----------------------------------------------------------------------
    // 7. CLOSING SECTION:
    //    Word-by-word quote with gold glow, family line, WhatsApp RSVP button
    // ----------------------------------------------------------------------
    gsap.set('.quote-word', { opacity: 0, y: 14 });
    gsap.set(['#closingFamily', '#rsvpWhatsappBtn', '#closingSeal'], { opacity: 0, y: 18 });

    const closingEls = ['.quote-word', '#closingFamily', '#rsvpWhatsappBtn', '#closingSeal'];
    const closingTl = gsap.timeline({
      onStart: () => setTempWillChange(closingEls, 'transform, opacity'),
      onComplete: () => clearTempWillChange(closingEls),
      scrollTrigger: {
        trigger: '#closingSection',
        start: 'top 85%',
        toggleActions: 'play none none none',
        once: true
      }
    });

    closingTl
      .to('.quote-word', {
        opacity: 1,
        y: 0,
        duration: 0.42,
        stagger: 0.06,
        ease: 'power2.out'
      })
      .to(
        '#closingFamily',
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'power2.out'
        },
        '-=0.15'
      )
      .to(
        '#rsvpWhatsappBtn',
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'back.out(1.5)'
        },
        '-=0.25'
      )
      .to(
        '#closingSeal',
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'back.out(1.6)'
        },
        '-=0.3'
      );
  }

  /* ========================================================================
     SLOT COUNTER REELS FOR DATE & TIME
     ======================================================================== */
  function setupSlotCounterDOM() {
    const reels = document.querySelectorAll('.slot-reel');
    reels.forEach((reel) => {
      const raw = reel.getAttribute('data-values');
      if (!raw) return;
      const items = raw.split(',');
      if (prefersReducedMotion) {
        reel.innerHTML = `<span>${items[items.length - 1]}</span>`;
        return;
      }
      reel.innerHTML = items.map((val) => `<span>${val}</span>`).join('');
    });
  }

  /* ========================================================================
     4. LIVE COUNTDOWN TO 2026-11-21T14:00:00+05:00
        Updates every second, pauses when tab is hidden, resyncs when visible.
     ======================================================================== */
  function setupLiveCountdown() {
    const targetTime = new Date(TARGET_ISO_DATE).getTime();
    const elDays = document.getElementById('cdDays');
    const elHours = document.getElementById('cdHours');
    const elMinutes = document.getElementById('cdMinutes');
    const elSeconds = document.getElementById('cdSeconds');
    const grid = document.getElementById('countdownGrid');
    const arrivedMsg = document.getElementById('countdownArrived');

    if (!elDays || !elHours || !elMinutes || !elSeconds) return;

    let intervalId = null;
    const prevValues = {
      days: null,
      hours: null,
      minutes: null,
      seconds: null
    };

    function updateTile(el, key, newVal) {
      const formatted = String(newVal).padStart(2, '0');
      if (prevValues[key] === formatted) return;

      const isInitial = prevValues[key] === null;
      prevValues[key] = formatted;

      if (isInitial || prefersReducedMotion || typeof gsap === 'undefined' || document.hidden) {
        el.textContent = formatted;
        return;
      }

      gsap.to(el, {
        y: -10,
        rotateX: 65,
        opacity: 0,
        duration: 0.16,
        ease: 'power1.in',
        onComplete: () => {
          el.textContent = formatted;
          gsap.fromTo(
            el,
            { y: 10, rotateX: -65, opacity: 0 },
            { y: 0, rotateX: 0, opacity: 1, duration: 0.24, ease: 'back.out(1.6)' }
          );
        }
      });
    }

    function tick() {
      if (document.hidden) return true;

      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        updateTile(elDays, 'days', 0);
        updateTile(elHours, 'hours', 0);
        updateTile(elMinutes, 'minutes', 0);
        updateTile(elSeconds, 'seconds', 0);
        if (grid) grid.hidden = true;
        if (arrivedMsg) arrivedMsg.hidden = false;
        stopInterval();
        return false;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      updateTile(elDays, 'days', days);
      updateTile(elHours, 'hours', hours);
      updateTile(elMinutes, 'minutes', minutes);
      updateTile(elSeconds, 'seconds', seconds);
      return true;
    }

    function startInterval() {
      if (intervalId) return;
      intervalId = setInterval(() => {
        tick();
      }, 1000);
    }

    function stopInterval() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    // Pause when tab is hidden, resync immediately when visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopInterval();
      } else {
        if (tick()) startInterval();
      }
    });

    if (tick()) {
      startInterval();
    }
  }

  /* ========================================================================
     "SAVE THE DATE" .ICS CALENDAR FILE DOWNLOAD
     Title: "Nikkah of Yashfa & Zain"
     Date: 21 Nov 2026 2:00 PM PKT (09:00 UTC)
     Location: "Bahira Town Gul Bahar Block, Lahore"
     ======================================================================== */
  function setupSaveTheDateICS() {
    const btn = document.getElementById('saveTheDateBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const icsLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Yashfa & Zain Nikkah Invitation//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:nikkah-yashfa-zain-20261121@nikkahinvitation.local',
        'DTSTAMP:20261030T000000Z',
        'DTSTART:20261121T090000Z',
        'DTEND:20261121T130000Z',
        'SUMMARY:Nikkah of Yashfa & Zain',
        'DESCRIPTION:Mr. & Mrs. Asghar Bashir invite you to the Nikkah of beloved daughter Yashfa Ali with Zain Saleem. May this day mark the beginning of a lifetime together.',
        'LOCATION:Bahira Town Gul Bahar Block\\, Lahore',
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ];

      const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Nikkah-of-Yashfa-and-Zain.ics';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    });
  }

  /* ========================================================================
     "COPY ADDRESS" SECONDARY BUTTON IN VENUE SECTION
     ======================================================================== */
  function setupCopyAddressButton() {
    const btn = document.getElementById('copyAddressBtn');
    const label = document.getElementById('copyAddressLabel');
    if (!btn || !label) return;

    btn.addEventListener('click', () => {
      const address = btn.getAttribute('data-address') || 'Bahira Town Gul Bahar Block, Lahore';

      const showCopied = () => {
        label.textContent = 'Address Copied ✓';
        setTimeout(() => {
          label.textContent = 'Copy address';
        }, 2200);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address).then(showCopied).catch(showCopied);
      } else {
        showCopied();
      }
    });
  }

  /* ========================================================================
     HTML5 CANVAS GOLD DUST PARTICLES (Max 40 particles, pauses when tab hidden)
     ======================================================================== */
  function setupGoldDustCanvas() {
    const canvas = document.getElementById('goldDustCanvas');
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let rafId = null;
    const MAX_PARTICLES = 24;
    const particles = [];

    function resize() {
      const shell = document.getElementById('invitationShell');
      width = shell ? shell.clientWidth : Math.min(window.innerWidth, 430);
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    for (let i = 0; i < MAX_PARTICLES; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1.1 + Math.random() * 2.1,
        vx: (Math.random() - 0.5) * 0.28,
        vy: -0.18 - Math.random() * 0.35,
        alpha: 0.2 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2
      });
    }

    function render() {
      if (document.hidden) {
        rafId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx + Math.sin(p.phase) * 0.12;
        p.y += p.vy;
        p.phase += 0.02;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const twinkle = 0.55 + 0.45 * Math.sin(p.phase * 1.5);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(218, 180, 92, ${(p.alpha * twinkle).toFixed(3)})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(render);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      } else if (!rafId) {
        rafId = requestAnimationFrame(render);
      }
    });

    rafId = requestAnimationFrame(render);
  }

  /* ========================================================================
     LANTERN SWAY & DEVICE-TILT / MOUSE PARALLAX
     ======================================================================== */
  function setupLanternSway() {
    if (prefersReducedMotion) return;

    const lanterns = document.querySelectorAll('.lantern');
    lanterns.forEach((lantern, idx) => {
      const angle = idx % 2 === 0 ? 3.4 : -3.4;
      const duration = 2.7 + (idx % 3) * 0.45;

      gsap.fromTo(
        lantern,
        { rotation: -angle },
        {
          rotation: angle,
          duration: duration,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        }
      );
    });
  }

  function setupLanternParallax() {
    if (prefersReducedMotion) return;

    const parallaxNodes = document.querySelectorAll('.parallax-lantern-wrap');
    if (!parallaxNodes.length) return;

    const setters = Array.from(parallaxNodes).map((node) => {
      const depth = parseFloat(node.getAttribute('data-depth') || '1');
      return {
        depth,
        xTo: gsap.quickTo(node, 'x', { duration: 0.6, ease: 'power2.out' }),
        yTo: gsap.quickTo(node, 'y', { duration: 0.6, ease: 'power2.out' })
      };
    });

    window.addEventListener(
      'pointermove',
      (e) => {
        const nx = (e.clientX / window.innerWidth - 0.5) * 2;
        const ny = (e.clientY / window.innerHeight - 0.5) * 2;
        setters.forEach((s) => {
          s.xTo(nx * 10 * s.depth);
          s.yTo(ny * 6 * s.depth);
        });
      },
      { passive: true }
    );

    window.addEventListener(
      'deviceorientation',
      (e) => {
        if (e.gamma === null || e.beta === null) return;
        const nx = Math.max(-1, Math.min(1, e.gamma / 30));
        const ny = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
        setters.forEach((s) => {
          s.xTo(nx * 12 * s.depth);
          s.yTo(ny * 8 * s.depth);
        });
      },
      { passive: true }
    );
  }

  /* ========================================================================
     COUPLE PARALLAX ROSE PETALS & CLOSING FALLING ROSE PETALS (Max 25)
     ======================================================================== */
  function setupCoupleParallaxPetals() {
    const backdrop = document.getElementById('couplePetalsBackdrop');
    if (!backdrop || prefersReducedMotion) return;
    backdrop.innerHTML = '';

    const count = 10;
    const svgNS = 'http://www.w3.org/2000/svg';
    const colors = ['#D49B9E', '#E6B8BB', '#C47D85', '#F2D4D7'];

    for (let i = 0; i < count; i++) {
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 20 26');
      svg.classList.add('couple-parallax-petal');
      svg.style.left = `${(i * 9.5 + 6) % 90}%`;
      svg.style.top = `${(i * 13 + 10) % 85}%`;

      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', 'M10 1 C16 5, 19 13, 15 21 C12 25, 7 25, 4 20 C1 13, 4 5, 10 1 Z');
      path.setAttribute('fill', colors[i % colors.length]);
      svg.appendChild(path);
      backdrop.appendChild(svg);
    }
  }

  function setupFallingRosePetals() {
    if (prefersReducedMotion) return;

    const layer = document.getElementById('fallingPetalsLayer');
    if (!layer) return;
    layer.innerHTML = '';

    const petalCount = 14; // Capped for 60fps on mid-range mobile (<= 25 max)
    const petalColors = ['#D49B9E', '#E6B8BB', '#C47D85', '#F2D4D7'];
    const svgNS = 'http://www.w3.org/2000/svg';

    for (let i = 0; i < petalCount; i++) {
      const petalSvg = document.createElementNS(svgNS, 'svg');
      petalSvg.setAttribute('viewBox', '0 0 20 26');
      petalSvg.classList.add('rose-petal');
      petalSvg.style.left = `${(i * 6.8 + 4) % 94}%`;

      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute(
        'd',
        'M10 1 C16 5, 19 13, 15 21 C12 25, 7 25, 4 20 C1 13, 4 5, 10 1 Z'
      );
      path.setAttribute('fill', petalColors[i % petalColors.length]);
      path.setAttribute('opacity', '0.78');
      petalSvg.appendChild(path);
      layer.appendChild(petalSvg);

      gsap.fromTo(
        petalSvg,
        {
          y: -30,
          x: 0,
          rotation: -20 + (i % 5) * 10,
          opacity: 0
        },
        {
          y: 680,
          x: (i % 2 === 0 ? 1 : -1) * (28 + (i % 4) * 10),
          rotation: 120 + (i % 4) * 35,
          opacity: 0.82,
          duration: 6.2 + (i % 5) * 1.1,
          repeat: -1,
          delay: i * 0.35,
          ease: 'sine.inOut'
        }
      );
    }
  }

  /* ========================================================================
     TOP SCROLL PROGRESS BAR
     ======================================================================== */
  function setupScrollProgressBar() {
    const bar = document.getElementById('scrollProgressBar');
    if (!bar) return;

    gsap.to(bar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.15
      }
    });
  }

  /* ========================================================================
     OPTIONAL BACKGROUND MUSIC TOGGLE (/assets/music.mp3)
     ======================================================================== */
  function setupOptionalMusicToggle() {
    const btn = document.getElementById('musicToggleBtn');
    if (!btn) return;

    const musicPath = '/assets/music.mp3';

    fetch(musicPath, { method: 'HEAD' })
      .then((res) => {
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || contentType.includes('text/html')) {
          return;
        }

        bgAudio = new Audio(musicPath);
        bgAudio.loop = true;
        bgAudio.preload = 'metadata';

        bgAudio.addEventListener(
          'canplaythrough',
          () => {
            musicAvailable = true;
            btn.hidden = false;
          },
          { once: true }
        );

        bgAudio.addEventListener('error', () => {
          musicAvailable = false;
          btn.hidden = true;
        });

        btn.addEventListener('click', () => {
          musicEnabledByUser = !musicEnabledByUser;
          btn.setAttribute('aria-pressed', musicEnabledByUser ? 'true' : 'false');

          if (!bgAudio) return;
          if (musicEnabledByUser) {
            bgAudio.play().catch(() => {});
          } else {
            bgAudio.pause();
          }
        });
      })
      .catch(() => {
        btn.hidden = true;
      });
  }

  function authorizeAndPlayMusicOnTap() {
    if (!bgAudio || !musicAvailable || !musicEnabledByUser) return;
    if (bgAudio.paused) {
      bgAudio.play().catch(() => {});
    }
  }
})();
