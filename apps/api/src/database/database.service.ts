import { AsyncLocalStorage } from 'node:async_hooks';
import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export const PG_POOL = Symbol('PG_POOL');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Drizzle's handle for the open transaction. Read it from `DatabaseService.tx`. */
export type ShopTx = Parameters<
  Parameters<NodePgDatabase['transaction']>[0]
>[0];

interface OpenTransaction {
  shopId: string;
  tx: ShopTx;
  open: boolean;
}

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly db: NodePgDatabase;

  // AsyncLocalStorage follows each call chain on its own, so concurrent requests
  // never see each other's transaction. A field on this singleton would be shared.
  private readonly current = new AsyncLocalStorage<OpenTransaction>();

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {
    this.db = drizzle({ client: pool });
  }

  /**
   * Runs `work` in a transaction that can see only this Shop's rows. It commits when
   * `work` resolves, and rolls everything back and rethrows when `work` rejects.
   * Inside `work`, and anything it calls, query through `tx`.
   *
   * A call made inside an open transaction joins it, so modules calling each other
   * are atomic (ADR-0002).
   */
  async runInShopTransaction<T>(
    shopId: string,
    work: () => Promise<T>,
  ): Promise<T> {
    // Binding the value already stops SQL injection, so this is about failing
    // clearly: '' would look like an empty Shop, because the policy reads it as "no
    // Shop", and any other non-UUID would only fail later, at the policy's cast.
    if (!UUID.test(shopId)) {
      throw new Error('Shop id must be a UUID');
    }
    const normalizedShopId = shopId.toLowerCase();

    const outer = this.current.getStore();
    if (outer?.open) {
      // Running this on its own connection would break atomicity with the outer
      // transaction, and a request has no reason to touch two Shops.
      if (outer.shopId !== normalizedShopId) {
        throw new Error('A transaction is already open for another Shop');
      }
      return work();
    }

    // Drizzle runs BEGIN, this callback, then COMMIT, or ROLLBACK if it throws, on one
    // connection from the pool, and releases that connection afterwards.
    return this.db.transaction(async (tx) => {
      // The `true` argument is what SET LOCAL does: Postgres drops the value when the
      // transaction ends, so it cannot follow the connection back into the pool.
      // set_config rather than SET because SET cannot take a bound parameter. The
      // Shop id travels as $1 and is never part of the SQL text.
      await tx.execute(
        sql`SELECT set_config('app.shop_id', ${normalizedShopId}, true)`,
      );

      const transaction: OpenTransaction = {
        shopId: normalizedShopId,
        tx,
        open: true,
      };
      try {
        return await this.current.run(transaction, work);
      } finally {
        // Closed before COMMIT or ROLLBACK. Work that outlives this point, such as a
        // Promise.all sibling of a failed query, keeps this async context, and the
        // connection may soon serve another Shop, so `tx` must refuse it from now on.
        transaction.open = false;
      }
    });
  }

  /** The open transaction. Throws outside `runInShopTransaction`. */
  get tx(): ShopTx {
    const transaction = this.current.getStore();
    if (!transaction?.open) {
      throw new Error('No Shop transaction is open here');
    }
    return transaction.tx;
  }

  onModuleDestroy() {
    return this.pool.end();
  }
}
