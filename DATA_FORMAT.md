# Adding study data

The app builds its vocabulary automatically from every `.json` file inside:

`data/topics/`

You do **not** edit `data/generated-vocabulary.json`; it is generated automatically before development/builds.

## Current v7 topic format

v7 supports noun topics. A topic file looks like this:

```json
{
  "topicId": "food-nouns-01",
  "title": "Food nouns",
  "level": "A1",
  "kind": "vocabulary",
  "items": [
    {
      "id": "food-01:banane",
      "type": "noun",
      "german": "Banane",
      "english": "banana",
      "article": "die",
      "plural": "Bananen"
    }
  ]
}
```

### Rules

- `id` must be a stable, unique string across **all** topic files. A good pattern is `topic-id:word`, such as `food-01:banane`.
- Never change an existing item's `id` after you have studied it; mastery/spaced-repetition history is attached to that ID.
- `type` is currently `noun`.
- `article` must be `der`, `die`, or `das`.
- Store the noun itself in `german`, without the article.
- Store the plural noun in `plural`, without `die`.
- `english` may contain a concise alternative, e.g. `card / map`.

## Workflow when you finish a new book page/topic

1. Take clear pictures of the page.
2. Send them to ChatGPT.
3. Ask for a topic JSON file for this project.
4. Put the returned `.json` file in `data/topics/`.
5. Commit and push it to GitHub.
6. GitHub Actions rebuilds the site and publishes the new material automatically.

The build validates the JSON. Duplicate IDs, missing plurals, or invalid articles will fail the build instead of silently adding bad data.

## Local check

Run:

```bash
npm run data:build
npm run dev
```

`npm run data:build` tells you how many items were loaded and reports malformed data.

## Future data types

The folder-based format is intentionally extensible. Later versions can add separate schemas/question engines for verbs, phrases and grammar while keeping the same `data/topics/` workflow.
