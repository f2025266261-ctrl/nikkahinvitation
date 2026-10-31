/**
 * Yashfa Ali & Zain Saleem — Blush-Pink Pearl Nikkah Wedding Invitation
 * 100% Native Scroll Architecture · Single IntersectionObserver · Zero Lenis/ScrollTrigger
 */

(function () {
  'use strict';

  const TARGET_ISO_DATE = '2026-11-21T14:00:00+05:00';

  let envelopeOpened = false;
  let prefersReducedMotion = false;

  // Audio state (OFF by default; only plays if /assets/music.mp3 exists & user enables it)
  let bgAudio = null;
  let musicAvailable = false;
  let musicEnabledByUser = false;

  // Expose flags for automated QA & profiling
  window.__lenis = null;
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Lock scroll during the blush envelope intro using ONLY html.locked
    document.documentElement.classList.add('locked');

    setupGuestPersonalization();
    setupSaveTheDateICS();
    setupCopyAddressButton();
    setupOptionalMusicToggle();
    setupLiveCountdown();
    setupScrollingClassDebounce();
    setupAmbientVisibilityObserver();
    prepareSectionInitialStates();
    setupEnvelopeIntro();
    setupSingleRevealObserver();
    setupScrollHintLink();
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

  /* ========================================================================
     PASSIVE SCROLL LISTENER WITH 120ms DEBOUNCE
     Adds html.scrolling while actively scrolling so CSS ambient animations
     (chandelier sway, crystal twinkle, candle flames, petals) pause completely.
     ======================================================================== */
  function setupScrollingClassDebounce() {
    let scrollTimer = null;
    const root = document.documentElement;

    window.addEventListener(
      'scroll',
      () => {
        if (!root.classList.contains('scrolling')) {
          root.classList.add('scrolling');
        }
        if (scrollTimer !== null) {
          clearTimeout(scrollTimer);
        }
        scrollTimer = setTimeout(() => {
          root.classList.remove('scrolling');
          scrollTimer = null;
        }, 120);
      },
      { passive: true }
    );
  }

  /* ========================================================================
     AMBIENT PLAY/PAUSE OBSERVER
     Pauses all chandelier sway, crystal twinkle, flame flicker & petal loops
     when their section is off-screen.
     ======================================================================== */
  function setupAmbientVisibilityObserver() {
    if (typeof IntersectionObserver === 'undefined') return;

    const ambientObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-active');
          } else {
            entry.target.classList.remove('section-active');
          }
        });
      },
      { threshold: 0.05 }
    );

    const allSections = document.querySelectorAll('.section');
    allSections.forEach((sec) => ambientObserver.observe(sec));
  }

  /* ========================================================================
     SECTION 0. INTRO: BLUSH ENVELOPE WITH SATIN RIBBON BOW & WAX SEAL (~2.5s)
     On tap:
     1. Seal cracks into 2 pieces & fades along with satin ribbon bow
     2. Envelope top flap opens in 3D (rotateX 180deg)
     3. Pearl-ivory card slides up and envelope drops away
     4. Scroll unlocks (html.locked removed) & intro removed from DOM
     ======================================================================== */
  function setupEnvelopeIntro() {
    const envelopeIntro = document.getElementById('envelopeIntro');
    const envelopeSealBtn = document.getElementById('envelopeSealBtn');
    const envelopeTapBtn = document.getElementById('envelopeTapBtn');
    const envelopeStage = document.getElementById('envelopeStage');

    if (!envelopeIntro || !envelopeSealBtn) {
      unlockAndRemoveIntro(envelopeIntro);
      playHeroEntrance();
      return;
    }

    const triggerOpenEnvelope = () => {
      if (envelopeOpened) return;
      envelopeOpened = true;
      prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      envelopeIntro.style.pointerEvents = 'none';
      envelopeSealBtn.disabled = true;
      if (envelopeTapBtn) envelopeTapBtn.disabled = true;

      authorizeAndPlayMusicOnTap();

      if (prefersReducedMotion || typeof gsap === 'undefined') {
        unlockAndRemoveIntro(envelopeIntro);
        playHeroEntrance();
        return;
      }

      // Stop idle pulse on the wax seal button
      envelopeSealBtn.style.animation = 'none';

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete: () => {
          unlockAndRemoveIntro(envelopeIntro);
        }
      });

      // 0.00s - 0.45s: Dusty-rose wax seal cracks apart & fades with satin bow
      tl.to(
        '#sealHalfLeft',
        {
          x: -22,
          y: 16,
          rotation: -18,
          opacity: 0,
          duration: 0.42,
          ease: 'power2.in'
        },
        0
      )
        .to(
          '#sealHalfRight',
          {
            x: 22,
            y: 18,
            rotation: 18,
            opacity: 0,
            duration: 0.42,
            ease: 'power2.in'
          },
          0
        )
        .to(
          ['#envelopeSatinBow', envelopeTapBtn, '#introTopCaption'],
          {
            opacity: 0,
            y: 8,
            duration: 0.36,
            ease: 'power2.in'
          },
          0.04
        )
        // 0.35s - 1.05s: Envelope top flap opens in 3D (rotateX 180deg)
        .to(
          '#envelopeTopFlap',
          {
            rotateX: 180,
            duration: 0.72,
            ease: 'power2.inOut'
          },
          0.35
        )
        .set('#envelopeTopFlap', { zIndex: 1 }, 0.72)
        // 0.90s - 1.75s: Pearl-ivory card slides up while envelope drops away
        .to(
          '#envelopeRisingCard',
          {
            y: -115,
            scale: 1.04,
            duration: 0.82,
            ease: 'power3.out'
          },
          0.9
        )
        .to(
          '#envelopeWrapper',
          {
            y: 85,
            opacity: 0,
            duration: 0.78,
            ease: 'power2.in'
          },
          1.32
        )
        // Start Hero entrance as the envelope drops away
        .add(() => {
          playHeroEntrance();
        }, 1.65)
        // 1.80s - 2.45s: Fade out intro container and unlock native scroll (~2.5s total)
        .to(
          envelopeIntro,
          {
            opacity: 0,
            duration: 0.65,
            ease: 'power2.out'
          },
          1.8
        );
    };

    envelopeSealBtn.addEventListener('click', triggerOpenEnvelope);
    if (envelopeTapBtn) envelopeTapBtn.addEventListener('click', triggerOpenEnvelope);
    if (envelopeStage) envelopeStage.addEventListener('click', triggerOpenEnvelope);
  }

  function unlockAndRemoveIntro(envelopeIntro) {
    document.documentElement.classList.remove('locked');
    window.scrollTo(0, 0);
    if (envelopeIntro && envelopeIntro.parentNode) {
      envelopeIntro.remove();
    }
  }

  /* ========================================================================
     PREPARE INITIAL STATES FOR HERO & SECTIONS 2–8
     ======================================================================== */
  function prepareSectionInitialStates() {
    // Prepare one-time SVG stroke-dashoffset using pathLength="100" (zero layout reads)
    const strokeEls = document.querySelectorAll('.dt-flourish-stroke, .attire-stroke');
    strokeEls.forEach((el) => {
      el.style.strokeDasharray = '100';
      el.style.strokeDashoffset = prefersReducedMotion ? '0' : '100';
    });

    if (typeof gsap === 'undefined') return;

    if (prefersReducedMotion) {
      gsap.set(
        [
          '#invitationSection .invitation-arch-card',
          '#coupleSection .couple-arch-card',
          '#dateTimeSection .datetime-pearl-card',
          '#countdownSection .countdown-grid',
          '#venueSection .venue-card-stage',
          '#dressCodeSection .dress-cards',
          '#closingSection .closing-arch-wrap'
        ],
        { opacity: 0 }
      );
      return;
    }

    // 1. HERO initial states
    gsap.set('#heroChandelier', { opacity: 0, y: -72 });
    gsap.set('#bismillahWipeMask', { clipPath: 'inset(0 0% 0 100%)', opacity: 0.2 });
    gsap.set('#guestGreeting', { opacity: 0, y: 12 });
    gsap.set('#heroMedallion', { opacity: 0, scale: 0.9, y: 14 });
    gsap.set('#heroScrollHint', { opacity: 0, y: 10 });

    // 2. INVITATION initial states
    gsap.set('#invitationSection .anim-invite-line', { opacity: 0, y: 18 });
    gsap.set('#nikkahHeading', { opacity: 0, scale: 0.88 });
    gsap.set('#invitationSection .leaf-flourish', { scaleX: 0, opacity: 0 });
    gsap.set('#inviteDaughter', { opacity: 0, y: 14 });

    // 3. NAMES initial states
    gsap.set('#coupleCandleGlow', { opacity: 0 });
    gsap.set('#brideName', { opacity: 0, x: -46 });
    gsap.set('#coupleDivider', { opacity: 0, scale: 0.35 });
    gsap.set('#groomName', { opacity: 0, x: 46 });

    // 4. DATE & TIME initial states
    gsap.set('#dateTimeSection .dt-stagger-item', { opacity: 0, y: 20 });
    gsap.set('#dateTimeSection .dt-flourish-reveal', { opacity: 0, scaleX: 0.2 });

    // 5. COUNTDOWN initial states
    gsap.set('.countdown-oval-tile', { opacity: 0, y: 22, scale: 0.94 });
    gsap.set('#saveTheDateBtn', { opacity: 0, y: 14 });

    // 6. VENUE initial states
    gsap.set('#mapPin', { opacity: 0, y: -54, scale: 0.82 });
    gsap.set('#mapPinShadow', { opacity: 0, scale: 0.3 });
    gsap.set('#venueDetailsText', { opacity: 0, y: 16 });

    // 7. DRESS CODE initial states
    gsap.set('#dressCandleGlow', { opacity: 0 });
    gsap.set(['#dressCardHer', '#dressCardHim'], { opacity: 0, y: 26 });
    gsap.set('#paletteStrip', { opacity: 0, y: 16 });
    gsap.set('.swatch-item', { opacity: 0, scale: 0.25 });
    gsap.set('#dressAvoidNote', { opacity: 0, y: 8 });

    // 8. CLOSING initial states
    gsap.set('#closingCandleGlow', { opacity: 0 });
    gsap.set('.quote-word', { opacity: 0, y: 12 });
    gsap.set(['#closingFamily', '#closingSeal'], { opacity: 0, y: 16 });
  }

  /* ========================================================================
     1. HERO ENTRANCE TIMELINE (Plays Once When Envelope Opens)
     Chandelier descends once with a small bounce, Bismillah reveals via
     clip-path wipe, Y & Z oval monogram & Scroll hint fade in.
     ======================================================================== */
  function playHeroEntrance() {
    if (typeof gsap === 'undefined' || prefersReducedMotion) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to(
      '#heroChandelier',
      {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'back.out(1.45)'
      },
      0
    )
      .to(
        '#bismillahWipeMask',
        {
          clipPath: 'inset(0 0% 0 0%)',
          opacity: 1,
          duration: 1.1,
          ease: 'power2.inOut'
        },
        0.18
      )
      .to(
        '#guestGreeting',
        {
          opacity: 1,
          y: 0,
          duration: 0.48
        },
        0.65
      )
      .to(
        '#heroMedallion',
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.65,
          ease: 'back.out(1.4)'
        },
        0.78
      )
      .to(
        '#heroScrollHint',
        {
          opacity: 1,
          y: 0,
          duration: 0.48
        },
        0.98
      );
  }

  /* ========================================================================
     SINGLE INTERSECTIONOBSERVER FOR ALL SECTIONS
     threshold: 0.25, rootMargin: "0px 0px -10% 0px"
     Adds .in-view once per element, then unobserves it and plays its
     one-time GSAP animation using transform & opacity only.
     ======================================================================== */
  function setupSingleRevealObserver() {
    const sections = document.querySelectorAll('.section:not(.hero-section)');
    if (!sections.length) return;

    if (typeof IntersectionObserver === 'undefined') {
      sections.forEach((sec) => {
        sec.classList.add('in-view');
        playSectionOnce(sec.id);
      });
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const sec = entry.target;
          sec.classList.add('in-view');
          observer.unobserve(sec);
          playSectionOnce(sec.id);
        });
      },
      {
        threshold: 0.25,
        rootMargin: '0px 0px -10% 0px'
      }
    );

    sections.forEach((sec) => {
      revealObserver.observe(sec);
    });
  }

  function playSectionOnce(sectionId) {
    if (typeof gsap === 'undefined') return;

    if (prefersReducedMotion) {
      const targetMap = {
        invitationSection: '#invitationSection .invitation-arch-card',
        coupleSection: '#coupleSection .couple-arch-card',
        dateTimeSection: '#dateTimeSection .datetime-pearl-card',
        countdownSection: '#countdownSection .countdown-grid',
        venueSection: '#venueSection .venue-card-stage',
        dressCodeSection: '#dressCodeSection .dress-cards',
        closingSection: '#closingSection .closing-arch-wrap'
      };
      const target = targetMap[sectionId];
      if (target) {
        gsap.to(target, { opacity: 1, duration: 0.35, ease: 'power1.out' });
      }
      return;
    }

    switch (sectionId) {
      case 'invitationSection': {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.to('#invitationSection .anim-invite-line', {
          opacity: 1,
          y: 0,
          duration: 0.58,
          stagger: 0.16
        })
          .to(
            '#invitationSection .leaf-flourish',
            {
              scaleX: 1,
              opacity: 1,
              duration: 0.62
            },
            '-=0.2'
          )
          .to(
            '#nikkahHeading',
            {
              opacity: 1,
              scale: 1,
              duration: 0.7,
              ease: 'back.out(1.45)'
            },
            '-=0.45'
          )
          .to(
            '#invitationSection .one-time-foil-sweep',
            {
              xPercent: 420,
              duration: 0.9,
              ease: 'power2.inOut'
            },
            '-=0.4'
          )
          .to(
            '#inviteDaughter',
            {
              opacity: 1,
              y: 0,
              duration: 0.52
            },
            '-=0.42'
          );
        break;
      }

      case 'coupleSection': {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.to(
          '#coupleCandleGlow',
          {
            opacity: 1,
            duration: 0.9,
            ease: 'power1.out'
          },
          0
        )
          .to(
            '#brideName',
            {
              opacity: 1,
              x: 0,
              duration: 0.72
            },
            0.05
          )
          .to(
            '#coupleDivider',
            {
              opacity: 1,
              scale: 1,
              duration: 0.52,
              ease: 'back.out(2)'
            },
            '-=0.32'
          )
          .to(
            '#groomName',
            {
              opacity: 1,
              x: 0,
              duration: 0.72
            },
            '-=0.28'
          );
        break;
      }

      case 'dateTimeSection': {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.to(
          '#dateTimeSection .dt-flourish-reveal',
          {
            opacity: 1,
            scaleX: 1,
            duration: 0.55,
            ease: 'power2.out'
          },
          0
        ).to(
          '#dateTimeSection .dt-stagger-item',
          {
            opacity: 1,
            y: 0,
            duration: 0.48,
            stagger: 0.065
          },
          0.06
        );
        break;
      }

      case 'countdownSection': {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.to('.countdown-oval-tile', {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.58,
          stagger: 0.1,
          ease: 'back.out(1.3)'
        }).to(
          '#saveTheDateBtn',
          {
            opacity: 1,
            y: 0,
            duration: 0.48
          },
          '-=0.2'
        );
        break;
      }

      case 'venueSection': {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.to(
          '#veilLeft',
          {
            xPercent: -102,
            opacity: 0,
            duration: 0.88,
            ease: 'power2.inOut'
          },
          0
        )
          .to(
            '#veilRight',
            {
              xPercent: 102,
              opacity: 0,
              duration: 0.88,
              ease: 'power2.inOut'
            },
            0
          )
          .to(
            '#mapPin',
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.76,
              ease: 'bounce.out'
            },
            0.42
          )
          .to(
            '#mapPinShadow',
            {
              opacity: 1,
              scale: 1,
              duration: 0.38
            },
            0.52
          )
          .fromTo(
            '#mapPinRipple',
            { opacity: 0.85, scale: 0.3 },
            { opacity: 0, scale: 2.2, duration: 0.82, ease: 'power2.out' },
            0.62
          )
          .to(
            '#venueDetailsText',
            {
              opacity: 1,
              y: 0,
              duration: 0.56
            },
            0.52
          )
          .to(
            '#mapsCtaBtn .btn-shimmer-once',
            {
              xPercent: 460,
              duration: 0.88,
              ease: 'power2.inOut'
            },
            0.9
          );
        break;
      }

      case 'dressCodeSection': {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.to(
          '#dressCandleGlow',
          {
            opacity: 1,
            duration: 0.75,
            ease: 'power1.out'
          },
          0
        )
          .to(
            ['#dressCardHer', '#dressCardHim'],
            {
              opacity: 1,
              y: 0,
              duration: 0.48,
              stagger: 0.1
            },
            0
          )
          .to(
            '.attire-stroke',
            {
              strokeDashoffset: 0,
              duration: 0.7,
              stagger: 0.03,
              ease: 'power2.inOut'
            },
            0.05
          )
          .to(
            '#paletteStrip',
            {
              opacity: 1,
              y: 0,
              duration: 0.4
            },
            0.18
          )
          .to(
            '.swatch-item',
            {
              opacity: 1,
              scale: 1,
              duration: 0.32,
              stagger: 0.04,
              ease: 'back.out(1.7)'
            },
            0.22
          )
          .to(
            '#dressAvoidNote',
            {
              opacity: 1,
              y: 0,
              duration: 0.35
            },
            0.45
          );
        break;
      }

      case 'closingSection': {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
        tl.to(
          '#closingCandleGlow',
          {
            opacity: 1,
            duration: 0.9,
            ease: 'power1.out'
          },
          0
        )
          .to(
            '.quote-word',
            {
              opacity: 1,
              y: 0,
              duration: 0.36,
              stagger: 0.055
            },
            0.05
          )
          .to(
            '#closingFamily',
            {
              opacity: 1,
              y: 0,
              duration: 0.48
            },
            '-=0.1'
          )
          .to(
            '#closingSeal',
            {
              opacity: 1,
              y: 0,
              duration: 0.48,
              ease: 'back.out(1.5)'
            },
            '-=0.2'
          );
        break;
      }

      default:
        break;
    }
  }

  /* ========================================================================
     HERO SCROLL HINT CLICK HANDLER
     ======================================================================== */
  function setupScrollHintLink() {
    const scrollHint = document.getElementById('heroScrollHint');
    if (!scrollHint) return;

    scrollHint.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('invitationSection');
      if (target) {
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  }

  /* ========================================================================
     5. LIVE COUNTDOWN TO 2026-11-21T14:00:00+05:00
        Tabular-nums + quick fade/slide on digit change.
        Pauses when tab is hidden, resyncs when visible.
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

      if (
        isInitial ||
        prefersReducedMotion ||
        typeof gsap === 'undefined' ||
        document.hidden ||
        document.documentElement.classList.contains('scrolling')
      ) {
        el.textContent = formatted;
        return;
      }

      // Quick fade/slide using only transform & opacity
      gsap.to(el, {
        y: -6,
        opacity: 0,
        duration: 0.12,
        ease: 'power1.in',
        onComplete: () => {
          el.textContent = formatted;
          gsap.fromTo(
            el,
            { y: 6, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.18, ease: 'power2.out' }
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
      intervalId = setInterval(tick, 1000);
    }

    function stopInterval() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopInterval();
      } else if (tick()) {
        startInterval();
      }
    });

    if (tick()) {
      startInterval();
    }
  }

  /* ========================================================================
     "SAVE THE DATE" .ICS CALENDAR FILE DOWNLOAD
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
        'DTSTAMP:20261031T000000Z',
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
