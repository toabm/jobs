import * as getPort from 'get-port';
import got from 'got';
import { Server } from 'http';
import { createApp } from '../src/app';
import {NPMPackageVersion} from "../src/types";

describe('/package/:name/:version endpoint', () => {
  let server: Server;
  let port: number;

  beforeAll(async (done) => {
    port = await getPort();
    server = createApp().listen(port, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  it('Responds right name and version number', async () => {
    const packageName = 'react';
    const packageVersion = '16.13.0';

    const res: any = await got(
      `http://localhost:${port}/package/${packageName}/${packageVersion}`,
    ).json();

    expect(res.name).toEqual(packageName);
    expect(res.version).toEqual(packageVersion);
  });

  it('Returns dependencies', async () => {
    const packageName = 'react';
    const packageVersion = '16.13.0';

    const res: NPMPackageVersion = await got(
      `http://localhost:${port}/package/${packageName}/${packageVersion}`,
    ).json();

    expect(res.dependencies).toEqual(
        [
           { "name": "loose-envify",
             "version": "1.1.0",
             "dependencies": [{"dependencies": null, "name": "js-tokens", "version": "1.0.1"}]
           },

          { "name": "object-assign", "version": "4.1.1", "dependencies": null},

          { "name": "prop-types",
            "version": "15.6.2",
            "dependencies": [
              { "dependencies": [{"dependencies": null, "name": "js-tokens", "version": "3.0.0"}],
                "name": "loose-envify",
                "version": "1.3.1"},
              { "name": "object-assign", "version": "4.1.1", "dependencies": null}],
          }]
    );
  });
});
