(() => {
  const fleetData = {
    river: {
      name: "River Class",
      tagline: "Built to work with the river.",
      description: "Designed for interior waterways where depth, channel constraints, and inland access shape the operating decision.",
      features: ["Wide profile", "Relatively shallow draft", "Large viewing areas"]
    },
    coastal: {
      name: "Coastal Class",
      tagline: "Built for changing conditions.",
      description: "Designed for more exposed coastal operations where weather, waves, and passenger comfort can matter more.",
      features: ["Deeper hull", "Higher freeboard", "Enclosed passenger spaces"]
    },
    harbor: {
      name: "Harbor Class",
      tagline: "Built for access.",
      description: "Designed for constrained ports and smaller harbors where maneuverability and footprint shape what is possible.",
      features: ["Compact footprint", "High maneuverability", "Smaller capacity"]
    },
    explorer: {
      name: "Explorer Class",
      tagline: "Built for the view.",
      description: "Designed for scenic operating environments where observation, environmental versatility, and the destination experience are central.",
      features: ["Panoramic viewing", "Outdoor observation areas", "Environmental versatility"]
    }
  };

  const tabs = document.querySelectorAll("[data-fleet]");
  const detailName = document.querySelector("[data-fleet-name]");
  const detailTagline = document.querySelector("[data-fleet-tagline]");
  const detailDescription = document.querySelector("[data-fleet-description]");
  const detailFeatures = document.querySelector("[data-fleet-features]");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");

      const item = fleetData[tab.dataset.fleet];
      detailName.textContent = item.name;
      detailTagline.textContent = item.tagline;
      detailDescription.textContent = item.description;
      detailFeatures.innerHTML = item.features.map((feature) => `<li>${feature}</li>`).join("");
    });
  });

  const patternFeedback = document.querySelector("[data-pattern-feedback]");
  document.querySelectorAll("[data-pattern-grid] .pattern-option").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest(".pattern-row");
      row.querySelectorAll(".pattern-option").forEach((b) => b.classList.remove("is-selected"));
      button.classList.add("is-selected");

      const valid = row.dataset.patternAnswer.split("|");
      const chosen = button.dataset.choice;

      if (valid.includes(chosen)) {
        patternFeedback.textContent = valid.length > 1
          ? "Strong choice. Several vessel categories may share this feature. Classification depends on the combination of characteristics and operating purpose, not one attribute alone."
          : "Good pattern recognition. That feature strongly supports this classification.";
      } else {
        patternFeedback.textContent = "Possible in some designs, but this feature is more strongly associated with another class in this reconstructed model.";
      }
    });
  });

  const envData = {
    river: "Changing depth, narrower channels, inland ports, and seasonal conditions make navigation and draft central considerations.",
    lakes: "Large open-water environments can introduce longer crossings, larger ports, and more variable operating conditions.",
    north: "Weather exposure, scenic viewing, and remote destinations make both operating capability and the passenger experience important.",
    seaboard: "Smaller historic ports and constrained waterfronts make vessel footprint, docking access, and maneuverability especially important."
  };

  const envButtons = document.querySelectorAll("[data-env]");
  const envDetail = document.querySelector("[data-env-detail]");
  envButtons.forEach((button) => {
    button.addEventListener("click", () => {
      envButtons.forEach((b) => b.classList.remove("is-active"));
      button.classList.add("is-active");
      envDetail.textContent = envData[button.dataset.env];
    });
  });

  const scenarios = [
    {
      text: "A new route travels through a shallow inland river with changing seasonal depths. Ports are relatively small, but passengers still expect comfortable viewing spaces.",
      accepted: ["river"],
      feedback: {
        river: "River Class is the strongest choice. Draft and inland navigation are the primary constraints. Passenger experience still matters, but only after the vessel can operate effectively in the environment."
      }
    },
    {
      text: "A route serves several historic coastal communities with small harbors and limited docking space.",
      accepted: ["harbor"],
      feedback: {
        harbor: "Harbor Class is the strongest choice because access and maneuverability dominate the decision."
      }
    },
    {
      text: "Passengers are traveling primarily for wildlife viewing along a scenic northern coastline with variable open-water conditions.",
      accepted: ["explorer"],
      feedback: {
        explorer: "Explorer Class is the strongest starting point for the desired experience, but weather capability still has to be confirmed. Experience never overrides operational suitability."
      }
    },
    {
      text: "A route includes moderate coastal exposure, large ports, extended open-water travel, and a strong emphasis on passenger comfort.",
      accepted: ["coastal", "explorer"],
      feedback: {
        coastal: "Strong choice. The operating conditions point toward a class designed for more exposed water and passenger comfort.",
        explorer: "Potentially appropriate. Explorer Class may also work depending on its specific operating capability and the importance of the onboard viewing experience."
      }
    }
  ];

  let scenarioIndex = 0;
  const scenarioTitle = document.querySelector("[data-scenario-title]");
  const scenarioText = document.querySelector("[data-scenario-text]");
  const scenarioFeedback = document.querySelector("[data-scenario-feedback]");
  const scenarioOptions = document.querySelectorAll("[data-scenario-options] .scenario-option");
  const nextScenario = document.querySelector("[data-next-scenario]");

  const renderScenario = () => {
    const scenario = scenarios[scenarioIndex];
    scenarioTitle.textContent = `Scenario ${scenarioIndex + 1} of ${scenarios.length}`;
    scenarioText.textContent = scenario.text;
    scenarioFeedback.textContent = "";
    nextScenario.disabled = true;
    scenarioOptions.forEach((b) => {
      b.classList.remove("is-correct", "is-wrong");
      b.disabled = false;
    });
    nextScenario.textContent = scenarioIndex === scenarios.length - 1 ? "Restart Scenarios" : "Next Scenario";
  };

  scenarioOptions.forEach((button) => {
    button.addEventListener("click", () => {
      const scenario = scenarios[scenarioIndex];
      const choice = button.dataset.choice;
      scenarioOptions.forEach((b) => b.disabled = true);

      if (scenario.accepted.includes(choice)) {
        button.classList.add("is-correct");
        scenarioFeedback.textContent = scenario.feedback[choice] || "Strong choice.";
      } else {
        button.classList.add("is-wrong");
        const best = scenario.accepted[0];
        scenarioFeedback.textContent = `Not the strongest fit in this scenario. Reconsider which constraint dominates the decision. ${scenario.feedback[best] || ""}`;
      }

      nextScenario.disabled = false;
    });
  });

  nextScenario.addEventListener("click", () => {
    scenarioIndex = scenarioIndex === scenarios.length - 1 ? 0 : scenarioIndex + 1;
    renderScenario();
  });

  const assignmentEnv = document.querySelector("[data-assignment-env]");
  const assignmentConstraint = document.querySelector("[data-assignment-constraint]");
  const assignmentExperience = document.querySelector("[data-assignment-experience]");
  const assignmentResult = document.querySelector("[data-assignment-result]");

  const recommend = () => {
    const env = assignmentEnv.value;
    const constraint = assignmentConstraint.value;
    const experience = assignmentExperience.value;

    let result = "Coastal Class";
    let explanation = "The combination points toward a versatile class suited for more exposed operating conditions.";

    if (constraint === "depth" || env === "river") {
      result = "River Class";
      explanation = "Shallow-water navigation is the dominant constraint, so draft and inland operating suitability take priority.";
    } else if (constraint === "access" || constraint === "maneuverability" || env === "seaboard" || experience === "community") {
      result = "Harbor Class";
      explanation = "Port access and maneuverability are driving the decision, making a compact operating profile the strongest fit.";
    } else if (experience === "viewing" || env === "north") {
      result = "Explorer Class";
      explanation = "The desired experience and scenic operating environment favor strong observation capability, while operational suitability still needs confirmation.";
    } else if (constraint === "weather" || experience === "comfort" || env === "lakes") {
      result = "Coastal Class";
      explanation = "Variable conditions and passenger comfort favor a class designed for more exposed operating environments.";
    }

    assignmentResult.innerHTML = `<strong>Recommended: ${result}</strong><p>${explanation}</p>`;
  };

  [assignmentEnv, assignmentConstraint, assignmentExperience].forEach((select) => {
    select.addEventListener("change", recommend);
  });

  const assessment = document.querySelector("[data-assessment]");
  const scoreBox = document.querySelector("[data-assessment-score]");
  const answers = { q1: "a", q2: "b", q3: "a", q4: "a", q5: "a" };

  assessment.addEventListener("submit", (event) => {
    event.preventDefault();
    let score = 0;
    let answered = 0;

    Object.entries(answers).forEach(([name, correct]) => {
      const selected = assessment.querySelector(`input[name="${name}"]:checked`);
      if (selected) {
        answered += 1;
        if (selected.value === correct) score += 1;
      }
    });

    const percentage = Math.round((score / 5) * 100);
    scoreBox.hidden = false;

    if (answered < 5) {
      scoreBox.textContent = `You answered ${answered} of 5 questions. Complete all five to receive a mastery result.`;
      return;
    }

    scoreBox.textContent = percentage >= 80
      ? `${percentage}% • Mastery achieved. You’re using the classification model rather than memorizing isolated facts.`
      : `${percentage}% • Keep exploring the model. The target is 80% mastery.`;
  });
})();
