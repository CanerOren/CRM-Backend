const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { getNowDateTime } = require('../../core/models/functions/index');
const model = prisma.users;
