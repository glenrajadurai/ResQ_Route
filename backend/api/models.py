from django.db import models

class SOSRequest(models.Model):
    URGENCY_CHOICES = [
        ('CRITICAL', 'Critical - Life Threatening'),
        ('HIGH', 'High - Urgent Assistance Required'),
        ('MEDIUM', 'Medium - Essential Supplies Needed'),
        ('LOW', 'Low - General Support'),
    ]

    CATEGORY_CHOICES = [
        ('RESCUE', 'Rescue / Trapped'),
        ('MEDICAL', 'Medical Emergency'),
        ('FOOD_WATER', 'Food & Clean Water'),
        ('SHELTER', 'Shelter & Blanket'),
        ('EVACUATION', 'Evacuation / Transport'),
        ('OTHER', 'General Need'),
    ]

    STATUS_CHOICES = [
        ('UNCLAIMED', 'Unclaimed'),
        ('CLAIMED', 'Claimed by Volunteer'),
        ('IN_PROGRESS', 'Aid en route'),
        ('RESOLVED', 'Resolved & Delivered'),
    ]

    raw_text = models.TextField(help_text="Original natural language request submitted by victim or reporter")
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='MEDIUM')
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='FOOD_WATER')
    items = models.JSONField(default=list, blank=True, help_text="Parsed list of items or services needed")
    address = models.CharField(max_length=255, default='Unknown Location')
    latitude = models.FloatField(default=0.0)
    longitude = models.FloatField(default=0.0)
    people_count = models.IntegerField(default=1)
    contact_name = models.CharField(max_length=100, default='Anonymous Victim')
    contact_phone = models.CharField(max_length=50, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='UNCLAIMED')
    
    # Volunteer claiming information
    volunteer_name = models.CharField(max_length=100, blank=True, default='')
    volunteer_phone = models.CharField(max_length=50, blank=True, default='')
    volunteer_notes = models.TextField(blank=True, default='')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.urgency}] {self.category} - {self.address} ({self.status})"
