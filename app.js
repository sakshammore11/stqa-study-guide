/**
 * STQA Pro • Apple Interactive Engine (Master Edition)
 * Provides state machine animations, CFG SVG tracer, BVA table generator,
 * WCAG contrast calculator, V-Model mapper, Mutation Testing lab,
 * Flippable Flashcard deck, PYQ accordion, and 15-question quiz engine.
 */

// ==========================================
// 1. Audio Haptic Feedback (Web Audio API)
// ==========================================
let soundEnabled = true;
const audioCtx = (typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext)) 
  ? new (window.AudioContext || window.webkitAudioContext)() 
  : null;

function playAppleClick(freq = 800, type = "sine", duration = 0.035) {
  if (!soundEnabled || !audioCtx) return;
  try {
    if (audioCtx.state === "suspended") audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn("Audio feedback error:", e);
  }
}

// ==========================================
// 2. Navigation & Theme Engine
// ==========================================
function switchTab(tabId) {
  playAppleClick(750);
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.segment-btn').forEach(btn => btn.classList.remove('active'));

  const targetTab = document.getElementById(`tab-${tabId}`);
  if (targetTab) targetTab.classList.add('active');

  const matchingBtn = document.querySelector(`.segment-btn[data-tab="${tabId}"]`);
  if (matchingBtn) matchingBtn.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (tabId === 'visualizers') {
    setTimeout(renderCFGGraph, 50);
    setTimeout(generateBVATable, 50);
  }
  if (tabId === 'flashcards') {
    renderFlashcards();
  }
}

function initNavigation() {
  const navButtons = document.querySelectorAll('.segment-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  const soundBtn = document.getElementById('sound-toggle-btn');
  const soundIcon = document.getElementById('sound-icon');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
      playAppleClick(900);
    });
  }

  const themeBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  
  // Restore saved theme preference if present
  try {
    const savedTheme = localStorage.getItem('stqa-theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
      if (themeIcon) themeIcon.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
    }
  } catch (e) {
    // localStorage may be disabled
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      if (themeIcon) themeIcon.textContent = nextTheme === 'dark' ? '🌙' : '☀️';
      try {
        localStorage.setItem('stqa-theme', nextTheme);
      } catch (e) {}
      playAppleClick(600);
    });
  }

  document.querySelectorAll('.sub-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      playAppleClick(700);
      document.querySelectorAll('.sub-nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

// ==========================================
// 3. Key Distinctions Comparison Data
// ==========================================
const diffData = {
  'err-fault-fail': {
    title: 'Error vs Fault (Bug) vs Failure (University 10-Marks Standard)',
    content: `
      <div class="table-responsive">
        <table class="apple-table">
          <thead>
            <tr>
              <th>Aspect</th>
              <th>Error</th>
              <th>Fault (Bug / Defect)</th>
              <th>Failure</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Definition</strong></td>
              <td>A human action or mistake made by a programmer/analyst during SDLC.</td>
              <td>A flaw, mistake, or incorrect line of code inside the software.</td>
              <td>The software fails to deliver expected output or halts at runtime.</td>
            </tr>
            <tr>
              <td><strong>Where It Exists</strong></td>
              <td>In the developer's mind or action.</td>
              <td>In source code, SRS, or architecture documents.</td>
              <td>During live execution by tester or end-user.</td>
            </tr>
            <tr>
              <td><strong>Handwritten Note Example</strong></td>
              <td>Developer mistakenly writes <code>a - b</code> instead of <code>a + b</code>.</td>
              <td>The compiled code contains <code>return a - b;</code>.</td>
              <td>User inputs <code>5 + 3</code> in calculator, system outputs <code>2</code> or crashes.</td>
            </tr>
            <tr>
              <td><strong>How Detected</strong></td>
              <td>Through code walkthroughs, inspections, pair programming.</td>
              <td>Through static analysis, testing, or code review.</td>
              <td>Through test case execution, dynamic testing, UAT.</td>
            </tr>
          </tbody>
        </table>
      </div>
    `
  },
  'verif-vs-valid': {
    title: 'Verification vs Validation (Boehm\'s Law)',
    content: `
      <div class="table-responsive">
        <table class="apple-table">
          <thead>
            <tr>
              <th>Dimension</th>
              <th>Verification</th>
              <th>Validation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Guiding Question</strong></td>
              <td><em>"Are we building the product right?"</em></td>
              <td><em>"Are we building the right product?"</em></td>
            </tr>
            <tr>
              <td><strong>Nature of Testing</strong></td>
              <td>Static testing (no code execution).</td>
              <td>Dynamic testing (executes application binaries).</td>
            </tr>
            <tr>
              <td><strong>Scope of Artifacts</strong></td>
              <td>Documents, SRS, HLD, LLD, Database schemas, Code syntax.</td>
              <td>Actual running software build against business expectations.</td>
            </tr>
            <tr>
              <td><strong>Techniques</strong></td>
              <td>Reviews, Walkthroughs, Fagan Inspections, SonarQube static checks.</td>
              <td>Unit testing, Integration, System, Sanity, Acceptance testing.</td>
            </tr>
            <tr>
              <td><strong>Carried Out By</strong></td>
              <td>Developers, QA team, System Architects.</td>
              <td>Independent QA team, End users, Business stakeholders.</td>
            </tr>
          </tbody>
        </table>
      </div>
    `
  },
  'smoke-vs-sanity': {
    title: 'Smoke Testing vs Sanity Testing (High-Yield 5-Mark Question)',
    content: `
      <div class="table-responsive">
        <table class="apple-table">
          <thead>
            <tr>
              <th>Dimension</th>
              <th>Smoke Testing (Build Verification Test)</th>
              <th>Sanity Testing (Subset of Regression)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Origin</strong></td>
              <td>Borrowed from electronics: turn on hardware and check if smoke appears.</td>
              <td>Quick check to confirm the developer's bug fix is rational/sane.</td>
            </tr>
            <tr>
              <td><strong>When Done</strong></td>
              <td>On initial/fresh software builds received from developers.</td>
              <td>On relatively stable builds after a specific defect has been fixed.</td>
            </tr>
            <tr>
              <td><strong>Depth & Breadth</strong></td>
              <td><strong>Wide & Shallow:</strong> Touches every major component superficially.</td>
              <td><strong>Narrow & Deep:</strong> Tests only the affected modules thoroughly.</td>
            </tr>
            <tr>
              <td><strong>Purpose</strong></td>
              <td>Verify if build is stable enough to proceed with deeper testing.</td>
              <td>Verify that the reported bug is genuinely fixed without new faults.</td>
            </tr>
            <tr>
              <td><strong>Executed By</strong></td>
              <td>Either developers or QA engineers (frequently automated in CI/CD).</td>
              <td>Primarily manual QA testers.</td>
            </tr>
          </tbody>
        </table>
      </div>
    `
  },
  'white-vs-black': {
    title: 'White Box Testing vs Black Box Testing',
    content: `
      <div class="table-responsive">
        <table class="apple-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>White Box Testing (Glass Box / Structural)</th>
              <th>Black Box Testing (Behavioral / Functional)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Knowledge Required</strong></td>
              <td>Deep knowledge of internal source code, logic, data structures.</td>
              <td>No internal code knowledge required; based entirely on SRS.</td>
            </tr>
            <tr>
              <td><strong>Primary Focus</strong></td>
              <td>Control flow paths, branch conditions, loops, data flow, mutations.</td>
              <td>Inputs, outputs, user experience, compliance with specifications.</td>
            </tr>
            <tr>
              <td><strong>Core Techniques</strong></td>
              <td>Basis Path Testing (CFG), Loop Testing, Mutation, Data Flow.</td>
              <td>Boundary Value Analysis (BVA), Equivalence Partitioning (ECT), Decision Tables.</td>
            </tr>
            <tr>
              <td><strong>Target Testing Level</strong></td>
              <td>Unit testing and Low-Level Integration testing.</td>
              <td>System testing, Acceptance testing, Sanity testing.</td>
            </tr>
          </tbody>
        </table>
      </div>
    `
  },
  'bvc-vs-robust': {
    title: 'BVC vs Robust Testing vs Worst-Case Testing (Formulas & Comparisons)',
    content: `
      <div class="table-responsive">
        <table class="apple-table">
          <thead>
            <tr>
              <th>Criterion</th>
              <th>Boundary Value Checking (BVC)</th>
              <th>Robust Testing</th>
              <th>Worst-Case Testing</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Values Tested</strong></td>
              <td>$min, min+1, nom, max-1, max$</td>
              <td>$min-1, min, min+1, nom, max-1, max, max+1$</td>
              <td>All combinations of $\{min, min+1, nom, max-1, max\}$</td>
            </tr>
            <tr>
              <td><strong>Validity of Inputs</strong></td>
              <td>Strictly valid boundary values only.</td>
              <td>Both valid values and slightly invalid boundary values.</td>
              <td>Valid boundaries across all simultaneous combinations.</td>
            </tr>
            <tr>
              <td><strong>Formula (n variables)</strong></td>
              <td><code>4n + 1</code></td>
              <td><code>6n + 1</code></td>
              <td><code>5^n</code> (or $7^n$ for robust worst-case)</td>
            </tr>
            <tr>
              <td><strong>Example: 3 Numbers</strong></td>
              <td>$4(3) + 1 = 13$ test cases</td>
              <td>$6(3) + 1 = 19$ test cases</td>
              <td>$5^3 = 125$ test cases</td>
            </tr>
          </tbody>
        </table>
      </div>
    `
  },
  'walk-vs-inspect': {
    title: 'Walkthrough vs Fagan Inspection',
    content: `
      <div class="table-responsive">
        <table class="apple-table">
          <thead>
            <tr>
              <th>Aspect</th>
              <th>Walkthrough (Structured Walkthrough)</th>
              <th>Inspection (Fagan Inspection)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Meeting Leader</strong></td>
              <td>Led by the <strong>Author</strong> of the document or code.</td>
              <td>Led by a trained, independent <strong>Moderator</strong> (never author).</td>
            </tr>
            <tr>
              <td><strong>Formality</strong></td>
              <td>Informal to semi-formal; flexible agenda.</td>
              <td>Highly formal; rigorous 6-step standard process.</td>
            </tr>
            <tr>
              <td><strong>Primary Objective</strong></td>
              <td>Knowledge transfer, familiarization, finding obvious bugs.</td>
              <td>Finding defects and collecting metrics for process improvement.</td>
            </tr>
            <tr>
              <td><strong>Roles Involved</strong></td>
              <td>Author, Moderator, Reviewers, Scribe (Notes Q.2A).</td>
              <td>Moderator, Author, Reader, Inspector, Scribe.</td>
            </tr>
            <tr>
              <td><strong>Pre-Meeting Prep</strong></td>
              <td>Optional or minimal by attendees.</td>
              <td>Mandatory preparation by all inspectors with checklists.</td>
            </tr>
          </tbody>
        </table>
      </div>
    `
  },
  'stubs-vs-drivers': {
    title: 'Stubs vs Drivers in Integration Testing',
    content: `
      <div class="table-responsive">
        <table class="apple-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Stub</th>
              <th>Driver</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Role</strong></td>
              <td><strong>Called Module:</strong> Simulates a missing sub-routine/child module.</td>
              <td><strong>Calling Module:</strong> Simulates a missing higher-level parent caller.</td>
            </tr>
            <tr>
              <td><strong>Integration Strategy</strong></td>
              <td>Used in <strong>Top-Down</strong> Integration testing.</td>
              <td>Used in <strong>Bottom-Up</strong> Integration testing.</td>
            </tr>
            <tr>
              <td><strong>Behavior</strong></td>
              <td>Passively receives calls from caller, returns hardcoded dummy data.</td>
              <td>Actively passes test cases to unit under test and displays results.</td>
            </tr>
            <tr>
              <td><strong>Complexity</strong></td>
              <td>Easier to write (usually returns fixed constants).</td>
              <td>More complex (must pass diverse test arguments and log results).</td>
            </tr>
          </tbody>
        </table>
      </div>
    `
  }
};

function showDiffComparison(key) {
  playAppleClick(700);
  document.querySelectorAll('.diff-tab-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');

  const container = document.getElementById('diff-comparison-content');
  if (diffData[key]) {
    container.innerHTML = `
      <h4 class="box-title mb-3">${diffData[key].title}</h4>
      ${diffData[key].content}
    `;
  }
}

// ==========================================
// 4. Interactive V-Model Simulator
// ==========================================
const vmodelPairs = {
  req: {
    title: "Requirements Analysis ↔ Acceptance Testing (UAT)",
    desc: "Acceptance testing directly validates whether the final built product satisfies the original business requirements and user needs drafted in the SRS/BRD. Performed by clients and end-users."
  },
  hld: {
    title: "System / High Level Design (HLD) ↔ System Testing",
    desc: "System testing evaluates the fully integrated software as a single holistic system against the architectural specifications, subsystem interfaces, and non-functional metrics defined in HLD."
  },
  lld: {
    title: "Detailed / Low Level Design (LLD) ↔ Integration Testing",
    desc: "Integration testing verifies that interconnected modules communicate data accurately without interface mismatches, directly validating the detailed data structures and API signatures defined in LLD."
  },
  code: {
    title: "Coding / Implementation ↔ Unit Testing",
    desc: "Unit testing tests individual functions, procedures, or methods in isolation immediately after coding to eliminate syntax and calculation flaws. Performed by developers using pytest or JUnit."
  }
};

function highlightVModelPair(phaseKey) {
  playAppleClick(850);
  // Clear active classes
  document.querySelectorAll('.vmodel-card').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.vmodel-beam').forEach(b => b.classList.remove('active'));

  // Highlight pair
  const devCard = document.getElementById(`vm-dev-${phaseKey}`);
  const testCard = document.getElementById(`vm-test-${phaseKey}`);
  const beam = document.getElementById(`vm-beam-${phaseKey}`);

  if (devCard) devCard.classList.add('active');
  if (testCard) testCard.classList.add('active');
  if (beam) beam.classList.add('active');

  const info = vmodelPairs[phaseKey];
  const textBox = document.getElementById('vmodel-explanation-text');
  if (info && textBox) {
    textBox.innerHTML = `
      <strong style="color: var(--apple-blue); font-size: 1rem;">🔗 ${info.title}</strong>
      <p class="mt-1" style="color: var(--text-primary); font-size: 0.9rem;">${info.desc}</p>
    `;
  }
}

function showSevPrioDetail(key) {
  playAppleClick(750);
  alert("Severity measures technical destruction; Priority measures business urgency to fix.");
}

// ==========================================
// 5. Mutation Testing Simulator
// ==========================================
function runMutationAnalysis() {
  playAppleClick(950);
  const input = document.getElementById('mutation-test-cases').value;
  const lines = input.split(/\n+/).map(line => line.trim()).filter(Boolean);
  const tests = [];
  const errors = [];
  lines.forEach((line, index) => {
    const match = line.match(/^(-?\d+)\s*,\s*(-?\d+)$/);
    if (!match) { errors.push(`Line ${index + 1}: use two integers separated by a comma.`); return; }
    const [a, b] = match.slice(1).map(Number);
    if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b) || !Number.isSafeInteger(a + 1)) {
      errors.push(`Line ${index + 1}: use safe integers.`); return;
    }
    tests.push({ a, b });
  });
  const feedback = document.getElementById('mutation-feedback');
  if (errors.length || !tests.length) {
    feedback.textContent = errors[0] || 'Add at least one input pair before running the suite.';
    feedback.classList.add('has-error');
    return;
  }
  feedback.classList.remove('has-error');
  const mutations = [
    { id: 'm1-status', equivalent: true, run: ({ a, b }) => a >= b ? a : b },
    { id: 'm2-status', run: ({ a, b }) => a < b ? a : b },
    { id: 'm3-status', run: ({ a, b }) => a > b ? b : b },
    { id: 'm4-status', run: ({ a, b }) => a > b ? a + 1 : b }
  ];
  let killed = 0;
  let survived = 0;
  let equivalent = 0;
  mutations.forEach(mutant => {
    const status = document.getElementById(mutant.id);
    if (mutant.equivalent) {
      equivalent++;
      status.textContent = 'EQUIVALENT · excluded';
      status.className = 'mutant-status status-equivalent';
      return;
    }
    const isKilled = tests.some(({ a, b }) => {
      const expected = a > b ? a : b;
      return mutant.run({ a, b }) !== expected;
    });
    if (isKilled) killed++; else survived++;
    status.textContent = isKilled ? 'KILLED ✓' : 'SURVIVED';
    status.className = `mutant-status ${isKilled ? 'status-killed' : 'status-survived'}`;
  });
  const score = Math.round((killed / (mutations.length - equivalent)) * 100);
  document.getElementById('mutation-score-val').textContent = `${score}%`;
  document.getElementById('mutation-analysis').textContent = `${killed} killed · ${survived} survived · ${equivalent} equivalent (excluded). Score: ${killed}/${mutations.length - equivalent} non-equivalent mutants.`;
  feedback.textContent = `${tests.length} test ${tests.length === 1 ? 'case' : 'cases'} run. Compare each mutant’s output with the original max(a, b).`;
}

// ==========================================
// 6. Flippable Flashcards Generator
// ==========================================
const flashcardDeck = [
  {
    tag: "STLC",
    q: "What are the 6 sequential phases of STLC?",
    a: "<strong>Recall:</strong> ‘Rabbits Plan Carefully, Enter Every Course.’<br>1. Requirement Analysis<br>2. Test Planning<br>3. Test Case Development<br>4. Test Environment Setup<br>5. Test Execution<br>6. Test Cycle Closure"
  },
  {
    tag: "Terminology",
    q: "What is Error vs Fault vs Failure?",
    a: "<strong>Error:</strong> Human mistake made by developer.<br><strong>Fault (Bug):</strong> Flawed code manifestation.<br><strong>Failure:</strong> Software crash or wrong output at runtime."
  },
  {
    tag: "Boehm's Law",
    q: "Verification vs Validation?",
    a: "<strong>Verification:</strong> <em>'Are we building the product right?'</em> (Static, no code execution).<br><strong>Validation:</strong> <em>'Are we building the right product?'</em> (Dynamic execution against user needs)."
  },
  {
    tag: "White Box",
    q: "What are the 3 formulas for Cyclomatic Complexity V(G)?",
    a: "<strong>Recall:</strong> Decisions + 1 · Edges − Nodes + 2 · Regions.<br>1. <strong>V(G) = P + 1</strong> (P = predicate decision nodes)<br>2. <strong>V(G) = E − N + 2</strong> (E = edges, N = nodes)<br>3. <strong>V(G) = R</strong> (R = planar regions)"
  },
  {
    tag: "Black Box",
    q: "Formulas for BVA Test Case Counts for n variables?",
    a: "• <strong>Standard BVC:</strong> 4n + 1 (four valid boundary points per input + nominal)<br>• <strong>Robust:</strong> 6n + 1 (adds two invalid points per input)<br>• <strong>Worst-case:</strong> 5<sup>n</sup> (Cartesian product of five valid points)<br>• <strong>Robust worst-case:</strong> 7<sup>n</sup> (Cartesian product including invalid points)<br><em>Check whether points overlap for narrow discrete ranges.</em>"
  },
  {
    tag: "Static Testing",
    q: "Walkthrough vs Fagan Inspection?",
    a: "• <strong>Walkthrough:</strong> Led by the Author. Recall its steps as <strong>P-O-R-M-R-F</strong>: Plan, Overview, individual Review, Meeting, Rework, Follow-up.<br>• <strong>Fagan inspection:</strong> Led by a trained Moderator; its six steps include <strong>Preparation</strong> before the inspection meeting."
  },
  {
    tag: "Integration",
    q: "What is the difference between a Stub and a Driver?",
    a: "• <strong>Stub:</strong> Dummy <em>called</em> module used in Top-Down integration.<br>• <strong>Driver:</strong> Dummy <em>calling</em> module used in Bottom-Up integration."
  },
  {
    tag: "Quality",
    q: "High Severity + Low Priority Example?",
    a: "Software crashes completely when executing an obsolete feature on Windows 98. Severe technical crash, but negligible business impact."
  },
  {
    tag: "Quality",
    q: "Low Severity + High Priority Example?",
    a: "Company logo or CEO name misspelled on the homepage. System functions perfectly, but brand reputation demands immediate fix."
  },
  {
    tag: "Accessibility",
    q: "What are the 4 WCAG POUR Principles?",
    a: "1. <strong>Perceivable:</strong> Multi-sensory (alt text, audio captions)<br>2. <strong>Operable:</strong> Keyboard navigation<br>3. <strong>Understandable:</strong> Clear wording<br>4. <strong>Robust:</strong> Screen reader compatibility"
  },
  {
    tag: "Regression",
    q: "What are the 4 types of Regression Testing?",
    a: "Recall <strong>CPRS</strong>: ‘Careful Planners Retest Selectively.’<br><strong>C</strong>orrective: reuse tests when requirements are unchanged.<br><strong>P</strong>rogressive: add or adapt tests when requirements change.<br><strong>R</strong>etest-all: run the entire suite.<br><strong>S</strong>elective: run tests affected by the change."
  },
  {
    tag: "Mutation Testing",
    q: "What is a Killed Mutant vs Survived Mutant?",
    a: "• <strong>Killed:</strong> Test case fails on modified code (test caught the bug!).<br>• <strong>Survived:</strong> All test cases pass despite mutant (test suite weakness!)."
  },
  {
    tag: "Testing Goals",
    q: "Recall the seven goals of testing in order.",
    a: "<strong>DVEVSRC:</strong> ‘Diligent Verifiers Ensure Valuable Software, Reduce Costs.’<br><b>D</b>etect defects · <b>V</b>erify requirements · <b>E</b>nsure correctness/reliability · <b>V</b>alidate user needs · <b>S</b>ecure data · <b>R</b>educe risk/cost · <b>C</b>omply with standards. Use it to recall; explain the goals in your own words."
  },
  {
    tag: "Testing Principles",
    q: "Recall the seven fundamental principles of software testing.",
    a: "<strong>ETEDPCA:</strong> ‘Early Testers Expect Defects; Pesticides Change Approach.’<br><strong>E</strong>arly testing · <strong>T</strong>esting shows presence, not absence · <strong>E</strong>xhaustive testing is impossible · <strong>D</strong>efects cluster · <strong>P</strong>esticide paradox · <strong>C</strong>ontext-dependent testing · <strong>A</strong>bsence-of-errors fallacy. Add a one-line explanation for each in an exam answer."
  },
  {
    tag: "Severity & Priority",
    q: "How do you distinguish severity from priority?",
    a: "<strong>Severity = impact</strong> on product behavior. <strong>Priority = urgency</strong> in the work queue. Ask: ‘How bad is the failure?’ and ‘How soon must it be fixed?’"
  },
  {
    tag: "V-Model",
    q: "Which test level maps to each V-Model development artifact?",
    a: "Requirements ↔ <strong>Acceptance</strong><br>HLD ↔ <strong>System</strong><br>LLD ↔ <strong>Integration</strong><br>Code ↔ <strong>Unit</strong><br>Test levels run upward: Unit → Integration → System → Acceptance."
  },
  {
    tag: "Test Levels",
    q: "What is the usual order of test levels?",
    a: "<strong>U-I-S-A:</strong> ‘Use It, Scale, Accept.’<br><strong>Unit → Integration → System → Acceptance.</strong> The mnemonic only cues the order; give the formal names in an exam answer."
  }
];

function renderFlashcards() {
  const container = document.getElementById('flashcards-grid');
  if (!container) return;

  container.innerHTML = flashcardDeck.map((fc, idx) => `
    <div class="flashcard" onclick="flipFlashcard(${idx})">
      <div class="flashcard-inner" id="fc-${idx}">
        <div class="flashcard-front">
          <div>
            <span class="fc-tag">${fc.tag}</span>
            <div class="fc-question mt-2">${fc.q}</div>
          </div>
          <div class="fc-flip-hint">
            <span>🔄 Click to flip answer</span>
          </div>
        </div>
        <div class="flashcard-back">
          <div>
            <span class="fc-tag" style="color: var(--apple-green);">Answer</span>
            <div class="fc-answer mt-2">${fc.a}</div>
          </div>
          <div class="fc-flip-hint">
            <span>🔄 Click to flip question</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function flipFlashcard(idx) {
  playAppleClick(750);
  const card = document.getElementById(`fc-${idx}`);
  if (card) {
    card.parentElement.classList.toggle('flipped');
  }
}

// ==========================================
// 7. STLC 6-Phase Pipeline Data & Controller
// ==========================================
const stlcPhases = [
  {
    num: 1,
    title: "Requirement Analysis",
    subtitle: "Study documents & identify testable requirements",
    lead: "Testers interact with clients, product managers, and architects to study SRS and BRD documents and identify what features are testable.",
    activities: [
      "Review functional and non-functional specifications",
      "Identify test conditions and edge cases",
      "Draft Requirement Traceability Matrix (RTM)",
      "Flag ambiguous or untestable requirements"
    ],
    deliverables: "Requirement Traceability Matrix (RTM), Automation Feasibility Report",
    entryCriteria: "Approved SRS / BRD document available from client",
    exitCriteria: "Signed-off RTM and clear list of testable scope"
  },
  {
    num: 2,
    title: "Test Planning",
    subtitle: "Determine strategy, scope, resources & schedule",
    lead: "The QA Lead calculates effort estimates, selects testing tools (e.g. Selenium, Jira), and determines the overall testing strategy.",
    activities: [
      "Define test strategy, scope, and objectives",
      "Perform resource allocation and effort estimation",
      "Select automation tools, bug tracking tools, and test harness",
      "Draft comprehensive Test Plan document"
    ],
    deliverables: "Test Plan Document, Test Strategy, Effort Estimation Matrix",
    entryCriteria: "Finalized requirements and signed-off RTM",
    exitCriteria: "Approved Test Plan document signed by project management"
  },
  {
    num: 3,
    title: "Test Case Development",
    subtitle: "Draft test cases, test data & test scripts",
    lead: "QA engineers write detailed test steps, positive/negative test data, expected outputs, and automation scripts.",
    activities: [
      "Author step-by-step test cases with unique IDs",
      "Generate test data (BVA boundaries, equivalence partitions)",
      "Map each test case to corresponding requirement in RTM",
      "Conduct peer review of test cases for coverage"
    ],
    deliverables: "Test Cases Suite, Test Data sets, Automation Test Scripts",
    entryCriteria: "Approved Test Plan and finalized requirements",
    exitCriteria: "Reviewed and approved test cases with complete RTM coverage"
  },
  {
    num: 4,
    title: "Test Environment Setup",
    subtitle: "Configure hardware, servers, databases & smoke check",
    lead: "DevOps and QA configure servers, test databases, network configurations, and verify readiness using a quick Smoke Test.",
    activities: [
      "Provision test servers, cloud instances, and database mirrors",
      "Deploy software build into testing staging environment",
      "Verify test network connectivity and third-party API mocks",
      "Execute smoke test to confirm build stability"
    ],
    deliverables: "Live Test Environment, Smoke Test Execution Report",
    entryCriteria: "Deployed build and hardware/software readiness",
    exitCriteria: "Environment functioning stably; smoke test PASSED"
  },
  {
    num: 5,
    title: "Test Execution",
    subtitle: "Execute tests, log defects & re-test fixes",
    lead: "Testers run the test cases, compare actual results with expected results, log defects in Jira, and verify re-tests.",
    activities: [
      "Execute planned manual and automated test cases",
      "Log defects with screenshots and reproducible steps",
      "Map defects to failed test cases in RTM",
      "Re-test verified defect fixes and run regression tests"
    ],
    deliverables: "Test Execution Logs, Defect Reports (Jira), RTM updated",
    entryCriteria: "Test environment ready and test cases approved",
    exitCriteria: "All planned test cases executed; no critical blockers open"
  },
  {
    num: 6,
    title: "Test Cycle Closure",
    subtitle: "Prepare test summary, metrics & sign-off",
    lead: "QA management analyzes test metrics (pass/fail rates, defect density), documents lessons learned, and prepares the Test Summary Report.",
    activities: [
      "Evaluate cycle completion criteria (coverage, defect trends)",
      "Prepare Test Summary Report and final defect metrics",
      "Conduct retrospective / lessons learned meeting",
      "Archive test assets for future regression cycles"
    ],
    deliverables: "Test Summary Report, Test Metrics, Formal QA Sign-off",
    entryCriteria: "Testing execution completed and exit criteria satisfied",
    exitCriteria: "Formal sign-off approved by product stakeholders"
  }
];

let currentSTLCPhase = 1;
let stlcAutoTimer = null;

function setSTLCPhase(phaseNum) {
  playAppleClick(750);
  currentSTLCPhase = phaseNum;
  const phase = stlcPhases[phaseNum - 1];

  document.querySelectorAll('.stlc-step-bubble').forEach((bubble, idx) => {
    if (idx + 1 === phaseNum) bubble.classList.add('active');
    else bubble.classList.remove('active');
  });

  for (let i = 1; i <= 5; i++) {
    const line = document.getElementById(`stlc-line-${i}`);
    if (line) {
      if (i < phaseNum) line.classList.add('active');
      else line.classList.remove('active');
    }
  }

  const detailBox = document.getElementById('stlc-phase-detail');
  if (detailBox) {
    detailBox.innerHTML = `
      <div class="topic-header">
        <span class="topic-number">Phase ${phase.num} of 6</span>
        <h3>${phase.title}</h3>
        <span class="marks-tag">${phase.subtitle}</span>
      </div>
      <p class="section-lead">${phase.lead}</p>
      
      <div class="grid-2col mt-4">
        <div class="info-box">
          <h4 class="box-title">Key Activities</h4>
          <ul class="apple-bullet-list">
            ${phase.activities.map(a => `<li>${a}</li>`).join('')}
          </ul>
          <div class="mt-4">
            <strong>Key Deliverable:</strong>
            <p class="small-text text-code">${phase.deliverables}</p>
          </div>
        </div>

        <div class="info-box">
          <h4 class="box-title">Entry & Exit Criteria</h4>
          <div class="mini-card mb-2">
            <strong style="color: var(--apple-blue);">Entry Criteria:</strong>
            <p>${phase.entryCriteria}</p>
          </div>
          <div class="mini-card">
            <strong style="color: var(--apple-green);">Exit Criteria:</strong>
            <p>${phase.exitCriteria}</p>
          </div>
        </div>
      </div>
    `;
  }
}

function runSTLCPipelineAuto() {
  playAppleClick(900);
  if (stlcAutoTimer) {
    clearInterval(stlcAutoTimer);
    stlcAutoTimer = null;
  }
  let step = 1;
  setSTLCPhase(step);
  stlcAutoTimer = setInterval(() => {
    step++;
    if (step > 6) {
      clearInterval(stlcAutoTimer);
      stlcAutoTimer = null;
    } else {
      setSTLCPhase(step);
    }
  }, 2200);
}

// ==========================================
// 8. CFG & Cyclomatic Complexity Simulator
// ==========================================
function renderCFGGraph(activePath = null, animatedNode = null) {
  const svg = document.getElementById('cfg-svg');
  if (!svg) return;

  svg.innerHTML = `
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 8 5 L 0 9 z" fill="#8d9b90" />
      </marker>
      <marker id="arrow-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 8 5 L 0 9 z" fill="#397653" />
      </marker>
    </defs>
  `;

  const edges = [
    { from: 1, to: 2, x1: 200, y1: 50, x2: 200, y2: 120, label: "" },
    { from: 2, to: 3, x1: 170, y1: 145, x2: 100, y2: 230, label: "True (a > b)", path: 'P1' },
    { from: 2, to: 4, x1: 230, y1: 145, x2: 300, y2: 230, label: "False (a <= b)", path: 'P2' },
    { from: 3, to: 5, x1: 100, y1: 270, x2: 180, y2: 345, label: "", path: 'P1' },
    { from: 4, to: 5, x1: 300, y1: 270, x2: 220, y2: 345, label: "", path: 'P2' },
    { from: 5, to: 6, x1: 200, y1: 375, x2: 200, y2: 430, label: "" }
  ];

  edges.forEach(e => {
    const isEdgeActive = (activePath && e.path === activePath) || (activePath && !e.path);
    const strokeColor = isEdgeActive ? "#397653" : "#b5c0b6";
    const strokeWidth = isEdgeActive ? "3.5" : "2";
    const marker = isEdgeActive ? "url(#arrow-active)" : "url(#arrow)";

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", e.x1);
    line.setAttribute("y1", e.y1);
    line.setAttribute("x2", e.x2);
    line.setAttribute("y2", e.y2);
    line.setAttribute("stroke", strokeColor);
    line.setAttribute("stroke-width", strokeWidth);
    line.setAttribute("marker-end", marker);
    svg.appendChild(line);

    if (e.label) {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      const midX = (e.x1 + e.x2) / 2 + (e.from === 2 && e.to === 3 ? -35 : 15);
      const midY = (e.y1 + e.y2) / 2 - 4;
      text.setAttribute("x", midX);
      text.setAttribute("y", midY);
      text.setAttribute("fill", isEdgeActive ? "#397653" : "#68756b");
      text.setAttribute("font-size", "11");
      text.setAttribute("font-family", "JetBrains Mono");
      text.textContent = e.label;
      svg.appendChild(text);
    }
  });

  const nodes = [
    { id: 1, x: 200, y: 35, r: 18, label: "1", sub: "Start / Input" },
    { id: 2, x: 200, y: 135, r: 20, label: "2", sub: "if (a > b)" },
    { id: 3, x: 90, y: 245, r: 20, label: "3", sub: "x = x + y" },
    { id: 4, x: 310, y: 245, r: 20, label: "4", sub: "x = y" },
    { id: 5, x: 200, y: 355, r: 20, label: "5", sub: "printf / return" },
    { id: 6, x: 200, y: 445, r: 16, label: "6", sub: "End" }
  ];

  nodes.forEach(n => {
    const isNodeActive = (activePath === 'P1' && [1, 2, 3, 5, 6].includes(n.id)) ||
                         (activePath === 'P2' && [1, 2, 4, 5, 6].includes(n.id)) ||
                         (animatedNode === n.id);

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", n.x);
    circle.setAttribute("cy", n.y);
    circle.setAttribute("r", n.r);
    circle.setAttribute("fill", isNodeActive ? "#397653" : "#fffefa");
    circle.setAttribute("stroke", isNodeActive ? "#397653" : "#97a69a");
    circle.setAttribute("stroke-width", isNodeActive ? "3" : "1.8");
    if (isNodeActive) {
      circle.setAttribute("filter", "drop-shadow(0px 0px 8px rgba(57, 118, 83, 0.35))");
    }
    group.appendChild(circle);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", n.x);
    text.setAttribute("y", n.y + 5);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", isNodeActive ? "#ffffff" : "#33453a");
    text.setAttribute("font-weight", "bold");
    text.setAttribute("font-size", "13");
    text.textContent = n.label;
    group.appendChild(text);

    const subText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    subText.setAttribute("x", n.id === 3 ? n.x - 28 : (n.id === 4 ? n.x + 28 : n.x + 30));
    subText.setAttribute("y", n.y + 4);
    subText.setAttribute("text-anchor", n.id === 3 ? "end" : "start");
    subText.setAttribute("fill", "var(--text-secondary)");
    subText.setAttribute("font-size", "10");
    subText.textContent = n.sub;
    group.appendChild(subText);

    svg.appendChild(group);
  });
}

function highlightPath(pathName) {
  playAppleClick(750);
  renderCFGGraph(pathName);
  const fb = document.getElementById('cfg-execution-feedback');
  if (pathName === 'P1') {
    fb.innerHTML = `
      <span style="color: var(--apple-blue); font-weight: 700;">Path 1 (True Branch):</span>
      Nodes <code>1 ➔ 2 ➔ 3 ➔ 5 ➔ 6</code>. Condition <code>a > b</code> is True. Executes <code>x = x + y</code>.
    `;
  } else {
    fb.innerHTML = `
      <span style="color: var(--apple-purple); font-weight: 700;">Path 2 (False Branch):</span>
      Nodes <code>1 ➔ 2 ➔ 4 ➔ 5 ➔ 6</code>. Condition <code>a &gt; b</code> is False, so <code>a &lt;= b</code>. Executes <code>x = y</code>.
    `;
  }
}

function resetCFG() {
  playAppleClick(600);
  renderCFGGraph(null);
  document.querySelectorAll('.code-line').forEach(l => l.classList.remove('active-line'));
  document.getElementById('cfg-execution-feedback').innerHTML = `
    <div class="feedback-status">💡 Click "Run & Trace Path" to watch the token travel through the graph in real-time.</div>
  `;
}

function runCFGSimulation() {
  playAppleClick(850);
  const rawInputs = ['a', 'b', 'x', 'y'].map(key => document.getElementById(`cfg-input-${key}`).value.trim());
  const values = rawInputs.map(Number);
  if (rawInputs.some(value => value === '') || values.some(value => !Number.isSafeInteger(value))) {
    const feedback = document.getElementById('cfg-execution-feedback');
    feedback.innerHTML = '<div class="feedback-status validation-error">Enter a whole number for a, b, x, and y before tracing the graph.</div>';
    return;
  }
  const [a, b, initialX, initialY] = values;

  const isTrue = a > b;
  const chosenPath = isTrue ? 'P1' : 'P2';
  const finalX = isTrue ? initialX + initialY : initialY;

  const pathNodes = isTrue ? [1, 2, 3, 5, 6] : [1, 2, 4, 5, 6];
  let step = 0;

  function stepThrough() {
    if (step < pathNodes.length) {
      const nodeId = pathNodes[step];
      renderCFGGraph(chosenPath, nodeId);
      playAppleClick(900 + step * 50);

      document.querySelectorAll('.code-line').forEach(l => l.classList.remove('active-line'));
      if (nodeId === 1) document.getElementById('code-line-5')?.classList.add('active-line');
      if (nodeId === 2) document.getElementById('code-line-6')?.classList.add('active-line');
      if (nodeId === 3) document.getElementById('code-line-7')?.classList.add('active-line');
      if (nodeId === 4) document.getElementById('code-line-9')?.classList.add('active-line');
      if (nodeId === 5) document.getElementById('code-line-11')?.classList.add('active-line');
      if (nodeId === 6) document.getElementById('code-line-12')?.classList.add('active-line');

      step++;
      setTimeout(stepThrough, 450);
    } else {
      const fb = document.getElementById('cfg-execution-feedback');
      fb.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>Execution Complete:</strong> <code>a = ${a}, b = ${b}</code> ➔ 
            Condition <code>(${a} &gt; ${b})</code> is <strong>${isTrue ? 'TRUE' : 'FALSE'}</strong>.
            Traversed Path <strong>${chosenPath}</strong>.
          </div>
          <div class="apple-pill-tag" style="margin: 0; background: rgba(52, 199, 89, 0.2); color: var(--apple-green);">
            Computed x = ${finalX}
          </div>
        </div>
      `;
    }
  }

  stepThrough();
}

// ==========================================
// 9. BVA & Robust Test Case Generator
// ==========================================
function loadBVAPreset(preset) {
  playAppleClick(750);
  let ranges = [];
  if (preset === 'age') {
    ranges = [{ min: 18, max: 60 }];
    document.getElementById('bva-variables').value = 1;
    document.getElementById('bva-mode').value = 'robust';
  } else if (preset === 'largest3') {
    ranges = Array.from({ length: 3 }, () => ({ min: 1, max: 50 }));
    document.getElementById('bva-variables').value = 3;
    document.getElementById('bva-mode').value = 'bvc';
  } else if (preset === 'power') {
    ranges = [{ min: 1, max: 8 }, { min: 1, max: 4 }];
    document.getElementById('bva-variables').value = 2;
    document.getElementById('bva-mode').value = 'robust';
  }
  updateBVARangeInputs(ranges);
  generateBVATable();
}

function updateBVARangeInputs(ranges = null) {
  const host = document.getElementById('bva-variable-ranges');
  const countInput = document.getElementById('bva-variables');
  if (!host || !countInput) return;
  const count = Math.max(1, Math.min(4, Number.parseInt(countInput.value, 10) || 1));
  countInput.value = count;
  const previous = Array.from({ length: 4 }, (_, index) => ({
    min: document.getElementById(`bva-min-${index + 1}`)?.value ?? '1',
    max: document.getElementById(`bva-max-${index + 1}`)?.value ?? '10'
  }));
  const values = Array.from({ length: count }, (_, index) => ranges?.[index] || previous[index] || previous[0]);
  host.innerHTML = values.map((range, index) => `
    <fieldset class="bva-range-input"><legend>Input ${index + 1}${index === 0 ? ' (shown on number line)' : ''}</legend>
      <label for="bva-min-${index + 1}">Minimum</label><input id="bva-min-${index + 1}" type="number" step="1" value="${range.min}" aria-label="Input ${index + 1} minimum">
      <label for="bva-max-${index + 1}">Maximum</label><input id="bva-max-${index + 1}" type="number" step="1" value="${range.max}" aria-label="Input ${index + 1} maximum">
    </fieldset>`).join('');
}

function generateBVATable() {
  playAppleClick(700);
  const n = Math.max(1, Math.min(4, Number.parseInt(document.getElementById('bva-variables')?.value, 10) || 1));
  const ranges = Array.from({ length: n }, (_, index) => ({
    min: Number(document.getElementById(`bva-min-${index + 1}`)?.value),
    max: Number(document.getElementById(`bva-max-${index + 1}`)?.value)
  }));
  const mode = document.getElementById('bva-mode').value;
  const invalidRange = ranges.findIndex(({ min, max }) => !Number.isInteger(min) || !Number.isInteger(max) || max <= min);
  if (invalidRange !== -1) {
    const feedback = document.getElementById('bva-case-count');
    feedback.textContent = `Input ${invalidRange + 1}: choose whole numbers with max greater than min`;
    document.getElementById('bva-tbody').innerHTML = `<tr><td colspan="6">Choose whole-number minimum and maximum values, with the maximum greater than the minimum.</td></tr>`;
    document.getElementById('number-line-display').innerHTML = '';
    return;
  }
  const nominals = ranges.map(({ min, max }) => Math.floor((min + max) / 2));
  const testCases = [];
  const seenInputs = new Set();
  let duplicateCount = 0;
  const addCase = (values, type, reason, idPrefix = 'TC') => {
    const signature = values.join('|');
    if (seenInputs.has(signature)) { duplicateCount++; return; }
    seenInputs.add(signature);
    const outOfRange = values.some((value, index) => value < ranges[index].min || value > ranges[index].max);
    testCases.push({ id: `${idPrefix}${String(testCases.length + 1).padStart(2, '0')}`, values, type, reason, outOfRange });
  };
  if (mode === 'worst') {
    const valueSets = ranges.map(({ min, max }) => [min, min + 1, Math.floor((min + max) / 2), max - 1, max]);
    const combinations = valueSets.reduce((rows, values) => rows.flatMap(row => values.map(value => [...row, value])), [[]]);
    combinations.forEach(values => addCase(values, `Combination ${testCases.length + 1}`, 'Cartesian product of valid boundary values', 'WC'));
  } else {
    addCase(nominals, 'Nominal baseline', 'All inputs use their nominal value');
    ranges.forEach(({ min, max }, index) => {
      const candidates = mode === 'bvc'
        ? [[min, 'min'], [min + 1, 'min+1'], [max - 1, 'max−1'], [max, 'max']]
        : [[min - 1, 'min−1'], [min, 'min'], [min + 1, 'min+1'], [max - 1, 'max−1'], [max, 'max'], [max + 1, 'max+1']];
      candidates.forEach(([value, label]) => {
        const values = [...nominals]; values[index] = value;
        addCase(values, `Input ${index + 1}: ${label}`, `${label} for input ${index + 1}; other inputs held nominal`);
      });
    });
  }

  const tbody = document.getElementById('bva-tbody');
  tbody.innerHTML = testCases.map(tc => `
    <tr>
      <td><strong>${tc.id}</strong></td>
      <td><code>${tc.values.length === 1 ? tc.values[0] : `(${tc.values.map((value, index) => `x${index + 1}=${value}`).join(', ')})`}</code></td>
      <td>${tc.type}</td>
      <td>${tc.outOfRange ? 'Reject input' : 'Accept input'}</td>
      <td><span class="table-tag ${tc.outOfRange ? 'tag-invalid' : 'tag-valid'}">${tc.outOfRange ? 'INVALID' : 'VALID'}</span></td>
      <td>${tc.reason}</td>
    </tr>
  `).join('');

  const expectedCount = mode === 'bvc' ? 4 * n + 1 : mode === 'robust' ? 6 * n + 1 : 5 ** n;
  document.getElementById('bva-case-count').textContent = duplicateCount
    ? `${testCases.length} unique · ${duplicateCount} duplicate${duplicateCount === 1 ? '' : 's'} removed (${expectedCount} planned)`
    : `${testCases.length} cases · formula ${expectedCount}`;
  document.getElementById('number-line-caption')?.remove();
  document.getElementById('number-line-display').insertAdjacentHTML('beforebegin', `<p class="number-line-caption" id="number-line-caption">Number line shows Input 1: [${ranges[0].min}, ${ranges[0].max}] · ${mode === 'robust' ? 'robust' : 'valid'} boundary values</p>`);
  renderNumberLine(ranges[0].min, ranges[0].max, mode);
}

function renderNumberLine(min, max, mode) {
  const container = document.getElementById('number-line-display');
  if (!container) return;

  const points = (mode === 'bvc' || mode === 'worst')
    ? [
        { label: `${min}`, pos: 20, tc: 'min' },
        { label: `${min + 1}`, pos: 32, tc: 'min+1' },
        { label: `${Math.floor((min + max) / 2)}`, pos: 50, tc: 'nom' },
        { label: `${max - 1}`, pos: 68, tc: 'max-1' },
        { label: `${max}`, pos: 80, tc: 'max' }
      ]
    : [
        { label: `${min - 1}`, pos: 10, tc: 'min-1', invalid: true },
        { label: `${min}`, pos: 22, tc: 'min' },
        { label: `${min + 1}`, pos: 34, tc: 'min+1' },
        { label: `${Math.floor((min + max) / 2)}`, pos: 50, tc: 'nom' },
        { label: `${max - 1}`, pos: 66, tc: 'max-1' },
        { label: `${max}`, pos: 78, tc: 'max' },
        { label: `${max + 1}`, pos: 90, tc: 'max+1', invalid: true }
      ];

  container.innerHTML = `
    <div class="nl-axis"></div>
    <div class="nl-valid-range" style="left: 21%; width: 58%;"></div>
    ${points.map(p => `
      <div class="nl-point" style="left: ${p.pos}%;">
        <span class="nl-tc-tag">${p.tc}</span>
        <div class="nl-dot ${p.invalid ? 'invalid' : ''}"></div>
        <span class="nl-label">${p.label}</span>
      </div>
    `).join('')}
  `;
}

// ==========================================
// 10. Bug Life Cycle State Machine
// ==========================================
const bugStateInfo = {
  NEW: {
    title: "NEW",
    desc: "A defect is logged for the very first time by the testing team and added to the bug tracking tool (Jira / Bugzilla).",
    role: "QA Engineer / Software Tester",
    next: "ASSIGNED"
  },
  ASSIGNED: {
    title: "ASSIGNED",
    desc: "The QA lead or Project Manager reviews the logged bug and assigns it to the developer responsible for that module.",
    role: "QA Lead / Project Manager",
    next: "OPEN"
  },
  OPEN: {
    title: "OPEN",
    desc: "The developer analyzes the defect, reproduces the steps, debugs the root cause, and decides whether it is a valid defect.",
    role: "Software Developer",
    next: "FIXED (or Rejected / Deferred / Duplicate)"
  },
  FIXED: {
    title: "FIXED",
    desc: "The developer modifies the code, verifies the patch with local unit tests, and commits the fix to the testing build.",
    role: "Software Developer",
    next: "RETEST"
  },
  RETEST: {
    title: "RETEST",
    desc: "The tester executes the failed test case again on the new software build to verify whether the defect is genuinely fixed.",
    role: "QA Engineer / Tester",
    next: "CLOSED (if fixed) OR REOPENED (if bug still persists)"
  },
  CLOSED: {
    title: "CLOSED",
    desc: "The tester verifies the defect is completely resolved and regression testing reveals no side-effects. Bug is officially closed.",
    role: "QA Engineer / Tester",
    next: "Terminal State (Defect Resolved)"
  },
  REOPENED: {
    title: "REOPENED",
    desc: "The bug still reproduces during re-testing, or the fix introduced another critical failure. Bug returns to the developer.",
    role: "QA Engineer / Tester",
    next: "OPEN"
  }
};

function transitionBugState(stateKey) {
  playAppleClick(800);
  document.querySelectorAll('.state-node').forEach(n => n.classList.remove('active'));

  const nodeEl = document.getElementById(`node-${stateKey}`);
  if (nodeEl) nodeEl.classList.add('active');

  const info = bugStateInfo[stateKey];
  if (info) {
    document.getElementById('current-bug-state-title').textContent = info.title;
    document.getElementById('current-bug-state-desc').textContent = info.desc;
    document.getElementById('current-bug-role').textContent = info.role;
    document.getElementById('current-bug-next').textContent = info.next;
  }
}

function resetBugStateMachine() {
  transitionBugState('NEW');
}

// ==========================================
// 11. WCAG Color Contrast & Speech Playground
// ==========================================
function getLuminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

function computeContrastRatio() {
  playAppleClick(700);
  const fgHex = document.getElementById('contrast-fg').value;
  const bgHex = document.getElementById('contrast-bg').value;

  const fgRgb = hexToRgb(fgHex);
  const bgRgb = hexToRgb(bgHex);

  const l1 = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const l2 = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);

  const ratioFormatted = ratio.toFixed(2);
  document.getElementById('contrast-ratio-val').textContent = `${ratioFormatted}:1`;

  const preview = document.getElementById('contrast-preview-box');
  preview.style.backgroundColor = bgHex;
  preview.style.color = fgHex;

  const aaPass = ratio >= 4.5;
  const aaaPass = ratio >= 7.0;

  const aaBadge = document.getElementById('contrast-aa-badge');
  const aaaBadge = document.getElementById('contrast-aaa-badge');

  aaBadge.className = `compliance-badge ${aaPass ? 'pass' : 'fail'}`;
  aaBadge.textContent = `WCAG AA: ${aaPass ? 'PASS ✓' : 'FAIL ✗'}`;

  aaaBadge.className = `compliance-badge ${aaaPass ? 'pass' : 'fail'}`;
  aaaBadge.textContent = `WCAG AAA: ${aaaPass ? 'PASS ✓' : 'FAIL ✗'}`;
}

function simulateScreenReader(text) {
  playAppleClick(900);
  document.getElementById('sr-transcript').innerHTML = `
    <strong>Screen Reader Speaking:</strong> "${text}"
  `;

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }
}

function switchLab(labId) {
  playAppleClick(750);
  document.querySelectorAll('.lab-card').forEach(card => card.classList.remove('active'));
  document.querySelectorAll('.lab-nav-btn').forEach(btn => btn.classList.remove('active'));

  const targetCard = document.getElementById(`lab-${labId}`);
  if (targetCard) targetCard.classList.add('active');

  const matchingBtn = document.querySelector(`.lab-nav-btn[onclick="switchLab('${labId}')"]`);
  if (matchingBtn) matchingBtn.classList.add('active');

  if (labId === 'cfg') setTimeout(renderCFGGraph, 50);
  if (labId === 'bva') setTimeout(generateBVATable, 50);
  if (labId === 'stlc') setTimeout(() => setSTLCPhase(currentSTLCPhase), 50);
  if (labId === 'wcag') setTimeout(computeContrastRatio, 50);
}

// ==========================================
// 12. Official Solved University PYQs
// ==========================================
const pyqList = [
  {
    id: "pyq-1",
    category: "unit1",
    marks: "10 Marks",
    title: "Q.1 Explain Software Testing Life Cycle (STLC) with detailed phases and diagram",
    reference: "Notes Page 1 & Page 5/6",
    answer: `
      <span class="solution-badge">University Standard Model Answer</span>
      <h4>1. Definition of STLC:</h4>
      <p>Software Testing Life Cycle (STLC) is a systematic step-by-step process followed to test a software application. It helps in finding bugs/defects early, ensures that the software satisfies the requirements, and confirms that it works as expected. STLC is executed parallel to the Software Development Life Cycle (SDLC).</p>

      <h4 class="mt-3">2. 6 Sequential Phases of STLC:</h4>
      <div class="apple-numbered-list mt-2">
        <div class="apple-num-item">
          <span class="num-circle">1</span>
          <div>
            <strong>Requirement Analysis:</strong> Testers review the SRS/BRD documents, understand testable requirements, and create the Requirement Traceability Matrix (RTM).
          </div>
        </div>
        <div class="apple-num-item">
          <span class="num-circle">2</span>
          <div>
            <strong>Test Planning:</strong> Test lead defines the testing approach, effort estimation, scope, resource allocation, tool selection, and produces the Test Plan Document.
          </div>
        </div>
        <div class="apple-num-item">
          <span class="num-circle">3</span>
          <div>
            <strong>Test Case Development:</strong> QA engineers write detailed test cases, generate test data (BVA/ECT), write test automation scripts, and review test cases.
          </div>
        </div>
        <div class="apple-num-item">
          <span class="num-circle">4</span>
          <div>
            <strong>Test Environment Setup:</strong> Configure hardware, server infrastructure, databases, and execute smoke testing to verify stability of the build.
          </div>
        </div>
        <div class="apple-num-item">
          <span class="num-circle">5</span>
          <div>
            <strong>Test Execution:</strong> Execute test cases, compare actual results with expected results, log defects in Jira/Bugzilla, and re-test bug fixes with regression testing.
          </div>
        </div>
        <div class="apple-num-item">
          <span class="num-circle">6</span>
          <div>
            <strong>Test Cycle Closure:</strong> Analyze test metrics, prepare the Test Summary Report, conduct lessons learned meetings, and obtain formal stakeholder sign-off.
          </div>
        </div>
      </div>

      <h4 class="mt-4">3. Entry and Exit Criteria (Example from Notes):</h4>
      <div class="grid-2col mt-2">
        <div class="mini-card">
          <strong>Entry Criteria (for Test Execution):</strong>
          <ul class="mini-steps mt-1">
            <li>Requirements are stable and approved.</li>
            <li>Test Plan & Test Cases are reviewed and approved.</li>
            <li>Test Environment is configured & available.</li>
            <li>Software build is successfully deployed and passed smoke test.</li>
          </ul>
        </div>
        <div class="mini-card">
          <strong>Exit Criteria (for Test Closure):</strong>
          <ul class="mini-steps mt-1">
            <li>100% planned test cases have been executed.</li>
            <li>All Critical and High severity defects are closed.</li>
            <li>Defect density is within acceptable contractual threshold.</li>
            <li>Test Summary Report is prepared and signed off.</li>
          </ul>
        </div>
      </div>
    `
  },
  {
    id: "pyq-2",
    category: "numericals",
    marks: "10 Marks",
    title: "Q.3 A website requires users to enter their age, valid range [18, 60] inclusive. Create test cases using Boundary Value Analysis",
    reference: "Notes Page 2",
    answer: `
      <span class="solution-badge">University Standard Model Answer</span>
      <h4>1. What is Boundary Value Analysis (BVA)?</h4>
      <p>Boundary Value Analysis is a black-box test design technique that focuses on testing the boundary values of input ranges. Most programming errors occur at the boundaries (minimum and maximum values) rather than in the center. Hence, we test at, just below, and just above boundaries.</p>

      <h4 class="mt-3">2. Identify the Boundaries:</h4>
      <ul>
        <li>Valid range for age = <code>18 to 60 (inclusive)</code></li>
        <li>Minimum valid value = <code>18</code></li>
        <li>Maximum valid value = <code>60</code></li>
        <li>Values to test: $min-1, min, min+1, nom, max-1, max, max+1$</li>
      </ul>

      <h4 class="mt-3">3. Test Cases Table (Direct from Notes):</h4>
      <div class="table-responsive mt-2">
        <table class="apple-table">
          <thead>
            <tr>
              <th>TC No.</th>
              <th>Input Age</th>
              <th>Expected Result</th>
              <th>Reason (University Standard)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>TC1</td><td>17</td><td>Invalid (Error message)</td><td>Below minimum $(18 - 1)$</td></tr>
            <tr><td>TC2</td><td>18</td><td>Valid (Accepted)</td><td>Minimum boundary</td></tr>
            <tr><td>TC3</td><td>19</td><td>Valid (Accepted)</td><td>Just above minimum $(18 + 1)$</td></tr>
            <tr><td>TC4</td><td>39</td><td>Valid (Accepted)</td><td>Nominal value (mid value)</td></tr>
            <tr><td>TC5</td><td>59</td><td>Valid (Accepted)</td><td>Just below maximum $(60 - 1)$</td></tr>
            <tr><td>TC6</td><td>60</td><td>Valid (Accepted)</td><td>Maximum boundary</td></tr>
            <tr><td>TC7</td><td>61</td><td>Invalid (Error message)</td><td>Above maximum $(60 + 1)$</td></tr>
          </tbody>
        </table>
      </div>

      <h4 class="mt-3">4. Conclusion:</h4>
      <p>These seven cases specify the expected behavior at the inclusive range boundaries and nearby invalid values; execute them against the implementation to verify the result.</p>
    `
  },
  {
    id: "pyq-3",
    category: "numericals",
    marks: "10 Marks",
    title: "Q.3(B) Draw Control Flow Graph (CFG) Basis Path Testing, calculate Cyclomatic Complexity by all methods and write test cases",
    reference: "Notes Page 7 & 8",
    answer: `
      <span class="solution-badge">University Standard Model Answer</span>
      <h4>1. Given Code:</h4>
      <pre class="code-display" style="padding: 12px; margin-top: 8px;">
int main() {
    int a, b, x, y;
    scanf("%d %d %d %d", &a, &b, &x, &y);   // Node 1 (Start & Input)
    if (a > b)                              // Node 2 (Condition / Predicate)
        x = x + y;                          // Node 3 (True branch)
    else
        x = y;                              // Node 4 (False branch)
    printf("Result: %d\\n", x);              // Node 5 (Output)
    return 0;                               // Node 6 (End)
}
      </pre>

      <h4 class="mt-3">2. Cyclomatic Complexity V(G) by all 3 methods:</h4>
      <div class="grid-3col mt-2">
        <div class="formula-card">
          <strong>(a) Formula: $V(G) = P + 1$</strong>
          <p>$P$ = predicate decision nodes. Here only one decision node $(a > b)$, so $P = 1$.</p>
          <div class="f-equation">V(G) = 1 + 1 = 2</div>
        </div>
        <div class="formula-card">
          <strong>(b) Formula: $V(G) = E - N + 2$</strong>
          <p>From CFG: $N = 6$ nodes $(1,2,3,4,5,6)$, $E = 6$ edges.</p>
          <div class="f-equation">V(G) = 6 - 6 + 2 = 2</div>
        </div>
        <div class="formula-card">
          <strong>(c) Formula: $V(G) = R$</strong>
          <p>$R$ = number of regions. CFG has 1 inner enclosed region + 1 outer region.</p>
          <div class="f-equation">V(G) = 2</div>
        </div>
      </div>
      <p class="mt-2"><strong>Conclusion from all methods:</strong> Minimum number of test cases required = <code>2</code>.</p>

      <h4 class="mt-3">3. Independent Paths (Basis Paths):</h4>
      <ul>
        <li><strong>Path 1 (P1):</strong> $1 \rightarrow 2 \rightarrow 3 \rightarrow 5 \rightarrow 6$ | Condition: $a > b$ (True) | Executes: $x = x + y$</li>
        <li><strong>Path 2 (P2):</strong> $1 \rightarrow 2 \rightarrow 4 \rightarrow 5 \rightarrow 6$ | Condition: $a > b$ is False, so $a \le b$; executes: $x = y$</li>
      </ul>

      <h4 class="mt-3">4. Test Cases & Execution Table:</h4>
      <div class="table-responsive mt-2">
        <table class="apple-table">
          <thead>
            <tr>
              <th>TC No.</th>
              <th>Inputs (a, b, x, y)</th>
              <th>Condition</th>
              <th>Computed x</th>
              <th>Expected Output</th>
              <th>Path Covered</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>TC1</td><td>(5, 3, 2, 4)</td><td>5 > 3 (True)</td><td>2 + 4 = 6</td><td>6</td><td>P1 (True branch)</td></tr>
            <tr><td>TC2</td><td>(2, 5, 2, 4)</td><td>a > b: 2 > 5 is false; take else branch</td><td>x = 4</td><td>4</td><td>P2 (False branch)</td></tr>
          </tbody>
        </table>
      </div>
    `
  },
  {
    id: "pyq-4",
    category: "numericals",
    marks: "10 Marks",
    title: "Q.3(A) System accepts inputs A: 1-100 and B: 20-40. Apply Equivalence Partitioning to find test cases",
    reference: "Notes Page 9",
    answer: `
      <span class="solution-badge">University Standard Model Answer</span>
      <h4>1. Equivalence Classes Identification:</h4>
      <div class="grid-2col mt-2">
        <div class="mini-card">
          <strong>Classes for Input A (Range 1 to 100):</strong>
          <ul class="mini-steps mt-1">
            <li>$A1: A < 1$ (Invalid, below range) ➔ Rep: <code>0</code></li>
            <li>$A2: 1 \le A \le 100$ (Valid, within range) ➔ Rep: <code>50</code></li>
            <li>$A3: A > 100$ (Invalid, above range) ➔ Rep: <code>101</code></li>
          </ul>
        </div>
        <div class="mini-card">
          <strong>Classes for Input B (Range 20 to 40):</strong>
          <ul class="mini-steps mt-1">
            <li>$B1: B < 20$ (Invalid, below range) ➔ Rep: <code>19</code></li>
            <li>$B2: 20 \le B \le 40$ (Valid, within range) ➔ Rep: <code>30</code></li>
            <li>$B3: B > 40$ (Invalid, above range) ➔ Rep: <code>41</code></li>
          </ul>
        </div>
      </div>

      <h4 class="mt-3">2. Test Cases Table (Direct from Notes):</h4>
      <div class="table-responsive mt-2">
        <table class="apple-table">
          <thead>
            <tr>
              <th>TC No.</th>
              <th>A</th>
              <th>B</th>
              <th>Expected Result</th>
              <th>Reason (Equivalence Class)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>TC1</td><td>50</td><td>30</td><td>Valid (Accepted)</td><td>A valid (1-100), B valid (20-40)</td></tr>
            <tr><td>TC2</td><td>1</td><td>20</td><td>Valid (Accepted)</td><td>A lower boundary (A=1), B lower boundary (B=20)</td></tr>
            <tr><td>TC3</td><td>100</td><td>40</td><td>Valid (Accepted)</td><td>A upper boundary (A=100), B upper boundary (B=40)</td></tr>
            <tr><td>TC4</td><td>0</td><td>30</td><td>Invalid (Rejected)</td><td>A below range (A &lt; 1), B valid (20-40)</td></tr>
            <tr><td>TC5</td><td>101</td><td>30</td><td>Invalid (Rejected)</td><td>A above range (A &gt; 100), B valid (20-40)</td></tr>
            <tr><td>TC6</td><td>50</td><td>19</td><td>Invalid (Rejected)</td><td>A valid (1-100), B below range (B &lt; 20)</td></tr>
            <tr><td>TC7</td><td>50</td><td>41</td><td>Invalid (Rejected)</td><td>A valid (1-100), B above range (B &gt; 40)</td></tr>
            <tr><td>TC8</td><td>0</td><td>19</td><td>Invalid (Rejected)</td><td>Both A and B below range</td></tr>
            <tr><td>TC9</td><td>101</td><td>41</td><td>Invalid (Rejected)</td><td>Both A and B above range</td></tr>
          </tbody>
        </table>
      </div>
    `
  },
  {
    id: "pyq-5",
    category: "unit2",
    marks: "10 Marks",
    title: "Q.2 Explain Structured Walkthrough Static Testing & Objectives of Regression Testing",
    reference: "Notes Page 10",
    answer: `
      <span class="solution-badge">University Standard Model Answer</span>
      <h4>Part A: Structured Walkthrough Static Testing</h4>
      <p><strong>Definition:</strong> A walkthrough is a static testing technique in which a software work product (documents, design, code) is reviewed by a group of peers without executing code.</p>
      
      <h5 class="mt-2">Roles and Responsibilities:</h5>
      <ul class="mini-steps mt-1">
        <li><strong>Moderator:</strong> Plans and controls walkthrough meeting; ensures guidelines are maintained.</li>
        <li><strong>Author:</strong> Presents and explains the work product step-by-step.</li>
        <li><strong>Reviewers:</strong> Ask questions, identify ambiguities, defects, and propose enhancements.</li>
        <li><strong>Scribe:</strong> Records all defects, issues, action items, and discussion points.</li>
      </ul>

      <h5 class="mt-2">6 Steps in Structured Walkthrough:</h5>
      <p><code>1. Planning ➔ 2. Overview ➔ 3. Individual Review ➔ 4. Walkthrough Meeting ➔ 5. Rework ➔ 6. Follow-up</code></p>

      <hr style="border: 0; border-top: 1px solid var(--border-subtle); margin: 16px 0;">

      <h4>Part B: Objectives of Regression Testing & When Performed</h4>
      <p><strong>Definition:</strong> Regression testing is re-running previously executed test cases to ensure that recent changes (bug fixes or new features) have not broken existing functionality.</p>
      <h5 class="mt-2">Objectives:</h5>
      <ol class="mini-steps mt-1">
        <li>Ensure existing functionality still works without regression.</li>
        <li>Detect unintended side-effects due to code modifications.</li>
        <li>Maintain overall stability and reliability of the release build.</li>
        <li>Verify that bug fixes have not disrupted other interconnected modules.</li>
        <li>Build stakeholder confidence for new version deployment.</li>
      </ol>
    `
  },
  {
    id: "pyq-6",
    category: "unit1",
    marks: "10 Marks",
    title: "Q.1 (A) Software Testing Goals, (B) Verification of HLD, (C) Pair-wise Integration Testing",
    reference: "Notes Page 11",
    answer: `
      <span class="solution-badge">University Standard Model Answer</span>
      <h4>(A) Software Testing Goals:</h4>
      <p>The primary goals are to <strong>Detect Defects</strong>, <strong>Verify Requirements</strong>, <strong>Ensure Correctness</strong>, <strong>Improve Quality & Reliability</strong>, <strong>Reduce Risk & Production Failures</strong>, <strong>Ensure Customer Satisfaction</strong>, and <strong>Comply with Industry Standards</strong>.</p>

      <h4 class="mt-3">(B) Verification of High Level Design (HLD):</h4>
      <p>HLD defines overall software architecture, major subsystems, data flow, and module interfaces. Verification of HLD is a static review to confirm that the architectural design correctly satisfies all SRS specifications.</p>
      <p><strong>Aspects Verified:</strong> Correctness, Completeness, Consistency (no conflicting design logic), Traceability to SRS, Technical Feasibility, Modularity, and Design Standards.</p>

      <h4 class="mt-3">(C) Pair-wise Integration Testing:</h4>
      <p>Integration testing checks interactions between combined modules. In <strong>Pair-wise integration testing</strong>, two interconnected modules are integrated and tested at a time in an incremental fashion.</p>
      <div class="mini-card mt-2">
        <strong>Example: Online Shopping System Modules (User, Product, Cart, Payment):</strong>
        <ul class="mini-steps mt-1">
          <li>Test 1: User Module + Product Module</li>
          <li>Test 2: Product Module + Cart Module</li>
          <li>Test 3: Cart Module + Payment Module</li>
        </ul>
        <p class="small-text mt-1"><em>Benefit: Extremely easy to implement; isolates interface communication defects early!</em></p>
      </div>
    `
  },
  {
    id: "pyq-7",
    category: "numericals",
    marks: "10 Marks",
    title: "Q.2 A program computes a^b where a in [1, 8] and b in [1, 4]. Design test cases using BVC, Robust and Worst Testing",
    reference: "Notes Page 24 & 26",
    answer: `
      <span class="solution-badge">University Standard Model Answer</span>
      <h4>1. Program Understanding:</h4>
      <ul>
        <li>Input 1: $a$ in range $[1, 8]$</li>
        <li>Input 2: $b$ in range $[1, 4]$</li>
        <li>Output: $a^b$ (e.g. $2^3 = 8$)</li>
        <li>If $a < 1$ or $a > 8$, return "Invalid a"</li>
        <li>If $b < 1$ or $b > 4$, return "Invalid b"</li>
      </ul>

      <h4 class="mt-3">2. Boundary Value Checking (BVC):</h4>
      <p>Use nominal values $a=4$ and $b=2$ (floor of each midpoint). For two inputs the textbook count is $4n+1=9$: four boundary checks per input plus one all-nominal case. Because $b$ has only four integer values, $b_{nom}=2$ overlaps with $min+1$; the table shows the nine designed cases and marks the repeated vector.</p>
      <div class="table-responsive mt-1">
        <table class="apple-table">
          <thead><tr><th>TC</th><th>a</th><th>b</th><th>Expected $a^b$</th><th>Reason</th></tr></thead>
          <tbody>
            <tr><td>B1</td><td>4</td><td>2</td><td>16</td><td>All nominal</td></tr>
            <tr><td>B2</td><td>1</td><td>2</td><td>1</td><td>a = min</td></tr>
            <tr><td>B3</td><td>2</td><td>2</td><td>4</td><td>a = min + 1</td></tr>
            <tr><td>B4</td><td>7</td><td>2</td><td>49</td><td>a = max − 1</td></tr>
            <tr><td>B5</td><td>8</td><td>2</td><td>64</td><td>a = max</td></tr>
            <tr><td>B6</td><td>4</td><td>1</td><td>4</td><td>b = min</td></tr>
            <tr><td>B7</td><td>4</td><td>2</td><td>16</td><td>b = min + 1; same input as B1</td></tr>
            <tr><td>B8</td><td>4</td><td>3</td><td>64</td><td>b = max − 1</td></tr>
            <tr><td>B9</td><td>4</td><td>4</td><td>256</td><td>b = max</td></tr>
          </tbody>
        </table>
      </div>
      <p class="small-text">There are 8 distinct input vectors after removing the duplicate B7. State the convention your course expects when a nominal value overlaps a boundary point.</p>

      <h4 class="mt-3">3. Robust BVA:</h4>
      <p>Robust BVA adds one invalid value just outside each end. The planned count is $6n+1=13$ before duplicate removal. Hold the other input nominal while varying one input:</p>
      <ul>
        <li><strong>Nominal:</strong> $(4,2)$ → $16$.</li>
        <li><strong>Vary a:</strong> $(0,2)$ and $(9,2)$ are invalid; $(1,2)$, $(2,2)$, $(7,2)$, and $(8,2)$ are valid boundary checks.</li>
        <li><strong>Vary b:</strong> $(4,0)$ and $(4,5)$ are invalid; $(4,1)$, $(4,2)$, $(4,3)$, and $(4,4)$ are valid boundary checks. $(4,2)$ repeats the nominal case.</li>
      </ul>
      <p class="small-text">That gives 13 planned test rows and 12 distinct input vectors after removing the overlap. Expected output is an invalid-input response whenever either input is outside its specified range; otherwise compute $a^b$.</p>

      <h4 class="mt-3">4. Worst-case combinations:</h4>
      <p>Worst-case testing combines every selected value for every input. The familiar $5^n=25$ count assumes five distinct values per variable. Here $a$ has five distinct values $\{1,2,4,7,8\}$, but integer $b \in [1,4]$ has only four distinct values $\{1,2,3,4\}$; using these actual domains gives $5 × 4 = 20$ distinct combinations. The old $4 × 4 = 16$ omitted the nominal $a=4$ value; for $b$, the nominal overlaps with $min+1$. Do not claim 25 unless the requirements allow a fifth distinct $b$ value (or your course explicitly asks you to count repeated nominal/boundary selections).</p>
    `
  },
  {
    id: "pyq-8",
    category: "unit2",
    marks: "10 Marks",
    title: "Q.3 Explain Usability and Accessibility Testing with WCAG principles",
    reference: "Notes Page 22",
    answer: `
      <span class="solution-badge">University Standard Model Answer</span>
      <h4>1. Usability Testing:</h4>
      <p>Testing how easy, intuitive, and comfortable the application is for real human end-users. Evaluates navigation flow, UI layout simplicity, response time, and user satisfaction.</p>
      <ul>
        <li><strong>Techniques:</strong> User observation, task-based testing, heuristic evaluation, A/B testing.</li>
        <li><strong>Example:</strong> Checking whether a student can register for courses and view exam marks within 3 clicks.</li>
      </ul>

      <h4 class="mt-3">2. Accessibility Testing:</h4>
      <p>Ensures that software can be comfortably operated by individuals with disabilities (visual, auditory, motor, or cognitive impairments).</p>
      <ul>
        <li><strong>Key Standards:</strong> W3C Web Content Accessibility Guidelines (WCAG 2.1).</li>
        <li><strong>Techniques:</strong> Screen reader testing (NVDA, VoiceOver), keyboard-only navigation (Tab order), high-contrast color verification (minimum ratio 4.5:1), video closed captions.</li>
      </ul>

      <h4 class="mt-3">3. Comparison Table (Direct from Notes):</h4>
      <div class="table-responsive mt-1">
        <table class="apple-table">
          <thead>
            <tr><th>Dimension</th><th>Usability Testing</th><th>Accessibility Testing</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Objective</strong></td><td>Check ease of use, UI elegance, and satisfaction.</td><td>Ensure access for people with disabilities.</td></tr>
            <tr><td><strong>Compliance</strong></td><td>UI/UX design guidelines and usability heuristics.</td><td>Legal compliance standards (WCAG 2.1, Section 508).</td></tr>
            <tr><td><strong>Focus Group</strong></td><td>General target user demographic.</td><td>Differently-abled individuals and assistive tech users.</td></tr>
          </tbody>
        </table>
      </div>
    `
  },
  {
    id: "pyq-9",
    category: "unit1",
    marks: "10 Marks",
    title: "Q.3 Explain Unit Testing with Python Pytest Code Example",
    reference: "Notes Page 23",
    answer: `
      <span class="solution-badge">University Standard Model Answer</span>
      <h4>1. What is Unit Testing?</h4>
      <p>Unit testing is a type of software testing in which small individual parts of a program (called units), like a single function or method, are tested in isolation. We check if that specific unit behaves correctly for various inputs.</p>

      <h4 class="mt-3">2. Python Pytest Implementation (From Notes):</h4>
      <pre class="code-display" style="padding: 12px; margin-top: 8px;">
# 1. Actual Program Code (Function to be tested)
def add(a, b):
    return a + b

# 2. Test Code using pytest framework
def test_add():
    assert add(2, 3) == 5     # Normal positive numbers
    assert add(-1, 1) == 0    # Negative and positive
    assert add(0, 0) == 0     # Zero boundary
      </pre>

      <h4 class="mt-3">3. Explanation of Test Cases:</h4>
      <div class="table-responsive mt-1">
        <table class="apple-table">
          <thead>
            <tr><th>Test Case</th><th>Input (a, b)</th><th>Expected Output</th><th>Purpose</th></tr>
          </thead>
          <tbody>
            <tr><td>1</td><td>(2, 3)</td><td>5</td><td>Normal positive case</td></tr>
            <tr><td>2</td><td>(-1, 1)</td><td>0</td><td>Negative number cancellation</td></tr>
            <tr><td>3</td><td>(0, 0)</td><td>0</td><td>Zero identity case</td></tr>
          </tbody>
        </table>
      </div>
      <p class="mt-2"><strong>Result:</strong> If all assert statements pass, the unit works correctly. If any assertion fails, pytest logs an error pinpointing the bug in the function.</p>
    `
  },
  {
    id: "pyq-10",
    category: "numericals",
    marks: "10 Marks",
    title: "Q.2 Design test cases for 3 numbers in range [1, 50] to find largest using BVC and Robust Testing",
    reference: "Notes Page 15, 18 & 20",
    answer: `
      <span class="solution-badge">University Standard Model Answer</span>
      <h4>1. Problem Setup:</h4>
      <p>Inputs: $A, B, C \in [1, 50]$. Program prints largest number. Min = 1, Max = 50, Nominal = 25.</p>

      <h4 class="mt-3">2. Boundary Value Checking (BVC - 13 Test Cases):</h4>
      <p>Formula = $4n + 1 = 4(3) + 1 = 13$ cases holding other variables at nominal value 25.</p>
      <ul>
        <li>Varying $A$: $(1, 25, 25), (2, 25, 25), (49, 25, 25), (50, 25, 25)$</li>
        <li>Varying $B$: $(25, 1, 25), (25, 2, 25), (25, 49, 25), (25, 50, 25)$</li>
        <li>Varying $C$: $(25, 25, 1), (25, 25, 2), (25, 25, 49), (25, 25, 50)$</li>
        <li>All nominal: $(25, 25, 25)$ ➔ Output = 25</li>
      </ul>

      <h4 class="mt-3">3. Robust Testing (19 Test Cases):</h4>
      <p>Formula = $6n + 1 = 6(3) + 1 = 19$ cases. Adds invalid boundaries ($min-1 = 0$, $max+1 = 51$):</p>
      <ul>
        <li>Invalid cases for $A$: $(0, 25, 25) \rightarrow \text{Error}$, $(51, 25, 25) \rightarrow \text{Error}$</li>
        <li>Invalid cases for $B$: $(25, 0, 25) \rightarrow \text{Error}$, $(25, 51, 25) \rightarrow \text{Error}$</li>
        <li>Invalid cases for $C$: $(25, 25, 0) \rightarrow \text{Error}$, $(25, 25, 51) \rightarrow \text{Error}$</li>
      </ul>
    `
  },
  {
    id: "pyq-11",
    category: "unit1",
    marks: "10 Marks",
    title: "Q.1 Define Testing Terminology (Error, Fault, Failure, Test Case, Test Oracle) & Bug Life Cycle",
    reference: "Notes Page 16",
    answer: `
      <span class="solution-badge">University Standard Model Answer</span>
      <h4>1. Core Definitions:</h4>
      <ul>
        <li><strong>Failure:</strong> When software does not work as expected and gives wrong output or halts at runtime. Example: Calculator app crashes when entering $5 + 3$.</li>
        <li><strong>Fault (Bug / Defect):</strong> A mistake or flaw in the code developed by the programmer. Example: writing <code>return a - b;</code> instead of <code>return a + b;</code>.</li>
        <li><strong>Error:</strong> A human action or misconception that leads to a fault in code.</li>
        <li><strong>Test Case:</strong> A set of inputs, preconditions, execution steps, and expected outputs designed to verify a specific software requirement.</li>
        <li><strong>Test Oracle:</strong> The authoritative source or reference mechanism used to evaluate whether actual output matches expected output.</li>
      </ul>

      <h4 class="mt-3">2. Bug Life Cycle (States & Transitions):</h4>
      <p><code>NEW ➔ ASSIGNED ➔ OPEN ➔ FIXED ➔ RETEST ➔ CLOSED (or REOPENED)</code></p>
      <ul>
        <li><strong>NEW:</strong> Defect is discovered and logged into tracking tool.</li>
        <li><strong>ASSIGNED:</strong> Lead assigns bug to the respective developer.</li>
        <li><strong>OPEN:</strong> Developer starts debugging the defect.</li>
        <li><strong>FIXED:</strong> Developer fixes code and commits the patch.</li>
        <li><strong>RETEST:</strong> Tester re-runs failed test cases on updated build.</li>
        <li><strong>CLOSED:</strong> Fix verified successfully.</li>
        <li><strong>REOPENED:</strong> Bug persists or fix caused regression.</li>
      </ul>
    `
  }
];

function renderPYQAccordion(filter = 'all') {
  const container = document.getElementById('pyq-accordion-container');
  if (!container) return;

  const filtered = pyqList.filter(item => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  container.innerHTML = filtered.map(pyq => `
    <div class="pyq-card glass-card" id="${pyq.id}">
      <div class="pyq-card-header" onclick="togglePYQCard('${pyq.id}')">
        <div class="pyq-title-group">
          <span class="pyq-marks">${pyq.marks}</span>
          <h4>${pyq.title}</h4>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="small-text" style="color: var(--text-tertiary);">${pyq.reference}</span>
          <span class="pyq-chevron">▼</span>
        </div>
      </div>
      <div class="pyq-body">
        ${pyq.answer}
      </div>
    </div>
  `).join('');
}

function togglePYQCard(id) {
  playAppleClick(700);
  const card = document.getElementById(id);
  if (card) {
    card.classList.toggle('open');
  }
}

function filterPYQs(category) {
  playAppleClick(750);
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  event.target.classList.add('active');
  renderPYQAccordion(category);
}

// ==========================================
// 13. Interactive Exam Simulator (15 High-Yield Questions)
// ==========================================
const quizQuestions = [
  {
    q: "A developer mistakenly writes 'return a - b' instead of 'return a + b'. In STQA terminology, what is this human mistake called?",
    options: [
      "Failure",
      "Error",
      "Bug / Fault",
      "Test Oracle"
    ],
    correct: 1,
    explanation: "An ERROR is a human action or mistake made by a programmer. The flaw in the code is the FAULT (bug), and an incorrect runtime output is a FAILURE."
  },
  {
    q: "Which phase of the Software Testing Life Cycle (STLC) produces the Requirement Traceability Matrix (RTM)?",
    options: [
      "Test Planning",
      "Test Execution",
      "Requirement Analysis",
      "Test Cycle Closure"
    ],
    correct: 2,
    explanation: "Requirement Analysis is the very first phase where testers study SRS/BRD documents, identify testable requirements, and map them to the RTM."
  },
  {
    q: "What is the primary distinguishing characteristic between Verification and Validation?",
    options: [
      "Verification is dynamic; Validation is static.",
      "Verification checks 'Are we building the product right?' without running code; Validation checks 'Are we building the right product?' by executing code.",
      "Verification is done only by end-users; Validation is done only by developers.",
      "There is no difference; they are identical terms."
    ],
    correct: 1,
    explanation: "Boehm's famous definition: Verification is static testing (reviews/inspections) to build the product right. Validation is dynamic execution against user requirements."
  },
  {
    q: "In a Control Flow Graph with 6 nodes and 6 edges, having 1 decision predicate node, what is its Cyclomatic Complexity V(G)?",
    options: [
      "1",
      "2",
      "4",
      "6"
    ],
    correct: 1,
    explanation: "Using V(G) = P + 1 = 1 + 1 = 2. Alternatively, V(G) = E - N + 2 = 6 - 6 + 2 = 2. This matches your handwritten PYQ Page 7!"
  },
  {
    q: "For an input age range of [18, 60] inclusive, which set of values represents Robust Boundary Value Analysis?",
    options: [
      "{18, 39, 60}",
      "{18, 19, 39, 59, 60}",
      "{17, 18, 19, 39, 59, 60, 61}",
      "{0, 18, 60, 100}"
    ],
    correct: 2,
    explanation: "Robust testing tests min-1, min, min+1, nom, max-1, max, max+1 = {17, 18, 19, 39, 59, 60, 61} (Notes Page 2)."
  },
  {
    q: "In a formal Fagan Inspection, who leads and controls the meeting?",
    options: [
      "The Author of the document/code",
      "An independent trained Moderator",
      "The Scribe",
      "The Software Client"
    ],
    correct: 1,
    explanation: "In a Walkthrough, the Author leads. But in a formal Fagan Inspection, an independent trained Moderator leads the meeting."
  },
  {
    q: "Which testing technique evaluates the quality of test cases by deliberately injecting artificial defects (mutants) into the code?",
    options: [
      "Basis Path Testing",
      "Data Flow Testing",
      "Mutation Testing",
      "Equivalence Class Testing"
    ],
    correct: 2,
    explanation: "Mutation Testing injects mutants into code. If a test case fails, the mutant is 'Killed', proving test case effectiveness."
  },
  {
    q: "In Top-Down Integration testing, when lower-level sub-modules are not yet developed, what dummy routine is used?",
    options: [
      "Driver",
      "Stub",
      "Oracle",
      "Mutant"
    ],
    correct: 1,
    explanation: "Top-Down integration uses STUBS (dummy called sub-routines). Bottom-Up integration uses DRIVERS (dummy calling parent harnesses)."
  },
  {
    q: "Pair-wise Integration Testing belongs to which level of software testing?",
    options: [
      "Unit Testing",
      "Integration Testing",
      "System Testing",
      "Acceptance Testing"
    ],
    correct: 1,
    explanation: "In this course, pair-wise integration means testing two interacting modules at a time to uncover interface defects. It differs from all-pairs combinatorial testing of input values."
  },
  {
    q: "What is the minimum WCAG 2.1 AA color contrast ratio required for normal body text?",
    options: [
      "2.5 : 1",
      "3.0 : 1",
      "4.5 : 1",
      "7.0 : 1"
    ],
    correct: 2,
    explanation: "WCAG AA requires at least 4.5:1 contrast for normal text and 3:1 for large text. 7:1 is for WCAG AAA."
  },
  {
    q: "When a bug is fixed by a developer and sent back to the tester, what state does it enter in the Bug Life Cycle?",
    options: [
      "NEW",
      "OPEN",
      "RETEST",
      "CLOSED"
    ],
    correct: 2,
    explanation: "After FIXED, the defect enters the RETEST state where the tester verifies whether the fix succeeded on the new build."
  },
  {
    q: "What is the primary objective of Regression Testing?",
    options: [
      "To test software on multiple mobile screen sizes",
      "To ensure new code changes or bug fixes have not broken existing features",
      "To test database performance under heavy concurrency",
      "To write user manual documentation"
    ],
    correct: 1,
    explanation: "Regression testing re-executes relevant existing test cases to check whether bug fixes and enhancements introduced unintended side effects."
  },
  {
    q: "A bug causes complete crash on Windows 98, but the product only officially supports Windows 11. What is its Severity and Priority?",
    options: [
      "High Severity + High Priority",
      "High Severity + Low Priority",
      "Low Severity + High Priority",
      "Low Severity + Low Priority"
    ],
    correct: 1,
    explanation: "High Severity because the system crashes completely; Low Priority because Windows 98 is obsolete and has negligible business impact."
  },
  {
    q: "In Decision Table testing, if there are 4 independent Boolean conditions, how many rules exist in the table?",
    options: [
      "4",
      "8",
      "16",
      "32"
    ],
    correct: 2,
    explanation: "Total rules = 2^C = 2^4 = 16 rules."
  },
  {
    q: "What is a 'Test Oracle' in software testing?",
    options: [
      "An automated tool made by Oracle Corporation",
      "The source or benchmark used to determine whether the actual output matches the expected output",
      "A developer who refuses to fix bugs",
      "The final report submitted to the client"
    ],
    correct: 1,
    explanation: "A Test Oracle is any mechanism (e.g. specifications, existing system, calculator, human expert) used to recognize whether a test result is correct or faulty."
  }
];

let currentQuizIndex = 0;
let userAnswers = {};
let quizScore = 0;

function renderQuizQuestion(idx) {
  const q = quizQuestions[idx];
  const container = document.getElementById('quiz-question-card');
  const counter = document.getElementById('quiz-question-counter');
  const progressFill = document.getElementById('quiz-progress-fill');
  const prevBtn = document.getElementById('quiz-prev-btn');
  const nextBtn = document.getElementById('quiz-next-btn');

  counter.textContent = `Question ${idx + 1} of ${quizQuestions.length}`;
  progressFill.style.width = `${((idx + 1) / quizQuestions.length) * 100}%`;

  prevBtn.disabled = idx === 0;
  nextBtn.textContent = idx === quizQuestions.length - 1 ? 'Finish Exam' : 'Next Question →';

  const selectedOpt = userAnswers[idx];
  const isAnswered = selectedOpt !== undefined;

  let optionsHtml = q.options.map((opt, optIdx) => {
    let btnClass = "quiz-opt-btn";
    if (isAnswered) {
      if (optIdx === q.correct) btnClass += " correct";
      else if (selectedOpt === optIdx) btnClass += " wrong";
    }
    return `
      <button class="${btnClass}" onclick="selectQuizOption(${idx}, ${optIdx})" ${isAnswered ? 'disabled' : ''}>
        <span class="num-circle" style="width: 22px; height: 22px; font-size: 0.75rem;">${String.fromCharCode(65 + optIdx)}</span>
        <span>${opt}</span>
      </button>
    `;
  }).join('');

  let explanationHtml = isAnswered ? `
    <div class="quiz-explanation-box">
      <strong>Explanation:</strong> ${q.explanation}
    </div>
  ` : '';

  container.innerHTML = `
    <div class="quiz-q-title">${q.q}</div>
    <div class="quiz-options-list">${optionsHtml}</div>
    ${explanationHtml}
  `;
}

function selectQuizOption(qIdx, optIdx) {
  playAppleClick(optIdx === quizQuestions[qIdx].correct ? 950 : 400);
  userAnswers[qIdx] = optIdx;

  if (optIdx === quizQuestions[qIdx].correct) {
    quizScore += 10;
  }
  document.getElementById('live-score').textContent = `${quizScore} / ${quizQuestions.length * 10}`;
  renderQuizQuestion(qIdx);
}

function nextQuizQuestion() {
  playAppleClick(750);
  if (currentQuizIndex < quizQuestions.length - 1) {
    currentQuizIndex++;
    renderQuizQuestion(currentQuizIndex);
  } else {
    showQuizResults();
  }
}

function prevQuizQuestion() {
  playAppleClick(700);
  if (currentQuizIndex > 0) {
    currentQuizIndex--;
    renderQuizQuestion(currentQuizIndex);
  }
}

function showQuizResults() {
  const container = document.getElementById('quiz-question-card');
  const percentage = Math.round((quizScore / (quizQuestions.length * 10)) * 100);
  let feedback = "Strong result. Review the questions you missed to make the ideas stick.";
  if (percentage < 70) feedback = "Good start. Revisit the related lesson, then try another round when you are ready.";

  container.innerHTML = `
    <div style="text-align: center; padding: 24px;">
      <div style="font-size: 3.5rem; margin-bottom: 12px;">🏆</div>
      <h3 style="font-size: 1.8rem; margin-bottom: 8px;">Exam Simulation Completed!</h3>
      <p style="font-size: 1.15rem; color: var(--apple-blue); font-weight: 700;">Final Score: ${quizScore} / ${quizQuestions.length * 10} (${percentage}%)</p>
      <p class="section-lead mt-3">${feedback}</p>
      <button class="btn-primary" style="margin: 20px auto 0 auto;" onclick="restartQuiz()">Retake Exam Simulator</button>
    </div>
  `;
  document.getElementById('quiz-prev-btn').style.display = 'none';
  document.getElementById('quiz-next-btn').style.display = 'none';
}

function restartQuiz() {
  userAnswers = {};
  quizScore = 0;
  currentQuizIndex = 0;
  document.getElementById('live-score').textContent = `0`;
  document.getElementById('quiz-prev-btn').style.display = 'block';
  document.getElementById('quiz-next-btn').style.display = 'block';
  renderQuizQuestion(0);
}

// ==========================================
// 14. Application Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  showDiffComparison('err-fault-fail');
  setSTLCPhase(1);
  renderCFGGraph();
  updateBVARangeInputs([{ min: 18, max: 60 }]);
  generateBVATable();
  renderPYQAccordion('all');
  renderQuizQuestion(0);
  renderFlashcards();
  computeContrastRatio();
  initInlineMath();
});

// Small, persistent learning loop for the study desk.
const STQA_PROGRESS_KEY = 'stqa-study-progress-v1';
function getStudyProgress() {
  try { return JSON.parse(localStorage.getItem(STQA_PROGRESS_KEY) || '{"firstLessonComplete":false}'); }
  catch { return { firstLessonComplete: false }; }
}
function renderStudyProgress() {
  const done = getStudyProgress().firstLessonComplete;
  const fill = document.getElementById('progress-fill');
  const summary = document.getElementById('progress-summary');
  const label = document.getElementById('lesson-progress-label');
  if (!fill || !summary || !label) return;
  fill.style.width = done ? '100%' : '0%';
  summary.textContent = done ? 'First idea complete. Your progress is saved on this device.' : 'Answer the quick check to save your progress on this device.';
  label.textContent = done ? 'First idea · Complete ✓' : 'First idea · Not started';
  if (done) {
    const correct = document.querySelector('.answer-option[data-answer="fault"]');
    if (correct) correct.classList.add('correct');
    document.querySelectorAll('.answer-option').forEach(button => button.disabled = true);
    const feedback = document.getElementById('answer-feedback');
    if (feedback) feedback.textContent = 'Exactly. The incorrect code is the fault; the wrong result at runtime is the failure.';
  }
}
function answerLesson(button, answer) {
  const feedback = document.getElementById('answer-feedback');
  if (answer === 'fault') {
    document.querySelectorAll('.answer-option').forEach(option => { option.disabled = true; });
    button.classList.add('correct');
    try { localStorage.setItem(STQA_PROGRESS_KEY, JSON.stringify({ firstLessonComplete: true, completedAt: new Date().toISOString() })); } catch (error) { console.warn('Progress could not be saved locally.', error); }
    feedback.textContent = 'Exactly. The incorrect code is the fault; the wrong result at runtime is the failure.';
    renderStudyProgress();
  } else {
    button.classList.add('incorrect');
    feedback.textContent = answer === 'error' ? 'Close: an error is the person’s mistake. Once that mistake is written into code, it becomes a fault.' : 'A failure is the incorrect behavior while the program runs. Here we are looking at the defect in the code.';
    window.setTimeout(() => button.classList.remove('incorrect'), 700);
  }
}
const quickActions = [
  { label: 'Overview', detail: 'Your study desk', tab: 'dashboard', icon: '⌂' },
  { label: 'Testing foundations', detail: 'Unit 1 · CO1', tab: 'module1', icon: '01' },
  { label: 'Testing goals', detail: 'Seven reasons to test', tab: 'module1', anchor: 'sec-1-1', icon: '✓' },
  { label: 'Seven testing principles', detail: 'ETEDPCA recall cue', tab: 'module1', anchor: 'sec-1-1', icon: '7' },
  { label: 'Study mnemonics', detail: 'Goals, principles, STLC, test levels', tab: 'flashcards', icon: '✳' },
  { label: 'V-Model and W-Model', detail: 'Development and test-level mapping', tab: 'module1', anchor: 'sec-1-1-models', icon: 'V' },
  { label: 'STLC and RTM', detail: 'Six phases and traceability', tab: 'module1', anchor: 'sec-1-1-stlc', icon: '↻' },
  { label: 'Verification and validation', detail: 'How the two differ', tab: 'module1', anchor: 'sec-1-2', icon: '≠' },
  { label: 'Integration, stubs, and drivers', detail: 'Unit 1 · testing levels', tab: 'module1', anchor: 'sec-1-3', icon: '↔' },
  { label: 'Test design techniques', detail: 'Unit 2 · CO2', tab: 'module2', icon: '02' },
  { label: 'Cyclomatic complexity and CFG', detail: 'Basis-path testing', tab: 'module2', anchor: 'sec-2-2-white', icon: '∮' },
  { label: 'BVA and equivalence classes', detail: 'Boundary values and black-box design', tab: 'module2', anchor: 'sec-2-2-black', icon: '±' },
  { label: 'Regression testing', detail: 'Retest and change impact', tab: 'module2', anchor: 'sec-2-3', icon: '↺' },
  { label: 'Interactive labs', detail: 'Explore visual examples', tab: 'visualizers', icon: '✳' },
  { label: 'Flashcards', detail: 'Review key terms', tab: 'flashcards', icon: '▤' },
  { label: 'Past questions', detail: 'Solved exam practice', tab: 'pyqs', icon: 'Q' },
  { label: 'Exam simulator', detail: 'Test your knowledge', tab: 'quiz', icon: '◎' }
];
let commandSelection = 0;
function renderCommandResults(query = '') {
  const results = document.getElementById('command-results');
  if (!results) return;
  const matches = quickActions.filter(action => `${action.label} ${action.detail}`.toLowerCase().includes(query.toLowerCase()));
  commandSelection = Math.min(commandSelection, Math.max(0, matches.length - 1));
  results.innerHTML = matches.length ? matches.map((action, index) => `<button class="command-item${index === commandSelection ? ' selected' : ''}" data-tab="${action.tab}"${action.anchor ? ` data-anchor="${action.anchor}"` : ''}><span class="command-item-icon">${action.icon}</span><span class="command-item-name">${action.label}</span><span class="command-item-hint">${action.detail}</span></button>`).join('') : '<p class="command-empty">No matching destination. Try “BVA”, “STLC”, or “questions”.</p>';
  results.querySelectorAll('.command-item').forEach(item => item.addEventListener('click', () => {
    const anchor = item.dataset.anchor;
    closeCommandPalette(); switchTab(item.dataset.tab);
    if (anchor) window.setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 360);
  }));
}
function openCommandPalette() {
  const overlay = document.getElementById('command-overlay');
  if (!overlay) return;
  overlay.classList.add('open'); overlay.setAttribute('aria-hidden', 'false');
  const input = document.getElementById('command-input'); input.value = ''; commandSelection = 0; renderCommandResults(); input.focus();
}
function closeCommandPalette() {
  const overlay = document.getElementById('command-overlay');
  if (!overlay) return;
  overlay.classList.remove('open'); overlay.setAttribute('aria-hidden', 'true');
}
function initStudyDesk() {
  renderStudyProgress();
  const input = document.getElementById('command-input');
  input?.addEventListener('input', () => { commandSelection = 0; renderCommandResults(input.value); });
  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openCommandPalette(); return; }
    const overlay = document.getElementById('command-overlay');
    if (!overlay?.classList.contains('open')) return;
    if (event.key === 'Escape') closeCommandPalette();
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); const count = document.querySelectorAll('.command-item').length;
      if (!count) return;
      commandSelection = (commandSelection + (event.key === 'ArrowDown' ? 1 : count - 1)) % count;
      document.querySelectorAll('.command-item').forEach((item, index) => item.classList.toggle('selected', index === commandSelection));
    }
    if (event.key === 'Enter') document.querySelector('.command-item.selected')?.click();
  });
}
document.addEventListener('DOMContentLoaded', initStudyDesk);

// Render the course's lightweight inline math notation without an external library.
function initInlineMath() {
  typesetInlineMath(document.body);
  const observer = new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) typesetInlineMath(node);
      else if (node.nodeType === Node.ELEMENT_NODE) typesetInlineMath(node);
    }));
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
function escapeMathText(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function mathToInlineHTML(source) {
  let value = source
    .replace(/\\(?:text|mathbf)\{([^{}]*)\}/g, '$1')
    .replace(/\\rightarrow|\\to/g, '→')
    .replace(/\\times/g, '×')
    .replace(/\\leq?|\\le/g, '≤')
    .replace(/\\geq?|\\ge/g, '≥')
    .replace(/\\in/g, '∈')
    .replace(/\\cdot/g, '·')
    .replace(/\\%/g, '%')
    .replace(/\\\{/g, '{').replace(/\\\}/g, '}')
    .replace(/\\,/g, ' ');
  value = escapeMathText(value);
  value = value.replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>').replace(/\^([a-zA-Z0-9+-])/g, '<sup>$1</sup>');
  value = value.replace(/_\{([^{}]+)\}/g, '<sub>$1</sub>').replace(/_([a-zA-Z0-9+-])/g, '<sub>$1</sub>');
  return value;
}
function typesetInlineMath(root) {
  const nodes = [];
  if (root.nodeType === Node.TEXT_NODE) nodes.push(root);
  else {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue.includes('$') || node.parentElement?.closest('script,style,textarea,pre,.math-inline')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    while (walker.nextNode()) nodes.push(walker.currentNode);
  }
  nodes.forEach(node => {
    const text = node.nodeValue;
    const expression = /\$([^$\n]+)\$/g;
    let match; let cursor = 0; let changed = false;
    const fragment = document.createDocumentFragment();
    while ((match = expression.exec(text))) {
      changed = true;
      if (match.index > cursor) fragment.append(document.createTextNode(text.slice(cursor, match.index)));
      const math = document.createElement('span');
      math.className = 'math-inline';
      math.setAttribute('role', 'math');
      math.setAttribute('aria-label', match[1].replace(/\\[a-z]+\{([^}]*)\}/g, '$1').replace(/\\[a-z]+/g, ' '));
      math.innerHTML = mathToInlineHTML(match[1]);
      fragment.append(math);
      cursor = expression.lastIndex;
    }
    if (!changed) return;
    if (cursor < text.length) fragment.append(document.createTextNode(text.slice(cursor)));
    node.replaceWith(fragment);
  });
}
