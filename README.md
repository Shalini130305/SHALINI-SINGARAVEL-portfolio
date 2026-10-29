# Shalini Singaravel: Portfolio

A static site built with HTML, CSS and JavaScript. It has no build step and no dependencies.

## Structure

```
index.html              Homepage (all sections, both project cards)
style.css               Shared styles, including dashboard styles
script.js               Shared behaviour: menu, reveal, active nav, back-to-top, form validation
projects/edge-ml.html   Edge-ML project page and simulated dashboard
projects/ai-finance.html AI Finance Controller page and demo dashboard
js/edge-ml.js           Simulation logic (synthetic signal, demo alert rule)
js/ai-finance.js        Demo transactions and reconciliation rules
```

## Run locally (macOS)

1. Unzip `shalini-portfolio.zip` and open the `shalini-portfolio` folder in VS Code.
2. Open the VS Code terminal and run:
   ```
   cd shalini-portfolio
   python3 -m http.server 8000
   ```
   Alternatively, install the "Live Server" extension and choose "Go Live".
3. Open http://localhost:8000 and test both project buttons and the menu.

## Edit

- Text and links: `index.html`, `projects/*.html`.
- Demo transactions and rules: the `DATA` array and `rows` logic in `js/ai-finance.js`.
- Simulation thresholds: `THRESH` and `MIN_RUN` in `js/edge-ml.js`.
- Images: put them in an `assets/` folder and reference them with relative paths such as `assets/photo.jpg`.

## Deploy for free

- **GitHub Pages:** create a repository, upload the files to its root, then go to Settings → Pages → Deploy from a branch → `main` / `(root)`. All links are relative, so the site also works from a subpath.
- **Netlify:** drag the folder onto app.netlify.com/drop.

## Not included (requires separate work)

- **Edge-ML live inference.** The original project is Python (OpenCV, MediaPipe, TensorFlow Lite). It needs its own environment, a camera and model files. This site only simulates the behaviour.
- **AI Finance Controller backend.** The FastAPI API, React frontend, database and AI model are not running here. The dashboard is a standalone demo with fictional data.
- **Contact form delivery.** The form only validates input. To receive messages, connect a form service (for example Formspree) by setting the form's `action`.

## To confirm before publishing

- Both repository URLs were supplied in the brief. They could not be opened during the build, so the project pages have not been checked against the source code.
- Excel is listed in the brief but does not appear on the resume. Remove it from `index.html` if it does not apply.
- Review the Edge-ML workflow stages and the finance rules against the repositories, then update the wording if they differ.
