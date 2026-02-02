from django.urls import path
from .views import signup, login, token_refresh

urlpatterns = [
    path("signup/", signup, name="signup"),
    path("login/", login, name="login"),
    path("token/refresh/", token_refresh, name="token_refresh"),
]