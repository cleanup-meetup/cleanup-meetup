from application import app, db
#from application.models import User
from flask import Flask

import sys
import os
#sys.path.append("/opt/python/current/app/FlaskAppAWS")

'''
Elastic Beanstalk by default looks for a WSGI gateway called "application", so we keep our functional logic in the application folder and basically create the project in app

Then we simply import app into application, so Elastic Beanstalk runs the finished application
'''
application = Flask(__name__)
application = app


#Simple little script to allow us to interact with the database without running the website in local host
#@application.shell_context_processor
#def make_shell_context():
#    return {'db': db, 'User': User}

#Standard way to run the application
if __name__ == "__main__":
    app.run()