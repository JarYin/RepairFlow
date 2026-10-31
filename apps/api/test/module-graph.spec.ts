import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const depcruiseBin = join(
  apiRoot,
  'node_modules/dependency-cruiser/bin/dependency-cruiser.mjs',
);
const config = join(apiRoot, '.dependency-cruiser.cjs');

function depcruise(cwd: string) {
  const result = spawnSync(
    process.execPath,
    [depcruiseBin, 'src', '--config', config],
    { cwd, encoding: 'utf8' },
  );
  return { exitCode: result.status, output: result.stdout + result.stderr };
}

/** Cruises a throwaway source tree, given as a map of path to file content. */
function depcruiseTree(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), 'module-graph-'));
  try {
    for (const [path, content] of Object.entries(files)) {
      const file = join(root, path);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, content);
    }
    return depcruise(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

describe('module graph rules', () => {
  it('fails when two files import each other', () => {
    const { exitCode, output } = depcruiseTree({
      'src/users/users.service.ts': `import { ShopsService } from '../shops/shops.service.js';\nexport class UsersService { shops = new ShopsService(); }\n`,
      'src/shops/shops.service.ts': `import { UsersService } from '../users/users.service.js';\nexport class ShopsService { users = new UsersService(); }\n`,
    });

    expect(output).toContain('no-file-cycle');
    expect(exitCode).not.toBe(0);
  });

  it('fails when two modules call each other through different files', () => {
    const { exitCode, output } = depcruiseTree({
      'src/users/users.service.ts': `import { ShopsService } from '../shops/shops.service.js';\nexport class UsersService { shops = new ShopsService(); }\n`,
      'src/users/users.repository.ts': `export class UsersRepository {}\n`,
      'src/shops/shops.service.ts': `export class ShopsService {}\n`,
      'src/shops/shops.controller.ts': `import { UsersRepository } from '../users/users.repository.js';\nexport class ShopsController { users = new UsersRepository(); }\n`,
    });

    expect(output).toContain('no-module-cycle');
    expect(exitCode).not.toBe(0);
  });

  it('fails on a module cycle that starts in a nested folder', () => {
    const { exitCode, output } = depcruiseTree({
      'src/users/users.service.ts': `import { ShopsService } from '../shops/shops.service.js';\nexport class UsersService { shops = new ShopsService(); }\n`,
      'src/users/users.repository.ts': `export class UsersRepository {}\n`,
      'src/shops/shops.service.ts': `export class ShopsService {}\n`,
      'src/shops/http/shops.controller.ts': `import { UsersRepository } from '../../users/users.repository.js';\nexport class ShopsController { users = new UsersRepository(); }\n`,
    });

    expect(output).toContain('no-module-cycle');
    expect(exitCode).not.toBe(0);
  });

  // Folder cycles only connect through a module's own folder, so an import into
  // another module's subfolder would hide a cycle unless it is refused outright.
  it("fails when a module imports from inside another module's subfolder", () => {
    const { exitCode, output } = depcruiseTree({
      'src/users/dto/user.dto.ts': `export class UserDto {}\n`,
      'src/shops/shops.service.ts': `import { UserDto } from '../users/dto/user.dto.js';\nexport class ShopsService { user = new UserDto(); }\n`,
    });

    expect(output).toContain('no-deep-module-import');
    expect(exitCode).not.toBe(0);
  });

  // An import the cruiser cannot follow is an edge it cannot see in a cycle.
  it('fails when a relative import cannot be resolved', () => {
    const { exitCode, output } = depcruiseTree({
      'src/users/users.service.ts': `import { Missing } from './missing.js';\nexport class UsersService { missing = new Missing(); }\n`,
    });

    expect(output).toContain('no-unresolvable-import');
    expect(exitCode).not.toBe(0);
  });

  it('passes a layered graph, including subfolders inside one module', () => {
    const { exitCode, output } = depcruiseTree({
      'src/main.ts': `import { UsersService } from './users/users.service.js';\nimport { ShopsService } from './shops/shops.service.js';\nnew UsersService();\nnew ShopsService();\n`,
      'src/config.ts': `export const config = {};\n`,
      'src/users/users.service.ts': `import { config } from '../config.js';\nimport { ShopsService } from '../shops/shops.service.js';\nimport { UserDto } from './dto/user.dto.js';\nexport class UsersService { config = config; shops = new ShopsService(); user = new UserDto(); }\n`,
      'src/users/dto/user.dto.ts': `import { rule } from '../rules/user.rule.js';\nexport class UserDto { rule = rule; }\n`,
      'src/users/rules/user.rule.ts': `export const rule = () => true;\n`,
      'src/shops/shops.service.ts': `import { config } from '../config.js';\nexport class ShopsService { config = config; }\n`,
    });

    expect(output).toContain('no dependency violations');
    expect(exitCode).toBe(0);
  });

  it('passes the real API source, and sees its modules', () => {
    const { exitCode, output } = depcruise(apiRoot);

    expect(output).toContain('no dependency violations');
    expect(output).toMatch(/\b[1-9]\d* modules, [1-9]\d* dependencies/);
    expect(exitCode).toBe(0);
  });
});
