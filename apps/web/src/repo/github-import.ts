// ============================================================================
// Public GitHub repo importer
// Fetches a repo tree in one API call, then downloads each non-skipped file
// from raw.githubusercontent.com in parallel. Feeds RepoFile[] into the
// existing buildRepoMap pipeline so the mind-map + drill-in paths are reused.
// ============================================================================

import { classifyRepoPath, shouldSkipRepoPath, type RepoFile } from "./repo-map.js";

/**
 * Hard cap per import. Unauthenticated GitHub API allows ~60 req/hour per IP;
 * the tree call is 1 and the blob fetches go through raw.githubusercontent,
 * which is effectively un-rate-limited for public repos — but we still cap
 * so giant monorepos don't saturate the browser or the UI.
 */
const MAX_FILES = 500;
/** Biggest file we'll read into memory — anything larger is kept as a node but its contents are ignored. */
const MAX_FILE_BYTES = 256 * 1024;

export interface GitHubRepoRef {
  owner: string;
  repo: string;
  /** Branch or tag; resolved to default branch when omitted. */
  ref?: string;
}

/**
 * Parse a github.com URL (or owner/repo shorthand) into its parts. Accepts:
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo/tree/branch
 *   https://github.com/owner/repo/tree/branch/sub/path   (sub path is ignored)
 *   github.com/owner/repo
 *   owner/repo
 */
export function parseGitHubUrl(input: string): GitHubRepoRef | null {
  const trimmed = input.trim().replace(/\.git$/, "");
  if (!trimmed) return null;

  // owner/repo shorthand
  const shorthand = trimmed.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (shorthand) {
    return { owner: shorthand[1], repo: shorthand[2] };
  }

  let url: URL;
  try {
    url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
  if (!/^(www\.)?github\.com$/i.test(url.hostname)) return null;

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  const [owner, repo, ...rest] = parts;
  let ref: string | undefined;
  if (rest[0] === "tree" && rest[1]) {
    ref = rest[1];
  }
  return { owner, repo, ref };
}

interface GitHubTreeEntry {
  path: string;
  type: "blob" | "tree" | "commit";
  size?: number;
  sha: string;
}

interface GitHubTreeResponse {
  tree: GitHubTreeEntry[];
  truncated: boolean;
}

interface GitHubRepoResponse {
  default_branch: string;
}

async function resolveDefaultBranch(owner: string, repo: string): Promise<string> {
  const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!resp.ok) {
    throw new Error(`GitHub repo lookup failed (${resp.status}): ${owner}/${repo}`);
  }
  const data = (await resp.json()) as GitHubRepoResponse;
  return data.default_branch;
}

async function fetchTree(
  owner: string,
  repo: string,
  ref: string,
): Promise<GitHubTreeResponse> {
  const resp = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(ref)}?recursive=1`,
    { headers: { Accept: "application/vnd.github+json" } },
  );
  if (!resp.ok) {
    throw new Error(`GitHub tree fetch failed (${resp.status}): ${owner}/${repo}@${ref}`);
  }
  return (await resp.json()) as GitHubTreeResponse;
}

async function fetchBlob(
  owner: string,
  repo: string,
  ref: string,
  path: string,
): Promise<string> {
  // raw.githubusercontent is not subject to the 60/hr API limit and serves
  // arbitrary text without any extra auth for public repos.
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(ref)}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
  const resp = await fetch(url);
  if (!resp.ok) return "";
  return await resp.text();
}

export interface FetchGitHubRepoResult {
  files: RepoFile[];
  /** True when GitHub truncated the tree response (very large repos). */
  truncated: boolean;
  /** True when we hit `MAX_FILES` and stopped adding more. */
  capped: boolean;
  ref: string;
}

/**
 * Walk a public GitHub repo into a `RepoFile[]` compatible with
 * `buildRepoMap`. Only code-ish files are pulled down; binary/cruft is
 * either skipped entirely or kept as an empty-content node.
 */
export async function fetchGitHubRepo(
  urlOrRef: string | GitHubRepoRef,
): Promise<FetchGitHubRepoResult> {
  const parsed = typeof urlOrRef === "string" ? parseGitHubUrl(urlOrRef) : urlOrRef;
  if (!parsed) throw new Error("Not a valid GitHub URL or owner/repo.");

  const { owner, repo } = parsed;
  const ref = parsed.ref ?? (await resolveDefaultBranch(owner, repo));
  const tree = await fetchTree(owner, repo, ref);

  // Keep blobs only; drop submodules (`commit`) and directories (`tree`).
  const candidates = tree.tree.filter((e) => e.type === "blob" && !shouldSkipRepoPath(e.path));

  let capped = false;
  const picked = candidates.slice(0, MAX_FILES);
  if (candidates.length > MAX_FILES) capped = true;

  // Download in parallel but bounded — Chrome's default max concurrent
  // fetches per origin sits around 6, so 32 is fine and keeps tail latency
  // roughly sqrt(N) instead of N.
  const out: RepoFile[] = new Array(picked.length);
  const BATCH = 32;
  for (let i = 0; i < picked.length; i += BATCH) {
    const slice = picked.slice(i, i + BATCH);
    const batch = await Promise.all(
      slice.map(async (entry, j): Promise<{ idx: number; file: RepoFile }> => {
        const kind = classifyRepoPath(entry.path);
        let content = "";
        // Only pull bodies for code files we might actually parse. Keeping
        // other files as empty nodes preserves folder structure without
        // blowing memory on images, binaries, etc.
        if (kind !== "other" && (entry.size ?? 0) <= MAX_FILE_BYTES) {
          try {
            content = await fetchBlob(owner, repo, ref, entry.path);
          } catch {
            content = "";
          }
        }
        return { idx: i + j, file: { path: entry.path, content, kind } };
      }),
    );
    for (const b of batch) out[b.idx] = b.file;
  }

  return { files: out, truncated: tree.truncated, capped, ref };
}
