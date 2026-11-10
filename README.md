# FlashForge – Flashcard Study App

**Purpose:** Help students study by building their own flashcard decks, quizzing themselves with flip cards, and tracking which cards they've mastered.

**Live app:** _paste your GitHub Pages / Netlify link here_

## Features
- **Deck builder** – add, delete, and clear cards; one-click sample deck (MIS terms)
- **Study mode** – shuffled flip cards (click or Space), self-grade "Got it" / "Missed it"
- **Feedback** – progress bar, live streak counter, toast messages, end-of-session score ring with a tailored message
- **Retry missed** – re-study only the cards you got wrong
- **Progress tracking** – sessions, best score, best streak, mastered cards (3 correct in a row)
- **Persistence** – deck and stats saved in `localStorage`
- **Responsive** – two-column layout on desktop, single column on phones
- **Keyboard shortcuts** – Space/Enter flip, → or Y = got it, ← or N = missed

## Files
- `index.html` – page structure
- `style.css` – styling, flip animation, responsive layout
- `app.js` – app logic, state, localStorage

---

## Deploy for free (GitHub Pages)
1. Create a new public repo on GitHub (e.g. `flashforge`).
2. In VS Code, open this folder, then in the terminal:
   ```
   git init
   git add .
   git commit -m "Initial FlashForge app"
   git branch -M main
   git remote add origin https://github.com/<your-username>/flashforge.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root) → Save**.
4. Wait ~1 minute; your link is `https://<your-username>.github.io/flashforge/`.

(Alternative: drag the folder onto https://app.netlify.com/drop.)

---

## AI prompts used
_Record the prompts you actually used. Examples of Copilot Chat prompts you could try in VS Code:_
1. "Add a dark mode toggle that remembers the user's choice in localStorage."
2. "Add a timer that shows how long each study session took and include it in the results."
3. "Add the ability to edit an existing card instead of only deleting it."
4. "Add an export/import button so users can save their deck as a JSON file."
5. "Review app.js for bugs and accessibility issues and suggest fixes."

| # | Tool | Prompt | What changed |
|---|------|--------|--------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

---

## Reflection
_Write a short paragraph (in your own words) covering:_
- What the app does and why you chose it
- Which improvements you made with GitHub Copilot and how well its suggestions worked
- A problem you ran into and how you fixed it
- What you'd add next
