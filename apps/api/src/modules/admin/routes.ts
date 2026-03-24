import { actions, teams } from '@workshop/shared';
import { Router } from 'express';
import { z } from 'zod';

import { createRateLimit } from '../../lib/rateLimit.js';
import { requireAdminAuth } from '../auth/adminAuth.js';
import type { Repository } from '../sessions/types.js';

const challengeSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  joinCode: z.string().min(1),
  isActive: z.boolean(),
});

const resourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum([
    'Container',
    'Kubernetes',
    'Serverless',
    'VirtualMachine',
    'Database',
    'Storage',
    'Identity',
  ]),
  assetTypeLabel: z.string().optional(),
  createdAt: z.string().optional(),
  tags: z.array(z.string()).optional(),
  account: z.string().optional(),
  detailsLabel: z.string().optional(),
  detailRows: z
    .array(
      z.object({
        field: z.string().min(1),
        value: z.string().min(1),
      })
    )
    .optional(),
  environment: z.string().min(1),
  ownerHints: z.array(z.enum(teams)).min(1),
  exposure: z.enum(['public', 'internal', 'restricted']),
  notes: z.string().optional(),
});

const scenarioSchema = z
  .object({
    order: z.number().int().nonnegative(),
    title: z.string().min(1),
    description: z.string().min(1),
    severityLabel: z.enum(['low', 'medium', 'high', 'critical']),
    sla: z.object({
      status: z.enum(['overdue', 'due_soon']),
      days: z.number().int().nonnegative(),
    }),
    remediation: z.string().min(1),
    diagram: z
      .object({
        src: z.string().min(1),
        alt: z.string().min(1),
        title: z.string().min(1).optional(),
      })
      .optional(),
    resources: z.array(resourceSchema).min(1),
    securityLesson: z.string().min(1),
    ignoreFeedbackOptions: z.array(z.string().min(1)).length(3),
    answer: z.object({
      action: z.enum(actions),
      ownerTeam: z.enum(teams).optional(),
      ignoreFeedback: z.string().min(1).optional(),
    }),
  })
  .superRefine((scenario, ctx) => {
    if (scenario.answer.action === 'ignore') {
      if (!scenario.answer.ignoreFeedback) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Ignore scenarios require correct vendor feedback.',
          path: ['answer', 'ignoreFeedback'],
        });
      }
      return;
    }

    if (!scenario.answer.ownerTeam) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Fix and snooze scenarios require a correct owner.',
        path: ['answer', 'ownerTeam'],
      });
    }
  });

export function createAdminRouter(repository: Repository) {
  const router = Router();
  const adminRateLimit = createRateLimit({
    key: 'admin',
    maxRequests: 20,
    windowMs: 60_000,
  });

  router.use(adminRateLimit);
  router.use(requireAdminAuth);

  router.get('/dashboard', async (_request, response) => {
    response.json(await repository.getAdminDashboard());
  });

  router.delete('/sessions/:sessionId', async (request, response) => {
    const revoked = await repository.revokeSession(request.params.sessionId);
    if (!revoked) {
      response.status(404).json({ message: 'Session not found' });
      return;
    }

    response.status(204).send();
  });

  router.post('/challenges', async (request, response) => {
    try {
      const challenge = await repository.upsertChallenge(
        null,
        challengeSchema.parse(request.body)
      );
      response.status(201).json(challenge);
    } catch (error) {
      response.status(400).json({
        message:
          error instanceof Error ? error.message : 'Unable to save challenge',
      });
    }
  });

  router.put('/challenges/:challengeId', async (request, response) => {
    try {
      const challenge = await repository.upsertChallenge(
        request.params.challengeId,
        challengeSchema.parse(request.body)
      );
      response.json(challenge);
    } catch (error) {
      response.status(400).json({
        message:
          error instanceof Error ? error.message : 'Unable to update challenge',
      });
    }
  });

  router.post(
    '/challenges/:challengeId/scenarios',
    async (request, response) => {
      try {
        const scenario = await repository.upsertScenario(
          request.params.challengeId,
          null,
          scenarioSchema.parse(request.body)
        );
        response.status(201).json(scenario);
      } catch (error) {
        response.status(400).json({
          message:
            error instanceof Error ? error.message : 'Unable to save scenario',
        });
      }
    }
  );

  router.put(
    '/challenges/:challengeId/scenarios/:scenarioId',
    async (request, response) => {
      try {
        const scenario = await repository.upsertScenario(
          request.params.challengeId,
          request.params.scenarioId,
          scenarioSchema.parse(request.body)
        );
        response.json(scenario);
      } catch (error) {
        response.status(400).json({
          message:
            error instanceof Error
              ? error.message
              : 'Unable to update scenario',
        });
      }
    }
  );

  return router;
}
