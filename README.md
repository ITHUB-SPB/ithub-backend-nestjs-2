<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZW5kxJeh19yU6-aQsonuX6DMCjYwoUlSCFFTnoGQiNctDFRzMIQCcHszb&s=10" width="620" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>

## КТ #4. Завершение работы над функционалом согласно спецификации. Система уведомлений: мгновенные уведомления через `WebSocket`, отложенные уведомления через `MongoDB` и `@nestjs/schedule`.

## КТ #3. Расширенная пользовательская модель, работа с почтой, очередями и файлами.

В данной контрольной точке вам предлагается переписать ролевую пользовательскую модель с использованием встроенных пакетов `@nestjs/authentication` и `@nestjs/authorization`, добавить отправку транзакционных писем (подтверждение почтового адреса) через `@nestjs/email` и `@nestjs/bullmq`, сохранение файлов через `@nestjs/storage`.

_Максимальный балл: 20_

1. Адаптируйте существующий функционал для использования возможностей пакетов `@nestjs/authentication` и `@nestjs/authorization` (4 балла)

2. Добавьте на слой данных сущность для хранения рефреш-токенов и соответствующие методы контроллера и сервиса (3 балла)

3. Опишите `policy` для проверки прав на защищенные операции, задекорируйте все конечные точки (в том числе публичные) (3 балла)

4. Реализуйте механики подтверждения почты. При успешной регистрации в очередь `transactional-email`, описанную через `@nestjs/bullmq`, должна добавляться задача `verify-email`. Воркер обрабатывает задачу с использованием `@nestjs/email`: в dev-окружении можно использовать логирующую заглушку либо `nodemailer/ethereal`, в проде - настроенный `nodemailer` с корректным `smtp`. Логин доступен только после перехода по ссылке подтверждения: до тех пор отдавать пользователю ошибку с соответствующим пояснением (6 баллов)

5. Добавить возможность загрузки пользовательских аватарок через `@nestjs/storage` (4 баллов)

_Максимальный балл: 20_

## КТ #2. Пользователи, базовый функционал статей. Работа с данными через `TypeORM`. Сквозные тесты на `vitest` и `supertest`.

В данной контрольной точке вам предлагается реализовать и протестировать часть функционала согласно спецификации. Ошибки и статус коды по всему функционалу должны соответствовать требованиям.

Критерий приемки функционала - зеленые e2e-тесты. При отсутствии е2е-теста нужно первично написать его, перенеся из формата `hurl`-тестов в формат автотеста на базе `vitest` и `supertest`.

_Максимальный балл: 20_

### Автотесты для существующего функционала (5 баллов)

- тесты ошибок логина (`auth.hurl` 159-212, 2 балла)
- тесты ошибок регистрации (`auth.hurl` 61-156, 3 балла)

### Пользователи (3 балла)

_При реализации используйте упрощенные схемы, без поля `following`_

- Получение профиля `GET /api/profiles/:username`

### Теги (2 балла)

- Получение тегов `GET /api/tags`

### Статьи (10 баллов)

_При реализации используйте упрощенные схемы, без полей `favorited`, `favoritesCount`, `following`, `updatedAt`_

- Создание статьи `POST /api/articles` (3 балла)

- Получение статьи `GET /api/articles/:slug` (4 балла)

- Удаление статьи `DELETE /api/articles/:slug` (3 балла)

## Спецификация

### Схемы ответов

_Убедитесь, что используете корректный заголовок `Content-Type: application/json; charset=utf-8`_

#### `User`

```json
{
  "user": {
    "email": "jake@jake.jake",
    "token": "jwt.token.here",
    "username": "jake",
    "bio": null,
    "image": null
  }
}
```

#### `Profile`

```json
{
  "profile": {
    "username": "jake",
    "bio": "I work at statefarm",
    "image": "https://api.realworld.io/images/smiley-cyrus.jpg",
    "following": false
  }
}
```

#### `Article`

```json
{
  "article": {
    "slug": "how-to-train-your-dragon",
    "title": "How to train your dragon",
    "description": "Ever wonder how?",
    "body": "It takes a Jacobian",
    "tagList": ["dragons", "training"],
    "createdAt": "2016-02-18T03:22:56.637Z",
    "updatedAt": "2016-02-18T03:48:35.824Z",
    "favorited": false,
    "favoritesCount": 0,
    "author": {
      "username": "jake",
      "bio": "I work at statefarm",
      "image": "https://i.stack.imgur.com/xHWG8.jpg",
      "following": false
    }
  }
}
```

#### `Articles`

```json
{
  "articles":[{
    "slug": "how-to-train-your-dragon",
    "title": "How to train your dragon",
    "description": "Ever wonder how?",
    "tagList": ["dragons", "training"],
    "createdAt": "2016-02-18T03:22:56.637Z",
    "updatedAt": "2016-02-18T03:48:35.824Z",
    "favorited": false,
    "favoritesCount": 0,
    "author": {
      "username": "jake",
      "bio": "I work at statefarm",
      "image": "https://i.stack.imgur.com/xHWG8.jpg",
      "following": false
    }
  }, {
    "slug": "how-to-train-your-dragon-2",
    "title": "How to train your dragon 2",
    "description": "So toothless",
    "tagList": ["dragons", "training"],
    "createdAt": "2016-02-18T03:22:56.637Z",
    "updatedAt": "2016-02-18T03:48:35.824Z",
    "favorited": false,
    "favoritesCount": 0,
    "author": {
      "username": "jake",
      "bio": "I work at statefarm",
      "image": "https://i.stack.imgur.com/xHWG8.jpg",
      "following": false
    }
  }],
  "articlesCount": 2
}
```

#### `Comment`

```json
{
  "comment": {
    "id": 1,
    "createdAt": "2016-02-18T03:22:56.637Z",
    "updatedAt": "2016-02-18T03:22:56.637Z",
    "body": "It takes a Jacobian",
    "author": {
      "username": "jake",
      "bio": "I work at statefarm",
      "image": "https://i.stack.imgur.com/xHWG8.jpg",
      "following": false
    }
  }
}
```

#### `Comments`

```json
{
  "comments": [{
    "id": 1,
    "createdAt": "2016-02-18T03:22:56.637Z",
    "updatedAt": "2016-02-18T03:22:56.637Z",
    "body": "It takes a Jacobian",
    "author": {
      "username": "jake",
      "bio": "I work at statefarm",
      "image": "https://i.stack.imgur.com/xHWG8.jpg",
      "following": false
    }
  }]
}
```

#### `Tags`

```json
{
  "tags": [
    "reactjs",
    "angularjs"
  ]
}
```

### Конечные точки 

_Для получения пользовательских данных используйте хедер запроса `Authorization: Token jwt.token.here`_

#### Аутентификация

`POST /api/users/login`

Пример тела запроса:

```json
{
  "user":{
    "email": "jake@jake.jake",
    "password": "jakejake"
  }
}
```

Не требует аутентификации, возвращает `User`

Обязательные поля: `email` (валидный), `password`

#### Регистрация

`POST /api/users`

Пример тела запроса:

```json
{
  "user":{
    "username": "Jacob",
    "email": "jake@jake.jake",
    "password": "jakejake"
  }
}
```

Не требует аутентификации, возвращает `User`

Обязательные поля: `email` (валидный), `username`, `password`

#### Текущий пользователь

`GET /api/user`

Требует аутентификации, возвращает текущего `User`

#### Обновление пользователя

`PUT /api/user`

Пример тела запроса:

```json
{
  "user":{
    "email": "jake@jake.jake",
    "bio": "I like to skateboard",
    "image": "https://i.stack.imgur.com/xHWG8.jpg"
  }
}
```

Требует аутентификации, возвращает `User`

Разрешенные поля: `email` (валидный), `username`, `password`, `image`, `bio`

#### Получение профиля

`GET /api/profiles/:username`

Аутентификация опциональная, возвращает `Profile`

#### Подписка на пользователя

`POST /api/profiles/:username/follow`

Требует аутентификации, возвращает `Profile`

#### Отписка от пользователя

`DELETE /api/profiles/:username/follow`

Требует аутентификации, возвращает `Profile`

#### Список статей

`GET /api/articles`

По умолчанию возвращает наиболее свежие статьи. 

Для фильтрации можно использовать параметры запроса `tag`, `author`, `favorited`:

- `?tag=AngularJS`

- `?author=jake`

- `?favorited=jake`

Для пагинации можно использовать лимит (по умолчанию 20) и отступ (по умолчанию 0):

- `?limit=20`

- `?offset=0`

Аутентификация опциональная, возвращает `Articles`, сортированные по новизне

#### Лента статей

`GET /api/articles/feed`

Для пагинации можно использовать лимит (по умолчанию 20) и отступ (по умолчанию 0):

- `?limit=20`

- `?offset=0`

Требует аутентификации, возвращает `Articles`, созданные пользователями, на которых подписан текущий пользователь, сортированные по новизне

#### Получение статьи

`GET /api/articles/:slug`

Не требует аутентификации, возвращает `Article`

#### Создание статьи

`POST /api/articles`

Пример тела запроса:

```json
{
  "article": {
    "title": "How to train your dragon",
    "description": "Ever wonder how?",
    "body": "You have to believe",
    "tagList": ["reactjs", "angularjs", "dragons"]
  }
}
```

Требует аутентификации, возвращает `Article`

Обязательные поля: `title`, `description`, `body`

Опциональные поля: `tagList` как массив строк

#### Обновление статьи

`PUT /api/articles/:slug`

Пример тела запроса:

```json
{
  "article": {
    "title": "Did you train your dragon?"
  }
}
```

Требует аутентификации, возвращает обновленный `Article`

Разрешенные поля: `title`, `description`, `body`

При обновлении поля `title` также обновляется `slug`

> Слаг (`slug`) — это URL-идентификатор статьи. Требуется, чтобы он был уникальной строкой — даже если названия статей совпадают. Способ достижения этого — на ваше усмотрение.

#### Удаление статьи

`DELETE /api/articles/:slug`

Требует аутентификации

#### Добавление комментария к статье

`POST /api/articles/:slug/comments`

Пример тела запроса:

```json
{
  "comment": {
    "body": "His name was my name too."
  }
}
```

Требует аутентификации, возвращает созданный `Comment`

Обязательное поле: `body`

#### Получение комментариев к статье

`GET /api/articles/:slug/comments`

Аутентификация опциональная, возвращает `Comments`

#### Удаление комментария

`DELETE /api/articles/:slug/comments/:id`

Требует аутентификации

#### Добавление статьи в "любимые"

`POST /api/articles/:slug/favorite`

Требует аутентификации, возвращает `Article`


#### Удаление статьи из "любимых"

`DELETE /api/articles/:slug/favorite`

Требует аутентификации, возвращает `Article`

#### Получение тегов

`GET /api/tags`

Не требует аутентификации, возвращает `Tags`

### Ошибки и статус-коды

#### Ошибки валидации

Если запрос невалидный, возвращать `422` и описание в следующем формате:

```json
{
  "errors":{
    "body": [
      "can't be empty"
    ]
  }
}
```

Используйте следующие текстовые пояснения к полям:

| Message                  | Когда использовать                                                      |
| ------------------------ | ----------------------------------------------------------------------- |
| `can't be blank`         | обязательное поле отсутствует, равно `null` или является пустой строкой |
| `is invalid`             | значение поля невалидно, например когда `email` не валиден              |
| `has already been taken` | уникальное поле (`username`, `email`) уже занято другим пользователем   |

Значения `Email` должны быть валидными почтовыми адресами (`format: email` в спецификации `OpenAPI`). 

#### Иные статус-коды

- `401` при отсутствии пользовательских данных для защищенных конечных точек

- `403` если пользователь не имеет достаточных прав на действие

- `404` если ресурс не найден