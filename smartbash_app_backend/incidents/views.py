from django.http import JsonResponse

def test_incident(request):
    return JsonResponse({"message": "Incidents app working"})
