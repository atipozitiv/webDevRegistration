# Для запуска
## Установка зависимостей:
npm run install:all  
docker-compose up -d  
docker ps (проверить контейнеры)
- mongodb на порту 27017
- rabbitmq на порту 5672 и 15672

## В корне создать .env:
```HTML
API_GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
COURSES_SERVICE_PORT=3002
ENROLLMENT_SERVICE_PORT=3003

MONGO_URI=mongodb://admin:password@localhost:27017/educational-platform?authSource=admin

JWT_SECRET={придумать код}

RABBITMQ_URL=amqp://localhost:5672
```
## Скачать nginx 
https://nginx.org/download/nginx-1.24.0.zip
## Заменить nginx.conf на:
```HTML
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    server {
        listen 3000;
        server_name localhost;
        
        # Health check
        location /health {
            add_header Content-Type application/json;
            return 200 '{"status":"Nginx Gateway is running"}';
        }
        
        # Auth service
        location /api/auth/ {
            proxy_pass http://localhost:3001/;
            proxy_set_header Host $host;
        }

        # Lessons service
        location /api/lessons/ {
            proxy_pass http://localhost:3002/lessons/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Courses service
        location /api/courses/ {
            proxy_pass http://localhost:3002/;
            proxy_set_header Host $host;
        }
        
        # Comments
        location /api/comments/ {
            proxy_pass http://localhost:3002/;
            proxy_set_header Host $host;
        }
        
        # Enrollment service
        location /api/enrollments/ {
            proxy_pass http://localhost:3003/;
            proxy_set_header Host $host;
        }
    }
}
```

## Запустить nginx

## Запустить все три сервиса
в отдельных терменалах yarn run dev

## Проверить, что все запустилось правильно:
http://localhost:3000/health

http://localhost:3000/api/auth/health

http://localhost:3000/api/courses/health

http://localhost:3000/api/enrollments/health 

## Вот несколько шаблонов для тестов работы сервисов:  


POST http://localhost:3000/api/auth/signup Регистрация пользователя  
```HTML
{
  "username": "testuser",
  "password": "password123",
  "name": "Test",
  "surname": "User", 
  "role": "student"
}
```

-------------------------------

POST http://localhost:3000/api/courses/ Создать курс (нужен токен)
```HTML
{
  "title": "Node.js Микросервисы",
  "price": 2999,
  "category": "Programming",
  "published": true
}
```
-------------------------------

POST http://localhost:3000/api/enrollments/courses/{id курса}/enroll Записаться на курс (нужен токен) 

-------------------------------

POST http://localhost:3000/api/enrollments/lessons/{id урока}/complete пройти урок
```HTML
{
  "courseId": "{id курса}"
}
```