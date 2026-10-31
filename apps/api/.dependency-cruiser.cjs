/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-file-cycle',
      comment: 'The import graph must have no cycle (ADR-0002).',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-module-cycle',
      comment:
        'The call graph of modules must have no cycle (docs/architecture.md). ' +
        'A module is a folder directly under src. This catches a cycle between ' +
        'modules that no single chain of files closes, which no-file-cycle misses.',
      severity: 'error',
      scope: 'folder',
      from: { path: '^src/[^/]+$' },
      to: { path: '^src/[^/]+$', circular: true },
    },
    {
      name: 'no-deep-module-import',
      comment:
        "Import another module only from files at its root, not from its subfolders. " +
        'no-module-cycle cannot see through an edge that ends in a subfolder: ' +
        'dependency-cruiser aggregates the importing side to its module folder, ' +
        'but not the imported side.',
      severity: 'error',
      from: { path: '^src/([^/]+)/' },
      to: { path: '^src/[^/]+/.+/', pathNot: '^src/$1/' },
    },
    {
      name: 'no-unresolvable-import',
      comment: 'An import that cannot be followed is an edge the cycle rules cannot see.',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    // Type-only imports are edges too: a cycle through one is still a cycle.
    tsPreCompilationDeps: true,
    // Off by default; without it packages that only declare `exports`, such as
    // @repairflow/contracts, do not resolve.
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
    },
  },
};
