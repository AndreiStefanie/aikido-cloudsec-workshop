import type { ChallengeDefinition } from '@workshop/shared';

import { env } from '../../config/env.js';

export const seedChallenges: ChallengeDefinition[] = [
  {
    id: 'challenge-aws-foundations-v1',
    slug: 'aws-identity-and-data-exposure',
    name: 'AWS: Identity and Data Exposure',
    description:
      'AWS-focused challenge covering IAM hygiene and ownership decisions under pressure.',
    joinCode: 'AWSLAB',
    joinPassword: env.WORKSHOP_JOIN_PASSWORD,
    isActive: true,
    scenarios: [
      {
        id: 'scn-aws-unused-backup-user',
        order: 1,
        title: 'Unused AWS Identity with Active Credentials',
        summary:
          'An AWS identity still has active long-lived credentials, but available usage data suggests the access may not be serving a live purpose.',
        severityLabel: 'medium',
        sla: {
          status: 'overdue',
          days: 160,
        },
        remediation:
          'Confirm whether the backup workflow still needs a standalone IAM user. If it does not, delete the access key and remove the user entirely. If the workflow is still required, replace the user with a narrower control such as a role-based integration, or at minimum rotate the credential and reduce the attached permissions. The remediation is operationally low risk because the key has never been used, but the access is broad enough that cleanup should not be deferred indefinitely.',
        resources: [
          {
            id: 'res-aws-1',
            name: 'backup-user',
            type: 'Identity',
            assetTypeLabel: 'AWS::IAM::User',
            createdAt: '2023-05-12',
            tags: ['owner:devops-team'],
            account: 'AWS development account',
            detailsLabel: 'View details',
            detailTitle: 'Asset Details (backup-user)',
            detailRows: [
              { field: 'Access Key Age', value: '340 days' },
              { field: 'Last Used', value: 'Never' },
              {
                field: 'Attached Policies',
                value: 'AmazonS3FullAccess, AmazonRDSFullAccess',
              },
            ],
            environment: 'development',
            ownerHints: ['DevOps Team'],
            exposure: 'restricted',
            notes: 'IAM user with access key never used',
          },
          {
            id: 'res-aws-2',
            name: 'AmazonS3FullAccess',
            type: 'Identity',
            assetTypeLabel: 'AWS::IAM::ManagedPolicy',
            createdAt: 'AWS Managed',
            account: 'AWS development account',
            detailsLabel: 'View details',
            environment: 'development',
            ownerHints: ['DevOps Team'],
            exposure: 'restricted',
            notes: 'Attached managed policy',
          },
          {
            id: 'res-aws-3',
            name: 'AmazonRDSFullAccess',
            type: 'Identity',
            assetTypeLabel: 'AWS::IAM::ManagedPolicy',
            createdAt: 'AWS Managed',
            account: 'AWS development account',
            detailsLabel: 'View details',
            environment: 'development',
            ownerHints: ['DevOps Team'],
            exposure: 'restricted',
            notes: 'Attached managed policy',
          },
        ],
        securityLesson:
          'Unused credentials should be removed, not merely monitored. Dormant IAM users with active keys create unnecessary risk, and simple context such as ownership tags is often enough to route the fix to the right team.',
        answer: {
          action: 'fix',
          ownerTeam: 'DevOps Team',
          rationale:
            'The IAM user still has an active access key and broad permissions despite showing no evidence of legitimate use. That makes this a cleanup issue that should be fixed rather than deferred. The `owner:devops-team` tag provides the clearest ownership signal, so the DevOps Team should handle the remediation.',
          impact:
            'Unused long-lived credentials increase the account attack surface and become high-value takeover material if they are ever exposed or rediscovered.',
        },
        alternatives: {
          snooze:
            'Deferring cleanup keeps a broad, unnecessary credential alive without any clear operational reason to keep it.',
          ignore:
            'Ignoring the issue accepts a stale identity with account access as normal, which is exactly how forgotten credentials turn into avoidable incidents.',
        },
      },
      {
        id: 'scn-aws-vulnerable-bastion-host',
        order: 2,
        title: 'Out-of-SLA Vulnerabilities on Shared Access Infrastructure',
        summary:
          'A production infrastructure asset used for administrative access has accumulated multiple overdue package vulnerabilities.',
        severityLabel: 'high',
        sla: {
          status: 'overdue',
          days: 120,
        },
        remediation:
          'Schedule patching or replacement through the normal platform maintenance cycle. In practice, that likely means updating the instance image, rotating the bastion onto a current baseline, testing administrator access paths, and verifying that the security group remains limited to trusted internal entry points. This remediation has moderate operational risk because it touches shared access infrastructure used by multiple teams, so planning and coordination matter as much as the scanner severity.',
        resources: [
          {
            id: 'res-aws-4',
            name: 'bastion-prod',
            type: 'VirtualMachine',
            assetTypeLabel: 'AWS::EC2::Instance',
            createdAt: '2022-08-14',
            tags: ['owner:platform-team', 'role:bastion'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailTitle: 'Asset Details (bastion-prod)',
            detailRows: [
              { field: 'Instance Role', value: 'Bastion Host' },
              { field: 'Critical Vulnerabilities', value: '2' },
              { field: 'High Vulnerabilities', value: '23' },
              { field: 'Patch Age', value: '11 months' },
            ],
            environment: 'production',
            ownerHints: ['Cloud Platform Team'],
            exposure: 'internal',
            notes: 'Shared administrative access host',
          },
          {
            id: 'res-aws-5',
            name: 'bastion-sg',
            type: 'Identity',
            assetTypeLabel: 'AWS::EC2::SecurityGroup',
            createdAt: '2022-08-14',
            tags: ['owner:platform-team'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailTitle: 'Asset Details (bastion-sg)',
            detailRows: [
              { field: 'Inbound SSH', value: 'Corporate VPN only' },
              { field: 'Internet Exposure', value: 'No' },
              {
                field: 'Purpose',
                value: 'Admin access to internal infrastructure',
              },
            ],
            environment: 'production',
            ownerHints: ['Cloud Platform Team'],
            exposure: 'internal',
            notes: 'Restricts admin access path',
          },
          {
            id: 'res-aws-6',
            name: 'prod-db',
            type: 'Database',
            assetTypeLabel: 'AWS::RDS::DBInstance',
            createdAt: '2021-11-03',
            tags: ['owner:data-team'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            environment: 'production',
            ownerHints: ['Application Team'],
            exposure: 'restricted',
            notes: 'Internal production database reachable from admin path',
          },
        ],
        securityLesson:
          'Severity alone does not determine priority. Exposure, reachable attack paths, and the operational cost of remediation all matter when deciding whether to fix now or schedule the work.',
        answer: {
          action: 'snooze',
          ownerTeam: 'Cloud Platform Team',
          rationale:
            'The bastion host still needs remediation, but the access path is controlled tightly enough that this does not warrant immediate emergency treatment. The better call is to schedule the work through platform maintenance rather than treat it as the top live incident. Because the bastion is shared infrastructure owned by the platform layer, the Cloud Platform Team is the right owner.',
          impact:
            'The host still carries meaningful technical debt, but the current network controls and system role reduce the urgency relative to a similarly vulnerable internet-facing asset.',
        },
        alternatives: {
          fix: 'Immediate remediation would be defensible, but it over-prioritizes scanner severity over the actual exposure and operational context.',
          ignore:
            'Ignoring the issue is incorrect because the backlog is real and the shared platform owner still needs to remediate it on a planned timeline.',
        },
      },
    ],
  },
];
