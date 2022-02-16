import * as express from 'express';
import {getPackage} from './package';
import * as path from "path";
import * as shell from "shelljs";

// Copy all the view folder into dist at server startup.
shell.cp( "-R", "src/views", "dist/" );

/**
 * Bootstrap the application framework
 */
export function createApp() {
  const app = express();

  // Configure Express to use EJS
  app.set( "views", path.join( __dirname, "views" ) );
  app.set( "view engine", "ejs" );
  app.use(express.json());

  // Set static file server.
  app.use(express.static('.'));

  // Define a route handler for the default home page
  app.get( "/", ( req, res ) => {
    // render the index template
    res.render( "index" );
  } );

  // Define endpoints
  app.get('/package/:name/:version', getPackage);
  // app.get('/deptree/:name/:version', getDepTree);

  return app;
}
