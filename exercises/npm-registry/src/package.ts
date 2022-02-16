import { RequestHandler } from 'express';
import got from 'got';
import {NPMPackageVersion, PackageInfo} from './types';

const MAX_DEPTH:number = 50; // Security variable to avoid createDepTree() go into infinite loop.
let depthCounter: number = 0;

/** Create a deep nested PackageInfo object containing all dependencies for any package. */
async function createDepTree(name: string, version: string ) : Promise<PackageInfo> {
  let packageInfo = await getPackageInfo(name, version);
  console.log(`Requesting pacakage --> ${name}:${version}`)
  // If package has dependencies we need to create a dependency tree recursively.
  if (packageInfo.hasOwnProperty("dependencies") && packageInfo.dependencies
      && !!Object.keys(packageInfo.dependencies).length && depthCounter++ < MAX_DEPTH) {
    let dependencies: PackageInfo[] = [];
    console.log(depthCounter)
    for (const [key, value] of Object.entries(packageInfo.dependencies)) {
        dependencies.push(await createDepTree(key, value.replace(/[^\d.]/g, '')));
    }
    return {name: name, version: version, dependencies: dependencies};
  }
  // If no dependencies just return name and version for current package.
  return {name: packageInfo.name, version: packageInfo.version, dependencies: null};
}

/** Get package information from NPM registry */
async function getPackageInfo(name: string, version: string = ''): Promise<NPMPackageVersion>  {
  try {
    return  await got(`https://registry.npmjs.org/${name}/${version}`).json();
  } catch (error) {
    // If https://registry.npmjs.org/ does not returns info about the package an error message will be added to the
    // dependency tree.
    return Promise.resolve({name, version: `${version}: ERROR -> Dependencies could not be found!`, dependencies: null});
  }
}


/**
 * Retrieves a JSON object containing a tree with all transitive dependencies for a package.
 */
export const getPackage: RequestHandler = async function (req, res, next) {
  const { name, version } = req.params;
  depthCounter = 0;
  let result:PackageInfo | {};
  result = await createDepTree(name, version);
  console.log("Request END: Sending response...");
  return res.status(200).json(result);

};
