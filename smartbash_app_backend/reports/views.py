from django.http import JsonResponse

def test_report(request):
    return JsonResponse({"message": "Reports app working"})
