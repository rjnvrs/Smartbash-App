from django.http import JsonResponse

def test_service(request):
    return JsonResponse({"message": "Services app working"})
