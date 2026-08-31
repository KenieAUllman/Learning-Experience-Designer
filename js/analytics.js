(() => {
  const tabs = document.querySelectorAll("[data-panel-target]");
  const panels = document.querySelectorAll("[data-panel]");

  const animateBars = (panel) => {
    panel.querySelectorAll(".bar-fill").forEach((bar) => {
      const width = Math.max(0, Math.min(100, Number(bar.dataset.width) || 0));
      requestAnimationFrame(() => {
        bar.style.width = `${width}%`;
      });
    });
  };

  const showPanel = (name) => {
    panels.forEach((panel) => {
      const active = panel.dataset.panel === name;
      panel.hidden = !active;
      if (active) animateBars(panel);
    });

    tabs.forEach((tab) => {
      const active = tab.dataset.panelTarget === name;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      showPanel(tab.dataset.panelTarget);
    });
  });

  showPanel("overview");
})();
