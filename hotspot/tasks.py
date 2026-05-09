from celery import shared_task
from django.utils import timezone
from .models import HotspotUser
from .services import MikroTikService

@shared_task
def disable_expired_users():
    """Find all expired hotspot users and disable them."""
    now = timezone.now()
    
    expired_users = HotspotUser.objects.filter(
        is_active=True,
        expires_at__lte=now
    )
    
    count = 0
    mikrotik = MikroTikService()
    
    for user in expired_users:
        # Disable in MikroTik (mocked for now)
        mikrotik.delete_hotspot_user(user.router_username)
        
        # Disable in database
        user.is_active = False
        user.save()
        count += 1
    
    return f"Disabled {count} expired users"
