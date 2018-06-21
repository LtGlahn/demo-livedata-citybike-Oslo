#!/usr/bin/python3
# coding: utf-8

## IMPORTANT! NOT PRODUCTION ROBUSTIFIED
## In particular, the requests.get should be within a try - clause
## to make it robust for network or API hickups. Right now it will CRASH
## unless the API behaves PERFECT every single time.
##
##  A better approach: Get rid of the while loop and just run the script every 10.5
##   second or so.

## This is the recommended practice for keeping stuff running at
## pythonanywhere.com
import logging
import socket
import sys

lock_socket = None  # we want to keep the socket open until the very end of
                    # our script so we use a global variable to avoid going
                    # out of scope and being garbage-collected

def is_lock_free():
    global lock_socket
    lock_socket = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
    try:
        lock_id = "jansimple.bysykkel0101"   # this should be unique. using your username as a prefix is a convention
        lock_socket.bind('\0' + lock_id)
        logging.debug("Acquired lock %r" % (lock_id,))
        return True
    except socket.error:
        # socket already locked, task must already be running
        logging.info("Failed to acquire lock %r" % (lock_id,))
        return False

if not is_lock_free():
    sys.exit()

# # then, either include the rest of your script below,
# # or import it, if it's in a separate file:
# # from my_module import my_long_running_process
# my_long_running_process()




import requests
import json
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
import time




# https://developer.oslobysykkel.no/
headers = { 'Client-Identifier' : 'My secret key'}
url = 'https://oslobysykkel.no/api/v1/stations'


# # Henter bysykkel-stasjoner


r = requests.get( url, headers=headers)
r2 = r.json()
temp1 = pd.DataFrame.from_dict(r2['stations'])
stasjoner = pd.concat([ temp1, temp1.center.apply(pd.Series) ], axis=1)
stasjoner.columns



stasjoner.drop(labels=['bounds', 'center'], axis=1, inplace=True)
stasjoner.columns


# # Henter status

infinite = True
while infinite:

    time.sleep(15)
    r = requests.get( url + '/availability', headers=headers)
    r2 = r.json()
    # print( 'Updated at', r2['updated_at'])
    # print( 'Refresh rate', r2['refresh_rate'], 's')
    tmp3  = pd.DataFrame.from_dict(r2['stations'])
    status = pd.concat( [ tmp3, tmp3.availability.apply( pd.Series ) ], axis=1)
    status.drop( ['availability' ], inplace=True, axis=1)
    status['Updated'] = r2['updated_at']

    status.columns


    # # Blander status med lokasjon

    stasjonstatus = pd.merge( stasjoner, status, left_on='id', right_on='id', how='left' )


    # # Legger på geometri

    geometry = [Point(xy) for xy in zip(stasjonstatus.longitude, stasjonstatus.latitude)]
    crs = {'init' : 'epsg:4326'}
    stasjonstatus.drop(['longitude', 'latitude'], axis=1, inplace=True)
    geostasjon = gpd.GeoDataFrame( stasjonstatus, crs=crs, geometry=geometry)

    outfile = '/home/jansimple/mysite/static/gps/bysykkelOslo.geojson'
    with open(outfile, 'w') as f:
        f.write( geostasjon.to_json())
