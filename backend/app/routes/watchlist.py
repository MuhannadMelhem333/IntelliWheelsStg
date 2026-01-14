from flask import Blueprint, request, jsonify
from ..db import get_db
from ..security import require_auth

bp = Blueprint('watchlist', __name__, url_prefix='/api/watchlist')


@bp.route('', methods=['GET'])
def get_watchlist():
    """Get all watchlist items for the current user."""
    user = require_auth()
    if not user:
        return jsonify({'success': False, 'error': 'Authentication required'}), 401
    
    db = get_db()
    
    # Ensure watchlist table exists
    try:
        db.execute('''
            CREATE TABLE IF NOT EXISTS watchlist (
                user_id INTEGER NOT NULL,
                car_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, car_id),
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                FOREIGN KEY (car_id) REFERENCES cars (id) ON DELETE CASCADE
            )
        ''')
        db.commit()
    except Exception as e:
        print(f"Watchlist table creation note: {e}")
    
    try:
        cursor = db.execute('''
            SELECT c.* FROM cars c
            INNER JOIN watchlist w ON c.id = w.car_id
            WHERE w.user_id = ?
            ORDER BY w.created_at DESC
        ''', (user['id'],))
        
        cars = []
        for row in cursor.fetchall():
            car = dict(row)
            # Parse JSON fields for any field that might contain JSON
            for key, value in car.items():
                if value and isinstance(value, str) and (value.startswith('[') or value.startswith('{')):
                    try:
                        import json
                        car[key] = json.loads(value)
                    except:
                        pass  # Keep as string if not valid JSON
            cars.append(car)
        
        return jsonify({'success': True, 'cars': cars})
    except Exception as e:
        print(f"Get watchlist error: {e}")
        return jsonify({'success': False, 'error': 'Failed to fetch watchlist'}), 500


@bp.route('', methods=['POST'])
def add_to_watchlist():
    """Add a car to the watchlist."""
    user = require_auth()
    if not user:
        return jsonify({'success': False, 'error': 'Authentication required'}), 401
    
    if not request.is_json:
        return jsonify({'success': False, 'error': 'Content-Type must be application/json'}), 400
    
    data = request.get_json(silent=True)
    if not data or 'car_id' not in data:
        return jsonify({'success': False, 'error': 'car_id is required'}), 400
    
    car_id = data['car_id']
    
    db = get_db()
    
    # Check if car exists
    car = db.execute('SELECT id FROM cars WHERE id = ?', (car_id,)).fetchone()
    if not car:
        return jsonify({'success': False, 'error': 'Car not found'}), 404
    
    try:
        db.execute('''
            INSERT OR IGNORE INTO watchlist (user_id, car_id)
            VALUES (?, ?)
        ''', (user['id'], car_id))
        db.commit()
        return jsonify({'success': True, 'message': 'Added to watchlist'})
    except Exception as e:
        print(f"Add to watchlist error: {e}")
        return jsonify({'success': False, 'error': 'Failed to add to watchlist'}), 500


@bp.route('/<int:car_id>', methods=['DELETE'])
def remove_from_watchlist(car_id):
    """Remove a car from the watchlist."""
    user = require_auth()
    if not user:
        return jsonify({'success': False, 'error': 'Authentication required'}), 401
    
    db = get_db()
    
    try:
        db.execute('''
            DELETE FROM watchlist
            WHERE user_id = ? AND car_id = ?
        ''', (user['id'], car_id))
        db.commit()
        return jsonify({'success': True, 'message': 'Removed from watchlist'})
    except Exception as e:
        print(f"Remove from watchlist error: {e}")
        return jsonify({'success': False, 'error': 'Failed to remove from watchlist'}), 500
