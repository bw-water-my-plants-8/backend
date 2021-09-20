# Base URL

https://water-my-plants-8-api.herokuapp.com/

## Endpoints

###Auth

[POST] /auth/signup : Requires {username, password, phone} where username is at least 3 characters and phone is a valid phone number with a country code (US numbers would start with +1 ). Returns the newly created user, {user_id, username, password, phone_number}, where password is hashed and phone_number is the e164 formatted number.

[POST] /auth/login : Requries valid credentials {username, password}. Returns {message, token, user} where user is the full user object.