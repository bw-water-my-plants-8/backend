# Base URL

https://water-my-plants-8-api.herokuapp.com/

## Endpoints

Restricted endpoints can only be accessed with a valid token in the authorization header.

### Auth

[POST] /auth/register : Requires {username, password, phone} (all strings) where username is at least 3 characters and phone is a valid phone number with a country code (US numbers would start with +1 ). Returns the newly created user, {user_id, username, password, phone_number}, where password is hashed and phone_number is the e164 formatted number.

[POST] /auth/login : Requries valid credentials {username, password}. Returns {message, token, user} where user is the full user object.

### Plants [RESTRICTED]

[GET] /plants : Returns an array of plant objects.

[POST] /plants : Requires a plant object, {species (string), frequency (integer), timeframe (string), nickname (optional string)}. Returns the newly created plant object.

[PUT] /plants/:plant_id : Requires a plant object (same as above, though may include last_watered and next_water strings) and returns the updated object.

[PUT] /plant/:plant_id/water : Requires a plant object (same as post) and returns the updated object, where last_watered is the current time and next_water is the h2oFrequency after the current time.

[DELETE] /plants/:plant_id : Returns the deleted object.