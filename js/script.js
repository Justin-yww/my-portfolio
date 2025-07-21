/*
|=============================================================================|
              JavaScript for Personal Portfolio Website
|=============================================================================|
*/

document.addEventListener("DOMContentLoaded", function () {
  // Smooth scrolling for navigation links
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

  // Fade in animation on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, observerOptions);

  // Observe all fade-in elements
  document.querySelectorAll(".fade-in").forEach((el) => {
    observer.observe(el);
  });

  // Gallery item interactions
  document.querySelectorAll(".gallery-item").forEach((item, index) => {
    item.addEventListener("click", () => {
      // Add click animation
      item.style.transform = "scale(1.1)";
      setTimeout(() => {
        item.style.transform = "scale(1.05)";
      }, 200);

      // Optional: Add functionality to open modal/lightbox here
      console.log(`Gallery item ${index + 1} clicked`);
    });
  });

  // Enhanced project card hover effects
  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-15px) rotateX(5deg)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0) rotateX(0)";
    });
  });

  // Navigation bar background opacity on scroll
  window.addEventListener("scroll", () => {
    const nav = document.querySelector("nav");
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;

    if (scrolled > 100) {
      nav.style.background = "rgba(255, 255, 255, 0.98)";
    } else {
      nav.style.background = "rgba(255, 255, 255, 0.95)";
    }
  });

  // Add parallax effect to hero section
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector(".hero");
    const rate = scrolled * -0.5;

    hero.style.transform = `translateY(${rate}px)`;
  });

  // Contact form validation (if you add a form later)
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Project link tracking (for analytics)
  document.querySelectorAll(".project-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      const linkType = this.textContent.includes("Slide")
        ? "presentation"
        : "repository";
      const projectTitle =
        this.closest(".project-card").querySelector(
          ".project-title"
        ).textContent;

      console.log(`Project link clicked: ${projectTitle} - ${linkType}`);
      // Add analytics tracking here if needed
    });
  });

  // Mobile menu toggle (for future mobile menu implementation)
  function toggleMobileMenu() {
    const navLinks = document.querySelector(".nav-links");
    navLinks.classList.toggle("active");
  }

  // Keyboard navigation support
  document.addEventListener("keydown", function (e) {
    // Press 'H' to go to home
    if (e.key === "h" || e.key === "H") {
      document.querySelector("#home").scrollIntoView({ behavior: "smooth" });
    }
    // Press 'P' to go to projects
    if (e.key === "p" || e.key === "P") {
      document
        .querySelector("#projects")
        .scrollIntoView({ behavior: "smooth" });
    }
    // Press 'G' to go to gallery
    if (e.key === "g" || e.key === "G") {
      document.querySelector("#gallery").scrollIntoView({ behavior: "smooth" });
    }
    // Press 'C' to go to contact
    if (e.key === "c" || e.key === "C") {
      document.querySelector("#contact").scrollIntoView({ behavior: "smooth" });
    }
  });

  // Performance optimization: Throttle scroll events
  function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttled scroll handler for better performance
  const throttledScrollHandler = throttle(() => {
    // Add any scroll-based animations or effects here
  }, 16); // ~60fps

  window.addEventListener("scroll", throttledScrollHandler);

  // Loading animation for page
  window.addEventListener("load", () => {
    document.body.classList.add("loaded");
  });

  // Console message for developers
  console.log("🎨 Portfolio loaded successfully! Built with ❤️");
  console.log("Keyboard shortcuts: H(ome), P(rojects), G(allery), C(ontact)");
});
