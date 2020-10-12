import os

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_cors import CORS

# INIT APP
app = Flask(__name__)

# DATABASE
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(
    BASE_DIR, "db.sqlite"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# INIT DATABASE
db = SQLAlchemy(app)

# INIT MARSHMALLOW
ma = Marshmallow(app)

# CORS
CORS(app)


# POSITION MODEL
class Position(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    x_pos = db.Column(db.Integer)
    y_pos = db.Column(db.Integer)
    timestamp = db.Column(db.Integer)

    def __init__(self, x_pos, y_pos, timestamp):
        self.x_pos = x_pos
        self.y_pos = y_pos
        self.timestamp = timestamp

    def __repr__(self):
        return f"<Position x_pos: {self.x_pos}, y_pos: {self.y_pos}, timestamp: {self.timestamp}>"


# POSITION SCHEMA
class PositionSchema(ma.Schema):
    class Meta:
        # Fields to expose
        fields = ("id", "x_pos", "y_pos", "timestamp", "_links")

    # Smart hyperlinking
    _links = ma.Hyperlinks(
        {
            "self": ma.URLFor("position_detail", values=dict(id="<id>")),
            "collection": ma.URLFor("positions"),
        }
    )


# INIT POSITION SCHEMA
position_schema = PositionSchema()
positions_schema = PositionSchema(many=True)

##################################################
# API START
##################################################


# ADD A POSITION
@app.route("/api/positions", methods=["POST"])
def add_position():
    x_pos = request.json["x_pos"]
    y_pos = request.json["y_pos"]
    timestamp = request.json["timestamp"]

    new_position = Position(x_pos, y_pos, timestamp)
    db.session.add(new_position)
    db.session.commit()
    return position_schema.dump(new_position)


# GET POSITION BY ID - FOR TESTING
@ app.route("/api/positions/<id>")
def position_detail(id):
    position = Position.query.get(id)
    return position_schema.dump(position)


# GET ALL POSITIONS
@app.route("/api/positions")
def positions():
    all_positions = Position.query.all()
    return jsonify(positions_schema.dump(all_positions))


# GET PARAMETERS
# TODO Calculate "Cadence", "Step length" and "Step width"
@app.route("/api/parameters")
def parameters():
    all_positions = Position.query.all()

    speed = round(((all_positions[-1].x_pos - all_positions[0].x_pos) /
                   (all_positions[-1].timestamp - all_positions[0].timestamp)) * 10, 2)
    return jsonify({"speed": speed})


##################################################
# API FINISH
##################################################
# RUN SERVER
if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
