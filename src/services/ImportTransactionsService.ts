import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import AppError from '../errors/AppError';
import Category from '../models/Category';

async function loadCSV(filePath: string): Promise<string[]> {
  const readCSVStream = fs.createReadStream(filePath);

  const parseStream = csvParse({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  const parseCSV = readCSVStream.pipe(parseStream);

  const lines: string[] = [];

  parseCSV.on('data', line => {
    lines.push(line);
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  return lines;
}
class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const transactionsRepository = getRepository(Transaction);

    const categoriesRepository = getRepository(Category);

    const fileToImportPath = path.join(uploadConfig.directory, filename);

    const fileToImportExists = await fs.promises.stat(fileToImportPath);

    if (!fileToImportExists) {
      throw new AppError('The file to import not exists.', 400);
    }

    const data: any[] = await loadCSV(fileToImportPath);

    if (!data || data.length === 0) {
      throw new AppError('No data found.', 400);
    }

    const transactions: Array<Transaction> = [];

    const transactionCreatePromises = data.map(async line => {
      const [title, type, value, categoryTitle] = line;

      let category = await categoriesRepository.findOne({
        where: { title: categoryTitle },
      });

      if (!category) {
        category = categoriesRepository.create({ title: categoryTitle });
        await categoriesRepository.save(category);
      }

      const transaction = transactionsRepository.create({
        title,
        value,
        type,
        category,
        category_id: category.id,
      });

      await transactionsRepository.save(transaction);

      transactions.push(transaction);
    });

    await Promise.all(transactionCreatePromises);
    return transactions;
  }
}

export default ImportTransactionsService;
