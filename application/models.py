from application import db, login
from flask_login import UserMixin

class User(UserMixin, db.Model):
    __tablename__ = 'user'
    id = db.Column(db.String(128), primary_key=True)
    username = db.Column(db.String(64))

    def __repr__(self):
        return '<User {} {}>'.format(self.username, self.id)

@login.user_loader
def load_user(id):
    return User.query.get(int(id))

class Event(db.Model):
    __tablename__ = 'event'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64))
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    confirmed_users = db.Column(db.String(1000))
    event_date = db.Column(db.String(20))
    event_creator = db.Column(db.String(128))
    filelocation = db.Column(db.String(128))
