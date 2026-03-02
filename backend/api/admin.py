from django.contrib import admin
from. models import Replica, Attachment, Ammunition
from rangefilter.filters import NumericRangeFilter

@admin.register(Replica)
class ReplicaAdmin(admin.ModelAdmin):
    list_display = ('name', 'company', 'category', 'size', 'weight', 'drive', 'hopUp', 'energy', 'description',)
    list_filter = ('company', 'category', 'drive', 'hopUp', ('energy', NumericRangeFilter), ('weight', NumericRangeFilter),)
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'company', 'category', 'size', 'weight', 'description', 'get_compatibility',)
    list_filter = ('company', 'category', ('weight', NumericRangeFilter),)
    search_fields = ('name',)
    ordering = ('name',)

    def get_compatibility(self, obj):
        return ", ".join([replica.name for replica in obj.compatibility.all()])
    get_compatibility.short_description = 'Compatibility'

@admin.register(Ammunition)
class AmmunitionAdmin(admin.ModelAdmin):
    list_display = ('name', 'company', 'weight', 'amount', 'biodegradable', 'glowing',)
    list_filter = ('company', 'weight', 'biodegradable', 'glowing',)
    search_fields = ('name',)

    ordering = ('name',)
