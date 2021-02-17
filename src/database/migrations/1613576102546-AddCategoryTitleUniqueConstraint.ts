import { MigrationInterface, QueryRunner, TableUnique } from 'typeorm';

export default class AddCategoryTitleUniqueConstraint1613576102546
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createUniqueConstraint(
      'categories',
      new TableUnique({
        columnNames: ['title'],
        name: 'CategoryTitleUK',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraint('categories', 'CategoryTitleUK');
  }
}
