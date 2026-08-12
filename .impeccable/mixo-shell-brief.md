# Mixo shared application shell

## Scope and mode

- Scope: authenticated web shell shared by client, coiffeur and administrator surfaces.
- Mode: Operate.
- Primary target: `frontend/src/main.js` and `frontend/src/components/navbars/NavbarLayout.js`.
- Approved comp: `.impeccable/mocks/mixo-shell-action-first.png`.

## Audience, job and action

- Mobile-first users need to identify their role, current task and next action without training.
- Client focus: discover or book a service and track the next appointment.
- Coiffeur focus: act on the next appointment and reach services, hours, invoices and messages.
- Administrator focus: act on the next validation or anomaly and reach dense management surfaces.

## Constraints

- Preserve routes, API calls, data models and authentication behavior.
- Keep Mixo and FC/CDF terminology.
- Five primary mobile destinations maximum; secondary routes and logout remain reachable from the profile sheet.
- Desktop uses a persistent left rail; mobile uses a compact top app bar and fixed bottom navigation.
- Motion uses CSS keyframes and respects `prefers-reduced-motion`.

## Chosen direction and memorable moment

- Direction: **Fiche de prestation**.
- Composition: **Action prioritaire**.
- Memorable moment: the current task reads like a precise salon work sheet with a cobalt index edge and one unmistakable primary action.
- Generated comp content is illustrative only; production renders real API data and does not copy invented names or dates.

## Implementation fidelity inventory

| Ingredient | Commitment | Medium |
| --- | --- | --- |
| Top app bar | 64px compact bar, Mixo wordmark, utilities and profile trigger | Semantic HTML + Lucide icons |
| Mobile navigation | Five labeled destinations, active top rule, 44px targets, safe-area padding | Semantic `nav` + buttons/links + CSS |
| Desktop navigation | Persistent 248px rail with all role routes, current-page marker and logout | Semantic HTML + CSS |
| Priority work sheet | Matte surface, 1px rules, 4px cobalt index edge, one dominant action | Semantic HTML + CSS |
| Status language | Small explicit label with icon and restrained semantic color | HTML + CSS tokens |
| Typography | Workhorse system sans, strong 1.75–2rem task title, 1rem body, .75rem metadata | CSS type tokens |
| Primary action | Solid cobalt, minimum 48px, direct verb, visible loading state | Button + CSS + existing handlers |
| Loading | Branded boot screen, route progress and reusable skeleton/spinner | HTML + CSS keyframes + router JS |
| Photography | Existing API/service/profile images only; no generated image ships as user content | Existing raster assets/API URLs |
| Motion | One staged page entrance, route progress and pressed states | CSS `@keyframes` + transitions |

## Responsive rules

- 0–767px: mobile app bar and bottom navigation; content clears both fixed regions.
- 768–1099px: compact navigation rail where space permits; dense tables become card/list views in migrated screens.
- 1100px+: full rail, bounded content width and two-column task/detail layouts where useful.

## Unresolved decisions

- None for the shared shell. Individual dense admin tables will receive route-specific migration briefs when rebuilt.
