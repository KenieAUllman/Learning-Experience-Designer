(() => {
  const stateLabels = {
    welcome: "Welcome",
    dogs: "Dogs",
    cats: "Cats",
    fish: "Fish"
  };

  const stateSections = document.querySelectorAll("[data-state]");
  const stateButtons = document.querySelectorAll("[data-state-target]");
  const menuToggle = document.querySelector("[data-experience-menu-toggle]");
  const menu = document.querySelector("[data-experience-menu]");
  const currentStateLabel = document.querySelector("[data-current-state-label]");

  let currentState = "welcome";

  const closeMenu = () => {
    menu.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    menu.hidden = false;
    menuToggle.setAttribute("aria-expanded", "true");
  };

  const resetFacts = () => {
    document.querySelectorAll("[data-fact-container]").forEach((container) => {
      container.classList.remove("is-fact-open");
      const trigger = container.querySelector("[data-fact-trigger]");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
  };

  const setState = (state) => {
    currentState = state;
    resetFacts();

    stateSections.forEach((section) => {
      section.hidden = section.dataset.state !== state;
    });

    stateButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.stateTarget === state);
    });

    currentStateLabel.textContent = stateLabels[state];
    closeMenu();

    const activeSection = document.querySelector(`[data-state="${state}"]`);
    const firstHeading = activeSection?.querySelector("h1");
    if (firstHeading) {
      firstHeading.setAttribute("tabindex", "-1");
      firstHeading.focus({ preventScroll: true });
      window.setTimeout(() => firstHeading.removeAttribute("tabindex"), 0);
    }

    window.history.replaceState(null, "", `#${state}`);
  };

  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    expanded ? closeMenu() : openMenu();
  });

  stateButtons.forEach((button) => {
    button.addEventListener("click", () => setState(button.dataset.stateTarget));
  });

  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target) && !menuToggle.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  // Donut chart interaction
  const generationData = {
    genz: { label: "Gen Z", value: 13 },
    millennials: { label: "Millennials", value: 33 },
    genx: { label: "Gen X", value: 25 },
    boomers: { label: "Boomers", value: 24 }
  };

  const donut = document.querySelector("[data-donut]");
  const donutSlices = document.querySelectorAll("[data-generation]");
  const generationControls = document.querySelectorAll("[data-generation-control]");
  const donutValue = document.querySelector("[data-donut-value]");
  const donutLabel = document.querySelector("[data-donut-label]");

  let lockedGeneration = null;

  const activateGeneration = (generation, lock = false) => {
    const item = generationData[generation];
    if (!item) return;

    donut.classList.add("has-active");

    donutSlices.forEach((slice) => {
      slice.classList.toggle("is-active", slice.dataset.generation === generation);
    });

    generationControls.forEach((control) => {
      control.classList.toggle("is-active", control.dataset.generationControl === generation);
      control.setAttribute("aria-pressed", String(control.dataset.generationControl === generation && lock));
    });

    donutValue.textContent = `${item.value}%`;
    donutLabel.textContent = item.label;

    if (lock) lockedGeneration = generation;
  };

  const clearGeneration = () => {
    if (lockedGeneration) return;

    donut.classList.remove("has-active");
    donutSlices.forEach((slice) => slice.classList.remove("is-active"));
    generationControls.forEach((control) => control.classList.remove("is-active"));
    donutValue.textContent = "95%";
    donutLabel.textContent = "shown across four generations";
  };

  donutSlices.forEach((slice) => {
    const generation = slice.dataset.generation;

    slice.addEventListener("mouseenter", () => {
      if (!lockedGeneration) activateGeneration(generation);
    });

    slice.addEventListener("mouseleave", clearGeneration);

    slice.addEventListener("focus", () => {
      if (!lockedGeneration) activateGeneration(generation);
    });

    slice.addEventListener("blur", clearGeneration);

    const select = () => {
      if (lockedGeneration === generation) {
        lockedGeneration = null;
        clearGeneration();
      } else {
        activateGeneration(generation, true);
      }
    };

    slice.addEventListener("click", select);
    slice.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select();
      }
    });
  });

  generationControls.forEach((control) => {
    const generation = control.dataset.generationControl;

    control.addEventListener("mouseenter", () => {
      if (!lockedGeneration) activateGeneration(generation);
    });

    control.addEventListener("mouseleave", clearGeneration);

    control.addEventListener("focus", () => {
      if (!lockedGeneration) activateGeneration(generation);
    });

    control.addEventListener("blur", clearGeneration);

    control.addEventListener("click", () => {
      if (lockedGeneration === generation) {
        lockedGeneration = null;
        clearGeneration();
      } else {
        activateGeneration(generation, true);
      }
    });
  });

  // Pet fact interactions
  document.querySelectorAll("[data-fact-container]").forEach((container) => {
    const trigger = container.querySelector("[data-fact-trigger]");
    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const open = container.classList.toggle("is-fact-open");
      trigger.setAttribute("aria-expanded", String(open));
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        trigger.click();
      }
    });
  });

  // Initial state from URL hash when valid
  const hash = window.location.hash.replace("#", "");
  if (stateLabels[hash]) {
    setState(hash);
  } else {
    setState("welcome");
  }
})();
