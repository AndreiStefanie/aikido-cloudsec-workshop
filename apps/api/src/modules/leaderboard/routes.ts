import { Router } from 'express';

import type { Repository } from '../sessions/types.js';

export function createLeaderboardRouter(repository: Repository) {
  const router = Router();

  router.get('/:challengeSlug', async (request, response) => {
    const leaderboard = await repository.getLeaderboard(
      request.params.challengeSlug
    );
    response.json(leaderboard);
  });

  return router;
}
