from django.urls import path
from . import views

urlpatterns = [
    path('requests/', views.sos_request_list, name='sos-list'),
    path('parse-sos/', views.parse_sos_preview, name='parse-sos-preview'),
    path('create-sos/', views.create_sos_with_ai, name='create-sos-ai'),
    path('requests/<int:pk>/claim/', views.claim_sos_request, name='claim-sos'),
    path('requests/<int:pk>/status/', views.update_sos_status, name='update-sos-status'),
    path('stats/', views.get_stats, name='sos-stats'),
    path('seed/', views.seed_demo_data, name='seed-data'),
]
