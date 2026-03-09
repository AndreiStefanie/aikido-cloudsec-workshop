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
        title: 'Unused IAM Backup User',
        summary:
          'A credential associated with an IAM user appears to be unused.',
        findingType: 'Unused identity credential',
        severityLabel: 'medium',
        exploitability: 'possible',
        sla: {
          status: 'overdue',
          days: 160,
        },
        description:
          'Security tools often flag unused identities because forgotten credentials can be abused if they are exposed.',
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
          'Unused credentials should be removed. Forgotten IAM users with active access keys create unnecessary risk, and ownership can often be determined from resource tags.',
        answer: {
          action: 'fix',
          ownerTeam: 'DevOps Team',
          rationale:
            'The IAM user has an access key that has never been used but still grants permissions in the account. The correct action is to remove the access key or delete the IAM user if it is no longer needed. The owner tag points to the DevOps team.',
          impact:
            'Unused credentials increase the attack surface and are a common takeover vector if they are ever exposed.',
        },
        alternatives: {
          snooze:
            'Deferring cleanup leaves an unnecessary credential active in the environment.',
          ignore:
            'Unused long-lived credentials should not be left unmanaged.',
        },
      },
      {
        id: 'scn-aws-vulnerable-bastion-host',
        order: 2,
        title: 'Vulnerable Bastion Host',
        summary:
          'An EC2 instance used as a bastion host has multiple unpatched vulnerabilities.',
        findingType: 'Infrastructure vulnerability backlog',
        severityLabel: 'high',
        exploitability: 'unlikely',
        sla: {
          status: 'overdue',
          days: 120,
        },
        description:
          'Security scanners report several outdated packages that are outside the remediation SLA.',
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
              { field: 'Last Login', value: '3 days ago' },
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
          'Vulnerability severity alone does not determine risk. Network exposure and system role must also be considered when prioritizing remediation.',
        answer: {
          action: 'snooze',
          ownerTeam: 'Cloud Platform Team',
          rationale:
            'The bastion host should eventually be updated or replaced, but it is not exposed to the public internet and is reachable only through the corporate VPN. This lowers exploitability enough that it belongs in scheduled maintenance rather than urgent response.',
          impact:
            'The host still carries real technical debt, but the current controls significantly reduce the chance of remote exploitation compared with an internet-facing system.',
        },
        alternatives: {
          fix:
            'Immediate remediation is acceptable but not the best prioritization decision given the current exposure and access controls.',
          ignore:
            'Ignoring the issue is incorrect because the vulnerability backlog still needs planned remediation by the infrastructure owner.',
        },
      },
    ],
  },
];
