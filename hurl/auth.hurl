# --------------- setup --------------- # 


# Register main user
POST {{host}}/api/users
{
  "user": {
    "username": "prof_{{uid}}",
    "email": "prof_{{uid}}@test.com",
    "password": "password123"
  }
}
HTTP 201
[Captures]
token: jsonpath "$.user.token"


# Register celeb user
POST {{host}}/api/users
{
  "user": {
    "username": "celeb_{{uid}}",
    "email": "celeb_{{uid}}@test.com",
    "password": "password123"
  }
}
HTTP 201


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


# --------------- register user --------------- # 


# Register empty username
POST {{host}}/api/users
{
  "user": {
    "username": "",
    "email": "ea_blank_{{uid}}@test.com",
    "password": "password123"
  }
}
HTTP 422
[Asserts]
jsonpath "$.errors.username[0]" == "can't be blank"


# Register empty email
POST {{host}}/api/users
{
  "user": {
    "username": "ea_blank_{{uid}}",
    "email": "",
    "password": "password123"
  }
}
HTTP 422
[Asserts]
jsonpath "$.errors.email[0]" == "can't be blank"


# Register empty password
POST {{host}}/api/users
{
  "user": {
    "username": "ea_blankp_{{uid}}",
    "email": "ea_blankp_{{uid}}@test.com",
    "password": ""
  }
}
HTTP 422
[Asserts]
jsonpath "$.errors.password[0]" == "can't be blank"


# Register malformed email
POST {{host}}/api/users
{
  "user": {
    "username": "ea_badmail_{{uid}}",
    "email": "ea_badmail_{{uid}}_not_an_email",
    "password": "password123"
  }
}
HTTP 422
[Asserts]
jsonpath "$.errors.email[0]" == "is invalid"


# Register valid user for duplicate and login tests
POST {{host}}/api/users
{
  "user": {
    "username": "ea_dup_{{uid}}",
    "email": "ea_dup_{{uid}}@test.com",
    "password": "password123"
  }
}
HTTP 201
[Captures]
token: jsonpath "$.user.token"


# Register duplicate username
POST {{host}}/api/users
{
  "user": {
    "username": "ea_dup_{{uid}}",
    "email": "ea_dup2_{{uid}}@test.com",
    "password": "password123"
  }
}
HTTP 409
[Asserts]
jsonpath "$.errors.username[0]" == "has already been taken"


# Register duplicate email
POST {{host}}/api/users
{
  "user": {
    "username": "ea_dup2_{{uid}}",
    "email": "ea_dup_{{uid}}@test.com",
    "password": "password123"
  }
}
HTTP 409
[Asserts]
jsonpath "$.errors.email[0]" == "has already been taken"


# --------------- login user --------------- # 


# Login empty email
POST {{host}}/api/users/login
{
  "user": {
    "email": "",
    "password": "password123"
  }
}
HTTP 422
[Asserts]
jsonpath "$.errors.email[0]" == "can't be blank"


# Login empty password
POST {{host}}/api/users/login
{
  "user": {
    "email": "ea_dup_{{uid}}@test.com",
    "password": ""
  }
}
HTTP 422
[Asserts]
jsonpath "$.errors.password[0]" == "can't be blank"


# Login malformed email
POST {{host}}/api/users/login
{
  "user": {
    "email": "ea_dup_{{uid}}@",
    "password": "password123"
  }
}
HTTP 422
[Asserts]
jsonpath "$.errors.email[0]" == "is invalid"


# Login wrong password
POST {{host}}/api/users/login
{
  "user": {
    "email": "ea_dup_{{uid}}@test.com",
    "password": "wrongpassword"
  }
}
HTTP 401
[Asserts]
jsonpath "$.errors.credentials[0]" == "invalid"

# --------------- get current user --------------- # 


# GET /user no auth
GET {{host}}/api/user
HTTP 401
[Asserts]
jsonpath "$.errors.token[0]" == "is missing"


# --------------- get profile --------------- # 


# Get profile without auth
GET {{host}}/api/profiles/celeb_{{uid}}
HTTP 200
[Asserts]
jsonpath "$.profile.username" == "celeb_{{uid}}"
jsonpath "$.profile.bio" == null
jsonpath "$.profile.image" == null


# Get profile with auth
GET {{host}}/api/profiles/celeb_{{uid}}
Authorization: Token {{token}}
HTTP 200
[Asserts]
jsonpath "$.profile.username" == "celeb_{{uid}}"
jsonpath "$.profile.bio" == null
jsonpath "$.profile.image" == null