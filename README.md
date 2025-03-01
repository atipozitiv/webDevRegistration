# Для запуска
## Установка зависимостей:
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
