from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel


SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

DATABASE_URL = "postgresql://postgres:Qwerty.*12345@localhost:5432/datacose"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
session = SessionLocal()

Base = declarative_base()

app = FastAPI()
security = HTTPBearer()


origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)

    def verify_password(self, password):
        return pwd_context.verify(password, self.password_hash)


class Author(Base):
    __tablename__ = 'authors'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)

    books = relationship('Book', back_populates='author')


class Book(Base):
    __tablename__ = 'books'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    page_numbers = Column(Integer, nullable=False)

    author_id = Column(Integer, ForeignKey('authors.id'))
    author = relationship('Author', back_populates='books')


# Base.metadata.create_all(bind=engine)

# user1 = User(username="user", password_hash="e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446")
# session.add(user1)
# session.commit()

# author1 = Author(name='Jack London')
# author2 = Author(name='Tolstoy')
# author3 = Author(name='Dosteyevski')
# author4 = Author(name='Charles Dickens')
# author5 = Author(name='Victor Hugo')

# book1 = Book(name='Beyaz Dis', page_numbers=200, author=author1)
# book2 = Book(name='Insan Ne ile Yasar', page_numbers=300, author=author2)
# book3 = Book(name='Kumarbaz', page_numbers=150, author=author3)
# book4 = Book(name='Suc ve Ceza', page_numbers=250, author=author3)
# book5 = Book(name='Iki Sehrin Hikayesi', page_numbers=250, author=author4)
# book6 = Book(name='Sefiller', page_numbers=250, author=author5)
# book7 = Book(name='Yeraltindan Notlar', page_numbers=150, author=author3)
# book8 = Book(name='Buyuk Umutlar', page_numbers=250, author=author4)
# book9 = Book(name='Antikaci Dukkani', page_numbers=250, author=author4)
# book10 = Book(name='Martin Eden', page_numbers=250, author=author1)

# session.add_all([author1, author2, author3, author4, author5, book1, book2, book3, book4, book5, book6, book7, book8, book9, book10])
# session.commit()


def get_db():
    db = session
    try:
        yield db
    finally:
        db.close()


# def create_user(username: str, password: str):
#     hashed_password = pwd_context.hash(password)
#     user = User(username=username, password_hash=hashed_password)
#     session.add(user)
#     session.commit()
#     return user

# new_user = create_user(username="user", password="user123")
# print("new_user", new_user)


def get_user(username: str):
    user = session.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    return user


def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user.verify_password(password):
        raise HTTPException(status_code=400, detail="Kullanıcı adı veya şifre yanlış")
    return user


def create_access_token(user_id: int):
    data = {"sub": str(user_id)}
    access_token = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
    return access_token


def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Geçersiz token")


@app.post("/login")
async def login(request: Request):
    data = await request.json()
    username = data.get('username')
    password = data.get('password')
    user = authenticate_user(username, password)
    access_token = create_access_token(user.id)
    return {"access_token": access_token, "token_type": "bearer"}


@app.get('/books')
async def get_books():
    books = session.query(Book).all()
    books_data = [
        {
            'id': book.id,
            'name': book.name,
            'page_numbers': book.page_numbers,
            'author_id': book.author_id,
            'author': book.author.name
        }
        for book in books
    ]
    session.close()
    return JSONResponse(content=books_data)

class BookCreate(BaseModel):
    name: str
    page_numbers: int
    author_id: int


@app.post('/books')
def create_book(book: BookCreate):
    print("BOOK: ", book)
    new_book = Book(name=book.name, page_numbers=book.page_numbers, author_id=book.author_id)
    session.add(new_book)
    session.commit()
    session.refresh(new_book)
    print("NEW BOOK: ", new_book)
    return new_book


# @app.put("/books/{book_id}")
# def update_book(book_id: int, book: Book):
#     existing_book = session.query(Book).get(book_id)
#     if existing_book:
#         existing_book.name = book.name
#         existing_book.pages = book.pages
#         existing_book.author = book.author
#         session.commit()
#         return existing_book
#     return {"error": "Book not found"}


# @app.delete("/books/{book_id}")
# def delete_book(book_id: int):
#     existing_book = session.query(Book).get(book_id)
#     if existing_book:
#         session.delete(existing_book)
#         session.commit()
#         return {"message": "Book deleted successfully"}
#     return {"error": "Book not found"}


@app.get('/authors')
async def get_authors():
    authors = session.query(Author).all()
    authors_data = [
        {
            'id': author.id,
            'name': author.name,
            'book_count': len(author.books),
            'books': [
                {
                    'name': book.name,
                    'page_numbers': book.page_numbers
                } 
                for book in author.books
            ]
        }
        for author in authors
    ]
    session.close()
    return JSONResponse(content=authors_data)

@app.get("/test")
def protected_route(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user_id = decode_access_token(credentials.credentials)
    return {"user_id": user_id}
