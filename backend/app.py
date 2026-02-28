from flask import Flask
from flask_cors import CORS
from routes import user_controllers, calendar_controllers, auth_controllers

app = Flask(__name__)
CORS(app)

app.register_blueprint(user_controllers.user_api_route)
app.register_blueprint(calendar_controllers.calendar_api_route)
app.register_blueprint(auth_controllers.auth_api_route)

@app.route("/")
def hello_world():
    return "Hello, World!"

if __name__ == '__main__':
    app.run(debug=True)
