(() => {
  // Build a Better Report
  const selectedReportParts = new Set();
  const reportButtons = document.querySelectorAll("[data-report-options] .report-option");
  const buildReportButton = document.querySelector("[data-build-report]");
  const assembledReport = document.querySelector("[data-assembled-report]");

  reportButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.key;
      if (selectedReportParts.has(key)) {
        selectedReportParts.delete(key);
        button.classList.remove("is-selected");
        button.setAttribute("aria-pressed", "false");
      } else {
        selectedReportParts.add(key);
        button.classList.add("is-selected");
        button.setAttribute("aria-pressed", "true");
      }
    });
  });

  buildReportButton.addEventListener("click", () => {
    assembledReport.hidden = false;

    if (selectedReportParts.size === 0) {
      assembledReport.innerHTML = "<strong>Select at least one piece of information first.</strong>";
      return;
    }

    const rows = [];
    if (selectedReportParts.has("observation")) rows.push(["What happened", "Unexpected equipment stop after an unusual noise was observed."]);
    if (selectedReportParts.has("location")) rows.push(["Where", "Zone C."]);
    if (selectedReportParts.has("impact")) rows.push(["Current impact", "Production stopped."]);
    if (selectedReportParts.has("people")) rows.push(["People", "No injuries reported."]);
    if (selectedReportParts.has("action")) rows.push(["Current action", "The area has been paused."]);
    if (selectedReportParts.has("unknown")) rows.push(["Known / unknown", "The cause is not yet known."]);

    const usefulKeys = ["observation","location","impact","people","action","unknown"];
    const complete = usefulKeys.every((key) => selectedReportParts.has(key));

    assembledReport.innerHTML = `
      <dl>
        ${rows.map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`).join("")}
      </dl>
      <p style="margin:1rem 0 0;color:var(--evergreen);font-weight:800;">
        ${complete
          ? "Strong update. You separated facts, impact, current actions, and uncertainty."
          : "Useful start. A stronger update usually distinguishes what happened, impact, current action, people affected, and what remains unknown."}
      </p>
    `;
  });

  // Who Owns What
  const roleFeedback = document.querySelector("[data-role-feedback]");
  document.querySelectorAll("[data-role-grid] .role-option").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest(".role-row");
      row.querySelectorAll(".role-option").forEach((b) => b.classList.remove("is-selected"));
      button.classList.add("is-selected");

      const correct = row.dataset.answer;
      const choice = button.dataset.choice;

      if (correct === choice) {
        roleFeedback.textContent = "Strong match. Role clarity reduces duplicate action and makes decision authority easier to understand.";
      } else {
        roleFeedback.textContent = "That role may contribute information, but another role more directly owns this task in the fictional model.";
      }
    });
  });

  // Scenario Lab
  const scenarios = [
    {
      text: "A piece of equipment stops unexpectedly during a busy operating period. An employee reports an unusual sound beforehand. No injuries have been reported, but the cause is unknown.",
      correct: "b",
      feedback: "The organizational priority is to establish what is known, maintain the current operational pause, and make sure the right people have usable information."
    },
    {
      text: "An operating disruption affects a customer area. Two supervisors independently begin giving customers different instructions while management is still assessing the situation.",
      correct: "b",
      feedback: "The primary organizational risk is conflicting direction. Clarify who owns communication and what information has been confirmed."
    },
    {
      text: "The disruption has been controlled and normal operations are beginning to resume. Is the response finished?",
      correct: "c",
      feedback: "Not necessarily. Follow-up may include documentation, remaining issues, corrective actions, and lessons that should inform future operations or training."
    }
  ];

  const scenarioChoices = [
    [
      ["a","Restart it to see whether the issue repeats."],
      ["b","Establish what is known, maintain the operational pause, and communicate the condition."],
      ["c","Wait until the cause is known before communicating."],
      ["d","Send a company-wide update immediately."]
    ],
    [
      ["a","Give every available detail to customers immediately."],
      ["b","Clarify communication ownership and align the confirmed message."],
      ["c","Allow each supervisor to continue using their own judgment."],
      ["d","Avoid communicating until the disruption is fully resolved."]
    ],
    [
      ["a","Yes. Once operations resume, the response is complete."],
      ["b","Yes, unless a manager asks for more work."],
      ["c","Not necessarily. Recovery, documentation, and improvement may still remain."],
      ["d","No. The entire training program must be repeated."]
    ]
  ];

  let scenarioIndex = 0;
  const scenarioTitle = document.querySelector("[data-scenario-title]");
  const scenarioText = document.querySelector("[data-scenario-text]");
  const scenarioOptions = document.querySelector("[data-scenario-options]");
  const scenarioFeedback = document.querySelector("[data-scenario-feedback]");
  const nextScenario = document.querySelector("[data-next-scenario]");

  const renderScenario = () => {
    const scenario = scenarios[scenarioIndex];
    scenarioTitle.textContent = `Scenario ${scenarioIndex + 1} of ${scenarios.length}`;
    scenarioText.textContent = scenario.text;
    scenarioFeedback.textContent = "";
    nextScenario.disabled = true;
    nextScenario.textContent = scenarioIndex === scenarios.length - 1 ? "Restart Scenarios" : "Next Scenario";

    scenarioOptions.innerHTML = scenarioChoices[scenarioIndex]
      .map(([value, label]) => `<button type="button" class="scenario-option" data-choice="${value}">${label}</button>`)
      .join("");

    scenarioOptions.querySelectorAll(".scenario-option").forEach((button) => {
      button.addEventListener("click", () => {
        const choice = button.dataset.choice;
        scenarioOptions.querySelectorAll(".scenario-option").forEach((b) => b.disabled = true);

        if (choice === scenario.correct) {
          button.classList.add("is-correct");
          scenarioFeedback.textContent = scenario.feedback;
        } else {
          button.classList.add("is-wrong");
          scenarioFeedback.textContent = `Not the strongest organizational response. ${scenario.feedback}`;
        }

        nextScenario.disabled = false;
      });
    });
  };

  nextScenario.addEventListener("click", () => {
    scenarioIndex = scenarioIndex === scenarios.length - 1 ? 0 : scenarioIndex + 1;
    renderScenario();
  });

  renderScenario();

  // Capstone
  const capstone = [
    {
      text: "A critical work area stops unexpectedly. Reports conflict about the cause and customers are beginning to ask questions. What do you prioritize first?",
      options: [
        ["scan","Establish what is known and what remains uncertain."],
        ["evaluate","Begin documenting lessons learned."],
        ["organize","Assign long-term corrective actions."]
      ],
      accepted: "scan",
      earned: ["scan","communicate"],
      feedback: "Strong start. You establish known conditions first, then communicate enough information to support coordinated decisions."
    },
    {
      text: "Another supervisor begins giving frontline employees contradictory instructions. What needs attention?",
      options: [
        ["organize","Clarify who owns the decision and align responsibilities."],
        ["support","Bring in outside expertise immediately."],
        ["evaluate","Begin the post-event review."]
      ],
      accepted: "organize",
      earned: ["organize"],
      feedback: "Correct. The immediate issue is role and decision ownership."
    },
    {
      text: "A technical specialist determines the problem exceeds the local team's expertise. What next?",
      options: [
        ["support","Pull in the additional expertise or authority needed."],
        ["scan","Start over and gather all observations again."],
        ["evaluate","Move directly into documentation."]
      ],
      accepted: "support",
      earned: ["support"],
      feedback: "Correct. Recognizing the limits of current expertise or authority is part of coordinated decision-making."
    },
    {
      text: "Operations resume and the immediate disruption is controlled. What is still part of the learning system?",
      options: [
        ["evaluate","Document, follow up, identify corrective actions, and capture lessons."],
        ["communicate","Send every detail to everyone."],
        ["organize","Reassign every role permanently."]
      ],
      accepted: "evaluate",
      earned: ["evaluate"],
      feedback: "Correct. Recovery, documentation, and improvement extend beyond the immediate event."
    }
  ];

  let capstoneIndex = 0;
  const capstoneTitle = document.querySelector("[data-capstone-title]");
  const capstoneText = document.querySelector("[data-capstone-text]");
  const capstoneOptions = document.querySelector("[data-capstone-options]");
  const capstoneFeedback = document.querySelector("[data-capstone-feedback]");
  const capstoneNext = document.querySelector("[data-capstone-next]");
  const chips = document.querySelectorAll("[data-chip]");

  const renderCapstone = () => {
    const item = capstone[capstoneIndex];
    capstoneTitle.textContent = `Decision ${capstoneIndex + 1} of ${capstone.length}`;
    capstoneText.textContent = item.text;
    capstoneFeedback.textContent = "";
    capstoneNext.disabled = true;
    capstoneNext.textContent = capstoneIndex === capstone.length - 1 ? "Restart Capstone" : "Next Decision";

    capstoneOptions.innerHTML = item.options
      .map(([value, label]) => `<button type="button" class="scenario-option" data-choice="${value}">${label}</button>`)
      .join("");

    capstoneOptions.querySelectorAll(".scenario-option").forEach((button) => {
      button.addEventListener("click", () => {
        capstoneOptions.querySelectorAll(".scenario-option").forEach((b) => b.disabled = true);

        if (button.dataset.choice === item.accepted) {
          button.classList.add("is-correct");
          item.earned.forEach((key) => {
            const chip = document.querySelector(`[data-chip="${key}"]`);
            if (chip) chip.classList.add("is-earned");
          });
          capstoneFeedback.textContent = item.feedback;
        } else {
          button.classList.add("is-wrong");
          capstoneFeedback.textContent = `Not the strongest choice here. ${item.feedback}`;
        }

        capstoneNext.disabled = false;
      });
    });
  };

  capstoneNext.addEventListener("click", () => {
    if (capstoneIndex === capstone.length - 1) {
      capstoneIndex = 0;
      chips.forEach((chip) => chip.classList.remove("is-earned"));
    } else {
      capstoneIndex += 1;
    }
    renderCapstone();
  });

  renderCapstone();

  // Facilitator guide
  const guideContent = {
    role: {
      title: "Know Your Role",
      fields: [
        ["Purpose","Introduce role clarity as the foundation of coordinated response."],
        ["Trainer Objective","Learners should understand that effective response depends on people executing defined responsibilities rather than trying to solve every part independently."],
        ["Say","High-pressure situations create a strong instinct to jump in. That can help, but it can also create confusion when responsibilities are unclear."],
        ["Ask","What problems can happen when several people assume they own the same decision?"],
        ["Listen For","Conflicting instructions, duplicate work, missed responsibilities, poor accountability, delayed decisions."],
        ["Apply","Three supervisors begin giving different instructions to the same frontline team. What problem exists before we even discuss the disruption itself?"],
        ["Reinforce","A coordinated response is not everyone doing everything. It is everyone understanding what they own."],
        ["Trainer Notes","Keep the discussion focused on organizational role clarity, not real-world emergency procedure."]
      ]
    },
    report: {
      title: "Communicate What Decision-Makers Need",
      fields: [
        ["Purpose","Help learners distinguish vague awareness from usable operational information."],
        ["Trainer Objective","Learners should identify the elements that make an update useful for decision support."],
        ["Say","Reporting that something is wrong creates awareness. Reporting what you observed, where it occurred, what changed, and what remains uncertain creates decision support."],
        ["Ask","What makes an operational report useful?"],
        ["Listen For","Context, observed condition, impact, who is affected, what has already happened, what remains unknown."],
        ["Apply","Compare: 'We've got a problem in the work area' with 'Equipment in Zone C stopped unexpectedly. Work is paused. No injuries have been reported. Cause is unknown.'"],
        ["Reinforce","Useful communication separates facts, impact, actions, and uncertainty."],
        ["Trainer Notes","Avoid turning the example into technical diagnosis. The learning target is information quality."]
      ]
    }
  };

  const guideButtons = document.querySelectorAll("[data-guide]");
  const guidePage = document.querySelector("[data-guide-page]");

  guideButtons.forEach((button) => {
    button.addEventListener("click", () => {
      guideButtons.forEach((b) => b.classList.remove("is-active"));
      button.classList.add("is-active");

      const item = guideContent[button.dataset.guide];
      guidePage.innerHTML = `
        <h3>${item.title}</h3>
        <div class="guide-fields">
          ${item.fields.map(([label, value]) => `
            <div class="guide-field">
              <strong>${label}</strong>
              <span>${value}</span>
            </div>
          `).join("")}
        </div>
      `;
    });
  });
})();
