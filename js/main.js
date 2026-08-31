(() => {
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const primaryNav = document.querySelector("[data-primary-nav]");
  const header = document.querySelector("[data-header]");
  const currentYear = document.querySelector("[data-current-year]");
  const diagram = document.querySelector("[data-system-diagram]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  if (menuToggle && primaryNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      primaryNav.classList.toggle("is-open", !isOpen);
    });

    primaryNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        primaryNav.classList.remove("is-open");
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 720) {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        primaryNav.classList.remove("is-open");
      }
    });
  }

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const revealItems = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14 }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  if (diagram) {
    if (reduceMotion) {
      diagram.classList.add("is-organized");
    } else {
      window.setTimeout(() => {
        diagram.classList.add("is-organized");
      }, 450);
    }
  }
})();
