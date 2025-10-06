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
POST /api/lessons создать урок (нужен токен)  
{  
  "title": "Введение в swift",  
  "content": "В этом уроке мы познакомимся с основами языка swift",  
  "course": "68dfed4ec9fca7f8df69d403",  (id курса)  
  "order": 1  
}  

-------------------

POST /api/comments добавить комментарий (нужен токен)  
{  
  "lesson": "68e3997ac32a1adca4df81da", (id урока)  
  "text": "Урок во! Скибиди доб ес ес"  
}  
