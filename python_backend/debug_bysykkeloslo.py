#!/usr/bin/python3
# coding: utf-8

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
        lock_id = "jansimple.bysykkelDEBUG0101"   # this should be unique. using your username as a prefix is a convention
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



testfil = '/home/jansimple/mysite/static/gps/bysyklerDebugOslo.geojson'

infinite = True
while infinite:

    with open( testfil) as f:
        bysykler = json.load( f, encoding='utf-8')

    for ii, syk in enumerate( bysykler['features']) :
        if syk['properties']['bikes' ] < 4:
            bysykler['features'][ii]['properties']['bikes'] += 2
        else:
            bysykler['features'][ii]['properties']['bikes'] = 0

        if syk['properties']['locks' ] < 4:
            bysykler['features'][ii]['properties']['locks'] += 2
        else:
            bysykler['features'][ii]['properties']['locks'] = 0



    with open(testfil, 'w') as f:
        f.write( json.dumps( bysykler, ensure_ascii = False ))

    time.sleep(17)
