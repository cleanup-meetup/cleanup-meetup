from flask import render_template, flash, redirect, url_for, request, send_file, make_response
from application import app, bootstrap
import geocoder
import json
from application.models import User, Event
from werkzeug.utils import secure_filename
import os
from geopy.geocoders import Nominatim

UPLOAD_FOLDER = 'IMAGES/'

@app.route('/')
@app.route('/home', methods=['GET', 'POST'])
def home():
    g = geocoder.ip('me')
    #print(g.json)
    #print(g.latlng)
    data_list = []
    data_list.append(g.latlng[0])
    data_list.append(g.latlng[1])
    print(json.dumps(data_list))
    events_info = make_json_struct() #Now events_info has a list of dictionaries of events
    print(events_info)
    print(json.dumps(events_info))
    return render_template('index.html')

#Method called to store an image
@app.route('/upload', methods=['POST'])
def upload():
    file = request.files['image']
    EventNameFile = request.form['EventName']
    EventDateFile = request.form['EventDate']
    EventTimeFile = request.form['EventTime']
    EventLocationFile = request.form['EventLocation']
    EventDescriptionFile = request.form['EventDescription']

    if not file:
        flash ("No file")
        return render_template('index.html')
    if not EventNameFile:
        flash ("Incorrect Name")
        return render_template('index.html')
    if not EventDateFile:
        flash ("Incorrect Date")
        return render_template('index.html')
    if not EventTimeFile:
        flash ("Incorrect Time")
        return render_template('index.html')
    if not EventLocationFile:
        flash ("Incorrect Location")
        return render_template('index.html')
    if not EventDescriptionFile:
        flash ("Incorrect Description")
        return render_template('index.html')
    f = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(f)
    print(EventNameFile)
    print(EventDateFile)
    print(EventTimeFile)
    print(EventLocationFile)
    print(EventDescriptionFile)
    geolocator = Nominatim(user_agent="cleanup-meetup")
    location = geolocator.geocode(EventLocationFile)
    print((location.latitude, location.longitude))
    locLat = truncate(location.latitude)
    locLng = truncate(location.longitude)
    #FOR DEMOING PURPOSES!!!!!!!!
    userID = "UserID1"
    e = Event(name = EventNameFile, lat = locLat, lng = locLng, confirmed_users = userID, event_date = EventDateFile, event_creator = userID, fileLocation = file.filename, address = EventLocationFile, description = EventDescriptionFile, time = EventTimeFile)
    db.session.add(e)
    db.session.commit()
    return render_template('index.html')

@app.route('/create-event', methods=['GET', 'POST'])
def create_event():
    return render_template('create-event.html')

#This function will return a jsonable
def make_json_struct():
    struct = {
        "Lat" : "",
        "Lng" : "",
        "EventName" : "",
        "EventID" : ""
    }
    event_list = []
    events = Event.query.all()
    for event in events:
        print("reached make json struct")
        print(event.lat)
        print(event.lng)
        print(event.name)
        print(event.id)
        struct["Lat"] = event.lat
        struct["Lng"] = event.lng
        struct["EventName"] = event.name
        struct["EventID"] = event.id
        event_list.append(struct)
    print(event_list)
    return event_list

#very experimental
@app.route('/future_events_sample.json')
def future_events_sample():
    return render_template('future_events_sample.json')

def truncate(n, decimals=0):
    multiplier = 10 ** decimals
    return int(n * multiplier) / multiplier
