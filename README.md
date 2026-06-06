# DOI Prefix Publication Dashboard

A public static dashboard designed to visualize, search, and analyze academic publications registered under the Crossref DOI prefix `10.25077`.

Developed by: **Ikhwan Arief** ([ikhwan[at]unand.ac.id](mailto:ikhwan[at]unand.ac.id))

The dashboard provides metadata aggregations, publication metrics over time, journal distribution analytics, and advanced searching/filtering on top of registered works.

## Architecture & Data Flow

This application is built with a **static-site architecture** designed for deployment on GitHub Pages. To preserve performance and adhere to API rate limits, visitors' browser sessions do not query the Crossref API directly. Instead:

1. **Data Ingestion**: A custom Node.js script fetches works metadata from the Crossref API.
2. **Local Processing**: Works are normalized, deduplicated by DOI, sorted, and aggregated into static JSON files.
3. **Daily Automations**: A GitHub Actions workflow runs the script daily (or on-demand) to generate and save these JSON files.
4. **Build & Host**: Vite builds the static assets, and GitHub Actions deploys the compiled output and static JSON data straight to GitHub Pages.
5. **Client Rendering**: The React web app loads the static JSON data relative to the deployed base URL.

```text
Crossref REST API → GitHub Actions → static JSON files → GitHub Pages dashboard
```

## Technology Stack

- **Core**: HTML5, React, TypeScript, Tailwind CSS (v3), Lucide React
- **Bundler & Dev Server**: Vite
- **Data Visualizations**: Recharts (fully responsive bar charts)
- **Data Grid & Sorting**: TanStack Table (v8)
- **CI/CD Automation**: GitHub Actions
- **Database/Storage**: Deployed static JSON files (`public/data/*.json`)

## Crossref API Notes

- **Authentication**: The Crossref REST API **does not require** an API key, signup, username, or password.
- **Etiquette (Polite Pool)**: The fetch script implements polite headers including a custom `User-Agent` and a contact `mailto` address. Providing a contact email places requests into Crossref's "polite pool", which offers faster and more reliable response rates.
- **Pagination**: Uses Crossref's cursor pagination (`cursor=*` and `message.next-cursor`) with exponential backoff retries (handling HTTP `429`, `5xx` codes) and a request throttle delay (400ms) to ensure stability.

## Local Development

Follow these steps to run the project locally on your machine:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/doi-prefix-dashboard.git
   cd doi-prefix-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root of the project (you can copy `.env.example` as a template):
   ```env
    CROSSREF_PREFIX=10.25077
    CROSSREF_MAILTO=ikhwan[at]unand.ac.id
    CROSSREF_USER_AGENT=DOI Prefix Dashboard/1.0 (mailto:ikhwan[at]unand.ac.id)
   ```

4. **Fetch Metadata**:
   Download and compile the latest Crossref records into local JSON files:
   ```bash
   npm run fetch
   ```

5. **Start Dev Server**:
   Launch the local development environment:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173/doi-prefix-dashboard/` (or the local URL printed in the terminal).

## Build & Preview

To build the production bundle and preview it locally:

- **Build**: Compiles TypeScript and packages static assets into the `dist/` folder:
  ```bash
  npm run build
  ```
- **Preview**: Serves the compiled production bundle locally:
  ```bash
  npm run preview
  ```

## GitHub Pages Deployment

### 1. Repository Variables

For automated deployments via GitHub Actions, add the following variables under **Repository Settings → Secrets and variables → Actions → Variables**:

- `CROSSREF_MAILTO`: Your email address (e.g. `yourname@domain.ac.id`).
- `CROSSREF_USER_AGENT`: User-agent string (e.g. `DOI Prefix Dashboard/1.0 (mailto:yourname@domain.ac.id)`).

*Note: No passwords or API keys are required for Crossref.*

### 2. GitHub Pages Settings

After pushing your code to GitHub:
1. Navigate to your repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, change the option from **Deploy from a branch** to **GitHub Actions**.

The workflow in `.github/workflows/update-crossref-and-deploy.yml` will automatically build the site and deploy it to GitHub Pages on every commit, on manual trigger (`workflow_dispatch`), and automatically on a daily schedule (at 20:00 UTC).

## Crossref Cited-by Configuration

The dashboard supports displaying forward citation lists (showing which articles cite each of our prefix's works). This feature requires Crossref Cited-by account credentials:

1. **Secure Ingestion**: The Cited-by query servlet (`getForwardLinks`) is only called at build time inside GitHub Actions or local dev setups. Credentials are never written to static JSON files or exposed in frontend JavaScript.
2. **Graceful Fallback**: If Cited-by credentials are not configured, the ingestion script will run in fallback mode, generating empty citation databases, so the app still deploys and loads successfully.
3. **Repository Configuration**:
   - Add the following secrets under **Settings → Secrets and variables → Actions → Secrets**:
     - `CROSSREF_CITEDBY_USER`: Your Crossref Cited-by account username.
     - `CROSSREF_CITEDBY_PASSWORD`: Your Crossref Cited-by account password.
   - Add the following variables under **Settings → Secrets and variables → Actions → Variables** (optional):
     - `CITEDBY_START_DATE`: Query start date (defaults to `2000-01-01`).
     - `CITEDBY_END_DATE`: Query end date (defaults to `2030-12-31`).

## Data Quality & Citation Caveats

- **Metadata Completeness**: Missing titles, authors, volume/issue numbers, pages, abstracts, or dates reflect the metadata deposited to Crossref by publishers and may not represent the full publisher record. Data quality depends on publisher deposits.
- **Citation Counts**: Crossref cited-by count represents the number of citations recorded *within the Crossref network*. It is **not** the same as, and will likely differ from, citation counts displayed in Scopus, Web of Science, or Google Scholar.
