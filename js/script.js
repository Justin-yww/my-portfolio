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

    // Close menu when a link is clicked
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open menu");
        document.body.classList.remove("menu-open");
      });
    });

    // Close menu on Escape key
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
    // If reduced motion is preferred, show everything immediately
    document.querySelectorAll(".fade-in").forEach((el) => {
      el.classList.add("visible");
    });
  }

  // Gallery item click - open modal if on gallery page
  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      const modal = document.getElementById("imageModal");
      if (modal && img) {
        const modalImg = document.getElementById("modalImage");
        const captionText = document.getElementById("caption");
        modal.style.display = "block";
        // Trigger reflow for transition
        modal.offsetHeight;
        modal.classList.add("active");
        modalImg.src = img.src;
        captionText.innerHTML = img.alt;
      }
    });
  });

  // Modal close functionality
  const modal = document.getElementById("imageModal");
  if (modal) {
    const closeBtn = modal.querySelector(".close");

    function closeModal() {
      modal.classList.remove("active");
      setTimeout(() => {
        modal.style.display = "none";
      }, 300);
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
    }

    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.style.display === "block") {
        closeModal();
      }
    });
  }

  // Page load animation
  window.addEventListener("load", () => {
    document.body.classList.add("loaded");
  });
});
