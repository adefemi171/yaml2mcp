import * as path from 'path';
import Mocha from 'mocha';
import { glob } from 'glob';

export function run(): Promise<void> {
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
    timeout: 10000,
    reporter: 'spec'
  });

  const testsRoot = path.resolve(__dirname, '..');

  return new Promise((c, e) => {
    glob('**/*.test.js', { cwd: testsRoot })
      .then(files => {
        if (files.length === 0) {
          console.log('No test files found in', testsRoot);
          c();
          return;
        }

        console.log(`Found ${files.length} test file(s)`);
        files.forEach(f => {
          const filePath = path.resolve(testsRoot, f);
          mocha.addFile(filePath);
        });

        mocha.run((failures: number) => {
          if (failures > 0) {
            e(new Error(`${failures} test(s) failed.`));
          } else {
            c();
          }
        });
      })
      .catch(err => {
        e(err);
      });
  });
}
