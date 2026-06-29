from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SermonViewSet, SermonSeriesViewSet, UploadIntentView, UploadCompleteView,
    SermonPodcastFeedView
)

router = DefaultRouter()
router.register('series', SermonSeriesViewSet, basename='sermon-series')
router.register('', SermonViewSet, basename='sermon')

urlpatterns = [
    path(
        'podcast.xml',
        SermonPodcastFeedView.as_view(),
        name='sermon-podcast-feed'
    ),
    path(
        'upload-intent/',
        UploadIntentView.as_view(),
        name='sermon-upload-intent'
    ),
    path(
        'upload-complete/',
        UploadCompleteView.as_view(),
        name='sermon-upload-complete'
    ),
    path('', include(router.urls)),
]
