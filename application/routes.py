from flask import render_template, flash, redirect, url_for, request, send_file, make_response, session
from application import app, bootstrap, db, twitter
import geocoder
import json
from application.models import User, Event
from werkzeug.utils import secure_filename
import os
from geopy.geocoders import Nominatim
from flask_oauth import OAuth
from sqlalchemy.orm import scoped_session, sessionmaker


UPLOAD_FOLDER = 'IMAGES/'

@twitter.tokengetter
def get_twitter_token(token=None):
    return session.get('twitter_token')



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
    try:
        geolocator = Nominatim(user_agent="cleanup-meetup")
        location = geolocator.geocode(EventLocationFile)
        print((location.latitude, location.longitude))
        locLat = truncate(location.latitude)
        locLng = truncate(location.longitude)
    except:
        flash ("Please enter a valid address!")
        return render_template('index.html')
    #FOR DEMOING PURPOSES!!!!!!!!
    userID = "UserID1"
    e = Event(name = EventNameFile, lat = locLat, lng = locLng, confirmed_users = userID, event_date = EventDateFile, event_creator = userID, fileLocation = file.filename, address = EventLocationFile, description = EventDescriptionFile, time = EventTimeFile)
    db.session.add(e)
    db.session.commit()
    return render_template('index.html')

@app.route('/create-event', methods=['GET', 'POST'])
def create_event():
    access_token = session.get('access_token')
    if access_token is None:
        return redirect(url_for('login'))
    access_token = access_token[0]
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

@app.route('/login')
def login():
    return twitter.authorize(callback=url_for('oauth_authorized',
    next=request.args.get('next') or request.referrer or None))

@app.route('/logout')
def logout():
    session.pop('screen_name', None)
    flash('You were signed out')
    return redirect(request.referrer or url_for('index'))

@app.route('/oauth-authorized')
@twitter.authorized_handler
def oauth_authorized(resp):
    next_url = request.args.get('next') or url_for('index')
    if resp is None:
        flash(u'You denied the request to sign in.')
        return redirect(next_url)
    access_token = resp['oauth_token']
    session['access_token'] = access_token
    session['screen_name'] = resp['screen_name']
    session['twitter_token'] = (
        resp['oauth_token'],
        resp['oauth_token_secret']
    )
    return redirect(url_for('create_event'))

#very experimental
@app.route('/future_events_sample.json')
def future_events_sample():
    return render_template('future_events_sample.json')

def truncate(n, decimals=0):
    multiplier = 10 ** decimals
    return int(n * multiplier) / multiplier