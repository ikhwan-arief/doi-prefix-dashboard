# Antigravity Instructions: Add Citing Articles Modal for DOI Prefix 10.25077

## Project Context

You are working on the existing `doi-prefix-dashboard` GitHub Pages project.

The current application already displays Crossref publication metadata for DOI prefix:

```text
10.25077
```

The current app has:

```text
Article table
Article detail modal or popup
Static JSON data files
GitHub Pages deployment
GitHub Actions data update workflow
```

Add a new feature that shows **which articles cite each article** inside the existing article detail modal.

## Main Goal

For every article in DOI prefix `10.25077`, the dashboard should show citing articles inside the article detail modal.

When a user clicks an article and opens the modal, add a new section or tab:

```text
Citing Articles
```

This section must show the articles that cite the selected DOI.

## Important Data Source

Use **Crossref Cited-by**, not the public Crossref REST API, for the citing article list.

Crossref Cited-by endpoint pattern:

```text
https://doi.crossref.org/servlet/getForwardLinks
```

The public Crossref REST API can provide `is-referenced-by-count`, but it does not provide the complete public list of citing articles. The citing article list requires Crossref Cited-by credentials.

## Security Requirements

Use credentials only from environment variables or GitHub Secrets.

Never put Crossref Cited-by username or password in:

```text
source code
README
frontend JavaScript
public/data/*.json
Git commit history
GitHub Pages output
console logs
error logs
browser requests
```

Use GitHub Secrets:

```text
CROSSREF_CITEDBY_USER
CROSSREF_CITEDBY_PASSWORD
```

Use GitHub repository variables:

```text
CROSSREF_PREFIX=10.25077
CROSSREF_MAILTO=<maintainer-email>
CROSSREF_USER_AGENT=DOI Prefix Dashboard/1.0 (mailto:<maintainer-email>)
CITEDBY_START_DATE=2000-01-01
CITEDBY_END_DATE=2030-12-31
```

If `CITEDBY_START_DATE` and `CITEDBY_END_DATE` are not set, use:

```text
2000-01-01
2030-12-31
```

Do not ask for or store the password in chat. Ask the user to add credentials through GitHub Secrets.

## Architecture

The app is hosted on GitHub Pages, so do not call Crossref Cited-by directly from the browser.

Correct architecture:

```text
GitHub Actions
→ Crossref Cited-by getForwardLinks
→ parse XML
→ enrich citing DOI metadata using Crossref REST API /works/{doi}
→ generate static JSON files
→ build Vite app
→ deploy to GitHub Pages
→ article modal reads static JSON
```

## Required New Files

Add these files:

```text
scripts/fetch-citedby.mjs
src/lib/citations.ts
```

Generate these static JSON files:

```text
public/data/citations.json
public/data/citation-index.json
public/data/citing-journals.json
public/data/citation-summary.json
```

## Required Dependencies

Add XML parsing dependency:

```bash
npm install fast-xml-parser
```

If useful, add a small concurrency control dependency:

```bash
npm install p-limit
```

Do not use backend server dependencies.

## package.json Changes

Add these scripts:

```json
{
  "scripts": {
    "fetch:citedby": "node scripts/fetch-citedby.mjs",
    "fetch:all": "npm run fetch && npm run fetch:citedby"
  }
}
```

If an existing `fetch` script already fetches Crossref article metadata, keep it and add the new scripts without breaking the existing app.

## Crossref Cited-by Fetch Script

Create:

```text
scripts/fetch-citedby.mjs
```

The script must:

1. Read `CROSSREF_CITEDBY_USER` from environment variables.
2. Read `CROSSREF_CITEDBY_PASSWORD` from environment variables.
3. Read `CROSSREF_PREFIX`, defaulting to `10.25077`.
4. Read `CITEDBY_START_DATE`, defaulting to `2000-01-01`.
5. Read `CITEDBY_END_DATE`, defaulting to `2030-12-31`.
6. Call Crossref Cited-by `getForwardLinks`.
7. Use `doi=10.25077` to retrieve forward links for the prefix.
8. Parse the XML response.
9. Extract cited DOI and citing DOI pairs.
10. Normalize all DOIs to lowercase.
11. Deduplicate citation pairs by `citedDoi + citingDoi`.
12. Enrich citing DOI metadata using Crossref REST API `/works/{doi}` where possible.
13. Create static JSON files in `public/data`.
14. Never print the password or full request URL to logs.
15. Exit with non-zero code if credential variables are missing, unless graceful fallback is enabled.

## Crossref Cited-by Request Pattern

Use a URL object and query parameters. Do not log the final URL.

Pseudo-code:

```js
const url = new URL("https://doi.crossref.org/servlet/getForwardLinks");

url.searchParams.set("usr", process.env.CROSSREF_CITEDBY_USER);
url.searchParams.set("pwd", process.env.CROSSREF_CITEDBY_PASSWORD);
url.searchParams.set("doi", process.env.CROSSREF_PREFIX || "10.25077");
url.searchParams.set("startDate", process.env.CITEDBY_START_DATE || "2000-01-01");
url.searchParams.set("endDate", process.env.CITEDBY_END_DATE || "2030-12-31");
```

Important:

```text
Do not console.log(url.toString()).
```

If the request fails, show only:

```text
Crossref Cited-by request failed. Check credentials, prefix, date range, or Crossref availability.
```

## Citation Data Model

Create this TypeScript type in:

```text
src/lib/types.ts
```

or in a new file:

```text
src/lib/citations.ts
```

```ts
export type CitationRecord = {
  citedDoi: string;
  citedTitle?: string;
  citedJournal?: string;
  citedYear?: number;

  citingDoi: string;
  citingDoiUrl: string;
  citingTitle?: string;
  citingJournal?: string;
  citingPublisher?: string;
  citingYear?: number;
  citingType?: string;
  citingAuthors?: string[];
  citingVolume?: string;
  citingIssue?: string;
  citingPage?: string;

  citationMatchDate?: string;
  source: "Crossref Cited-by";
};
```

## Output JSON Format

### `public/data/citations.json`

This file must contain all citation pairs.

```json
[
  {
    "citedDoi": "10.25077/example-cited",
    "citedTitle": "Cited article title",
    "citedJournal": "Journal inside prefix 10.25077",
    "citedYear": 2020,
    "citingDoi": "10.xxxx/example-citing",
    "citingDoiUrl": "https://doi.org/10.xxxx/example-citing",
    "citingTitle": "Citing article title",
    "citingJournal": "Citing journal name",
    "citingPublisher": "Citing publisher",
    "citingYear": 2024,
    "citingType": "journal-article",
    "citingAuthors": ["Author One", "Author Two"],
    "citationMatchDate": "2026-01-01",
    "source": "Crossref Cited-by"
  }
]
```

### `public/data/citation-index.json`

This file must be optimized for modal lookup by cited DOI.

Use object keys as cited DOI.

```json
{
  "10.25077/example-cited": [
    {
      "citingDoi": "10.xxxx/example-citing",
      "citingDoiUrl": "https://doi.org/10.xxxx/example-citing",
      "citingTitle": "Citing article title",
      "citingJournal": "Citing journal name",
      "citingPublisher": "Citing publisher",
      "citingYear": 2024,
      "citingType": "journal-article",
      "citingAuthors": ["Author One", "Author Two"],
      "citationMatchDate": "2026-01-01",
      "source": "Crossref Cited-by"
    }
  ]
}
```

### `public/data/citing-journals.json`

Aggregate citing journals.

```json
[
  {
    "citingJournal": "Journal Name",
    "count": 10
  }
]
```

### `public/data/citation-summary.json`

```json
{
  "prefix": "10.25077",
  "source": "Crossref Cited-by",
  "totalCitationPairs": 0,
  "totalCitedArticlesWithCitations": 0,
  "totalUniqueCitingDois": 0,
  "totalUniqueCitingJournals": 0,
  "startDate": "2000-01-01",
  "endDate": "2030-12-31",
  "lastSync": "2026-06-06T00:00:00.000Z"
}
```

## Enrich Citing DOI Metadata

For each `citingDoi`, call:

```text
https://api.crossref.org/works/{citingDoi}
```

Add these query/header details:

```text
mailto=<maintainer-email>
User-Agent=<configured user agent>
```

Extract:

```text
title
container-title
publisher
year
type
author
volume
issue
page
URL
```

Use safe fallback values if metadata is missing.

If enrichment fails for one DOI, do not fail the whole script. Keep a citation record with DOI only.

Add delay or low concurrency to avoid stressing Crossref:

```text
concurrency: 3 to 5
delay between batches: 300 ms
```

## XML Parsing Notes

The Crossref Cited-by response is XML.

Use `fast-xml-parser`.

The exact XML structure may vary, so write parser logic defensively.

The parser must search recursively for:

```text
cited DOI
citing DOI
citation match date if available
```

If the exact XML node names are not obvious from one sample response, log a sanitized sample of element names only, not credentials.

Never log the request URL.

## Update Existing GitHub Actions Workflow

Find the existing workflow:

```text
.github/workflows/update-crossref-and-deploy.yml
```

or equivalent.

Update it so it runs:

```bash
npm run fetch:all
```

instead of only:

```bash
npm run fetch
```

Add environment variables:

```yaml
env:
  CROSSREF_PREFIX: "10.25077"
  CROSSREF_MAILTO: ${{ vars.CROSSREF_MAILTO }}
  CROSSREF_USER_AGENT: ${{ vars.CROSSREF_USER_AGENT }}
  CITEDBY_START_DATE: ${{ vars.CITEDBY_START_DATE }}
  CITEDBY_END_DATE: ${{ vars.CITEDBY_END_DATE }}
  CROSSREF_CITEDBY_USER: ${{ secrets.CROSSREF_CITEDBY_USER }}
  CROSSREF_CITEDBY_PASSWORD: ${{ secrets.CROSSREF_CITEDBY_PASSWORD }}
```

The workflow must fail early with a clear message if Cited-by secrets are missing.

Optional behavior:

If the user wants the publication dashboard to still deploy even without Cited-by credentials, allow graceful fallback:

```text
Generate empty citation JSON files and show "Cited-by data is not configured yet."
```

Prefer graceful fallback for public deployment.

## Update Article Detail Modal

Modify the existing article detail modal or popup component.

Likely file:

```text
src/components/ArticleDetailModal.tsx
```

Add a new section or tab:

```text
Citing Articles
```

For the selected article:

```ts
const citedDoi = article.doi.toLowerCase();
const citingArticles = citationIndex[citedDoi] || [];
```

Display:

```text
Crossref Cited-by: N citing articles found
```

If `citingArticles.length === 0`, show:

```text
No citing articles found in Crossref Cited-by for this DOI.
```

Also show a small caveat:

```text
Crossref Cited-by reflects citation links matched from deposited references. It may differ from Scopus, Web of Science, SINTA, Google Scholar, or Dimensions.
```

## Modal Table Requirements

Inside the modal, show a compact table with columns:

```text
Year
Citing article
Citing journal
Authors
DOI
Type
Action
```

Action:

```text
Open DOI
```

Each citing DOI link must open:

```text
https://doi.org/{citingDoi}
```

Use:

```html
target="_blank"
rel="noopener noreferrer"
```

For mobile view, make the table responsive. If table is too wide, use cards on small screens.

## Optional Search Inside Modal

Add a small search input inside the `Citing Articles` section.

Search across:

```text
citingTitle
citingJournal
citingDoi
citingAuthors
citingPublisher
citingYear
```

## Add Citation Count to Article Table

If `citation-index.json` is available, add a column to the main article table:

```text
Citing articles
```

This count should use:

```ts
citationIndex[article.doi.toLowerCase()]?.length || 0
```

Do not replace `is-referenced-by-count`. Instead, display both if both are available:

```text
Crossref count
Matched citing articles
```

Label them clearly because they may differ.

## Frontend Data Loading

Add citation JSON loading to the existing data loader.

Example:

```ts
const base = import.meta.env.BASE_URL;

const citationIndex = await fetch(`${base}data/citation-index.json`)
  .then((res) => res.ok ? res.json() : {})
  .catch(() => ({}));

const citationSummary = await fetch(`${base}data/citation-summary.json`)
  .then((res) => res.ok ? res.json() : null)
  .catch(() => null);
```

The app must still work if citation files are missing.

## UI Copy

Use these labels:

```text
Citing Articles
Crossref Cited-by
Citing articles found
Open DOI
No citing articles found in Crossref Cited-by for this DOI.
```

Use this caveat text:

```text
Crossref Cited-by reflects citation links matched from references deposited to Crossref. It may differ from Scopus, Web of Science, SINTA, Google Scholar, or Dimensions.
```

## README Update

Update `README.md` with a new section:

```text
Crossref Cited-by
```

Explain:

1. The dashboard can show citing articles for each DOI.
2. This requires Crossref Cited-by credentials.
3. Credentials must be stored as GitHub Secrets.
4. Required secrets:
   - `CROSSREF_CITEDBY_USER`
   - `CROSSREF_CITEDBY_PASSWORD`
5. Optional repository variables:
   - `CITEDBY_START_DATE`
   - `CITEDBY_END_DATE`
6. Cited-by data is fetched only in GitHub Actions or local environment.
7. Credentials are never exposed to GitHub Pages visitors.

Do not include real credentials in README.

## Local Development Instructions

Support local testing with environment variables.

Example:

```bash
export CROSSREF_PREFIX="10.25077"
export CROSSREF_MAILTO="admin@example.ac.id"
export CROSSREF_USER_AGENT="DOI Prefix Dashboard/1.0 (mailto:admin@example.ac.id)"
export CROSSREF_CITEDBY_USER="your-crossref-citedby-user"
export CROSSREF_CITEDBY_PASSWORD="your-crossref-citedby-password"
export CITEDBY_START_DATE="2000-01-01"
export CITEDBY_END_DATE="2030-12-31"

npm run fetch:all
npm run dev
```

Do not put real credentials in committed `.env` files.

## Acceptance Criteria

The feature is complete when:

1. `scripts/fetch-citedby.mjs` exists.
2. Cited-by credentials are read only from environment variables or GitHub Secrets.
3. No credential appears in source code, README, JSON output, or logs.
4. The script calls Crossref Cited-by for prefix `10.25077`.
5. The script parses XML response.
6. The script extracts citing DOI to cited DOI relationships.
7. The script deduplicates citation pairs.
8. The script enriches citing DOI metadata through Crossref REST API where possible.
9. The script generates:
   - `public/data/citations.json`
   - `public/data/citation-index.json`
   - `public/data/citing-journals.json`
   - `public/data/citation-summary.json`
10. The GitHub Actions workflow runs `npm run fetch:all`.
11. The deployed GitHub Pages site still works without backend.
12. The existing article detail modal has a `Citing Articles` section or tab.
13. The modal shows citing articles for the selected DOI.
14. The modal shows a clear empty state when no citing articles are found.
15. Each citing DOI can be opened through `https://doi.org/{doi}`.
16. The modal works on mobile, tablet, and desktop.
17. The main article table optionally shows a citing article count.
18. README explains how to configure Crossref Cited-by safely.
19. The app builds successfully with `npm run build`.
20. The feature works after deployment to GitHub Pages.

## Final Instruction

Implement this feature carefully in the existing app.

Do not expose credentials.

Do not call Crossref Cited-by from the browser.

Use GitHub Actions or local scripts to generate static citation JSON files.

Show the citing articles inside the existing article modal or popup.
