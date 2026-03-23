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
        title: 'Ensure credentials unused for 45 days or more are disabled',
        description:
          'AWS IAM users can access AWS resources using different types of credentials, such as passwords or access keys. It is recommended that all credentials that have been unused for 45 days or more be deactivated or removed.',
        severityLabel: 'medium',
        sla: {
          status: 'overdue',
          days: 160,
        },
        remediation:
          'After confirming that the IAM user is not needed, disable console access and deactivate or delete the access key(s).',
        ignoreFeedbackOptions: [
          'Automatically ignore unused IAM credential findings when access keys have never been used.',
          'Automatically ignore IAM credential hygiene findings in development accounts.',
          'Automatically ignore IAM findings when the resource has an explicit owner tag.',
        ],
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
        },
      },
      {
        id: 'scn-aws-vulnerable-bastion-host',
        order: 2,
        title: 'EC2 Instance with Multiple Package Vulnerabilities (CVEs)',
        description:
          'The vulnerability assessment solution on your virtual machine reported multiple package vulnerabilities, including 2 critical and 23 high severity CVEs.',
        severityLabel: 'high',
        sla: {
          status: 'due_soon',
          days: 21,
        },
        remediation:
          'Update or remove vulnerable packages on the virtual machine.',
        ignoreFeedbackOptions: [
          'Automatically ignore vulnerability findings on bastion hosts that are reachable only through the corporate VPN.',
          'Automatically ignore package vulnerabilities on shared access infrastructure when no public IP is attached.',
          'Automatically ignore out-of-SLA VM vulnerabilities whenever network exposure is limited to private CIDR ranges.',
        ],
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
            detailRows: [
              { field: 'Inbound TCP 22', value: '50.236.77.120/32' },
              { field: 'Inbound TCP 3389', value: '50.236.77.120/32' },
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
        },
      },
      {
        id: 'scn-aws-internal-vm-openssh-cves',
        order: 3,
        title: 'OpenSSH Package Vulnerabilities on Internal Compute Asset',
        description:
          'The vulnerability assessment solution on your virtual machine reported OpenSSH package vulnerabilities. The affected host is not internet reachable based on the currently attached network controls.',
        severityLabel: 'medium',
        sla: {
          status: 'due_soon',
          days: 14,
        },
        remediation:
          'If this finding class is expected to remain non-exploitable when no public attack path exists, update the detection logic to automatically suppress or ignore matching cases. If exposure changes later, the issue should become actionable again.',
        ignoreFeedbackOptions: [
          'Automatically ignore vulnerabilities when the affected service is reachable only from private CIDR ranges and the host has no public IP.',
          'Automatically ignore all vulnerabilities on private instances, regardless of which service is affected.',
          'Automatically ignore OpenSSH findings whenever the instance is tagged as internal.',
        ],
        resources: [
          {
            id: 'res-aws-7',
            name: 'ops-runner-01',
            type: 'VirtualMachine',
            assetTypeLabel: 'AWS::EC2::Instance',
            createdAt: '2024-01-09',
            tags: ['owner:platform-team', 'role:ops-runner'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              { field: 'Installed Package', value: 'openssh-server' },
              { field: 'Critical Vulnerabilities', value: '0' },
              { field: 'High Vulnerabilities', value: '2' },
              { field: 'Public IP', value: 'None' },
            ],
            environment: 'production',
            ownerHints: ['Cloud Platform Team'],
            exposure: 'internal',
            notes: 'Private operations runner in a restricted subnet',
          },
          {
            id: 'res-aws-8',
            name: 'ops-runner-sg',
            type: 'Identity',
            assetTypeLabel: 'AWS::EC2::SecurityGroup',
            createdAt: '2024-01-09',
            tags: ['owner:platform-team'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              { field: 'Inbound TCP 22', value: '10.40.0.0/16' },
              { field: 'Inbound TCP 443', value: 'None' },
              { field: 'Inbound TCP 3389', value: 'None' },
            ],
            environment: 'production',
            ownerHints: ['Cloud Platform Team'],
            exposure: 'internal',
            notes: 'Allows access only from internal network ranges',
          },
        ],
        securityLesson:
          'Some findings should be ignored when the required attack path does not exist. In those cases, the better long-term fix is often improving the tool so non-actionable issues are suppressed automatically.',
        answer: {
          action: 'ignore',
          ownerTeam: 'Security Team',
        },
      },
    ],
  },
];
