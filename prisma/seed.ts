import { resolve } from 'node:path';
import { config } from 'dotenv';
import {
  PrismaClient,
  AccountType,
  CurrencyCode,
} from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

config({ path: resolve(__dirname, '../.env') });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const clients = [
  { name: 'Ana Lima', email: 'ana.lima@email.com', doc: '63520324008' },
  { name: 'Bruno Souza', email: 'bruno.souza@email.com', doc: '15612030096' },
  { name: 'Carla Mendes', email: 'carla.mendes@email.com', doc: '58660849027' },
  {
    name: 'Diego Oliveira',
    email: 'diego.oliveira@email.com',
    doc: '99364785096',
  },
  {
    name: 'Elisa Ferreira',
    email: 'elisa.ferreira@email.com',
    doc: '42352878004',
  },
  {
    name: 'Felipe Castro',
    email: 'felipe.castro@email.com',
    doc: '57081459005',
  },
  {
    name: 'Gabriela Nunes',
    email: 'gabriela.nunes@email.com',
    doc: '29748389014',
  },
  {
    name: 'Henrique Alves',
    email: 'henrique.alves@email.com',
    doc: '39816360071',
  },
  {
    name: 'Isabela Rocha',
    email: 'isabela.rocha@email.com',
    doc: '48763578034',
  },
  { name: 'Joao Martins', email: 'joao.martins@email.com', doc: '48763578034' },
];

function randomDeposit(): number {
  return Math.round((Math.random() * 49500 + 500) * 100) / 100;
}

function accountNumber(index: number): string {
  return `${String(index + 1).padStart(6, '0')}-${index % 9}`;
}

async function main() {
  console.log('Seeding database...');

  const basket = await prisma.basket.create({
    data: {
      name: 'Carteira Diversificada B3',
      items: {
        create: [
          { code: 'PETR4', percentage: 25 },
          { code: 'VALE3', percentage: 25 },
          { code: 'ITUB4', percentage: 20 },
          { code: 'WEGE3', percentage: 15 },
          { code: 'ABEV3', percentage: 15 },
        ],
      },
    },
  });

  console.log(`Basket created: id=${basket.id} name=${basket.name}`);

  const masterClient = await prisma.client.upsert({
    where: { email: 'master@stockpurchaser.com' },
    update: {},
    create: {
      name: 'Master Account',
      email: 'master@stockpurchaser.com',
      mainDocumentCode: '71800677090',
      monthlyDeposit: 0,
      graphicalAccount: {
        create: {
          account: '000000-0',
          type: AccountType.MASTER,
          currencies: { create: { amount: 0, code: CurrencyCode.BRL } },
        },
      },
    },
  });

  console.log(`Master client created: id=${masterClient.id}`);

  for (let i = 0; i < clients.length; i++) {
    const { name, email, doc } = clients[i];
    const client = await prisma.client.upsert({
      where: { email },
      update: {},
      create: {
        name,
        email,
        mainDocumentCode: doc,
        monthlyDeposit: randomDeposit(),
        graphicalAccount: {
          create: {
            account: accountNumber(i),
            type: AccountType.CHILD,
            currencies: { create: { amount: 0, code: CurrencyCode.BRL } },
          },
        },
      },
    });

    console.log(`Client created: id=${client.id} name=${client.name}`);
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
