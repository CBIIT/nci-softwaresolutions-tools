# express-angular-spa template

This template uses the express framework in conjunction with an angular single page application. The directory structure is as follows:

### Configuration (config.json)

This file contains global configuration. The `config.json.dev.example` and `config.json.prod.example` files are sample configurations.


### Application Client (/client)

This folder contains the angular client, generated using the angular cli. In this template, `npm run build` will build the angular application under `/public/`.


### Public Document Root (/public)

This folder contains the compiled angular application.


### Application Server (/server)

This folder contains api routes, models, and views for the express server.


### Test Folder (/test)

This folder contains end-to-end, integration, and unit tests written using the mocha framework and the chai assertions library.
