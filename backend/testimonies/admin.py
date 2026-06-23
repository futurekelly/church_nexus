from django.contrib import admin
from testimonies.models import Testimony

@admin.register(Testimony)
class TestimonyAdmin(admin.ModelAdmin):
    list_display = ('title', 'author_name', 'category', 'status', 'is_featured', 'views', 'created_at')
    list_filter = ('status', 'category', 'is_featured', 'branch')
    search_fields = ('title', 'content', 'author_name', 'author_email')
    readonly_fields = ('views', 'created_at', 'updated_at')
    ordering = ('-created_at',)
