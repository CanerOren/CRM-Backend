const { PrismaClient } = require('@prisma/client');
const { getNowDateTime } = require('../../core/models/functions/index');

const prisma = new PrismaClient();
const model = prisma.meeting_contact_types;
