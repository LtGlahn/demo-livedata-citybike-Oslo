from flask import Flask, request, url_for, render_template, make_response, abort
import flask

# Directory where we write (and read!) our geojson-data
dataDir = '/home/jansimple/mysite/static/gps/'

app = Flask(__name__)
app.secret_key = 'This is really unique and secret'


@app.route('/getfile/<filename>')
def getFile(filename):
    filename = dataDir + filename

    try:
        with open( filename) as file:
            blob = file.read()
    except:
        abort(404)
        pass

    r = make_response(blob)
    r.mimetype='application/json'
    r.headers['Access-Control-Allow-Origin'] = '*'

    return r
