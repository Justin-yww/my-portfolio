/*
|=============================================================================|
              JavaScript for Personal Portfolio Website
              Lightweight, performance-focused interactions
|=============================================================================|
*/

document.addEventListener("DOMContentLoaded", function () {
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Mobile menu toggle
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      const isOpen = navLinks.classList.toggle("open");
      menuToggle.classList.toggle("active", isOpen);
      menuToggle.setAttribute("aria-expanded", isOpen);
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close menu" : "Open menu"
      );
      document.body.classList.toggle("menu-open", isOpen);
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open menu");
        document.body.classList.remove("menu-open");
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navLinks.classList.contains("open")) {
        navLinks.classList.remove("open");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open menu");
        document.body.classList.remove("menu-open");
      }
    });
  }

  // Intersection Observer for fade-in animations
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!prefersReducedMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    document.querySelectorAll(".fade-in").forEach((el) => {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll(".fade-in").forEach((el) => {
      el.classList.add("visible");
    });
  }

  // ----- Interactive snap gallery -----
  const track = document.querySelector(".gallery-track");
  const filterButtons = document.querySelectorAll(".gallery-filter");
  const modal = document.getElementById("imageModal");

  function getVisibleCards() {
    if (!track) return [];
    return Array.from(track.querySelectorAll(".gallery-card")).filter(
      (card) => !card.classList.contains("is-hidden")
    );
  }

  function getCardStep() {
    if (!track) return 340;
    const card = track.querySelector(".gallery-card:not(.is-hidden)");
    if (!card) return 340;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap) || 20;
    return card.getBoundingClientRect().width + gap;
  }

  // Filters
  if (filterButtons.length && track) {
    const emptyEl = document.querySelector(".gallery-empty");
    const carouselEl = document.querySelector(".gallery-carousel");

    function updateEmptyState() {
      const hasVisible = getVisibleCards().length > 0;
      if (emptyEl) {
        emptyEl.hidden = hasVisible;
      }
      if (carouselEl) {
        carouselEl.classList.toggle("is-empty", !hasVisible);
      }
    }

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.dataset.filter;

        filterButtons.forEach((b) => {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });

        track.querySelectorAll(".gallery-card").forEach((card) => {
          const match =
            filter === "all" || card.dataset.category === filter;
          card.classList.toggle("is-hidden", !match);
        });

        track.scrollTo({
          left: 0,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
        updateEmptyState();
      });
    });
  }

  // Desktop drag-to-scroll
  if (track) {
    let isPointerDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let moved = false;
    let suppressClick = false;

    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch") return;
      isPointerDown = true;
      moved = false;
      startX = e.clientX;
      scrollLeft = track.scrollLeft;
      track.classList.add("is-dragging");
      track.setPointerCapture(e.pointerId);
    });

    track.addEventListener("pointermove", (e) => {
      if (!isPointerDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = scrollLeft - dx;
    });

    function endDrag(e) {
      if (!isPointerDown) return;
      isPointerDown = false;
      track.classList.remove("is-dragging");
      if (moved) {
        suppressClick = true;
        setTimeout(() => {
          suppressClick = false;
        }, 0);
      }
      try {
        track.releasePointerCapture(e.pointerId);
      } catch (_) {
        /* ignore */
      }
    }

    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);

    // Chevrons
    const prevBtn = document.querySelector(".gallery-chevron--prev");
    const nextBtn = document.querySelector(".gallery-chevron--next");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        track.scrollBy({
          left: -getCardStep(),
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        track.scrollBy({
          left: getCardStep(),
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      });
    }

    // ----- Lightbox -----
    if (modal) {
      const modalImg = document.getElementById("modalImage");
      const titleEl = document.getElementById("lightboxTitle");
      const descEl = document.getElementById("lightboxDescription");
      const counterEl = document.getElementById("lightboxCounter");
      const closeBtn = modal.querySelector(".lightbox-close, .close");
      const prevNav = modal.querySelector(".lightbox-prev");
      const nextNav = modal.querySelector(".lightbox-next");

      let currentIndex = 0;
      let lastFocus = null;
      let touchStartX = 0;

      function openLightbox(index) {
        const cards = getVisibleCards();
        if (!cards.length) return;
        currentIndex = ((index % cards.length) + cards.length) % cards.length;
        const card = cards[currentIndex];
        const img = card.querySelector("img");

        lastFocus = document.activeElement;
        modal.hidden = false;
        modal.style.display = "block";
        modal.offsetHeight;
        modal.classList.add("active");
        document.body.style.overflow = "hidden";

        modalImg.src = img.src;
        modalImg.alt = img.alt || card.dataset.title || "";
        titleEl.textContent = card.dataset.title || img.alt || "";
        descEl.textContent = card.dataset.description || "";
        counterEl.textContent = `${currentIndex + 1} / ${cards.length}`;

        (closeBtn || modal).focus?.();
      }

      function closeLightbox() {
        modal.classList.remove("active");
        document.body.style.overflow = "";
        setTimeout(() => {
          modal.style.display = "none";
          modal.hidden = true;
          modalImg.removeAttribute("src");
        }, 300);
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      }

      function showNext(delta) {
        const cards = getVisibleCards();
        if (!cards.length) return;
        openLightbox(currentIndex + delta);
      }

      track.querySelectorAll(".gallery-card").forEach((card) => {
        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "button");

        const activate = () => {
          if (suppressClick) return;
          const cards = getVisibleCards();
          const index = cards.indexOf(card);
          if (index >= 0) openLightbox(index);
        };

        card.addEventListener("click", activate);
        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            activate();
          }
        });
      });

      if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
      if (prevNav) prevNav.addEventListener("click", () => showNext(-1));
      if (nextNav) nextNav.addEventListener("click", () => showNext(1));

      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeLightbox();
      });

      document.addEventListener("keydown", (e) => {
        if (!modal.classList.contains("active")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") showNext(-1);
        if (e.key === "ArrowRight") showNext(1);
      });

      // Touch swipe in lightbox
      modal.addEventListener(
        "touchstart",
        (e) => {
          touchStartX = e.changedTouches[0].screenX;
        },
        { passive: true }
      );

      modal.addEventListener(
        "touchend",
        (e) => {
          if (!modal.classList.contains("active")) return;
          const dx = e.changedTouches[0].screenX - touchStartX;
          if (Math.abs(dx) < 50) return;
          showNext(dx < 0 ? 1 : -1);
        },
        { passive: true }
      );
    }
  }

  // Page load animation
  window.addEventListener("load", () => {
    document.body.classList.add("loaded");
  });
});
