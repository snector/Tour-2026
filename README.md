# Sonar Trails — Jaisalmer Tour Bookings

Jaisalmer tour website with commission-based bookings and 5 travel blogs.

## Features

- Full-bleed desert hero landing page (**Sonar Trails**)
- 3 curated tour packages with visible commission rates (12–20%)
- Booking form → local ledger + WhatsApp lead handoff
- 5 SEO-friendly blogs under `/blogs`

## Run locally

```bash
# any static server, e.g.
python3 -m http.server 8080
```

Open `http://localhost:8080`

## Setup WhatsApp number

In `index.html`, update the form attribute:

```html
<form ... data-whatsapp="91XXXXXXXXXX">
```

Use country code without `+`.

## Commission rates

| Package           | Rate |
|-------------------|------|
| Golden Fort Day   | 12%  |
| Desert Overnight  | 15%  |
| 3-Day Heritage    | 18%  |
| Custom Private    | 20%  |
