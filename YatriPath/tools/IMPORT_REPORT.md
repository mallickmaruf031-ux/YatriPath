# YatriPath transport database: import report
Source: YatriPath_Transport_Database (xlsx, 14 sheets, none hidden), the 11 CSV exports and the PDF (data as of 11 Nov 2026).
The workbook and CSV files match row for row on all 10 data sheets. The PDF tables match them too (124 airports, 146 stations, 43 terminals).

| Item | Count |
|---|---|
| Railway stations | 146 |
| Airports (India / international destinations / total) | 124 / 64 / 188 |
| Bus terminals + boarding points | 43 + 2 |
| Cities / states-UTs / countries | 232 / 36 / 41 |
| Airlines | 44 |
| Verified bus routes | 10 |
| Verified train routes | 0 (no train timetable or route data supplied) |
| Verified flight routes | 0 (no flight route data supplied) |
| International rail service records | 8 (bookable now: 0) |
| Duplicate records | 0 |
| Data-quality flags | 14: {'rail_division_unverified_or_blank': 6, 'airport_missing_icao': 8} |

Tables: countries, states_ut, cities, railway_stations, airports, bus_stations, bus_boarding_points, bus_routes, railway_routes, intl_railway_services, train_service_types, airlines, flight_routes, transport_operators, ticket_classes, data_sources, import_log.
Indexes: city, station, airport and terminal names; route source and destination.

Bus terminals named only in the route file (stored as boarding points, not permanent terminals): Durgapur City bus stand (operator-specific), Shillong Police Bazar area (operator-specific).

Approximate coordinates: 181 of 232 cities (from data_in/geo_reference.csv, added by YatriPath, not in the supplied files). Others fall back to the state centre.
Reference fares imported: 0.
