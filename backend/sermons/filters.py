import django_filters
from django.db.models import Q
from .models import Sermon, SermonSeries


class SermonFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='filter_search')
    category = django_filters.CharFilter(
        field_name='category', lookup_expr='exact'
    )
    speaker = django_filters.CharFilter(
        field_name='speaker', lookup_expr='icontains'
    )
    scripture = django_filters.CharFilter(
        field_name='scripture_reference', lookup_expr='icontains'
    )
    series = django_filters.CharFilter(method='filter_series')
    featured = django_filters.BooleanFilter(field_name='featured')
    date_from = django_filters.DateFilter(
        field_name='sermon_date', lookup_expr='gte'
    )
    date_to = django_filters.DateFilter(
        field_name='sermon_date', lookup_expr='lte'
    )

    class Meta:
        model = Sermon
        fields = [
            'search', 'category', 'speaker', 'scripture',
            'series', 'featured', 'date_from', 'date_to', 'status'
        ]

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(title__icontains=value) |
            Q(speaker__icontains=value) |
            Q(description__icontains=value) |
            Q(scripture_reference__icontains=value) |
            Q(series__title__icontains=value)
        )

    def filter_series(self, queryset, name, value):
        if not value:
            return queryset
        # Support UUID or Slug lookup
        return queryset.filter(
            Q(series__id__iexact=value) | Q(series__slug__iexact=value)
        )


class SermonSeriesFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='filter_search')
    is_active = django_filters.BooleanFilter(field_name='is_active')

    class Meta:
        model = SermonSeries
        fields = ['search', 'is_active']

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(title__icontains=value) | Q(description__icontains=value)
        )
