# Put this project on GitHub + GitHub Pages

## 1. Create the repository

Create a new GitHub repository, for example:

`deutsch-trainer`

A public repository works with GitHub Pages on GitHub Free.

## 2. Push the project

From this project folder:

```bash
git init
git add .
git commit -m "Initial Deutsch Trainer"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/deutsch-trainer.git
git push -u origin main
```

If you already created/cloned the repository, just copy the project files into it, commit and push.

## 3. Turn on Pages

In the GitHub repository:

1. Open **Settings**.
2. Open **Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Go to the **Actions** tab and watch **Deploy to GitHub Pages**.

The included workflow builds the Next.js static export and deploys the `out/` folder.

For a normal project repository, the URL will look like:

`https://YOUR-USERNAME.github.io/deutsch-trainer/`

## 4. Future updates

Edit code or add a JSON file to `data/topics/`, then:

```bash
git add .
git commit -m "Add new German topic"
git push
```

Every push to `main` automatically rebuilds and redeploys the website.

## Important: study progress

Progress currently lives in browser `localStorage`.

Your `localhost` progress does not automatically transfer to the GitHub Pages domain because browsers isolate storage by website origin. Once you study on the GitHub Pages URL, future code/data deployments at that same URL should keep that browser's progress.
