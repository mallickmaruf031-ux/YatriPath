# YatriPath transport-data importer

Run from the project folder:

    python3 tools/import_data.py            # reads data_in/, writes data/

It validates and de-duplicates the CSV files (and cross-checks the .xlsx workbook, every sheet),
rebuilds `data/yatripath.db` (SQLite, with indexes) and the browser files `data/*.js` used by the site.
Running it again with the same input gives the same result (nothing is duplicated).

## Adding more data later
Drop new or updated CSVs into `data_in/` using the same file names and columns, then re-run.
Two optional files switch on direct train and flight results (they are not in the supplied data):

- `train_routes.csv`  : train_no,train_name,src_station_code,dst_station_code,dep_time,arr_time,runs_on,distance_km
- `flight_routes.csv` : origin_iata,dest_iata,airline_iata,is_direct,stops,status,valid_from,valid_to,source_ref

Rows whose codes are not in the imported stations/airports are rejected and counted in `data/import_report.json`.
A route is shown on the website only if it exists in a route file.

## Reference fares (optional, indicative only)
`fare_reference.csv`: mode,src_id,dst_id,fare_min,fare_max,currency,class,source,as_of. Rows need a source and valid IDs. They are shown as "Indicative fare", never as a booking price.

## Sample itineraries
When there is no live provider and no verified timetable, `scripts/services/transport-search-service.js` and the files in `scripts/transport/` build clearly labelled sample itineraries
(`YP.sample`). Distances come from `geo_reference.csv`; fares and times follow fixed rules with seeded variation.
No flight or train numbers are generated, and sample operators are named "Sample ...".
