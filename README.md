# YatriPath

YatriPath is a front-end travel booking website for **Flights, Trains and Buses** (college Software Engineering project).

> **Academic prototype.** There is no server and no live provider. Where no live or verified data exists, search results are labelled **Sample**, bookings are **sample bookings** and payment is **simulated** (no money is charged). Nothing here issues a real ticket. Real payment and a customer-support system are not part of this version.

## Run it
No installation and no build step. Open `index.html` in Chrome, Edge or Firefox.
(An internet connection is only needed for the online photos and fonts.)

## Project structure
```
YatriPath/
├── index.html                  The only HTML page. Loads the styles and scripts below.
├── assets/logo/                Logo
├── styles/                     One CSS file per feature
│   ├── base.css                Colours, reset, typography, page layout helpers
│   ├── components.css          Buttons, cards, tags, form fields, popups, toasts
│   ├── navigation.css          Header, logo, menu, notifications, footer
│   ├── home.css                Home page and search box
│   ├── location-search.css     From / To autocomplete
│   ├── search-results.css      Results page and result cards
│   ├── booking.css             Booking steps, identity boxes, seat map, fare box
│   ├── my-bookings.css        My Bookings page
│   ├── ticket.css              View Ticket page and print rules
│   ├── login-signup.css        Login / Sign Up popup
│   └── info-pages.css          About Us, Terms, Privacy
├── scripts/
│   ├── core/                   Shared basics: helpers, transport names, icons, images, app state, router
│   ├── services/               Data and search engine (transport-search-service.js, live-providers.js)
│   ├── components/             Reusable parts: location-autocomplete.js, navigation.js
│   ├── transport/              ONE FOLDER PER TRANSPORT TYPE
│   │   ├── bus/                bus-search-results.js, bus-booking.js, bus-sample-itineraries.js
│   │   ├── train/              train-search-results.js, train-booking.js, train-sample-itineraries.js
│   │   └── flight/             flight-search-results.js, flight-booking.js, flight-sample-itineraries.js
│   ├── pages/                  One folder per page
│   │   ├── home/               home.js, home-data.js
│   │   ├── search-results/     search-results.js, search-result-cards.js
│   │   ├── booking/            booking-flow.js, booking-fares.js, passenger-identity.js
│   │   ├── my-bookings/        my-bookings.js
│   │   ├── ticket/             view-ticket.js
│   │   ├── profile/            profile.js
│   │   ├── support/            support.js
│   │   ├── info-pages/         info-pages.js
│   │   └── login/              login-signup.js
│   └── main.js                 Start-up (runs last)
├── data/                       Transport data used by the website (generated, do not edit by hand)
├── data_in/                    Source files (CSV, Excel, PDF) that data/ is built from
└── tools/                      Import script and reports
```
The scripts are plain `<script>` files loaded in a fixed order (see the bottom of `index.html`). If you add a new script file, add its `<script>` line there, before `scripts/main.js`.

## Where do I change...?
| I want to change | Edit this |
|---|---|
| **Bus booking** (ID rules, seats, charges) | `scripts/transport/bus/bus-booking.js` |
| **Bus result card** (what a bus result shows, category filter) | `scripts/transport/bus/bus-search-results.js` |
| **Bus sample times and fares** | `scripts/transport/bus/bus-sample-itineraries.js` |
| **Train booking** (Tatkal, IRCTC account rule, ID list, seats) | `scripts/transport/train/train-booking.js` |
| **Train result card** (class buttons, class filter) | `scripts/transport/train/train-search-results.js` |
| **Train sample times and fares** | `scripts/transport/train/train-sample-itineraries.js` |
| **Flight booking** (domestic vs international ID, DigiYatra, seat fee) | `scripts/transport/flight/flight-booking.js` |
| **Flight result card** | `scripts/transport/flight/flight-search-results.js` |
| **Flight sample times and fares** | `scripts/transport/flight/flight-sample-itineraries.js` |
| Booking steps shared by all (passengers, payment step, confirmation) | `scripts/pages/booking/booking-flow.js` |
| Fare breakdown, promo codes | `scripts/pages/booking/booking-fares.js` |
| **My Bookings** | `scripts/pages/my-bookings/my-bookings.js` + `styles/my-bookings.css` |
| **View Ticket** | `scripts/pages/ticket/view-ticket.js` + `styles/ticket.css` |
| **Navigation** (header, menu, footer) | `index.html` (markup), `scripts/components/navigation.js`, `styles/navigation.css` |
| Home page | `scripts/pages/home/home.js`, `home-data.js` (destinations, offers) + `styles/home.css` |
| Results page (shared by all types) | `scripts/pages/search-results/` + `styles/search-results.css` |
| From / To search boxes | `scripts/components/location-autocomplete.js` + `styles/location-search.css` |
| Common styling (colours, fonts, buttons, cards) | `styles/base.css`, `styles/components.css` |
| About, Terms, Privacy text | `scripts/pages/info-pages/info-pages.js` |
| Plug in a live flight/train/bus provider | `scripts/services/live-providers.js` |
| Photos | `scripts/core/images.js` (the `PH` list) |

### Adding a new transport type (for example Ferry)
1. Add its name in `scripts/core/transport-types.js` (`MODES`, `TRANSPORT`, `PLU`, `SUB`).
2. Create `scripts/transport/ferry/` with the three files, copying the bus ones as a starting point.
3. Add the `<script>` lines to `index.html`.
4. Add its locations to the data (see `tools/README.md`).

## Data
Built from the supplied YatriPath transport database: 146 railway stations, 188 airports, 45 bus terminals and boarding points, 10 bus routes, 8 international rail service records. It has **no train or flight routes, timetables or fares**.
To rebuild `data/` after changing `data_in/` (Python 3 and `pip install openpyxl`):
```
python3 tools/import_data.py
```
See `tools/README.md` and `tools/IMPORT_REPORT.md`.

## Limitations
- Live flight, train and bus data, real fares, seat availability and ticket issuing need authorised provider access.
- Real Aadhaar authentication and real payment need authorised services. YatriPath never authenticates Aadhaar.
- Bookings are saved only in your browser (localStorage).
- IRCTC rules change. Check current rules before relying on them.
