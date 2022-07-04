# HotTakes

This project is split in 2 sub-projects : the back-end, and the front end

## Back-end

This is the part of code done for the 6th project of the Openclassrooms Web Developper Course : Hot takes API for the Piiquante enterprise

### Additionnal files required

#### RSA keys
A public and a private RSA key files (any location) are needed for the backend to run

#### dotenv
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

### Install
Run `npm install` (in the backend folder)

### Run server
Run `node server` (in the backend folder)
If you want a server that automatically reload if you change any of the source files,
you can instead run `nodemon server` (after having installing nodemon : `npm install nodemon`)

### Generate OpenAPI documentation
Run `npm run doc` (in the backend folder)
To visualize the OpenAPI documentation, you can use a VSCode pluggin (Swagger Viewer for example),
or paste the content of hot-takes-openapi-doc.json in the editor on the following website : https://editor.swagger.io/

## Front-end

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.2.4.
The following commands should be executed in the frontend folder.

### Install
Run `npm install` (in the frontend folder)

### Quick start
Run `npm start` (in the frontend folder)

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
