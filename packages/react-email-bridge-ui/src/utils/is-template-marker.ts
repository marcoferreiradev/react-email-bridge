/**
 * Recognises whether an attribute value (href, src, alt, etc) is actually
 * a template marker that gets filled at send time on the destination platform.
 *
 * Without this, the email validation checks (link reachability, image fetch,
 * alt-text presence) emit false-positive errors because `{{trackingUrl}}`
 * isn't a valid URL until the platform interpolates it.
 *
 * Patterns covered:
 * - Handlebars / Liquid output: `{{ x.y }}`
 * - Liquid block tags: `{% if user.admin %}`
 * - Mailchimp merge tags: `*|FNAME|*`
 *
 * A value is considered "dynamic" if it contains at least one marker — even
 * if the marker is part of a longer string (`https://cdn/{{slug}}.jpg` is
 * still dynamic).
 */
const MARKER_PATTERNS: RegExp[] = [
  /\{\{[\s\S]*?\}\}/,
  /\{%\s*[\s\S]*?\s*%\}/,
  /\*\|[A-Z0-9_:]+\|\*/,
];

export function isTemplateMarker(value: string | undefined | null): boolean {
  if (!value) return false;
  return MARKER_PATTERNS.some((p) => p.test(value));
}
