import { actions, teams } from '@workshop/shared';
import { Router } from 'express';
import { z } from 'zod';

import { getBearerToken } from '../../lib/http.js';
import { createRateLimit } from '../../lib/rateLimit.js';
import type { Repository } from '../sessions/types.js';

const joinSchema = z.object({
  joinCode: z.string().min(1),
  participantName: z.string().min(1),
  existingToken: z.string().min(1).optional(),
});

const resumeSchema = z.object({
  token: z.string().min(1),
  challengeSlug: z.string().min(1),
});

const decisionSchema = z.object({
  action: z.enum(actions),
  ownerTeam: z.enum(teams).optional(),
  ignoreFeedback: z.string().min(1).optional(),
});

export function createPlayerRouter(repository: Repository) {
  const router = Router();
  const joinRateLimit = createRateLimit({
    key: 'player-join',
    maxRequests: 10,
    windowMs: 60_000,
  });
  const resumeRateLimit = createRateLimit({
    key: 'player-resume',
    maxRequests: 30,
    windowMs: 60_000,
  });

  router.post('/join', joinRateLimit, async (request, response) => {
    try {
      const input = joinSchema.parse(request.body);
      const bootstrap = await repository.joinChallenge(input);
      response.status(201).json(bootstrap);
    } catch (error) {
      response.status(400).json({
        message: error instanceof Error ? error.message : 'Unable to join',
      });
    }
  });

  router.post('/resume', resumeRateLimit, async (request, response) => {
    const input = resumeSchema.parse(request.body);
    const bootstrap = await repository.resumeSession(
      input.token,
      input.challengeSlug
    );

    if (!bootstrap) {
      response.status(404).json({ message: 'Session not found' });
      return;
    }

    response.json(bootstrap);
  });

  router.get('/me', async (request, response) => {
    const token = getBearerToken(request);
    if (!token) {
      response.status(401).json({ message: 'Missing token' });
      return;
    }

    const challengeSlug = String(request.query.challengeSlug ?? '');
    const bootstrap = await repository.resumeSession(token, challengeSlug);

    if (!bootstrap) {
      response.status(404).json({ message: 'Session not found' });
      return;
    }

    response.json(bootstrap);
  });

  router.post('/decision', async (request, response) => {
    try {
      const token = getBearerToken(request);
      if (!token) {
        response.status(401).json({ message: 'Missing token' });
        return;
      }

      const input = decisionSchema.parse(request.body);
      const result = await repository.submitDecision(token, input);

      if (!result) {
        response.status(404).json({ message: 'Scenario not found' });
        return;
      }

      response.json(result);
    } catch (error) {
      response.status(400).json({
        message:
          error instanceof Error ? error.message : 'Unable to submit decision',
      });
    }
  });

  router.get('/current-scenario', async (request, response) => {
    const token = getBearerToken(request);
    if (!token) {
      response.status(401).json({ message: 'Missing token' });
      return;
    }

    const scenario = await repository.getCurrentScenario(token);
    if (!scenario) {
      response.status(404).json({ message: 'No active scenario' });
      return;
    }

    response.json(scenario);
  });

  return router;
}
