#!/usr/bin/env node
/* Usage: check-playwright-version.mjs <image-version> <package-version>
 *
 * Guards the Accessibility job: the browsers in the container image must not
 * be older than the `playwright` package driving them. An image ahead of the
 * package passes with a notice, because Renovate proposes the image tag as
 * soon as it is released while the package waits out its release-age hold.
 *
 * Both versions must be plain `major.minor.patch`; anything else fails.
 */

const VERSION = /^(\d+)\.(\d+)\.(\d+)$/;

const parse = (version) => {
  const match = VERSION.exec(version ?? "");
  return match ? match.slice(1).map(Number) : null;
};

const compare = (a, b) => {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
};

const [img, pw] = process.argv.slice(2);
const imgParts = parse(img);
const pwParts = parse(pw);

if (!imgParts || !pwParts) {
  console.log(
    `::error::cannot compare Playwright versions: image "${img ?? ""}", playwright "${pw ?? ""}" (expected major.minor.patch)`,
  );
  process.exit(1);
}

const order = compare(imgParts, pwParts);
if (order < 0) {
  console.log(
    `::error::image ships Playwright ${img}, but playwright is ${pw}; update this job's container image tag to v${pw}`,
  );
  process.exit(1);
}
if (order > 0) {
  console.log(
    `::notice::image ships Playwright ${img}, newer than playwright ${pw}; tests run with the newer browsers until the playwright package is updated`,
  );
}
