from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import SOSRequest
from .serializers import SOSRequestSerializer
from .ai_parser import parse_sos_text

@api_view(['GET', 'POST'])
def sos_request_list(request):
    """
    List all SOS requests (with optional filters) or create a raw structured request.
    """
    if request.method == 'GET':
        urgency = request.query_params.get('urgency')
        category = request.query_params.get('category')
        req_status = request.query_params.get('status')
        search = request.query_params.get('search')

        queryset = SOSRequest.objects.all()

        if urgency:
            queryset = queryset.filter(urgency__iexact=urgency)
        if category:
            queryset = queryset.filter(category__iexact=category)
        if req_status:
            queryset = queryset.filter(status__iexact=req_status)
        if search:
            queryset = queryset.filter(
                Q(raw_text__icontains=search) | 
                Q(address__icontains=search) | 
                Q(items__icontains=search)
            )

        serializer = SOSRequestSerializer(queryset, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        # Create SOS request (either pre-parsed or directly submitted)
        serializer = SOSRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def parse_sos_preview(request):
    """
    Accepts raw text, returns AI extracted structured JSON preview.
    """
    raw_text = request.data.get('raw_text', '').strip()
    api_key = request.data.get('openai_key', None)
    parser_mode = request.data.get('parser_mode', 'AUTO')

    if not raw_text:
        return Response({"error": "raw_text field is required"}, status=status.HTTP_400_BAD_REQUEST)

    parsed_result = parse_sos_text(raw_text, api_key=api_key, parser_mode=parser_mode)
    return Response(parsed_result, status=status.HTTP_200_OK)

@api_view(['POST'])
def create_sos_with_ai(request):
    """
    Accepts natural language text, parses it via AI, creates database record, and returns it.
    """
    raw_text = request.data.get('raw_text', '').strip()
    api_key = request.data.get('openai_key', None)
    parser_mode = request.data.get('parser_mode', 'AUTO')
    contact_name = request.data.get('contact_name', 'Anonymous Victim')
    contact_phone = request.data.get('contact_phone', '')

    if not raw_text:
        return Response({"error": "raw_text field is required"}, status=status.HTTP_400_BAD_REQUEST)

    parsed = parse_sos_text(raw_text, api_key=api_key, parser_mode=parser_mode)

    sos = SOSRequest.objects.create(
        raw_text=raw_text,
        urgency=parsed.get('urgency', 'MEDIUM'),
        category=parsed.get('category', 'OTHER'),
        items=parsed.get('items', []),
        address=parsed.get('address', 'Disaster Zone'),
        latitude=parsed.get('latitude', 29.7604),
        longitude=parsed.get('longitude', -95.3698),
        people_count=parsed.get('people_count', 1),
        contact_name=contact_name if contact_name != 'Anonymous Victim' else parsed.get('contact_name', 'Anonymous Victim'),
        contact_phone=contact_phone or parsed.get('contact_phone', ''),
        status='UNCLAIMED'
    )

    serializer = SOSRequestSerializer(sos)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def claim_sos_request(request, pk):
    """
    Claim an SOS request as a volunteer.
    """
    try:
        sos = SOSRequest.objects.get(pk=pk)
    except SOSRequest.DoesNotExist:
        return Response({"error": "SOS Request not found"}, status=status.HTTP_404_NOT_FOUND)

    volunteer_name = request.data.get('volunteer_name', 'Verified Volunteer')
    volunteer_phone = request.data.get('volunteer_phone', '')
    volunteer_notes = request.data.get('volunteer_notes', '')

    sos.status = 'CLAIMED'
    sos.volunteer_name = volunteer_name
    sos.volunteer_phone = volunteer_phone
    sos.volunteer_notes = volunteer_notes
    sos.save()

    serializer = SOSRequestSerializer(sos)
    return Response(serializer.data)

@api_view(['PATCH'])
def update_sos_status(request, pk):
    """
    Update request status (UNCLAIMED, CLAIMED, IN_PROGRESS, RESOLVED).
    """
    try:
        sos = SOSRequest.objects.get(pk=pk)
    except SOSRequest.DoesNotExist:
        return Response({"error": "SOS Request not found"}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if new_status not in dict(SOSRequest.STATUS_CHOICES):
        return Response({"error": f"Invalid status choices: {list(dict(SOSRequest.STATUS_CHOICES).keys())}"}, status=status.HTTP_400_BAD_REQUEST)

    sos.status = new_status
    sos.save()

    serializer = SOSRequestSerializer(sos)
    return Response(serializer.data)

@api_view(['GET'])
def get_stats(request):
    """
    Return high-level summary statistics for disaster dashboard.
    """
    total = SOSRequest.objects.count()
    critical = SOSRequest.objects.filter(urgency='CRITICAL', status__in=['UNCLAIMED', 'CLAIMED']).count()
    high = SOSRequest.objects.filter(urgency='HIGH', status__in=['UNCLAIMED', 'CLAIMED']).count()
    claimed = SOSRequest.objects.filter(status='CLAIMED').count()
    in_progress = SOSRequest.objects.filter(status='IN_PROGRESS').count()
    resolved = SOSRequest.objects.filter(status='RESOLVED').count()
    unclaimed = SOSRequest.objects.filter(status='UNCLAIMED').count()

    return Response({
        "total_sos": total,
        "critical_active": critical,
        "high_active": high,
        "unclaimed": unclaimed,
        "claimed": claimed,
        "in_progress": in_progress,
        "resolved": resolved,
        "resolution_rate_percent": round((resolved / total * 100) if total > 0 else 0, 1)
    })

@api_view(['POST'])
def seed_demo_data(request):
    """
    Populates 8 sample realistic disaster SOS messages for immediate interactive testing.
    """
    SOSRequest.objects.all().delete() # Clean slate for crisp demo

    seed_items = [
        {
            "raw_text": "CRITICAL EMERGENCY! Water rising fast at 104 Riverside Dr. 2 elderly residents stuck on top floor. Urgent insulin for diabetic grandmother and drinking water needed immediately!",
            "urgency": "CRITICAL",
            "category": "RESCUE",
            "items": ["Rescue Boat", "Insulin Injection", "Drinking Water"],
            "address": "104 Riverside Dr, Metro Flood Zone",
            "latitude": 29.7680,
            "longitude": -95.3580,
            "people_count": 2,
            "contact_name": "Sarah Miller",
            "contact_phone": "+1 555-0192",
            "status": "UNCLAIMED"
        },
        {
            "raw_text": "Flash flood trapped mother and 3 month infant at 450 Main St. Need baby formula, dry blankets, and battery power bank. Phone battery at 4%!",
            "urgency": "CRITICAL",
            "category": "MEDICAL",
            "items": ["Baby Formula", "Dry Blankets", "Power Bank", "First Aid"],
            "address": "450 Main St, Apt 3B",
            "latitude": 29.7604,
            "longitude": -95.3698,
            "people_count": 2,
            "contact_name": "Elena Rostova",
            "contact_phone": "+1 555-0481",
            "status": "UNCLAIMED"
        },
        {
            "raw_text": "Need urgent evacuation at 78 Park Ave. Wheelchair user with broken leg needs transport to Central Shelter before nightfall.",
            "urgency": "HIGH",
            "category": "EVACUATION",
            "items": ["Wheelchair Transport", "Medical Escort"],
            "address": "78 Park Ave, West Wing",
            "latitude": 29.7520,
            "longitude": -95.3750,
            "people_count": 1,
            "contact_name": "David Chen",
            "contact_phone": "+1 555-0833",
            "status": "UNCLAIMED"
        },
        {
            "raw_text": "Group of 6 evacuees sheltering at Central High Shelter near gym. Short on clean drinking water and non-perishable canned food.",
            "urgency": "MEDIUM",
            "category": "FOOD_WATER",
            "items": ["Canned Food", "Drinking Water (20L)", "Towelettes"],
            "address": "Central High Gym, 120 School Rd",
            "latitude": 29.7710,
            "longitude": -95.3820,
            "people_count": 6,
            "contact_name": "Marcus Vance",
            "contact_phone": "+1 555-0914",
            "status": "UNCLAIMED"
        },
        {
            "raw_text": "Asthma emergency at 310 Oak Wood Ln. 12yo boy having breathing difficulty, inhaler lost in floodwater evacuation.",
            "urgency": "CRITICAL",
            "category": "MEDICAL",
            "items": ["Asthma Inhaler (Albuterol)", "Oxygen Pack"],
            "address": "310 Oak Wood Ln",
            "latitude": 29.7450,
            "longitude": -95.3620,
            "people_count": 1,
            "contact_name": "Maria Garcia",
            "contact_phone": "+1 555-0275",
            "status": "CLAIMED",
            "volunteer_name": "Dr. James Wilson (Red Cross Vol)",
            "volunteer_phone": "+1 555-9911",
            "volunteer_notes": "En route with medical kit and inhaler. ETA 12 mins."
        },
        {
            "raw_text": "Roof leak shelter breach at 89 Harbor Blvd. 4 adults need tarp covers and warm sleeping bags.",
            "urgency": "MEDIUM",
            "category": "SHELTER",
            "items": ["Heavy Duty Tarp", "Sleeping Bags", "Flashlights"],
            "address": "89 Harbor Blvd, East Dock",
            "latitude": 29.7820,
            "longitude": -95.3410,
            "people_count": 4,
            "contact_name": "Robert Taylor",
            "contact_phone": "+1 555-0629",
            "status": "UNCLAIMED"
        },
        {
            "raw_text": "Evacuation assistance requested at 55 Pine Street. Elderly couple with pet dog need pickup to county shelter.",
            "urgency": "HIGH",
            "category": "EVACUATION",
            "items": ["Pet-friendly Vehicle Evac", "Dog Food"],
            "address": "55 Pine Street",
            "latitude": 29.7390,
            "longitude": -95.3900,
            "people_count": 2,
            "contact_name": "Helen & George Ross",
            "contact_phone": "+1 555-0552",
            "status": "RESOLVED",
            "volunteer_name": "Austin Pet Rescue Team",
            "volunteer_phone": "+1 555-8822",
            "volunteer_notes": "Safely evacuated couple and pet to Regional Shelter B."
        },
        {
            "raw_text": "Power outage and flooded basement at 204 Lakeview Dr. Need portable generator and sump pump.",
            "urgency": "LOW",
            "category": "OTHER",
            "items": ["Water Pump", "Fuel Generator"],
            "address": "204 Lakeview Dr",
            "latitude": 29.7890,
            "longitude": -95.3670,
            "people_count": 3,
            "contact_name": "Kenji Sato",
            "contact_phone": "+1 555-0144",
            "status": "UNCLAIMED"
        }
    ]

    created_objects = []
    for item in seed_items:
        created_objects.append(SOSRequest.objects.create(**item))

    return Response({
        "message": f"Successfully seeded {len(created_objects)} realistic disaster SOS requests!",
        "count": len(created_objects)
    }, status=status.HTTP_201_CREATED)
