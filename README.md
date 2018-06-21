# demo-livedata-citybike-Oslo
Displaying live citybike data by pulling geojson every N second. Javascript: Leaflet, realtime. Super-simple python backend  

# Frontend - map

![Realtime Oslo citybike map](./figures/leaflet_realtime_citybike_map.png "Citybike map")

Bike stations are shown as bike and locks symbols. Orange means 3 or fewer bikes or locks, red = none, and green > 3 available.

[Leaflet](https://leafletjs.com/) Javascript map client augmented with [leaflet-realtime](https://github.com/perliedman/leaflet-realtime) for updating the data every N second. (N = 20 seconds in current implementation). This is done by http get to a geojson file which resides at our backend.



# Backend

Current implementation is python flask app run at pythonanywhere, but can run on any machine with python >= 3.4 able to serve files on internet with appropriate CORS header.

### Pulling data from oslobysykkel.no

The script `pythonbackend/bysykkeloslo.py` runs an infinite loop fetching data from https://developer.oslobysykkel.no/ . We have a merge process, where presumably static data with station locations (pulled once) are merged with fresh status updates (pulled every 15th second).

I have implemented the tips from https://help.pythonanywhere.com/pages/LongRunningTasks/ to keep the process running smoothly. Only one instance of this script can run at any time. Every hour we try to start it - which either fails (which is fine, one process is running), or succeeds. If (or rather, when -- see next paragraph) the process crashes the data won't be updated until the next hour.

### Production hardening

There is absolutely NO input validation. The process WILL CRASH if the next REST GET operation does not go through or return incomplete data. Battle hardening with appropriate tests is straightforward, but left as exercise to the reader.

Another option is to delete the while-loop and just run the script once every N second. 

### Debugging

The script `debug_bysykkeloslo.py` will read the specific geojson-file, modify the number of available locks and bicycles and write back again. Infinite while-loop, process is repeated every 17th second.
