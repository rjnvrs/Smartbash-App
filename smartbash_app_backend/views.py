from django.http import HttpResponse
from views import home

def home(request):
    return HttpResponse("Welcome to SmartBash!")