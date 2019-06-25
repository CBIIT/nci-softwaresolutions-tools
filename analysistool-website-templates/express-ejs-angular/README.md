# express-ejs-angular template

This template uses the express framework in conjunction with ejs templates and optionally, angular components for dynamic pages. The directory structure is as follows:

### Configuration (config.json)

This file contains global configuration, as well as any constants that may be used in ejs templates (such as application name, root url, navbar routes, etc). The `config.json.dev.example` and `config.json.prod.example` files are sample configurations.


### Application Client (/client)

This folder contains the angular client, generated using the angular cli. In this template, `npm run build` will build the angular application and copy it under `/public/angular/`.


### Public Document Root (/public)

This folder contains static assets (including compiled js/css files), which should be publicly available.


### Application Server (/server)

This folder contains controllers, routes, models, and views for the express server.


### Test Folder (/test)

This folder contains end-to-end, integration, and unit tests written using the mocha framework and the chai assertions library.
