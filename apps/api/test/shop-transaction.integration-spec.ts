import { randomUUID } from 'node:crypto';
import { Test } from '@nestjs/testing';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import { DatabaseModule } from '../src/database/database.module.js';
import { DatabaseService } from '../src/database/database.service.js';

// Hard-coded to the Postgres in compose.yaml, and never read from the environment,
// so these tests cannot reach Neon by accident. It logs in as app_tenant because
// superusers skip RLS entirely and would make every assertion below meaningless.
const APP_TENANT_URL = 'postgres://app_tenant@127.0.0.1:5432/repairflow';

// The SQLSTATE Postgres raises when a row fails a policy's WITH CHECK.
const INSUFFICIENT_PRIVILEGE = '42501';

describe('running work in a Shop transaction', () => {
  const pool = new Pool({ connectionString: APP_TENANT_URL, max: 4 });
  const database = new DatabaseService(pool);

  afterAll(() => pool.end());

  // All test data goes in through app_tenant under RLS, and every test uses fresh
  // Shops. Rows from other tests stay committed, which is what a leak would expose.
  const insertNote = (shopId: string, note: string) =>
    database.tx.execute(
      sql`INSERT INTO spike_shop_rows (shop_id, note) VALUES (${shopId}, ${note})`,
    );

  const visibleNotes = async () => {
    const { rows } = await database.tx.execute<{ note: string }>(
      sql`SELECT note FROM spike_shop_rows ORDER BY note`,
    );
    return rows.map((row) => row.note);
  };

  const seedShop = (note: string) => {
    const shopId = randomUUID();
    return database
      .runInShopTransaction(shopId, () => insertNote(shopId, note))
      .then(() => shopId);
  };

  it('connects as a role that cannot get around RLS', async () => {
    const { rows } = await pool.query<{
      current_user: string;
      rolsuper: boolean;
      rolbypassrls: boolean;
    }>(
      `SELECT current_user, rolsuper, rolbypassrls
         FROM pg_roles WHERE rolname = current_user`,
    );

    expect(rows).toEqual([
      { current_user: 'app_tenant', rolsuper: false, rolbypassrls: false },
    ]);
  });

  it("sees only the rows of the transaction's own Shop", async () => {
    const shopA = await seedShop('note of A');
    const shopB = await seedShop('note of B');

    await expect(
      database.runInShopTransaction(shopA, visibleNotes),
    ).resolves.toEqual(['note of A']);
    await expect(
      database.runInShopTransaction(shopB, visibleNotes),
    ).resolves.toEqual(['note of B']);
  });

  it('keeps Shops apart while their transactions are open at the same time', async () => {
    const shops = await Promise.all(
      ['A', 'B', 'C', 'D'].map(async (name) => ({
        note: `note of ${name}`,
        shopId: await seedShop(`note of ${name}`),
      })),
    );

    for (let round = 0; round < 25; round++) {
      // Each work waits until all four are inside their transactions, so the pool
      // must hold four connections and four Shop values at the same moment.
      let opened = 0;
      let openAll = () => {};
      const allOpen = new Promise<void>((resolve) => (openAll = resolve));

      const seen = await Promise.all(
        shops.map(({ shopId }) =>
          database.runInShopTransaction(shopId, async () => {
            if (++opened === shops.length) openAll();
            await allOpen;
            return visibleNotes();
          }),
        ),
      );

      expect(seen).toEqual(shops.map(({ note }) => [note]));
    }
  });

  it('refuses to write a row that belongs to another Shop', async () => {
    const shopA = randomUUID();
    const shopB = await seedShop('note of B');

    await expect(
      database.runInShopTransaction(shopA, () =>
        insertNote(shopB, 'written from A'),
      ),
    ).rejects.toMatchObject({ cause: { code: INSUFFICIENT_PRIVILEGE } });

    await expect(
      database.runInShopTransaction(shopB, visibleNotes),
    ).resolves.toEqual(['note of B']);
  });

  it('does not leave the Shop on the connection after the transaction ends', async () => {
    // One connection only, so the query after the transaction reuses it for certain.
    const onePool = new Pool({ connectionString: APP_TENANT_URL, max: 1 });
    const oneConnection = new DatabaseService(onePool);
    const shopId = randomUUID();
    const backendPid = async () =>
      (await onePool.query('SELECT pg_backend_pid() AS pid')).rows[0].pid;

    try {
      const pidBefore = await backendPid();
      await oneConnection.runInShopTransaction(shopId, () =>
        oneConnection.tx.execute(
          sql`INSERT INTO spike_shop_rows (shop_id, note) VALUES (${shopId}, 'kept')`,
        ),
      );

      const { rows } = await onePool.query('SELECT note FROM spike_shop_rows');

      expect(rows).toEqual([]);
      await expect(backendPid()).resolves.toBe(pidBefore);
    } finally {
      await onePool.end();
    }
  });

  it('sees zero rows and can write nothing when no Shop was set', async () => {
    await seedShop('a row that exists');
    // A brand-new connection, where app.shop_id has never been set at all. This is
    // a different state from a connection that has already used SET LOCAL.
    const freshPool = new Pool({ connectionString: APP_TENANT_URL, max: 1 });

    try {
      const { rows } = await freshPool.query(
        'SELECT note FROM spike_shop_rows',
      );
      expect(rows).toEqual([]);

      await expect(
        freshPool.query(
          'INSERT INTO spike_shop_rows (shop_id, note) VALUES ($1, $2)',
          [randomUUID(), 'no Shop set'],
        ),
      ).rejects.toMatchObject({ code: INSUFFICIENT_PRIVILEGE });
    } finally {
      await freshPool.end();
    }
  });

  it('rolls everything back and rethrows when the work fails', async () => {
    const shopId = randomUUID();
    const failure = new Error('failed in the middle of the work');

    await expect(
      database.runInShopTransaction(shopId, async () => {
        await insertNote(shopId, 'must not survive');
        throw failure;
      }),
    ).rejects.toBe(failure);

    await expect(
      database.runInShopTransaction(shopId, visibleNotes),
    ).resolves.toEqual([]);
  });

  it('gives the connection back after a failure', async () => {
    const onePool = new Pool({ connectionString: APP_TENANT_URL, max: 1 });
    const oneConnection = new DatabaseService(onePool);
    const shopId = randomUUID();

    try {
      await expect(
        oneConnection.runInShopTransaction(shopId, () =>
          oneConnection.tx.execute(sql`SELECT 1 / 0`),
        ),
      ).rejects.toThrow();

      await expect(
        oneConnection.runInShopTransaction(shopId, () =>
          oneConnection.tx.execute(sql`SELECT 1`),
        ),
      ).resolves.toBeDefined();
    } finally {
      await onePool.end();
    }
  });

  it('survives losing the connection in the middle of the work', async () => {
    vi.stubEnv('DATABASE_URL', APP_TENANT_URL);
    const module = await Test.createTestingModule({
      imports: [DatabaseModule],
    }).compile();
    const moduleDatabase = module.get(DatabaseService);

    try {
      await expect(
        moduleDatabase.runInShopTransaction(randomUUID(), async () => {
          const { rows } = await moduleDatabase.tx.execute<{ pid: number }>(
            sql`SELECT pg_backend_pid() AS pid`,
          );
          await pool.query('SELECT pg_terminate_backend($1)', [rows[0].pid]);
          // No query is in flight while the connection dies, so pg can only report
          // it as an 'error' event. Vitest fails the run if that event goes unhandled.
          await new Promise((resolve) => setTimeout(resolve, 200));
          await moduleDatabase.tx.execute(sql`SELECT 1`);
        }),
      ).rejects.toThrow();

      await expect(
        moduleDatabase.runInShopTransaction(randomUUID(), () =>
          moduleDatabase.tx.execute(sql`SELECT 1`),
        ),
      ).resolves.toBeDefined();
    } finally {
      await module.close();
      vi.unstubAllEnvs();
    }
  });

  it.each(['', 'not-a-uuid', `' OR '1'='1`])(
    'refuses %j as a Shop before any work runs',
    async (shopId) => {
      const work = vi.fn(() => Promise.resolve());

      await expect(database.runInShopTransaction(shopId, work)).rejects.toThrow(
        'Shop id must be a UUID',
      );
      expect(work).not.toHaveBeenCalled();
    },
  );

  describe('when one module calls another inside the transaction (ADR-0002)', () => {
    it('joins the open transaction for the same Shop, so both roll back together', async () => {
      const shopId = randomUUID();

      await expect(
        database.runInShopTransaction(shopId, async () => {
          await database.runInShopTransaction(shopId, () =>
            insertNote(shopId, 'written by the inner module'),
          );
          throw new Error('the outer module failed afterwards');
        }),
      ).rejects.toThrow('the outer module failed afterwards');

      await expect(
        database.runInShopTransaction(shopId, visibleNotes),
      ).resolves.toEqual([]);
    });

    it('refuses to start work for a different Shop', async () => {
      const work = vi.fn(() => Promise.resolve());

      await expect(
        database.runInShopTransaction(randomUUID(), () =>
          database.runInShopTransaction(randomUUID(), work),
        ),
      ).rejects.toThrow('already open for another Shop');
      expect(work).not.toHaveBeenCalled();
    });
  });

  describe('reaching the transaction from outside its work', () => {
    it('refuses when no transaction is open', () => {
      expect(() => database.tx).toThrow('No Shop transaction is open');
    });

    // Promise.all rejects on the first failure while its siblings keep running. If
    // they could still reach the transaction, they would query a connection that is
    // already back in the pool and may be serving another Shop.
    it('refuses work that is still running after its transaction ended', async () => {
      let transactionEnded = () => {};
      const ended = new Promise<void>(
        (resolve) => (transactionEnded = resolve),
      );
      let stillRunning: Promise<unknown> = Promise.resolve();

      await database.runInShopTransaction(randomUUID(), () => {
        // Not awaited on purpose: this keeps the transaction's async context alive
        // past the end of the transaction, which is the case under test.
        stillRunning = ended.then(() => database.tx);
        return Promise.resolve();
      });
      transactionEnded();

      await expect(stillRunning).rejects.toThrow('No Shop transaction is open');
    });
  });

  // Dropping FORCE changes nothing that app_tenant can observe, because FORCE only
  // binds a table's owner, and app_tenant owns nothing. So this one reads the catalog.
  // It covers every table with a shop_id, so Sprint 2 tables are checked automatically.
  it('has RLS enabled and forced on every table that holds Shop data', async () => {
    const { rows } = await pool.query<{
      table: string;
      enabled: boolean;
      forced: boolean;
    }>(
      `SELECT c.relname AS table,
              c.relrowsecurity AS enabled,
              c.relforcerowsecurity AS forced
         FROM pg_class c
         JOIN pg_namespace n ON n.oid = c.relnamespace
         JOIN pg_attribute a ON a.attrelid = c.oid
        WHERE n.nspname = 'public'
          AND c.relkind IN ('r', 'p')
          AND a.attname = 'shop_id'
          AND NOT a.attisdropped`,
    );

    expect(rows).toContainEqual({
      table: 'spike_shop_rows',
      enabled: true,
      forced: true,
    });
    expect(rows.filter((row) => !row.enabled || !row.forced)).toEqual([]);
  });
});

describe('DatabaseModule', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('runs a Shop transaction as the role in DATABASE_URL', async () => {
    vi.stubEnv('DATABASE_URL', APP_TENANT_URL);
    const module = await Test.createTestingModule({
      imports: [DatabaseModule],
    }).compile();
    const database = module.get(DatabaseService);

    try {
      const { rows } = await database.runInShopTransaction(randomUUID(), () =>
        database.tx.execute(sql`SELECT current_user`),
      );

      expect(rows).toEqual([{ current_user: 'app_tenant' }]);
    } finally {
      await module.close();
    }
  });

  it('refuses to start without DATABASE_URL', async () => {
    vi.stubEnv('DATABASE_URL', '');

    await expect(
      Test.createTestingModule({ imports: [DatabaseModule] }).compile(),
    ).rejects.toThrow('DATABASE_URL is not set');
  });
});
