from flask import Flask
from backend.routes import user_controllers, authentication_controllers

app = Flask(__name__)

app.register_blueprint(user_controllers.user_api_route)
app.register_blueprint(authentication_controllers.auth_api_route)


@app.route("/")
def hello_world():
    return "Hello, World!"


if __name__ == '__main__':
    app.run()
