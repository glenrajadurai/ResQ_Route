from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.http import HttpResponse

def spa_index_view(request, path=''):
    index_file = settings.FRONTEND_DIR / 'index.html'
    if index_file.exists():
        with open(index_file, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type='text/html')
    return HttpResponse(
        "<h3>Frontend build not found.</h3><p>Please run <code>cd frontend && npm run build</code> to generate static assets.</p>",
        status=404
    )

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    re_path(r'^(?:.*)/?$', spa_index_view),
]
