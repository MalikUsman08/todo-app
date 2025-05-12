import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTasksTable1715000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types first
    await queryRunner.query(`
      CREATE TYPE task_status_enum AS ENUM ('pending', 'done', 'in_progress', 'paused');
      CREATE TYPE task_priority_enum AS ENUM ('red', 'yellow', 'blue');
    `);

    // Create tasks table
    await queryRunner.query(`
      CREATE TABLE tasks (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        "dueDate" DATE NOT NULL,
        status task_status_enum NOT NULL DEFAULT 'pending',
        priority task_priority_enum NOT NULL DEFAULT 'blue',
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "isActive" BOOLEAN NOT NULL DEFAULT true
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE tasks;`);
    await queryRunner.query(`DROP TYPE task_status_enum;`);
    await queryRunner.query(`DROP TYPE task_priority_enum;`);
  }
}
