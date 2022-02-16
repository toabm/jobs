import { RequestHandler } from 'express';
import got from 'got';
import {NPMPackageVersion, PackageInfo} from './types';


/** Create a deep nested PackageInfo object containing all dependencies for any package. */
async function createDepTree(name: string, version: string ) : Promise<PackageInfo> {
  let packageInfo = await getPackageInfo(name, version);
  // If package has dependencies we need to create a dependency tree recursively.
  if (packageInfo.hasOwnProperty("dependencies") && packageInfo.dependencies && !!Object.keys(packageInfo.dependencies).length) {
    let dependencies: PackageInfo[] = [];
    for (const [key, value] of Object.entries(packageInfo.dependencies)) {
        dependencies.push(await createDepTree(key, value.replace(/[^\d.]/g, '')));
    }
    return {name: name, version: version, dependencies: dependencies};
  }
  return {name, version, dependencies: null}; // If no dependencies just return name and version for current package.
}

/** Get package information from NPM registry */
async function getPackageInfo(name: string, version: string = ''): Promise<NPMPackageVersion>  {
  try {
    return  got(`https://registry.npmjs.org/${name}/${version}`).json();
  } catch (error) {
    return {name, version, dependencies: { error: "Package info could not be retrieved!"}}
  }
}


/**
 * Retrieves a JSON object containing a tree with all transitive dependencies for a package.
 */
export const getPackage: RequestHandler = async function (req, res, next) {
  const { name, version } = req.params;
  try {
    let result:PackageInfo;
    result = await createDepTree(name, version);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).send("Compruebe el num. de version.");
  }
};
