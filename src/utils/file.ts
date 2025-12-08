import * as fs from 'fs';
import { join } from 'path';

/**
 * Check if the folder exists, create it if it does not exist
 * @param filePath file path
 */
export const checkDirAndCreate = (filePath: string) => {
  console.log('checkDirAndCreate filePath', filePath);
  const pathArr = filePath.split('/');
  let checkPath = join('./');
  let item: string;
  for (item of pathArr) {
    checkPath += `/${item}`;
    if (!fs.existsSync(checkPath)) {
      console.log('checkPath', checkPath);
      fs.mkdirSync(checkPath);
    }
  }
};
