# ⚡ AlgoQuest

**Master algorithm patterns through interactive challenges**

AlgoQuest is a web-based quiz game designed to help developers learn and memorize algorithm patterns for coding interviews. Based on the decision flowchart from [AlgoMonster](https://algo.monster/flowchart), it provides three different game modes to reinforce pattern recognition skills.

![AlgoQuest Screenshot](https://img.shields.io/badge/Status-Active-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue)

## 🎮 Game Modes

### 🎯 Signal Quiz
Multiple-choice quiz that presents problem "signals" (hints about what algorithm to use) and asks you to identify the correct algorithm pattern.
- 30 questions covering all major patterns
- Score and streak tracking
- Detailed explanations after each answer

### 🃏 Pattern Cards
Interactive flashcards to learn when to use each algorithm pattern.
- 12 algorithm pattern cards
- Click to flip between pattern name and signals
- Shows both "Use When" signals and "Avoid When" anti-signals
- Shuffle and navigate through cards

### 🧩 Scenario Quiz
Full problem descriptions that simulate real LeetCode-style questions.
- 15 scenarios with varying difficulty (Easy/Medium/Hard)
- Collapsible hints system
- Points-based scoring system
- Difficulty badges and point rewards

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local HTTP server (required for loading JSON data)

### Running the Application

1. **Clone or download the repository**
   ```bash
   cd mango-tree
   ```

2. **Start a local server**
   
   Using Python:
   ```bash
   python3 -m http.server 8080
   ```
   
   Using Node.js (with `http-server`):
   ```bash
   npx http-server -p 8080
   ```
   
   Using PHP:
   ```bash
   php -S localhost:8080
   ```

3. **Open in browser**
   ```
   http://localhost:8080
   ```

## 📁 Project Structure

```
mango-tree/
├── index.html          # Main HTML file with all views
├── styles.css          # CSS styling (dark theme)
├── app.js              # Game logic and state management
├── README.md           # This file
└── data/
    ├── algorithm_decision_flowchart.json   # Full decision tree data
    ├── algorithm_quiz_data.json            # Index file with references
    └── questions/
        ├── signal_questions.json           # 30 signal quiz questions
        ├── pattern_recognition_cards.json  # 12 flashcard patterns
        └── game_scenarios.json             # 15 problem scenarios
```

## 📊 Data Format

### Signal Questions (`signal_questions.json`)
```json
{
  "id": "q1",
  "signal": "Array is sorted, need to find a target value",
  "correctAlgorithm": "binary_search",
  "wrongOptions": ["linear_search_or_hash", "two_pointers_same", "dfs_tree"],
  "explanation": "Sorted array + search = Binary Search for O(log n) time"
}
```

### Pattern Cards (`pattern_recognition_cards.json`)
```json
{
  "id": "card_1",
  "pattern": "Binary Search",
  "signals": ["Array is sorted", "Search space can be halved", ...],
  "antiSignals": ["Array is unsorted and cannot be sorted", ...]
}
```

### Game Scenarios (`game_scenarios.json`)
```json
{
  "id": "scenario_1",
  "problemDescription": "Given a sorted array of integers, find if a target value exists.",
  "hints": ["Array is sorted", "Need to find single value"],
  "correctAnswer": "binary_search",
  "difficulty": "easy",
  "points": 10
}
```

## 🎨 Features

- **Dark Theme**: Modern midnight theme with vibrant accent colors
- **Responsive Design**: Works on desktop and mobile devices
- **Progress Tracking**: Persistent stats saved to localStorage
- **Animations**: Smooth transitions and 3D card flip effects
- **Immediate Feedback**: Explanations shown after each answer

## 📚 Algorithm Patterns Covered

| Category | Patterns |
|----------|----------|
| **Search** | Binary Search, Two Pointers |
| **Traversal** | BFS, DFS, Flood Fill |
| **Graph** | Dijkstra, Topological Sort, Union Find |
| **Dynamic Programming** | Linear, Grid, Dual-Sequence, Knapsack, Interval |
| **Data Structures** | Heap, Monotonic Stack, Trie |
| **Techniques** | Sliding Window, Prefix Sum, Backtracking |

## ➕ Adding More Questions

To add new questions, edit the corresponding JSON file in `data/questions/`:

1. **Signal Questions**: Add to the `questions` array in `signal_questions.json`
2. **Pattern Cards**: Add to the `cards` array in `pattern_recognition_cards.json`
3. **Scenarios**: Add to the `scenarios` array in `game_scenarios.json`

Make sure to update the metadata counts (`questionCount`, `cardCount`, `scenarioCount`) in each file.

## 🛠️ Technologies Used

- **HTML5** - Structure
- **CSS3** - Styling with CSS variables, flexbox, grid, and animations
- **JavaScript (ES6+)** - Game logic with modules
- **Google Fonts** - Space Grotesk & JetBrains Mono

## 📖 References

- [AlgoMonster Flowchart](https://algo.monster/flowchart) - Original algorithm decision flowchart
- [AlgoMonster Patterns](https://algo.monster/) - Algorithm pattern learning resource

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Happy Learning! 🚀**

Master algorithm patterns and ace your coding interviews with AlgoQuest.
