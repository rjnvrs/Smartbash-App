from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET', 'POST'])
def home(request):
    if request.method == 'GET':
        return Response({"message": "API root is working"})

    if request.method == 'POST':
        return Response({
            "message": "POST received",
            "data": request.data
        })

@api_view(['GET'])
def health_check(request):
    return Response({
        "status": "ok",
        "message": "Backend connected successfully"
    })