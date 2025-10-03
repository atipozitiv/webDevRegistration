# Для запуска
## Установка зависимостей:
- npm install 
- yarn add express
- yarn add -D typescript @types/node @types/express
- yarn add -D ts-node
- yarn add -D nodemon
- yarn add mongoose

## Подключение базы:
Запустить Docker,
В консоль:
- docker run -d -p 27017:27017 --name mongo mongo:latest
- docker exec -it mongo bash
- mongosh
Скопировать зеленую ссылку и вставить ее в файл .env в MONGO_URI, там же придумываем JWT_SECRET

## Запуск:
- yarn run dev




## Вот несколько шаблонов для тестов:
POST /api/auth/signup (создать пользователя)
{
  "username": "myLogin",
  "password": "myPass111",
  "name": "Илья",
  "surname": "Игорев",
  "role": "teacher"
}

-------------------

POST /api/courses (создать курс)(нужен токен, т.к. курс создает пользователь)
{
  "title": "Мобильная разработка",
  "description": "Изучение мобильной разработки",
  "price": 777,
  "category": "programming",
  "level": "beginner",
  "published": true,
  "tags": "[\"mobile\", \"android\", \"ios\"]",
  "imageUrl": "https://i.pinimg.com/736x/34/36/87/3436874588a193cbe1f0b7f928053ab3.jpg"
}

------------------

POST /api/courses/{id курса} (добавить курс в избранное)(нужен токен)

------------------

GET /api/courses (получить курсы)
параметры для пагинации, сортировки и фильтрации:
?page=1&limit=10&sort=-createdAt&category=programming&level=beginner&published=true&minPrice=0&maxPrice=1000&tags=javascript,web&
