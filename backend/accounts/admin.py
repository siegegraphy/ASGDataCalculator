from django.contrib import admin
from .models import SavedCalculator

@admin.register(SavedCalculator)
class SavedCalculatorAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'user', 'created_at')
    list_filter = ('user',)
    search_fields = ('name',)
