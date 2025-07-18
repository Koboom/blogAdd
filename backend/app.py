from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
import os
from dotenv import load_dotenv
from authlib.integrations.flask_client import OAuth
import base64 # Eklendi
import json   # Eklendi
import logging # Eklendi

# Authlib loglama seviyesini DEBUG olarak ayarla (zaten vardı, tekrar ekledik)
logging.basicConfig(level=logging.DEBUG)
logging.getLogger('authlib').setLevel(logging.DEBUG)


# .env dosyasını yükle
load_dotenv()

app = Flask(__name__)

# Veritabanı ve JWT ayarları
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_super_secret_key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///blog.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# CORS ayarları (Frontend'den gelen istekleri kabul etmek için)
CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://127.0.0.1:5173"]) # Frontend adresini ekle

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Google OAuth ayarları
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    access_token_url='https://accounts.google.com/o/oauth2/token',
    access_token_params=None,
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    authorize_params=None,
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    client_kwargs={'scope': 'openid profile email'},
    jwks_uri='https://accounts.google.com/.well-known/openid-configuration/jwks',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    issuer='https://accounts.google.com' # Önceki versiyona geri döndük, burayı değiştirmeyin
)

# --- Modeller ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    google_id = db.Column(db.String(120), unique=True, nullable=True) # Google ID için yeni sütun
    posts = db.relationship('Post', backref='author', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email
        }

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    slug = db.Column(db.String(120), unique=True, nullable=False) # SEO dostu URL'ler için

# --- Yardımcı Fonksiyonlar ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'message': 'Token eksik!'}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token süresi doldu!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Geçersiz token!'}), 401
        except Exception as e:
            print(f"Token çözme hatası: {e}")
            return jsonify({'message': 'Token çözme hatası!'}), 401

        if not current_user:
            return jsonify({'message': 'Kullanıcı bulunamadı!'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

# --- Kimlik Doğrulama Rotları ---
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'message': 'Tüm alanları doldurmak zorunludur!'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Kullanıcı adı zaten mevcut.'}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Bu e-posta zaten kullanımda.'}), 409

    new_user = User(username=username, email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    # Kayıttan sonra otomatik giriş yap ve token döndür
    token = jwt.encode({
        'user_id': new_user.id,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24) # 24 saat geçerli
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({'message': 'Kayıt başarılı!', 'token': token, 'user': new_user.to_dict()}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({'message': 'Geçersiz e-posta veya şifre!'}), 401

    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24) # 24 saat geçerli
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({'message': 'Giriş başarılı!', 'token': token, 'user': user.to_dict()}), 200

# Google OAuth Rotları
@app.route('/api/auth/google')
def google_login():
    redirect_uri = os.getenv('GOOGLE_REDIRECT_URI')
    return google.authorize_redirect(redirect_uri)

@app.route('/api/auth/google/callback')
def google_callback():
    token_response = None
    try:
        token_response = google.authorize_access_token()
        print(f"DEBUG: Google API'den alınan token yanıtı (authorize_access_token): {token_response}")

        # Eğer buraya geldiysek, authorize_access_token başarılı oldu demektir.
        # Şimdi id_token'ı parse etmeye çalışalım.
        userinfo = google.parse_id_token(token_response)
        print(f"DEBUG: Başarıyla parse edilen userinfo: {userinfo}")

    except Exception as e:
        print(f"Google OAuth hatası: {e}") # authorize_access_token veya parse_id_token aşamasında hata

        # Hata durumunda bile token_response'u ve id_token payload'ını yazdırmaya çalışalım
        if token_response:
            print(f"DEBUG: Hata anında token_response içeriği: {token_response}")
            id_token_jwt = token_response.get('id_token')
            if id_token_jwt:
                try:
                    parts = id_token_jwt.split('.')
                    if len(parts) == 3:
                        payload_base64 = parts[1] + '==' * (len(parts[1]) % 4)
                        decoded_payload = base64.urlsafe_b64decode(payload_base64).decode('utf-8')
                        payload_data = json.loads(decoded_payload)
                        print(f"DEBUG: id_token payload (manuel decode, hata anında): {payload_data}")
                    else:
                        print(f"DEBUG: id_token JWT formatında değil veya eksik parça sayısı: {len(parts)}")
                except Exception as decode_e:
                    print(f"DEBUG: id_token payload manuel decode hatası (hata anında): {decode_e}")
            else:
                print("DEBUG: token_response içinde 'id_token' bulunamadı (hata anında).")
        else:
            print("DEBUG: token_response null (authorize_access_token hiç başarılı olmadı).")

        return jsonify({'message': f'Google girişi başarısız: {e}'}), 500

    # Eğer buraya kadar geldiysek userinfo başarılı demektir
    email = userinfo.get('email')
    username = userinfo.get('name')
    google_id = userinfo.get('sub')

    user = User.query.filter_by(google_id=google_id).first()
    if not user:
        existing_user_with_email = User.query.filter_by(email=email).first()
        if existing_user_with_email:
            existing_user_with_email.google_id = google_id
            db.session.commit()
            user = existing_user_with_email
        else:
            user = User(username=username, email=email, google_id=google_id)
            db.session.add(user)
            db.session.commit()

    jwt_token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    response = make_response(f"""
    <script>
        localStorage.setItem('token', '{jwt_token}');
        localStorage.setItem('user', JSON.stringify({user.to_dict()}));
        window.location.href = '/auth-success';
    </script>
    """)
    response.headers['Content-Type'] = 'text/html'
    return response


# --- Post Rotları (Örnek) ---
@app.route('/api/posts', methods=['GET'])
def get_posts():
    posts = Post.query.all()
    output = []
    for post in posts:
        output.append({
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'created_at': post.created_at.isoformat(),
            'user_id': post.user_id,
            'slug': post.slug
        })
    return jsonify(output)

@app.route('/api/posts', methods=['POST'])
@token_required
def create_post(current_user):
    data = request.get_json()
    title = data.get('title')
    content = data.get('content')
    slug = data.get('slug')

    if not title or not content or not slug:
        return jsonify({'message': 'Başlık, içerik ve slug zorunludur!'}), 400

    if Post.query.filter_by(slug=slug).first():
        return jsonify({'message': 'Bu slug zaten kullanımda.'}), 409

    new_post = Post(title=title, content=content, slug=slug, user_id=current_user.id)
    db.session.add(new_post)
    db.session.commit()
    return jsonify({'message': 'Gönderi oluşturuldu!', 'post': {
        'id': new_post.id,
        'title': new_post.title,
        'content': new_post.content,
        'created_at': new_post.created_at.isoformat(),
        'user_id': new_post.user_id,
        'slug': new_post.slug
    }}), 201

@app.route('/api/posts/<slug>', methods=['GET'])
def get_post(slug):
    post = Post.query.filter_by(slug=slug).first()
    if not post:
        return jsonify({'message': 'Gönderi bulunamadı!'}), 404
    return jsonify({
        'id': post.id,
        'title': post.title,
        'content': post.content,
        'created_at': post.created_at.isoformat(),
        'user_id': post.user_id,
        'slug': post.slug,
        'author_username': post.author.username
    })

# --- Kullanıcı Rotları (Örnek) ---
@app.route('/api/profile', methods=['GET'])
@token_required
def get_user_profile(current_user):
    return jsonify({'user': current_user.to_dict()}), 200


# --- Veritabanı Migrasyon Komutları ---
# İlk kez çalıştırıldığında (veya model değişikliklerinde):
# flask db init
# flask db migrate -m "Initial migration"
# flask db upgrade
# Daha sonra modelde değişiklik olduğunda:
# flask db migrate -m "Your migration message"
# flask db upgrade


# Uygulama çalıştırma
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)