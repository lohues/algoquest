/**
 * AlgoQuest - Algorithm Pattern Quiz Game
 * Main Application Logic
 */

// ============================================
// DATA LOADING
// ============================================

async function loadJSON(path) {
  const response = await fetch(path);
  return response.json();
}

// Global data stores
let signalData = null;
let patternData = null;
let scenarioData = null;
let flowchartData = null;
let complexityData = null;

// Algorithm display names (populated from flowchart data)
let algorithmNames = {};

// Global state
const gameState = {
  currentView: 'homepage',
  signal: {
    questions: [],
    currentIndex: 0,
    score: 0,
    streak: 0,
    answered: false
  },
  pattern: {
    cards: [],
    currentIndex: 0,
    isFlipped: false
  },
  scenario: {
    scenarios: [],
    currentIndex: 0,
    score: 0,
    correct: 0,
    answered: false
  },
  complexity: {
    questions: [],
    currentIndex: 0,
    score: 0,
    streak: 0,
    answered: false
  },
  stats: {
    gamesPlayed: 0,
    bestStreak: 0,
    totalPoints: 0
  }
};


// ============================================
// INITIALIZATION
// ============================================

async function init() {
  // Load all data
  try {
    [signalData, patternData, scenarioData, flowchartData, complexityData] = await Promise.all([
      loadJSON('./data/questions/signal_questions.json'),
      loadJSON('./data/questions/pattern_recognition_cards.json'),
      loadJSON('./data/questions/game_scenarios.json'),
      loadJSON('./data/algorithm_decision_flowchart.json'),
      loadJSON('./data/questions/complexity_questions.json')
    ]);
    
    // Build algorithm names from flowchart data
    buildAlgorithmNames();
    
    // Update menu counts from loaded data
    updateMenuCounts();
    
    // Load saved stats
    loadStats();
    
    // Setup event listeners
    setupEventListeners();
    
    // Check for saved session and offer to resume
    const session = loadSession();
    if (session && hasActiveSession()) {
      showResumePrompt(session);
    }
    
    console.log('AlgoQuest initialized successfully!');
  } catch (error) {
    console.error('Failed to load game data:', error);
  }
}

function showResumePrompt(session) {
  // Create a modal to ask user if they want to resume
  const gameNames = {
    'signal-quiz': 'Signal Quiz',
    'pattern-quiz': 'Pattern Flashcards',
    'scenario-quiz': 'Scenario Quiz',
    'complexity-quiz': 'Complexity Quiz'
  };
  
  const gameName = gameNames[session.currentView] || 'Quiz';
  
  // Get progress info
  let progressInfo = '';
  switch (session.currentView) {
    case 'signal-quiz':
      progressInfo = `Question ${session.signal.currentIndex + 1} of ${session.signal.questions.length}`;
      break;
    case 'pattern-quiz':
      progressInfo = `Card ${session.pattern.currentIndex + 1} of ${session.pattern.cards.length}`;
      break;
    case 'scenario-quiz':
      progressInfo = `Scenario ${session.scenario.currentIndex + 1} of ${session.scenario.scenarios.length}`;
      break;
    case 'complexity-quiz':
      progressInfo = `Question ${session.complexity.currentIndex + 1} of ${session.complexity.questions.length}`;
      break;
  }
  
  const modal = document.createElement('div');
  modal.className = 'resume-modal';
  modal.innerHTML = `
    <div class="resume-modal-content">
      <div class="resume-icon">🔄</div>
      <h2>Resume Session?</h2>
      <p>You have an unfinished <strong>${gameName}</strong></p>
      <p class="resume-progress">${progressInfo}</p>
      <div class="resume-buttons">
        <button class="resume-btn resume-yes">Resume</button>
        <button class="resume-btn resume-no">Start Fresh</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add styles for modal
  if (!document.getElementById('resume-modal-styles')) {
    const styles = document.createElement('style');
    styles.id = 'resume-modal-styles';
    styles.textContent = `
      .resume-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .resume-modal-content {
        background: var(--card-bg, #1e1e2e);
        padding: 2rem;
        border-radius: 1rem;
        text-align: center;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease;
      }
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .resume-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }
      .resume-modal-content h2 {
        margin: 0 0 0.5rem;
        color: var(--text-primary, #fff);
      }
      .resume-modal-content p {
        color: var(--text-secondary, #a0a0a0);
        margin: 0.5rem 0;
      }
      .resume-progress {
        font-size: 0.9rem;
        color: var(--accent, #6366f1) !important;
        font-weight: 500;
      }
      .resume-buttons {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
        justify-content: center;
      }
      .resume-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 0.5rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .resume-btn:hover {
        transform: translateY(-2px);
      }
      .resume-yes {
        background: var(--accent, #6366f1);
        color: white;
      }
      .resume-no {
        background: var(--card-bg-hover, #2a2a3e);
        color: var(--text-primary, #fff);
        border: 1px solid var(--border, #3a3a4e);
      }
    `;
    document.head.appendChild(styles);
  }
  
  // Handle button clicks
  modal.querySelector('.resume-yes').addEventListener('click', () => {
    modal.remove();
    restoreSession(session);
  });
  
  modal.querySelector('.resume-no').addEventListener('click', () => {
    modal.remove();
    clearSession();
  });
}

function buildAlgorithmNames() {
  // Build algorithm display names from flowchart data
  algorithmNames = {};
  for (const [id, algo] of Object.entries(flowchartData.algorithms)) {
    algorithmNames[id] = algo.name;
  }
}

function updateMenuCounts() {
  // Update badge counts dynamically from loaded data
  document.getElementById('signal-count').textContent = 
    `${signalData.questions.length} Questions`;
  document.getElementById('pattern-count').textContent = 
    `${patternData.cards.length} Patterns`;
  document.getElementById('scenario-count').textContent = 
    `${scenarioData.scenarios.length} Scenarios`;
  document.getElementById('complexity-count').textContent = 
    `${complexityData.questions.length} Questions`;
  
  // Update pattern instruction count
  document.getElementById('pattern-instruction-count').textContent = 
    patternData.cards.length;
}

function loadStats() {
  const saved = localStorage.getItem('algoquest-stats');
  if (saved) {
    Object.assign(gameState.stats, JSON.parse(saved));
    updateStatsDisplay();
  }
}

function saveStats() {
  localStorage.setItem('algoquest-stats', JSON.stringify(gameState.stats));
}

// ============================================
// SESSION PERSISTENCE
// ============================================

function saveSession() {
  const session = {
    currentView: gameState.currentView,
    signal: gameState.signal,
    pattern: gameState.pattern,
    scenario: gameState.scenario,
    complexity: gameState.complexity,
    timestamp: Date.now()
  };
  localStorage.setItem('algoquest-session', JSON.stringify(session));
}

function loadSession() {
  const saved = localStorage.getItem('algoquest-session');
  if (!saved) return null;
  
  try {
    const session = JSON.parse(saved);
    // Session expires after 24 hours
    if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
      clearSession();
      return null;
    }
    return session;
  } catch (e) {
    clearSession();
    return null;
  }
}

function clearSession() {
  localStorage.removeItem('algoquest-session');
}

function restoreSession(session) {
  // Restore game state
  gameState.currentView = session.currentView;
  Object.assign(gameState.signal, session.signal);
  Object.assign(gameState.pattern, session.pattern);
  Object.assign(gameState.scenario, session.scenario);
  Object.assign(gameState.complexity, session.complexity);
  
  // Restore the appropriate view and render
  switch (session.currentView) {
    case 'signal-quiz':
      document.getElementById('signal-total').textContent = gameState.signal.questions.length;
      updateSignalScore();
      renderSignalQuestion();
      // Don't use showView here as it would clear the session
      document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
      document.getElementById('signal-quiz').classList.add('active');
      break;
    case 'pattern-quiz':
      document.getElementById('pattern-total').textContent = gameState.pattern.cards.length;
      renderPatternDots();
      renderPatternCard();
      // Restore flip state
      if (gameState.pattern.isFlipped) {
        document.getElementById('flashcard').classList.add('flipped');
      }
      document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
      document.getElementById('pattern-quiz').classList.add('active');
      break;
    case 'scenario-quiz':
      document.getElementById('scenario-total').textContent = gameState.scenario.scenarios.length;
      updateScenarioScore();
      renderScenario();
      document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
      document.getElementById('scenario-quiz').classList.add('active');
      break;
    case 'complexity-quiz':
      document.getElementById('complexity-total').textContent = gameState.complexity.questions.length;
      updateComplexityScore();
      renderComplexityQuestion();
      document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
      document.getElementById('complexity-quiz').classList.add('active');
      break;
    default:
      showView('homepage');
      clearSession();
  }
}

function hasActiveSession() {
  const session = loadSession();
  if (!session) return false;
  
  // Check if there's an active quiz (not on homepage or results)
  const activeViews = ['signal-quiz', 'pattern-quiz', 'scenario-quiz', 'complexity-quiz'];
  return activeViews.includes(session.currentView);
}

function updateStatsDisplay() {
  document.getElementById('total-played').textContent = gameState.stats.gamesPlayed;
  document.getElementById('best-streak').textContent = gameState.stats.bestStreak;
  document.getElementById('total-points').textContent = gameState.stats.totalPoints;
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  // Menu cards
  document.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('click', () => {
      const game = card.dataset.game;
      startGame(game);
    });
  });
  
  // Back buttons
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showView(btn.dataset.view);
    });
  });
  
  // Signal Quiz
  document.getElementById('signal-next').addEventListener('click', nextSignalQuestion);
  
  // Pattern Quiz
  document.getElementById('flashcard').addEventListener('click', flipCard);
  document.getElementById('pattern-prev').addEventListener('click', prevPattern);
  document.getElementById('pattern-next').addEventListener('click', nextPattern);
  document.getElementById('pattern-shuffle').addEventListener('click', shufflePatterns);
  
  // Scenario Quiz
  document.getElementById('scenario-next').addEventListener('click', nextScenario);
  document.getElementById('hints-toggle').addEventListener('click', toggleHints);
  
  // Complexity Quiz
  document.getElementById('complexity-next').addEventListener('click', nextComplexityQuestion);
  
  // Results
  document.getElementById('play-again').addEventListener('click', playAgain);
  document.querySelectorAll('[data-view="homepage"]').forEach(btn => {
    btn.addEventListener('click', () => showView('homepage'));
  });
}

// ============================================
// VIEW MANAGEMENT
// ============================================

function showView(viewId) {
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  document.getElementById(viewId).classList.add('active');
  gameState.currentView = viewId;
  
  // Clear session when returning to homepage or showing results
  if (viewId === 'homepage' || viewId === 'results') {
    clearSession();
  }
}

function startGame(game) {
  switch (game) {
    case 'signal':
      initSignalQuiz();
      showView('signal-quiz');
      break;
    case 'pattern':
      initPatternQuiz();
      showView('pattern-quiz');
      break;
    case 'scenario':
      initScenarioQuiz();
      showView('scenario-quiz');
      break;
    case 'complexity':
      initComplexityQuiz();
      showView('complexity-quiz');
      break;
  }
}

// ============================================
// SIGNAL QUIZ
// ============================================

function initSignalQuiz() {
  // Shuffle questions
  gameState.signal.questions = shuffleArray([...signalData.questions]);
  gameState.signal.currentIndex = 0;
  gameState.signal.score = 0;
  gameState.signal.streak = 0;
  gameState.signal.answered = false;
  
  document.getElementById('signal-total').textContent = gameState.signal.questions.length;
  updateSignalScore();
  renderSignalQuestion();
  saveSession();
}

function renderSignalQuestion() {
  const state = gameState.signal;
  const question = state.questions[state.currentIndex];
  
  // Update progress
  document.getElementById('signal-current').textContent = state.currentIndex + 1;
  const progress = ((state.currentIndex) / state.questions.length) * 100;
  document.getElementById('signal-progress').style.width = `${progress}%`;
  
  // Render question
  document.getElementById('signal-question').textContent = question.signal;
  
  // Create options (1 correct + 3 wrong, shuffled)
  const options = shuffleArray([
    { algorithm: question.correctAlgorithm, isCorrect: true },
    ...question.wrongOptions.map(w => ({ algorithm: w, isCorrect: false }))
  ]);
  
  const optionsContainer = document.getElementById('signal-options');
  optionsContainer.innerHTML = '';
  
  const letters = ['A', 'B', 'C', 'D'];
  options.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `
      <span class="option-letter">${letters[index]}</span>
      <span class="option-text">${algorithmNames[option.algorithm] || option.algorithm}</span>
    `;
    btn.addEventListener('click', () => selectSignalAnswer(btn, option, question));
    optionsContainer.appendChild(btn);
  });
  
  // Hide feedback and next button
  document.getElementById('signal-feedback').classList.add('hidden');
  document.getElementById('signal-next').classList.add('hidden');
  state.answered = false;
}

function selectSignalAnswer(btn, option, question) {
  const state = gameState.signal;
  if (state.answered) return;
  state.answered = true;
  
  // Disable all buttons
  document.querySelectorAll('#signal-options .option-btn').forEach(b => {
    b.disabled = true;
  });
  
  // Show correct/wrong
  const feedbackEl = document.getElementById('signal-feedback');
  feedbackEl.classList.remove('hidden', 'correct', 'wrong');
  
  if (option.isCorrect) {
    btn.classList.add('correct');
    feedbackEl.classList.add('correct');
    feedbackEl.querySelector('.feedback-icon').textContent = '✅';
    feedbackEl.querySelector('.feedback-text').textContent = 'Correct!';
    state.score += 10;
    state.streak += 1;
    
    if (state.streak > gameState.stats.bestStreak) {
      gameState.stats.bestStreak = state.streak;
    }
  } else {
    btn.classList.add('wrong');
    feedbackEl.classList.add('wrong');
    feedbackEl.querySelector('.feedback-icon').textContent = '❌';
    feedbackEl.querySelector('.feedback-text').textContent = `Wrong! The answer is ${algorithmNames[question.correctAlgorithm]}`;
    state.streak = 0;
    
    // Highlight correct answer
    document.querySelectorAll('#signal-options .option-btn').forEach(b => {
      if (b.querySelector('.option-text').textContent === algorithmNames[question.correctAlgorithm]) {
        b.classList.add('correct');
      }
    });
  }
  
  feedbackEl.querySelector('.feedback-explanation').textContent = question.explanation;
  updateSignalScore();
  saveSession();
  
  // Show next button or finish
  if (state.currentIndex < state.questions.length - 1) {
    document.getElementById('signal-next').classList.remove('hidden');
  } else {
    setTimeout(() => finishSignalQuiz(), 1500);
  }
}

function nextSignalQuestion() {
  gameState.signal.currentIndex++;
  gameState.signal.answered = false;
  renderSignalQuestion();
  saveSession();
}

function updateSignalScore() {
  document.getElementById('signal-score').textContent = gameState.signal.score;
  document.getElementById('signal-streak').textContent = gameState.signal.streak;
}

function finishSignalQuiz() {
  const state = gameState.signal;
  gameState.stats.gamesPlayed++;
  gameState.stats.totalPoints += state.score;
  saveStats();
  
  showResults({
    score: state.score,
    correct: Math.floor(state.score / 10),
    total: state.questions.length,
    gameType: 'signal'
  });
}

// ============================================
// PATTERN QUIZ (FLASHCARDS)
// ============================================

function initPatternQuiz() {
  gameState.pattern.cards = [...patternData.cards];
  gameState.pattern.currentIndex = 0;
  gameState.pattern.isFlipped = false;
  
  document.getElementById('pattern-total').textContent = gameState.pattern.cards.length;
  renderPatternDots();
  renderPatternCard();
  saveSession();
}

function renderPatternCard() {
  const state = gameState.pattern;
  const card = state.cards[state.currentIndex];
  
  // Update progress
  document.getElementById('pattern-current').textContent = state.currentIndex + 1;
  
  // Reset flip state
  state.isFlipped = false;
  document.getElementById('flashcard').classList.remove('flipped');
  
  // Render front
  document.getElementById('pattern-name').textContent = card.pattern;
  
  // Render back - signals
  const signalsList = document.getElementById('pattern-signals');
  signalsList.innerHTML = card.signals.map(s => `<li>${s}</li>`).join('');
  
  // Render back - anti-signals
  const antiSignalsList = document.getElementById('pattern-anti-signals');
  antiSignalsList.innerHTML = card.antiSignals.map(s => `<li>${s}</li>`).join('');
  
  // Update navigation buttons
  document.getElementById('pattern-prev').disabled = state.currentIndex === 0;
  document.getElementById('pattern-next').disabled = state.currentIndex === state.cards.length - 1;
  
  // Update dots
  updatePatternDots();
}

function flipCard() {
  const flashcard = document.getElementById('flashcard');
  flashcard.classList.toggle('flipped');
  gameState.pattern.isFlipped = !gameState.pattern.isFlipped;
  saveSession();
}

function prevPattern() {
  if (gameState.pattern.currentIndex > 0) {
    gameState.pattern.currentIndex--;
    renderPatternCard();
    saveSession();
  }
}

function nextPattern() {
  if (gameState.pattern.currentIndex < gameState.pattern.cards.length - 1) {
    gameState.pattern.currentIndex++;
    renderPatternCard();
    saveSession();
  }
}

function shufflePatterns() {
  gameState.pattern.cards = shuffleArray([...gameState.pattern.cards]);
  gameState.pattern.currentIndex = 0;
  renderPatternDots();
  renderPatternCard();
  saveSession();
  
  // Visual feedback
  document.getElementById('pattern-shuffle').textContent = '✓ Shuffled!';
  setTimeout(() => {
    document.getElementById('pattern-shuffle').textContent = '🔀 Shuffle';
  }, 1000);
}

function renderPatternDots() {
  const dotsContainer = document.getElementById('pattern-dots');
  dotsContainer.innerHTML = '';
  
  gameState.pattern.cards.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    if (index === gameState.pattern.currentIndex) {
      dot.classList.add('active');
    }
    dot.addEventListener('click', () => {
      gameState.pattern.currentIndex = index;
      renderPatternCard();
      saveSession();
    });
    dotsContainer.appendChild(dot);
  });
}

function updatePatternDots() {
  document.querySelectorAll('#pattern-dots .dot').forEach((dot, index) => {
    dot.classList.toggle('active', index === gameState.pattern.currentIndex);
  });
}

// ============================================
// SCENARIO QUIZ
// ============================================

function initScenarioQuiz() {
  // Shuffle scenarios
  gameState.scenario.scenarios = shuffleArray([...scenarioData.scenarios]);
  gameState.scenario.currentIndex = 0;
  gameState.scenario.score = 0;
  gameState.scenario.correct = 0;
  gameState.scenario.answered = false;
  
  document.getElementById('scenario-total').textContent = gameState.scenario.scenarios.length;
  updateScenarioScore();
  renderScenario();
  saveSession();
}

function renderScenario() {
  const state = gameState.scenario;
  const scenario = state.scenarios[state.currentIndex];
  
  // Update progress
  document.getElementById('scenario-current').textContent = state.currentIndex + 1;
  const progress = ((state.currentIndex) / state.scenarios.length) * 100;
  document.getElementById('scenario-progress').style.width = `${progress}%`;
  
  // Render scenario
  document.getElementById('scenario-problem').textContent = scenario.problemDescription;
  
  // Difficulty badge
  const diffBadge = document.getElementById('scenario-difficulty');
  diffBadge.textContent = scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1);
  diffBadge.className = 'difficulty-badge ' + scenario.difficulty;
  
  // Points
  document.getElementById('scenario-points').textContent = `+${scenario.points} pts`;
  
  // Hints
  const hintsContainer = document.getElementById('scenario-hints');
  hintsContainer.innerHTML = scenario.hints.map(h => `<span class="hint-tag">${h}</span>`).join('');
  
  // Generate options - get wrong options from other scenarios
  const wrongOptions = getScenarioWrongOptions(scenario.correctAnswer);
  const options = shuffleArray([
    { algorithm: scenario.correctAnswer, isCorrect: true },
    ...wrongOptions.map(w => ({ algorithm: w, isCorrect: false }))
  ]);
  
  const optionsContainer = document.getElementById('scenario-options');
  optionsContainer.innerHTML = '';
  
  const letters = ['A', 'B', 'C', 'D'];
  options.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `
      <span class="option-letter">${letters[index]}</span>
      <span class="option-text">${algorithmNames[option.algorithm] || option.algorithm}</span>
    `;
    btn.addEventListener('click', () => selectScenarioAnswer(btn, option, scenario));
    optionsContainer.appendChild(btn);
  });
  
  // Hide feedback and next button
  document.getElementById('scenario-feedback').classList.add('hidden');
  document.getElementById('scenario-next').classList.add('hidden');
  
  // Reset hints to collapsed state
  document.querySelector('.scenario-hints').classList.add('collapsed');
  
  state.answered = false;
}

function getScenarioWrongOptions(correctAnswer) {
  // Get 3 unique wrong options from all scenarios
  const allAnswers = [...new Set(scenarioData.scenarios.map(s => s.correctAnswer))];
  const wrongOptions = allAnswers.filter(a => a !== correctAnswer);
  return shuffleArray(wrongOptions).slice(0, 3);
}

function selectScenarioAnswer(btn, option, scenario) {
  const state = gameState.scenario;
  if (state.answered) return;
  state.answered = true;
  
  // Disable all buttons
  document.querySelectorAll('#scenario-options .option-btn').forEach(b => {
    b.disabled = true;
  });
  
  // Show correct/wrong
  const feedbackEl = document.getElementById('scenario-feedback');
  feedbackEl.classList.remove('hidden', 'correct', 'wrong');
  
  if (option.isCorrect) {
    btn.classList.add('correct');
    feedbackEl.classList.add('correct');
    feedbackEl.querySelector('.feedback-icon').textContent = '✅';
    feedbackEl.querySelector('.feedback-text').textContent = `Correct! +${scenario.points} points`;
    state.score += scenario.points;
    state.correct++;
  } else {
    btn.classList.add('wrong');
    feedbackEl.classList.add('wrong');
    feedbackEl.querySelector('.feedback-icon').textContent = '❌';
    feedbackEl.querySelector('.feedback-text').textContent = `Wrong! The answer is ${algorithmNames[scenario.correctAnswer]}`;
    
    // Highlight correct answer
    document.querySelectorAll('#scenario-options .option-btn').forEach(b => {
      if (b.querySelector('.option-text').textContent === algorithmNames[scenario.correctAnswer]) {
        b.classList.add('correct');
      }
    });
  }
  
  updateScenarioScore();
  saveSession();
  
  // Show next button or finish
  if (state.currentIndex < state.scenarios.length - 1) {
    document.getElementById('scenario-next').classList.remove('hidden');
  } else {
    setTimeout(() => finishScenarioQuiz(), 1500);
  }
}

function nextScenario() {
  gameState.scenario.currentIndex++;
  gameState.scenario.answered = false;
  renderScenario();
  saveSession();
}

function updateScenarioScore() {
  document.getElementById('scenario-score').textContent = gameState.scenario.score;
  document.getElementById('scenario-correct').textContent = gameState.scenario.correct;
}

function toggleHints() {
  const hintsSection = document.querySelector('.scenario-hints');
  hintsSection.classList.toggle('collapsed');
}

function finishScenarioQuiz() {
  const state = gameState.scenario;
  gameState.stats.gamesPlayed++;
  gameState.stats.totalPoints += state.score;
  saveStats();
  
  showResults({
    score: state.score,
    correct: state.correct,
    total: state.scenarios.length,
    gameType: 'scenario'
  });
}

// ============================================
// COMPLEXITY QUIZ
// ============================================

function initComplexityQuiz() {
  // Shuffle questions
  gameState.complexity.questions = shuffleArray([...complexityData.questions]);
  gameState.complexity.currentIndex = 0;
  gameState.complexity.score = 0;
  gameState.complexity.streak = 0;
  gameState.complexity.answered = false;
  
  document.getElementById('complexity-total').textContent = gameState.complexity.questions.length;
  updateComplexityScore();
  renderComplexityQuestion();
  saveSession();
}

function renderComplexityQuestion() {
  const state = gameState.complexity;
  const question = state.questions[state.currentIndex];
  
  // Update progress
  document.getElementById('complexity-current').textContent = state.currentIndex + 1;
  const progress = ((state.currentIndex) / state.questions.length) * 100;
  document.getElementById('complexity-progress').style.width = `${progress}%`;
  
  // Render question
  document.getElementById('complexity-question').textContent = question.question;
  
  // Create options (1 correct + 3 wrong, shuffled)
  const options = shuffleArray([
    { answer: question.correctAnswer, isCorrect: true },
    ...question.wrongOptions.map(w => ({ answer: w, isCorrect: false }))
  ]);
  
  const optionsContainer = document.getElementById('complexity-options');
  optionsContainer.innerHTML = '';
  
  const letters = ['A', 'B', 'C', 'D'];
  options.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `
      <span class="option-letter">${letters[index]}</span>
      <span class="option-text">${option.answer}</span>
    `;
    btn.addEventListener('click', () => selectComplexityAnswer(btn, option, question));
    optionsContainer.appendChild(btn);
  });
  
  // Hide feedback and next button
  document.getElementById('complexity-feedback').classList.add('hidden');
  document.getElementById('complexity-next').classList.add('hidden');
  state.answered = false;
}

function selectComplexityAnswer(btn, option, question) {
  const state = gameState.complexity;
  if (state.answered) return;
  state.answered = true;
  
  // Disable all buttons
  document.querySelectorAll('#complexity-options .option-btn').forEach(b => {
    b.disabled = true;
  });
  
  // Show correct/wrong
  const feedbackEl = document.getElementById('complexity-feedback');
  feedbackEl.classList.remove('hidden', 'correct', 'wrong');
  
  if (option.isCorrect) {
    btn.classList.add('correct');
    feedbackEl.classList.add('correct');
    feedbackEl.querySelector('.feedback-icon').textContent = '✅';
    feedbackEl.querySelector('.feedback-text').textContent = 'Correct!';
    state.score += 10;
    state.streak += 1;
    
    if (state.streak > gameState.stats.bestStreak) {
      gameState.stats.bestStreak = state.streak;
    }
  } else {
    btn.classList.add('wrong');
    feedbackEl.classList.add('wrong');
    feedbackEl.querySelector('.feedback-icon').textContent = '❌';
    feedbackEl.querySelector('.feedback-text').textContent = `Wrong! The answer is ${question.correctAnswer}`;
    state.streak = 0;
    
    // Highlight correct answer
    document.querySelectorAll('#complexity-options .option-btn').forEach(b => {
      if (b.querySelector('.option-text').textContent === question.correctAnswer) {
        b.classList.add('correct');
      }
    });
  }
  
  feedbackEl.querySelector('.feedback-explanation').textContent = question.explanation;
  updateComplexityScore();
  saveSession();
  
  // Show next button or finish
  if (state.currentIndex < state.questions.length - 1) {
    document.getElementById('complexity-next').classList.remove('hidden');
  } else {
    setTimeout(() => finishComplexityQuiz(), 1500);
  }
}

function nextComplexityQuestion() {
  gameState.complexity.currentIndex++;
  gameState.complexity.answered = false;
  renderComplexityQuestion();
  saveSession();
}

function updateComplexityScore() {
  document.getElementById('complexity-score').textContent = gameState.complexity.score;
  document.getElementById('complexity-streak').textContent = gameState.complexity.streak;
}

function finishComplexityQuiz() {
  const state = gameState.complexity;
  gameState.stats.gamesPlayed++;
  gameState.stats.totalPoints += state.score;
  saveStats();
  
  showResults({
    score: state.score,
    correct: Math.floor(state.score / 10),
    total: state.questions.length,
    gameType: 'complexity'
  });
}

// ============================================
// RESULTS
// ============================================

function showResults({ score, correct, total, gameType }) {
  const percentage = Math.round((correct / total) * 100);
  
  document.getElementById('result-score').textContent = score;
  document.getElementById('result-correct').textContent = `${correct}/${total}`;
  document.getElementById('result-percentage').textContent = `${percentage}%`;
  
  // Icon and title based on performance
  const resultsIcon = document.getElementById('results-icon');
  const resultsTitle = document.getElementById('results-title');
  
  if (percentage >= 90) {
    resultsIcon.textContent = '🏆';
    resultsTitle.textContent = 'Outstanding!';
  } else if (percentage >= 70) {
    resultsIcon.textContent = '🌟';
    resultsTitle.textContent = 'Great Job!';
  } else if (percentage >= 50) {
    resultsIcon.textContent = '💪';
    resultsTitle.textContent = 'Good Effort!';
  } else {
    resultsIcon.textContent = '📚';
    resultsTitle.textContent = 'Keep Practicing!';
  }
  
  // Store game type for play again
  document.getElementById('play-again').dataset.game = gameType;
  
  updateStatsDisplay();
  showView('results');
}

function playAgain() {
  const gameType = document.getElementById('play-again').dataset.game;
  startGame(gameType);
}

// ============================================
// UTILITIES
// ============================================

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================
// START THE APP
// ============================================

document.addEventListener('DOMContentLoaded', init);
