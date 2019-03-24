from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from config import Config
from flask_bootstrap import Bootstrap
import os

UPLOAD_FOLDER = 'Images/'  #Folder that contains the zipped html files
UPLOAD_FOLDER2 = 'application/templates/HTMLfiles/'   #Folder that will contain the html files to display


app = Flask(__name__)   #Initializes flask app
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['UPLOAD_FOLDER2'] = UPLOAD_FOLDER2
app.config.from_object(Config)  #inherits MySQL settings from py.config in root directory of app
db = SQLAlchemy(app)    #initilizes db to be a MySQL database with SQLAlchemy (Object-relational Mapper)
migrate = Migrate(app, db)  #Creates the migration folder
login = LoginManager(app)
login.login_view = 'login'
bootstrap = Bootstrap(app)  #Imports bootstrap functionality


from application import routes #, models