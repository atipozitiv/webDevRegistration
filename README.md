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




## Вот несколько шаблонов для тестов новых моделей:  

POST /api/enrollments/courses/{id курса}/enroll    
запись на курс, нужен токен

-------------------------------

POST /api/enrollments/lessons/{id урока}/complete    
пройти урок, нужен токен

-------------------------------

DELETE /api/enrollments/lessons/{id урока}/complete    
отменить прохождение урока, нужне токен

-------------------------------

GET /api/enrollments/courses/{id курса}/progress    
узнать прогресс, нужен токен

-------------------------------

GET /api/enrollments/courses/{id курса}/enrollments/count    
подсчет студентов записавшихся на курс
