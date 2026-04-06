import { FastifyInstance } from 'fastify';
import { prisma } from '../../config/database';
import { LeadStatus } from '@prisma/client';

export async function dashboardRoutes(app: FastifyInstance) {
  // Overview - KPIs
  app.get('/api/metrics/overview', async (request, reply) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalLeads, leadsToday, byStatus, totalCommission] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: today } } }),
      prisma.lead.groupBy({ by: ['status'], _count: true }),
      prisma.partnerSubmission.aggregate({
        where: { status: 'APPROVED' },
        _sum: { commission: true },
      }),
    ]);

    const approved = byStatus.find(s => s.status === LeadStatus.APPROVED)?._count || 0;
    const paid = byStatus.find(s => s.status === LeadStatus.PAID)?._count || 0;
    const conversionRate = totalLeads > 0 ? ((approved + paid) / totalLeads * 100).toFixed(1) : '0';

    return reply.send({
      totalLeads,
      leadsToday,
      approved: approved + paid,
      conversionRate: parseFloat(conversionRate),
      totalCommission: totalCommission._sum.commission || 0,
      byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
    });
  });

  // Lista de leads
  app.get('/api/leads', async (request, reply) => {
    const query = request.query as any;
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const status = query.status;
    const search = query.search;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { cpf: { contains: search } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          submissions: { select: { partner: true, status: true, approvedAmount: true } },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return reply.send({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  });

  // Detalhe do lead
  app.get('/api/leads/:id', async (request, reply) => {
    const { id } = request.params as any;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        conversations: {
          include: {
            messages: { orderBy: { createdAt: 'asc' } },
          },
        },
        submissions: true,
        events: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });

    if (!lead) return reply.status(404).send({ error: 'Lead nao encontrado' });
    return reply.send(lead);
  });

  // Metricas diarias
  app.get('/api/metrics/daily', async (request, reply) => {
    const days = parseInt((request.query as any).days || '30');
    const since = new Date();
    since.setDate(since.getDate() - days);

    const leads = await prisma.lead.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, status: true },
    });

    const daily: Record<string, { leads: number; approved: number }> = {};
    leads.forEach(lead => {
      const day = lead.createdAt.toISOString().split('T')[0];
      if (!daily[day]) daily[day] = { leads: 0, approved: 0 };
      daily[day].leads++;
      if (lead.status === LeadStatus.APPROVED || lead.status === LeadStatus.PAID) {
        daily[day].approved++;
      }
    });

    return reply.send(daily);
  });

  // Configuracoes
  app.get('/api/config', async (_request, reply) => {
    const configs = await prisma.systemConfig.findMany();
    const result = configs.reduce((acc, c) => ({ ...acc, [c.key]: c.value }), {});
    return reply.send(result);
  });

  app.put('/api/config', async (request, reply) => {
    const body = request.body as Record<string, any>;
    for (const [key, value] of Object.entries(body)) {
      await prisma.systemConfig.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    }
    return reply.send({ ok: true });
  });
}
