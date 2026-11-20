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


# --------------- update user --------------- # 


# Update user
PUT {{host}}/api/user
Authorization: Token {{token}}
{
  "user": {
    "bio": "Updated bio"
  }
}
HTTP 200
[Asserts]
jsonpath "$.user.username" == "auth_{{uid}}"
jsonpath "$.user.email" == "auth_{{uid}}@test.com"
jsonpath "$.user.bio" == "Updated bio"
jsonpath "$.user.image" == "default-avatar.png"
jsonpath "$.user.token" isString
jsonpath "$.user.token" not isEmpty


# Verify update persisted
GET {{host}}/api/user
Authorization: Token {{token}}
HTTP 200
[Asserts]
jsonpath "$.user.username" == "auth_{{uid}}"
jsonpath "$.user.email" == "auth_{{uid}}@test.com"
jsonpath "$.user.bio" == "Updated bio"
jsonpath "$.user.image" == "default-avatar.png"
jsonpath "$.user.token" isString
jsonpath "$.user.token" not isEmpty


# Update user bio to empty string - should normalize to null
PUT {{host}}/api/user
Authorization: Token {{token}}
{
  "user": {
    "bio": ""
  }
}
HTTP 200
[Asserts]
jsonpath "$.user.bio" == null


# Verify empty string normalization persisted
GET {{host}}/api/user
Authorization: Token {{token}}
HTTP 200
[Asserts]
jsonpath "$.user.bio" == null


# Restore bio then set to null
PUT {{host}}/api/user
Authorization: Token {{token}}
{
  "user": {
    "bio": "Temporary bio"
  }
}
HTTP 200
[Asserts]
jsonpath "$.user.bio" == "Temporary bio"


# Update user bio to null - should accept for nullable field
PUT {{host}}/api/user
Authorization: Token {{token}}
{
  "user": {
    "bio": null
  }
}
HTTP 200
[Asserts]
jsonpath "$.user.bio" == null


# Verify null bio persisted
GET {{host}}/api/user
Authorization: Token {{token}}
HTTP 200
[Asserts]
jsonpath "$.user.bio" == null


# Restore bio
PUT {{host}}/api/user
Authorization: Token {{token}}
{
  "user": {
    "bio": "Updated bio"
  }
}
HTTP 200
[Asserts]
jsonpath "$.user.username" == "auth_{{uid}}"
jsonpath "$.user.email" == "auth_{{uid}}@test.com"
jsonpath "$.user.bio" == "Updated bio"
jsonpath "$.user.image" == "default-avatar.png"
jsonpath "$.user.token" isString
jsonpath "$.user.token" not isEmpty


# Update user image
PUT {{host}}/api/user
Authorization: Token {{token}}
{
  "user": {
    "image": "https://example.com/photo.jpg"
  }
}
HTTP 200
[Asserts]
jsonpath "$.user.image" == "https://example.com/photo.jpg"


# Verify image update persisted
GET {{host}}/api/user
Authorization: Token {{token}}
HTTP 200
[Asserts]
jsonpath "$.user.image" == "https://example.com/photo.jpg"


# Update image to empty string - should normalize to null
PUT {{host}}/api/user
Authorization: Token {{token}}
{
  "user": {
    "image": ""
  }
}
HTTP 200
[Asserts]
jsonpath "$.user.image" == "default-avatar.png"


# Verify image empty string normalization persisted
GET {{host}}/api/user
Authorization: Token {{token}}
HTTP 200
[Asserts]
jsonpath "$.user.image" == "default-avatar.png"


# Set image then update to null - should accept for nullable field
PUT {{host}}/api/user
Authorization: Token {{token}}
{
  "user": {
    "image": "https://example.com/temp.jpg"
  }
}
HTTP 200
[Asserts]
jsonpath "$.user.image" == "https://example.com/temp.jpg"

PUT {{host}}/api/user
Authorization: Token {{token}}
{
  "user": {
    "image": null
  }
}
HTTP 200
[Asserts]
jsonpath "$.user.image" == "default-avatar.png"


# Verify default image persisted
GET {{host}}/api/user
Authorization: Token {{token}}
HTTP 200
[Asserts]
jsonpath "$.user.image" == "default-avatar.png"


# Update username and email
PUT {{host}}/api/user
Authorization: Token {{token}}
{
  "user": {
    "username": "auth_{{uid}}_upd",
    "email": "auth_{{uid}}_upd@test.com"
  }
}
HTTP 200
[Asserts]
jsonpath "$.user.username" == "auth_{{uid}}_upd"
jsonpath "$.user.email" == "auth_{{uid}}_upd@test.com"
jsonpath "$.user.bio" == "Updated bio"
jsonpath "$.user.image" == "default-avatar.png"
jsonpath "$.user.token" isString
jsonpath "$.user.token" not isEmpty
[Captures]
updated_token: jsonpath "$.user.token"


# Verify username/email update persisted
GET {{host}}/api/user
Authorization: Token {{updated_token}}
HTTP 200
[Asserts]
jsonpath "$.user.username" == "auth_{{uid}}_upd"
jsonpath "$.user.email" == "auth_{{uid}}_upd@test.com"
jsonpath "$.user.bio" == "Updated bio"
jsonpath "$.user.image" == "default-avatar.png"
jsonpath "$.user.token" isString
jsonpath "$.user.token" not isEmpty


# Update email to empty string - should reject
PUT {{host}}/api/user
Authorization: Token {{token}}
{
  "user": {
    "email": ""
  }
}
HTTP 422


# Update email to malformed value - should reject
PUT {{host}}/api/user
Authorization: Token {{token}}
{
  "user": {
    "email": "not-an-email"
  }
}
HTTP 422
[Asserts]
jsonpath "$.errors.email[0]" == "is invalid"


# Update username to empty string - should reject
PUT {{host}}/api/user
Authorization: Token {{token}}
{
  "user": {
    "username": ""
  }
}
HTTP 422


# Update email to null - should reject
PUT {{host}}/api/user
Authorization: Token {{token}}
{
  "user": {
    "email": null
  }
}
HTTP 422


# Update username to null - should reject
PUT {{host}}/api/user
Authorization: Token {{token}}
{
  "user": {
    "username": null
  }
}
HTTP 422


# === NIST 800-63B password policy for PUT /user ===
# Ref: https://pages.nist.gov/800-63-3/sp800-63b.html section 5.1.1.2
# Rules: min 8 chars, must accept at least 64 chars, no composition, no breach check (demo)


# Update password to empty string - should reject
PUT {{host}}/api/user
Authorization: Token {{token}}
{
  "user": {
    "password": ""
  }
}
HTTP 422


# Update password to null - should reject
PUT {{host}}/api/user
Authorization: Token {{token}}
{
  "user": {
    "password": null
  }
}
HTTP 422


# Update password shorter than 8 chars - should reject
PUT {{host}}/api/user
Authorization: Token {{token}}
{
  "user": {
    "password": "short7c"
  }
}
HTTP 422


# Update password to 8 char simple word - should accept
PUT {{host}}/api/user
Authorization: Token {{token}}
{
  "user": {
    "password": "bonjour1"
  }
}
HTTP 200


# Update password to 64 chars - should accept
PUT {{host}}/api/user
Authorization: Token {{token}}
{
  "user": {
    "password": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  }
}
HTTP 200


# --------------- get current user --------------- # 


# GET /user no auth
GET {{host}}/api/user
HTTP 401
[Asserts]
jsonpath "$.errors.token[0]" == "is missing"


# PUT /user no auth
PUT {{host}}/api/user
{
  "user": {
    "bio": "test"
  }
}
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