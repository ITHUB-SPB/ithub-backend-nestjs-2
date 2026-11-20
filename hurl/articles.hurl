# --------------- setup --------------- # 

# Setup: Register
POST {{host}}/api/users
{
  "user": {
    "username": "art_{{uid}}",
    "email": "art_{{uid}}@test.com",
    "password": "password123"
  }
}
HTTP 201
[Captures]
token: jsonpath "$.user.token"


# Register user A
POST {{host}}/api/users
{
  "user": {
    "username": "authz_a_{{uid}}",
    "email": "authz_a_{{uid}}@test.com",
    "password": "password123"
  }
}
HTTP 201
[Captures]
token_a: jsonpath "$.user.token"


# Register user B
POST {{host}}/api/users
{
  "user": {
    "username": "authz_b_{{uid}}",
    "email": "authz_b_{{uid}}@test.com",
    "password": "password123"
  }
}
HTTP 201
[Captures]
token_b: jsonpath "$.user.token"

# --------------- create article --------------- #

# Create article no auth
POST {{host}}/api/articles
{
  "article": {
    "title": "No Auth Article",
    "description": "test",
    "body": "test"
  }
}
HTTP 401
[Asserts]
jsonpath "$.errors.token[0]" == "is missing"


# Create article empty title
POST {{host}}/api/articles
Authorization: Token {{token}}
{
  "article": {
    "title": "",
    "description": "test",
    "body": "test"
  }
}
HTTP 422
[Asserts]
jsonpath "$.errors.title[0]" == "can't be blank"


# Create article empty description
POST {{host}}/api/articles
Authorization: Token {{token}}
{
  "article": {
    "title": "Err Desc {{uid}}",
    "description": "",
    "body": "test"
  }
}
HTTP 422
[Asserts]
jsonpath "$.errors.description[0]" == "can't be blank"


# Create article empty body
POST {{host}}/api/articles
Authorization: Token {{token}}
{
  "article": {
    "title": "Err Body {{uid}}",
    "description": "test",
    "body": ""
  }
}
HTTP 422
[Asserts]
jsonpath "$.errors.body[0]" == "can't be blank"


# Duplicate titles are allowed (each gets a unique slug)
POST {{host}}/api/articles
Authorization: Token {{token}}
{
  "article": {
    "title": "Dup Title {{uid}}",
    "description": "first",
    "body": "first"
  }
}
HTTP 201
[Captures]
slug1: jsonpath "$.article.slug"

POST {{host}}/api/articles
Authorization: Token {{token}}
{
  "article": {
    "title": "Dup Title {{uid}}",
    "description": "second",
    "body": "second"
  }
}
HTTP 201
[Captures]
slug2: jsonpath "$.article.slug"
[Asserts]
jsonpath "$.article.slug" != {{slug1}}

# --------------- get article by slug --------------- #

# Get single article
GET {{host}}/api/articles/{{slug}}
HTTP 200
[Asserts]
jsonpath "$.article.title" == "Test Article {{uid}}"
jsonpath "$.article.slug" == "{{slug}}"
jsonpath "$.article.description" == "Test description"
jsonpath "$.article.body" == "Test body content"
jsonpath "$.article.tagList" isList
jsonpath "$.article.createdAt" matches "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}"
jsonpath "$.article.updatedAt" matches "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}"
jsonpath "$.article.author.username" == "art_{{uid}}"


# GET unknown slug
GET {{host}}/api/articles/unknown-slug-{{uid}}
HTTP 404
[Asserts]
jsonpath "$.errors.article[0]" == "not found"

# --------------- update article by slug --------------- #

# Update article body
PUT {{host}}/api/articles/{{slug}}
Authorization: Token {{token}}
{
  "article": {
    "body": "Updated body content"
  }
}
HTTP 200
[Asserts]
jsonpath "$.article.title" == "Test Article {{uid}}"
jsonpath "$.article.slug" == "{{slug}}"
jsonpath "$.article.description" == "Test description"
jsonpath "$.article.body" == "Updated body content"
jsonpath "$.article.tagList" isList
jsonpath "$.article.tagList" count == 2
jsonpath "$.article.tagList" contains "d_{{uid}}"
jsonpath "$.article.tagList" contains "t_{{uid}}"
jsonpath "$.article.createdAt" == "{{created_at}}"
jsonpath "$.article.updatedAt" != "{{updated_at}}"
jsonpath "$.article.author.username" == "art_{{uid}}"


# Verify update persisted
GET {{host}}/api/articles/{{slug}}
HTTP 200
[Asserts]
jsonpath "$.article.title" == "Test Article {{uid}}"
jsonpath "$.article.slug" == "{{slug}}"
jsonpath "$.article.description" == "Test description"
jsonpath "$.article.body" == "Updated body content"
jsonpath "$.article.tagList" isList
jsonpath "$.article.tagList" count == 2
jsonpath "$.article.tagList" contains "d_{{uid}}"
jsonpath "$.article.tagList" contains "t_{{uid}}"
jsonpath "$.article.createdAt" matches "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}"
jsonpath "$.article.updatedAt" matches "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}"
jsonpath "$.article.author.username" == "art_{{uid}}"


# Update article without tagList: tags should be preserved
PUT {{host}}/api/articles/{{slug}}
Authorization: Token {{token}}
{
  "article": {
    "body": "Body without touching tags"
  }
}
HTTP 200
[Asserts]
jsonpath "$.article.body" == "Body without touching tags"
jsonpath "$.article.tagList" count == 2
jsonpath "$.article.tagList" contains "d_{{uid}}"
jsonpath "$.article.tagList" contains "t_{{uid}}"


# Update article: remove all tags with empty array
PUT {{host}}/api/articles/{{slug}}
Authorization: Token {{token}}
{
  "article": {
    "tagList": []
  }
}
HTTP 200
[Asserts]
jsonpath "$.article.tagList" isList
jsonpath "$.article.tagList" count == 0


# Verify tags were actually removed
GET {{host}}/api/articles/{{slug}}
HTTP 200
[Asserts]
jsonpath "$.article.tagList" isList
jsonpath "$.article.tagList" count == 0


# Update article: tagList null should be rejected
PUT {{host}}/api/articles/{{slug}}
Authorization: Token {{token}}
{
  "article": {
    "tagList": null
  }
}
HTTP 422


# Update no auth
PUT {{host}}/api/articles/some-slug
{
  "article": {
    "body": "test"
  }
}
HTTP 401
[Asserts]
jsonpath "$.errors.token[0]" == "is missing"


# Update unknown slug
PUT {{host}}/api/articles/unknown-slug-{{uid}}
Authorization: Token {{token}}
{
  "article": {
    "body": "test"
  }
}
HTTP 404
[Asserts]
jsonpath "$.errors.article[0]" == "not found"


# --------------- delete article by slug --------------- #

# Delete article
DELETE {{host}}/api/articles/{{slug}}
Authorization: Token {{token}}
HTTP 204


# Verify deletion
GET {{host}}/api/articles/{{slug}}
HTTP 404
[Asserts]
jsonpath "$.errors.article[0]" == "not found"


# Delete no auth
DELETE {{host}}/api/articles/some-slug
HTTP 401
[Asserts]
jsonpath "$.errors.token[0]" == "is missing"


# Delete unknown slug
DELETE {{host}}/api/articles/unknown-slug-{{uid}}
Authorization: Token {{token}}
HTTP 404
[Asserts]
jsonpath "$.errors.article[0]" == "not found"


# --------------- tags --------------- #


# Setup: Create article with tags
POST {{host}}/api/articles
Authorization: Token {{token}}
{
  "article": {
    "title": "Tag Article {{uid}}",
    "description": "For tags",
    "body": "Article body",
    "tagList": ["h_{{uid}}", "t_{{uid}}"]
  }
}
HTTP 201
[Captures]
slug: jsonpath "$.article.slug"


# Get tags
GET {{host}}/api/tags
HTTP 200
[Asserts]
jsonpath "$.tags" isList
jsonpath "$.tags" count >= 1
jsonpath "$.tags" contains "h_{{uid}}"
jsonpath "$.tags" contains "t_{{uid}}"
jsonpath "$.tags[0]" isString
jsonpath "$.tags[1]" isString
jsonpath "$[?count($.*) == 1]" exists


# --------------- authorization checks --------------- #


# User A creates article
POST {{host}}/api/articles
Authorization: Token {{token_a}}
{
  "article": {
    "title": "Authz Article {{uid}}",
    "description": "test",
    "body": "test"
  }
}
HTTP 201
[Captures]
slug: jsonpath "$.article.slug"


# User B tries to delete -> 403
DELETE {{host}}/api/articles/{{slug}}
Authorization: Token {{token_b}}
HTTP 403
[Asserts]
jsonpath "$.errors.article[0]" == "forbidden"


# User B tries to update -> 403
PUT {{host}}/api/articles/{{slug}}
Authorization: Token {{token_b}}
{
  "article": {
    "body": "hijacked"
  }
}
HTTP 403
[Asserts]
jsonpath "$.errors.article[0]" == "forbidden"