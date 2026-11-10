Live app: https://ztprojectss.github.io/flashforge/
GitHub repository: https://github.com/ztprojectss/flashforge

AI PROMPTS USED

Claude (Claude Code desktop app):
1. Pasted the full assignment description and asked for an interactive web app that is different from the multiplication game.
2. "So is it done? What files do I submit? And it has to be a live app link?"
3. "Move them into a real folder and do I need to login to anything for u to post to github"
4. "Yes, install and publish" (Claude installed Git, created the GitHub repo, and turned on GitHub Pages)

GitHub Copilot (VS Code):
5. "Add a dark mode toggle button to the header that saves the user's preference to localStorage." — Copilot added a toggle button in the header, CSS variables for dark mode, and JavaScript to save/load the preference. It worked on the first try and didn't break any existing features.
6. "Add a session timer that counts up during study mode and shows the elapsed time below the flashcard."
7. "Add a feature to export the deck as a JSON file and a button to import a deck from a JSON file."
   Copilot added the new buttons and the timer line to the page, but its JavaScript changes did not save to my project folder, so the buttons did nothing at first.

ZTFlix Studio (my self-hosted coding assistant, running the Qwen local model) and Claude Code:
8. "Make sure the local files and submission md is up to date." Qwen wrote the missing JavaScript for the timer and for export/import; Claude Code fixed the timer showing up twice, made import skip broken cards, and tested export, import and the timer in a browser before I published.

| # | Tool | Prompt | What changed |
|---|------|--------|--------------|
| 1 | Claude Code | Pasted the full assignment description | Built the complete FlashForge flashcard app (HTML, CSS, JS) |
| 2 | Claude Code | "So is it done? What files do I submit?" | Created SUBMISSION.md and deployed to GitHub Pages |
| 3 | Claude Code | "Move them into a real folder" | Organized files into a working folder |
| 4 | Claude Code | "Yes, install and publish" | Installed Git, created GitHub repo, enabled Pages |
| 5 | GitHub Copilot | "Add a dark mode toggle button to the header that saves the user's preference to localStorage." | Added dark mode toggle button, dark mode CSS variables, and localStorage save/load |
| 6 | GitHub Copilot | "Add a session timer that counts up during study mode..." | Added the timer line under the flashcard (HTML/CSS) |
| 7 | GitHub Copilot | "Add a feature to export the deck as a JSON file and a button to import a deck..." | Added Export JSON / Import JSON buttons (HTML); its JavaScript did not save |
| 8 | ZTFlix Studio (Qwen) + Claude Code | "Make sure the local files and submission md is up to date" | Wrote and tested the JavaScript for the timer, export and import |

REFLECTION

For this project I built FlashForge, a flashcard study app. Users create their own deck of questions and answers, study them on cards that flip over, and mark each card as "Got it" or "Missed it." The app gives feedback while you study (a progress bar, a streak counter, and pop-up messages) and shows a score at the end of each session, with an option to retry only the cards you missed. It also tracks progress over time: sessions completed, best score, best streak, and which cards are "mastered" after three correct answers in a row. Everything is saved in the browser, so a deck is still there when you come back. I picked a flashcard app because it is useful for studying in my other classes and it is clearly different from the multiplication game we built in class.

I used AI for most of the build. Claude generated the first version of the HTML, CSS, and JavaScript from the assignment requirements, then tested it in a browser. That testing caught a real bug: the grading buttons showed up before the card was flipped, because a CSS display rule overrode the HTML "hidden" attribute. It was fixed with one CSS rule. Claude also helped deploy the app by installing Git, creating a public GitHub repository, and turning on GitHub Pages, which hosts the site for free. I then used GitHub Copilot in VS Code to add a dark mode toggle — it worked on the first try and didn't break any existing features.

When I asked Copilot for a session timer and JSON import/export, only the page markup saved, so the new buttons did nothing until the JavaScript was written and tested. That was a good reminder to check that AI changes actually landed instead of trusting the chat.

The biggest thing I learned is that AI can produce working code quickly, but you still need to understand the requirements, test what it builds, and check the details. Deployment is a good example: the app was not "done" until it had a live public link. If I kept working on FlashForge, I would add editing existing cards, multiple decks, and a way to share decks with classmates.
