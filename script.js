(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
     Ambient floating particles (hearts / petals / stars)
     ============================================================ */
  function spawnAmbientParticles() {
    if (reducedMotion) return;
    const layer = document.getElementById("particles");
    const glyphs = ["🤍", "🌸", "✨", "💜"];
    const count = window.innerWidth < 480 ? 10 : 16;

    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = "particle";
      el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      const left = Math.random() * 100;
      const duration = 10 + Math.random() * 10;
      const delay = Math.random() * 14;
      const drift = (Math.random() * 60 - 30) + "px";
      const size = 0.7 + Math.random() * 0.9;

      el.style.left = left + "vw";
      el.style.fontSize = size + "rem";
      el.style.setProperty("--drift", drift);
      el.style.animationDuration = duration + "s";
      el.style.animationDelay = delay + "s";
      layer.appendChild(el);
    }
  }

  function burstHearts(container, count, glyph) {
    if (reducedMotion) {
      // still show a gentle, single, non-animated cue
      count = Math.min(count, 3);
    }
    const rect = container.getBoundingClientRect();
    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = "burst-heart";
      el.textContent = glyph || "🤍";
      const x = 20 + Math.random() * 60; // percent within container
      const delay = Math.random() * 0.6;
      el.style.left = x + "%";
      el.style.bottom = "10%";
      el.style.animationDelay = delay + "s";
      container.appendChild(el);
      setTimeout(() => el.remove(), 2600);
    }
  }

  /* ============================================================
     Opening screen sequence
     ============================================================ */
  function runOpeningSequence() {
    const lines = Array.from(document.querySelectorAll(".opening .line"));
    const openBtn = document.getElementById("openBtn");
    let delay = 300;
    const step = reducedMotion ? 120 : 900;

    lines.forEach((line) => {
      setTimeout(() => line.classList.add("show"), delay);
      delay += step;
    });

    setTimeout(() => openBtn.classList.add("show"), delay + 200);
  }

  function goToMain() {
    const opening = document.getElementById("opening");
    const main = document.getElementById("main");
    opening.style.transition = "opacity .5s ease";
    opening.style.opacity = "0";
    setTimeout(() => {
      opening.hidden = true;
      main.hidden = false;
      main.classList.add("reveal");
      window.scrollTo(0, 0);
    }, reducedMotion ? 0 : 480);
  }

  /* ============================================================
     Care cards (envelope open/close)
     ============================================================ */
  const cardContent = {
    tired: {
      icon: "💌",
      text: "You don’t have to do anything right now. Just breathe, get comfortable, and let yourself rest. The world can wait. 🤍",
    },
    lonely: {
      icon: "🌷",
      text: "Even if I’m not right beside you, I hope you remember that there’s someone here who genuinely cares about you. You never have to feel like you’re alone. 🫂",
    },
    hugneed: {
      icon: "🫂",
      text: "Okay… come here. 🫂\n\nConsider this your very long-distance hug.\n\nNo escaping until you feel at least a tiny bit better. 🤍",
    },
    smile: {
      icon: "☁️",
      text: "Your only job right now is to get better.\n\nEverything else can wait.\n\nAnd yes, that includes pretending you’re completely fine when you’re obviously not. 😭🤍",
    },
    sleep: {
      icon: "🌙",
      text: "Put your phone down soon, get yourself comfortable, close your eyes, and let yourself rest.\n\nI hope you wake up feeling a little better tomorrow.\n\nGoodnight, Zoey. 🌙🤍",
    },
  };

  function setupCards() {
    const grid = document.getElementById("cardGrid");
    const overlay = document.getElementById("envelopeOverlay");
    const iconEl = document.getElementById("envelopeIcon");
    const textEl = document.getElementById("envelopeText");
    const closeBtn = document.getElementById("envelopeClose");
    let open = false;

    function openCard(key) {
      if (open) return;
      const data = cardContent[key];
      if (!data) return;
      iconEl.textContent = data.icon;
      textEl.textContent = data.text;
      overlay.hidden = false;
      open = true;
    }

    function closeCard() {
      overlay.hidden = true;
      open = false;
    }

    grid.addEventListener("click", (e) => {
      const btn = e.target.closest(".care-card");
      if (!btn) return;
      openCard(btn.dataset.card);
    });

    closeBtn.addEventListener("click", closeCard);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeCard();
    });
  }

  /* ============================================================
     Interactive hug (locked against double taps)
     ============================================================ */
  function setupHug() {
    const hugBtn = document.getElementById("hugBtn");
    const overlay = document.getElementById("hugOverlay");
    const heartsLayer = document.getElementById("hugHearts");
    const line1 = document.getElementById("hugLine1");
    const line2 = document.getElementById("hugLine2");
    const closeBtn = document.getElementById("hugClose");

    let isAnimating = false;

    hugBtn.addEventListener("click", () => {
      if (isAnimating) return;
      isAnimating = true;

      overlay.hidden = false;
      line1.classList.remove("show");
      line2.classList.remove("show");
      closeBtn.classList.remove("show");
      closeBtn.hidden = true;

      burstHearts(heartsLayer, 10, "🤍");

      const t1 = reducedMotion ? 100 : 400;
      const t2 = reducedMotion ? 200 : 1500;
      const t3 = reducedMotion ? 300 : 2600;

      setTimeout(() => line1.classList.add("show"), t1);
      setTimeout(() => line2.classList.add("show"), t2);
      setTimeout(() => {
        closeBtn.hidden = false;
        closeBtn.classList.add("show");
        isAnimating = false; // animation + reveal fully finished
      }, t3);
    });

    closeBtn.addEventListener("click", () => {
      overlay.hidden = true;
    });
  }

  /* ============================================================
     Novel cover reveal on scroll into view
     ============================================================ */
  function setupNovelReveal() {
    const cover = document.getElementById("novelCover");
    if (!cover) return;
    if (!("IntersectionObserver" in window)) {
      cover.classList.add("in-view");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            cover.classList.add("in-view");
            io.unobserve(cover);
          }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(cover);
  }

  /* ============================================================
     Voice note surprise — plays on "Okay", replayable any number
     of times via the "Play it again" button.
     ============================================================ */
  function setupVoiceNote() {
    const btn = document.getElementById("voiceBtn");
    const replayBtn = document.getElementById("voiceReplayBtn");
    const audio = document.getElementById("voiceAudio");
    const waveform = document.getElementById("voiceWaveform");
    const heartsLayer = document.getElementById("voiceHearts");
    const reveal1 = document.getElementById("voiceReveal");
    const reveal2 = document.getElementById("voiceReveal2");

    let isPlaying = false;
    let hasRevealed = false;

    function startPlayback() {
      if (isPlaying) return; // guard against overlapping playback
      isPlaying = true;

      btn.disabled = true;
      replayBtn.disabled = true;

      waveform.hidden = false;
      burstHearts(heartsLayer, 6, "💜");

      try {
        audio.currentTime = 0;
      } catch (err) {
        // some mobile browsers throw if metadata isn't loaded yet; safe to ignore
      }

      const onFinished = () => {
        isPlaying = false;
        waveform.hidden = true;
        btn.disabled = false;
        replayBtn.disabled = false;

        if (!hasRevealed) {
          hasRevealed = true;
          btn.hidden = true;
          reveal1.hidden = false;
          reveal2.hidden = false;
          requestAnimationFrame(() => {
            reveal1.classList.add("show");
            setTimeout(() => reveal2.classList.add("show"), reducedMotion ? 80 : 500);
            setTimeout(() => { replayBtn.hidden = false; }, reducedMotion ? 120 : 800);
          });
        }
      };

      let playPromise;
      try {
        playPromise = audio.play();
      } catch (err) {
        playPromise = null;
      }
      if (playPromise && playPromise.then) {
        playPromise.catch(() => {
          // playback blocked for some reason (autoplay policy quirk, codec
          // issue, etc). Don't leave Zoey stuck — reveal the message anyway.
          setTimeout(onFinished, 1200);
        });
      }

      audio.addEventListener("ended", onFinished, { once: true });
      audio.addEventListener(
        "error",
        () => setTimeout(onFinished, 1200),
        { once: true }
      );
    }

    btn.addEventListener("click", startPlayback);
    replayBtn.addEventListener("click", () => {
      burstHearts(heartsLayer, 4, "💜");
      startPlayback();
    });
  }

  /* ============================================================
     Page navigation (swipe-free, button + dot based)
     ============================================================ */
  function setupPages() {
    const pages = Array.from(document.querySelectorAll(".page"));
    const prevBtn = document.getElementById("prevPageBtn");
    const nextBtn = document.getElementById("nextPageBtn");
    const dotsLayer = document.getElementById("pageDots");
    if (!pages.length || !prevBtn || !nextBtn || !dotsLayer) return;

    let current = 0;

    pages.forEach((_, i) => {
      const dot = document.createElement("span");
      dot.className = "dot" + (i === 0 ? " current" : "");
      dotsLayer.appendChild(dot);
    });
    const dots = Array.from(dotsLayer.children);

    function render() {
      pages.forEach((p, i) => {
        const isCurrent = i === current;
        p.classList.toggle("active", isCurrent);
        p.classList.remove("enter");
        if (isCurrent) {
          // restart the enter animation
          void p.offsetWidth;
          p.classList.add("enter");
        }
      });
      dots.forEach((d, i) => d.classList.toggle("current", i === current));

      prevBtn.disabled = current === 0;
      nextBtn.textContent = current === pages.length - 1 ? "Done \u2713" : "Next \u2192";
      if (current === pages.length - 1) {
        nextBtn.disabled = true;
      } else {
        nextBtn.disabled = false;
      }

      const viewport = document.getElementById("pagesViewport");
      if (viewport) viewport.scrollTop = 0;
    }

    prevBtn.addEventListener("click", () => {
      if (current === 0) return;
      current -= 1;
      render();
    });

    nextBtn.addEventListener("click", () => {
      if (current >= pages.length - 1) return;
      current += 1;
      render();
    });

    render();
  }

  /* ============================================================
     Signature element: moon charm comfort notes
     ============================================================ */
  function setupMoonCharm() {
    const charm = document.getElementById("moonCharm");
    const noteEl = document.getElementById("charmNote");
    if (!charm || !noteEl) return;

    const notes = [
      "You're doing better than you think you are.",
      "It's okay to rest without earning it first.",
      "This feeling is temporary, even when it doesn't feel that way.",
      "You don't have to be strong every single moment.",
      "Small steps still count as moving forward.",
      "Someone out there is genuinely rooting for you. It's me.",
      "You're allowed to take up space while healing.",
      "Being tired doesn't mean you're failing.",
    ];

    let lastIndex = -1;

    charm.addEventListener("click", () => {
      let idx = Math.floor(Math.random() * notes.length);
      if (idx === lastIndex) idx = (idx + 1) % notes.length;
      lastIndex = idx;

      noteEl.classList.remove("show");
      void noteEl.offsetWidth; // restart animation
      noteEl.textContent = notes[idx];
      noteEl.classList.add("show");
    });
  }

  /* ============================================================
     Final cinematic sequence — fully non-skippable
     ============================================================ */
  function setupFinale() {
    const triggerBtn = document.getElementById("finalTriggerBtn");
    const finale = document.getElementById("finale");
    const nextBtn = document.getElementById("finaleNext");
    const lines = Array.from(document.querySelectorAll(".finale-line"));
    const ring = document.getElementById("finaleHeartRing");

    let index = 0;
    let isAnimating = false;

    const REVEAL_MS = reducedMotion ? 200 : 1300;
    const PAUSE_MS = reducedMotion ? 150 : 1200;

    function showStep(i) {
      isAnimating = true;
      nextBtn.classList.remove("show");
      nextBtn.hidden = true;

      lines.forEach((l) => l.classList.remove("show"));
      const current = lines[i];
      current.classList.add("show");

      if (i === lines.length - 1) {
        ring.hidden = false;
      }

      const isLast = i === lines.length - 1;

      setTimeout(() => {
        // animation + short emotional pause fully complete
        isAnimating = false;
        if (!isLast) {
          nextBtn.hidden = false;
          nextBtn.textContent = "Next";
          requestAnimationFrame(() => nextBtn.classList.add("show"));
        } else {
          nextBtn.hidden = false;
          nextBtn.textContent = "Close 🤍";
          requestAnimationFrame(() => nextBtn.classList.add("show"));
        }
      }, REVEAL_MS + PAUSE_MS);
    }

    function spawnStars() {
      const layer = document.getElementById("finaleStars");
      const count = window.innerWidth < 480 ? 40 : 70;
      for (let i = 0; i < count; i++) {
        const s = document.createElement("span");
        s.className = "star";
        s.style.left = Math.random() * 100 + "%";
        s.style.top = Math.random() * 100 + "%";
        s.style.animationDelay = Math.random() * 2 + "s";
        layer.appendChild(s);
      }
    }

    let starsSpawned = false;

    triggerBtn.addEventListener("click", () => {
      finale.hidden = false;
      document.body.style.overflow = "hidden";
      if (!starsSpawned) {
        spawnStars();
        starsSpawned = true;
      }
      index = 0;
      showStep(index);
    });

    nextBtn.addEventListener("click", () => {
      if (isAnimating) return; // ignore taps while locked
      if (index >= lines.length - 1) {
        // closing the finale
        document.body.style.overflow = "";
        finale.hidden = true;
        return;
      }
      index += 1;
      showStep(index);
    });

    // belt-and-suspenders: swallow any tap on the finale background
    finale.addEventListener("click", (e) => {
      if (e.target === finale) {
        // no-op: background taps never advance or close the sequence
      }
    });
  }

  /* ============================================================
     Hidden easter egg
     ============================================================ */
  function setupEasterEgg() {
    const heart = document.getElementById("secretHeart");
    const overlay = document.getElementById("eggOverlay");
    const closeBtn = document.getElementById("eggClose");
    const heartsLayer = document.getElementById("eggHearts");

    heart.addEventListener("click", () => {
      overlay.hidden = false;
      burstHearts(heartsLayer, 8, "🤍");
    });

    closeBtn.addEventListener("click", () => {
      overlay.hidden = true;
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.hidden = true;
    });
  }

  /* ============================================================
     Init
     ============================================================ */
  document.addEventListener("DOMContentLoaded", () => {
    spawnAmbientParticles();
    runOpeningSequence();
    setupPages();
    setupCards();
    setupHug();
    setupNovelReveal();
    setupVoiceNote();
    setupMoonCharm();
    setupFinale();
    setupEasterEgg();

    document.getElementById("openBtn").addEventListener("click", goToMain);
  });
})();
