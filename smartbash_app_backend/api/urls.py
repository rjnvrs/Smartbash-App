from django.urls import path, include
from smartbash_app_backend.views import home

urlpatterns = [
    path('', home),          # This is the root URL
    path('api/', include('api.urls')),  # Your existing API URLs
]