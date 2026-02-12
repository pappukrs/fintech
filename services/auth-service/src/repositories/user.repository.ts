import { db } from '@platform/common';
import { UserDoc, UserRole } from '../models/user';

export class UserRepository {
  private static readonly SCHEMA = 'auth_schema';
  private static readonly TABLE = 'users';

  async findByEmail(email: string): Promise<UserDoc | null> {
    const query = `
      SELECT * FROM ${UserRepository.SCHEMA}.${UserRepository.TABLE}
      WHERE email = $1
    `;
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
  }

  async findById(id: string): Promise<UserDoc | null> {
    const query = `
      SELECT * FROM ${UserRepository.SCHEMA}.${UserRepository.TABLE}
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  async create(user: Partial<UserDoc>): Promise<UserDoc> {
    const query = `
      INSERT INTO ${UserRepository.SCHEMA}.${UserRepository.TABLE} (email, password, role)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await db.query(query, [user.email, user.password, user.role || UserRole.USER]);
    return result.rows[0];
  }

  async update(id: string, updates: Partial<UserDoc>): Promise<UserDoc | null> {
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');

    const query = `
      UPDATE ${UserRepository.SCHEMA}.${UserRepository.TABLE}
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await db.query(query, [id, ...values]);
    return result.rows[0] || null;
  }
}
