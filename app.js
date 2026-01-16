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
  stats: {
    gamesPlayed: 0,
    bestStreak: 0,
    totalPoints: 0
  }
};

// Algorithm display names
const algorithmNames = {
  binary_search: 'Binary Search',
  binary_search_rotated: 'Binary Search (Rotated)',
  linear_search_or_hash: 'Linear Search / Hash Map',
  two_pointers_same: 'Two Pointers (Same Direction)',
  two_pointers_opposite: 'Two Pointers (Opposite)',
  sliding_window_fixed: 'Sliding Window (Fixed)',
  sliding_window_variable: 'Sliding Window (Variable)',
  prefix_sum: 'Prefix Sum',
  dfs_tree: 'DFS on Tree',
  bfs_tree: 'BFS on Tree',
  dfs_graph: 'DFS on Graph',
  bfs_graph: 'BFS on Graph',
  bfs_matrix: 'BFS on Matrix',
  dfs_flood_fill: 'DFS Flood Fill',
  dfs_cycle_directed: 'DFS Cycle Detection',
  dijkstra: 'Dijkstra\'s Algorithm',
  topological_sort: 'Topological Sort',
  union_find: 'Union Find',
  union_find_cycle: 'Union Find (Cycle)',
  dfs_components: 'DFS (Components)',
  dp_linear: 'Linear DP',
  dp_dual_sequence: 'Dual Sequence DP',
  dp_grid: 'Grid DP',
  dp_knapsack: 'Knapsack DP',
  dp_tree: 'Tree DP',
  dp_lis: 'LIS DP',
  dp_game_theory: 'Game Theory DP',
  backtracking: 'Backtracking',
  greedy: 'Greedy Algorithm',
  greedy_jump: 'Greedy (Jump Game)',
  kadane_greedy: 'Kadane\'s Algorithm',
  heap_top_k: 'Heap (Top K)',
  monotonic_stack: 'Monotonic Stack',
  stack: 'Stack',
  trie: 'Trie',
  floyd_cycle: 'Floyd Cycle Detection',
  interval_merge: 'Interval Merge',
  interval_heap: 'Interval + Heap',
  cache_design: 'Cache Design (LRU)',
  comparison_sort: 'Comparison Sort',
  binary_search_matrix: 'Binary Search (Matrix)',
  divide_conquer: 'Divide and Conquer'
};

// ============================================
// INITIALIZATION
// ============================================

async function init() {
  // Load all data
  try {
    [signalData, patternData, scenarioData] = await Promise.all([
      loadJSON('./data/questions/signal_questions.json'),
      loadJSON('./data/questions/pattern_recognition_cards.json'),
      loadJSON('./data/questions/game_scenarios.json')
    ]);
    
    // Update menu counts from loaded data
    updateMenuCounts();
    
    // Load saved stats
    loadStats();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('AlgoQuest initialized successfully!');
  } catch (error) {
    console.error('Failed to load game data:', error);
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
  
  // Show next button or finish
  if (state.currentIndex < state.questions.length - 1) {
    document.getElementById('signal-next').classList.remove('hidden');
  } else {
    setTimeout(() => finishSignalQuiz(), 1500);
  }
}

function nextSignalQuestion() {
  gameState.signal.currentIndex++;
  renderSignalQuestion();
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
}

function prevPattern() {
  if (gameState.pattern.currentIndex > 0) {
    gameState.pattern.currentIndex--;
    renderPatternCard();
  }
}

function nextPattern() {
  if (gameState.pattern.currentIndex < gameState.pattern.cards.length - 1) {
    gameState.pattern.currentIndex++;
    renderPatternCard();
  }
}

function shufflePatterns() {
  gameState.pattern.cards = shuffleArray([...gameState.pattern.cards]);
  gameState.pattern.currentIndex = 0;
  renderPatternDots();
  renderPatternCard();
  
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
  
  // Show next button or finish
  if (state.currentIndex < state.scenarios.length - 1) {
    document.getElementById('scenario-next').classList.remove('hidden');
  } else {
    setTimeout(() => finishScenarioQuiz(), 1500);
  }
}

function nextScenario() {
  gameState.scenario.currentIndex++;
  renderScenario();
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
