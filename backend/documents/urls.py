from django.urls import path, include
from rest_framework.routers import DefaultRouter
from documents.views import (
    DocumentTemplateViewSet,
    GeneratedDocumentViewSet,
    DownloadFileView
)

router = DefaultRouter()
router.register(r'document-templates', DocumentTemplateViewSet, basename='documenttemplate')
router.register(r'generated-documents', GeneratedDocumentViewSet, basename='generateddocument')

urlpatterns = [
    path('', include(router.urls)),
    path('secure-download/', DownloadFileView.as_view({'get': 'retrieve_file'}), name='secure-download'),
]
