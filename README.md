# Gama Travel & Tour Agency: website redesign prototype

A three-page concept for https://www.gamatour.agency/, built to show the agency what a modern,
conversion-focused site could look like. Static HTML, CSS and vanilla JavaScript: no build step,
no dependencies, no API keys.

## Pages
| File | Page |
| --- | --- |
| `index.html` | Homepage: hero, trip finder, about, destination index, featured tours, services, why Gama, gallery, trip-planning form |
| `tours.html` | Tours & destinations: all 14 published tours with style chips and length filter (shareable via URL hash, e.g. `tours.html#primates--short`) |
| `tour.html#<slug>` | Tour detail: facts bar, overview, highlights, day-by-day itinerary, gallery, good-to-know, sticky enquiry card, enquiry form, related tours. Default: `#volcanoes-gorillas` |

## Run locally
Any static server works. From this folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```
(or `npx serve .`). Opening `index.html` directly also works in most browsers.

Photos are loaded from Gama's own website (`gamatour.agency/wp-content/uploads/…`), so you need an
internet connection. If a photo can't load, an illustrated "thousand hills" landscape appears instead.

## Structure
```
index.html, tours.html, tour.html   page markup (semantic HTML, per-page titles & descriptions)
css/styles.css                      design tokens + all components (light & dark themes)
js/data.js                          tour catalogue + verified company details (single source of truth)
js/scenes.js                        illustrated image fallbacks
js/site.js                          header, mobile menu, image loading, tour cards, form validation
js/home.js, tours-page.js, tour-page.js   page-specific behaviour
```
To add or edit a tour, change `js/data.js`; cards, filters and detail pages update automatically.

## Content sources
Tour titles, itineraries, highlights, group sizes, contact details and the Akagera price
(“From US$390 pp, 2 sharing”) are taken from the current gamatour.agency pages (Nov 2026).
Anything not published there is shown as “To be confirmed” or marked as a placeholder.
