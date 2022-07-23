# HotTakes

This is the part of code done for the 6th project of the Openclassrooms Web Developper Course : Hot takes API for the Piiquante enterprise

## Additionnal files required

### RSA keys
A public and a private RSA key files (any location) are needed for the backend to run

### dotenv
A ".env" file is required in the backend folder, with the following variables :
* DB_PROTOCOL : protocol of the database
* DB_USERNAME : username to use to connect to the database
* DB_PASSWORD : password to use to connect to the database
* DB_HOST : name of the host to connect to
* DB_NAME : name of the database to connect to
* RSA_PRIVATE_KEY : path to the private RSA key file
-> To generate a private RSA key (private.key for exemple) :
ssh-keygen -t rsa -b 4096 -m PEM -f private.key
* RSA_PUBLIC_KEY : path to the public RSA key file (PEM format)
→ To generate a public RSA key to the right format (public.key.pub for exemple) :
openssl rsa -in private.key -pubout -outform PEM -out public.key.pub
* JWT_ISSUER : software organization that issues the JWT
* JWT_AUDIENCE : basically identity of the intended recipient of the JWT

## Install
Run `npm install` (in the backend folder)

## Run server
Run `node server` (in the backend folder)
If you want a server that automatically reload if you change any of the source files,
you can instead run `nodemon server` (after having installing nodemon : `npm install nodemon`)

## Generate OpenAPI documentation
Run `npm run doc` (in the backend folder)

## View OpenAPI documentation
The OpenAPI documentation is here : backend/hot-takes-openapi-doc.json
To visualize the OpenAPI documentation, you can use a VSCode pluggin (Swagger Viewer for example),
or paste the content of hot-takes-openapi-doc.json in the editor on the following website : https://editor.swagger.io/