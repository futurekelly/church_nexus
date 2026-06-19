from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from authentication.services.bible_service import get_daily_scripture
from drf_spectacular.utils import extend_schema

class DailyScriptureView(APIView):
    """
    Exposes a dynamic Daily Scripture (Verse of the Day) fetched from a public Bible API.
    Caches the scripture for 24 hours. Accessible publicly (AllowAny).
    """
    permission_classes = [AllowAny]

    @extend_schema(
        responses={200: dict},
        description="Returns the current dynamic Verse of the Day with reference and reflection."
    )
    def get(self, request):
        try:
            scripture = get_daily_scripture()
            return Response(scripture, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Failed to load daily scripture", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
