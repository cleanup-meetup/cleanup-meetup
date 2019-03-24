from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from config import Config
from flask_bootstrap import Bootstrap
from flask_oauth import OAuth
import os

UPLOAD_FOLDER = 'Images/'  #Folder that contains the zipped html files
UPLOAD_FOLDER2 = 'application/templates/HTMLfiles/'   #Folder that will contain the html files to display
SECRET_KEY = 'development key'
DEBUG = True

app = Flask(__name__)   #Initializes flask app
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['UPLOAD_FOLDER2'] = UPLOAD_FOLDER2
app.debug = DEBUG
app.secret_key = SECRET_KEY
oauth = OAuth()
app.config.from_object(Config)  #inherits MySQL settings from py.config in root directory of app

twitter = oauth.remote_app('twitter',
base_url='https://api.twitter.com/1/',
request_token_url='https://api.twitter.com/oauth/request_token',
access_token_url='https://api.twitter.com/oauth/access_token',
authorize_url='https://api.twitter.com/oauth/authenticate',
consumer_key='uc7w80IvHfKw15uGzKGXTCeUL',
consumer_secret='tHCpTLXO3o0Ib29A9yi5r8uB6oYSQF6swGWiLMYwY3LFn3umfN'
)

db = SQLAlchemy(app)    #initilizes db to be a MySQL database with SQLAlchemy (Object-relational Mapper)
migrate = Migrate(app, db)  #Creates the migration folder
login = LoginManager(app)
login.login_view = 'login'
bootstrap = Bootstrap(app)  #Imports bootstrap functionality


from application import routes, models