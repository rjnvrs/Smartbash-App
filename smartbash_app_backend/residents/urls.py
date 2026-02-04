from rest_framework import routers
from .views import ResidentViewSet

router = routers.DefaultRouter()
router.register(r'residents', ResidentViewSet)

urlpatterns = router.urls
