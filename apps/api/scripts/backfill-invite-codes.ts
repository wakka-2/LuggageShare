/**
 * One-time backfill: give every existing user a unique invite code so they can
 * refer others. New users get one automatically at signup (UsersService.create).
 *
 * Run once after applying the wallet-credits migration:
 *   npx ts-node scripts/backfill-invite-codes.ts
 *
 * Idempotent — only touches users whose inviteCode is still null.
 */
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

async function uniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const bytes = crypto.randomBytes(8);
    let code = '';
    for (let i = 0; i < 8; i++) code += ALPHABET[bytes[i] % ALPHABET.length];
    const clash = await prisma.user.findUnique({
      where: { inviteCode: code },
      select: { id: true },
    });
    if (!clash) return code;
  }
  return crypto.randomBytes(9).toString('hex').toUpperCase();
}

async function main() {
  const users = await prisma.user.findMany({
    where: { inviteCode: null },
    select: { id: true },
  });
  console.log(`Backfilling invite codes for ${users.length} user(s)...`);

  for (const user of users) {
    const inviteCode = await uniqueCode();
    await prisma.user.update({ where: { id: user.id }, data: { inviteCode } });
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
