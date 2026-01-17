from flask import Blueprint, jsonify, request
from ..db import get_db
from ..security import require_auth
import json
import math

bp = Blueprint('dealers', __name__, url_prefix='/api/dealers')

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in kilometers using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

@bp.route('', methods=['GET'])
def get_dealers():
    """Get all dealers or filter by location"""
    db = get_db()
    
    # Get query parameters
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    radius = request.args.get('radius', type=float, default=50)  # Default 50km radius
    
    # Get all dealers
    cursor = db.execute('SELECT * FROM dealers WHERE verified = ? ORDER BY rating DESC', (True,))
    dealers = [dict(row) for row in cursor.fetchall()]
    
    # Parse JSON fields
    for dealer in dealers:
        if dealer.get('showroom_images'):
            try:
                dealer['showroom_images'] = json.loads(dealer['showroom_images']) if isinstance(dealer['showroom_images'], str) else dealer['showroom_images']
            except:
                dealer['showroom_images'] = []
        else:
            dealer['showroom_images'] = []
            
        if dealer.get('business_hours'):
            try:
                dealer['business_hours'] = json.loads(dealer['business_hours']) if isinstance(dealer['business_hours'], str) else dealer['business_hours']
            except:
                dealer['business_hours'] = {}
        else:
            dealer['business_hours'] = {}
    
    # Filter by location if coordinates provided
    if lat is not None and lng is not None:
        nearby_dealers = []
        for dealer in dealers:
            if dealer.get('latitude') and dealer.get('longitude'):
                distance = calculate_distance(lat, lng, dealer['latitude'], dealer['longitude'])
                if distance <= radius:
                    dealer['distance'] = round(distance, 2)
                    nearby_dealers.append(dealer)
        
        # Sort by distance
        nearby_dealers.sort(key=lambda x: x.get('distance', float('inf')))
        dealers = nearby_dealers
    
    return jsonify({'success': True, 'dealers': dealers})

@bp.route('/<int:id>', methods=['GET'])
def get_dealer(id):
    """Get detailed dealer information"""
    db = get_db()
    
    # Get dealer info
    dealer_row = db.execute('SELECT * FROM dealers WHERE id = ?', (id,)).fetchone()
    if not dealer_row:
        return jsonify({'success': False, 'error': 'Dealer not found'}), 404
    
    dealer = dict(dealer_row)
    
    # Parse JSON fields
    if dealer.get('showroom_images'):
        try:
            dealer['showroom_images'] = json.loads(dealer['showroom_images']) if isinstance(dealer['showroom_images'], str) else dealer['showroom_images']
        except:
            dealer['showroom_images'] = []
    else:
        dealer['showroom_images'] = []
        
    if dealer.get('business_hours'):
        try:
            dealer['business_hours'] = json.loads(dealer['business_hours']) if isinstance(dealer['business_hours'], str) else dealer['business_hours']
        except:
            dealer['business_hours'] = {}
    else:
        dealer['business_hours'] = {}
    
    # Get dealer's inventory
    inventory_cursor = db.execute('''
        SELECT * FROM cars 
        WHERE owner_id = (SELECT user_id FROM dealers WHERE id = ?)
        ORDER BY created_at DESC
    ''', (id,))
    dealer['inventory'] = [dict(row) for row in inventory_cursor.fetchall()]
    
    # Get dealer reviews (from reviews table)
    reviews_cursor = db.execute('''
        SELECT r.*, u.username 
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN cars c ON r.car_id = c.id
        WHERE c.owner_id = (SELECT user_id FROM dealers WHERE id = ?)
        ORDER BY r.created_at DESC
        LIMIT 50
    ''', (id,))
    dealer['reviews'] = [dict(row) for row in reviews_cursor.fetchall()]
    
    return jsonify({'success': True, 'dealer': dealer})

@bp.route('/register', methods=['POST'])
def register_dealer():
    """Register current user as a dealer"""
    current_user = require_auth()
    if not current_user:
        return jsonify({'success': False, 'error': 'Authentication required'}), 401
    
    db = get_db()
    data = request.get_json()
    
    # Check if user already has a dealer profile
    existing = db.execute('SELECT id FROM dealers WHERE user_id = ?', (current_user['id'],)).fetchone()
    if existing:
        return jsonify({'success': False, 'error': 'User already registered as dealer'}), 400
    
    # Validate required fields
    required = ['name', 'location', 'contact_email', 'contact_phone']
    for field in required:
        if not data.get(field):
            return jsonify({'success': False, 'error': f'Missing required field: {field}'}), 400
    
    # Insert dealer
    showroom_images = json.dumps(data.get('showroom_images', []))
    business_hours = json.dumps(data.get('business_hours', {}))
    
    cursor = db.execute('''
        INSERT INTO dealers (
            user_id, name, location, latitude, longitude,
            contact_email, contact_phone, description,
            showroom_images, business_hours, image_url, verified
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        current_user['id'],
        data['name'],
        data['location'],
        data.get('latitude'),
        data.get('longitude'),
        data['contact_email'],
        data['contact_phone'],
        data.get('description', ''),
        showroom_images,
        business_hours,
        data.get('image_url', ''),
        False  # Requires admin verification
    ))
    
    db.commit()
    dealer_id = cursor.lastrowid
    
    return jsonify({
        'success': True,
        'dealer_id': dealer_id,
        'message': 'Dealer registration submitted for verification'
    })

@bp.route('/profile', methods=['GET'])
def get_dealer_profile():
    """Get dealer profile for current user"""
    current_user = require_auth()
    if not current_user:
        return jsonify({'success': False, 'error': 'Authentication required'}), 401
    db = get_db()
    
    dealer_row = db.execute('SELECT * FROM dealers WHERE user_id = ?', (current_user['id'],)).fetchone()
    if not dealer_row:
        return jsonify({'success': False, 'error': 'No dealer profile found'}), 404
    
    dealer = dict(dealer_row)
    
    # Parse JSON fields
    if dealer.get('showroom_images'):
        try:
            dealer['showroom_images'] = json.loads(dealer['showroom_images']) if isinstance(dealer['showroom_images'], str) else dealer['showroom_images']
        except:
            dealer['showroom_images'] = []
    
    if dealer.get('business_hours'):
        try:
            dealer['business_hours'] = json.loads(dealer['business_hours']) if isinstance(dealer['business_hours'], str) else dealer['business_hours']
        except:
            dealer['business_hours'] = {}
    
    return jsonify({'success': True, 'dealer': dealer})

@bp.route('/profile', methods=['PUT'])
def update_dealer_profile():
    """Update dealer profile"""
    current_user = require_auth()
    if not current_user:
        return jsonify({'success': False, 'error': 'Authentication required'}), 401
    db = get_db()
    data = request.get_json()
    
    # Check if dealer profile exists
    dealer_row = db.execute('SELECT id FROM dealers WHERE user_id = ?', (current_user['id'],)).fetchone()
    if not dealer_row:
        return jsonify({'success': False, 'error': 'No dealer profile found'}), 404
    
    dealer_id = dealer_row['id']
    
    # Build update query
    updates = []
    params = []
    
    if 'name' in data:
        updates.append('name = ?')
        params.append(data['name'])
    if 'location' in data:
        updates.append('location = ?')
        params.append(data['location'])
    if 'latitude' in data:
        updates.append('latitude = ?')
        params.append(data['latitude'])
    if 'longitude' in data:
        updates.append('longitude = ?')
        params.append(data['longitude'])
    if 'contact_email' in data:
        updates.append('contact_email = ?')
        params.append(data['contact_email'])
    if 'contact_phone' in data:
        updates.append('contact_phone = ?')
        params.append(data['contact_phone'])
    if 'description' in data:
        updates.append('description = ?')
        params.append(data['description'])
    if 'image_url' in data:
        updates.append('image_url = ?')
        params.append(data['image_url'])
    if 'showroom_images' in data:
        updates.append('showroom_images = ?')
        params.append(json.dumps(data['showroom_images']))
    if 'business_hours' in data:
        updates.append('business_hours = ?')
        params.append(json.dumps(data['business_hours']))
    
    if not updates:
        return jsonify({'success': False, 'error': 'No fields to update'}), 400
    
    params.append(dealer_id)
    query = f"UPDATE dealers SET {', '.join(updates)} WHERE id = ?"
    
    db.execute(query, params)
    db.commit()
    
    return jsonify({'success': True, 'message': 'Dealer profile updated'})

@bp.route('/showroom/upload', methods=['POST'])
def upload_showroom_image():
    """Upload showroom image (placeholder - actual upload handled by frontend)"""
    current_user = require_auth()
    if not current_user:
        return jsonify({'success': False, 'error': 'Authentication required'}), 401
    db = get_db()
    data = request.get_json()
    
    # Check if dealer profile exists
    dealer_row = db.execute('SELECT id, showroom_images FROM dealers WHERE user_id = ?', (current_user['id'],)).fetchone()
    if not dealer_row:
        return jsonify({'success': False, 'error': 'No dealer profile found'}), 404
    
    dealer_id = dealer_row['id']
    
    # Get current showroom images
    try:
        showroom_images = json.loads(dealer_row['showroom_images']) if dealer_row['showroom_images'] else []
    except:
        showroom_images = []
    
    # Add new image URL
    if 'image_url' in data:
        showroom_images.append(data['image_url'])
        
        # Update database
        db.execute('UPDATE dealers SET showroom_images = ? WHERE id = ?', 
                  (json.dumps(showroom_images), dealer_id))
        db.commit()
        
        return jsonify({'success': True, 'showroom_images': showroom_images})
    
    return jsonify({'success': False, 'error': 'No image URL provided'}), 400
