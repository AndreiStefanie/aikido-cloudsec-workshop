import type { ChallengeDefinition } from '@workshop/shared';

import { env } from '../../config/env.js';

export const seedChallenges: ChallengeDefinition[] = [
  {
    id: 'challenge-aws-foundations-v1',
    slug: 'aws-identity-and-data-exposure',
    name: 'Cloud Village @RSAC 2026',
    description:
      'AWS-focused challenge covering IAM hygiene and ownership decisions under pressure.',
    joinCode: env.WORKSHOP_JOIN_CODE,
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
          },
          {
            id: 'res-aws-2',
            name: 'AmazonS3FullAccess',
            type: 'Identity',
            assetTypeLabel: 'AWS::IAM::ManagedPolicy',
            createdAt: 'AWS Managed',
            account: 'AWS development account',
            detailsLabel: 'View details',
          },
          {
            id: 'res-aws-3',
            name: 'AmazonRDSFullAccess',
            type: 'Identity',
            assetTypeLabel: 'AWS::IAM::ManagedPolicy',
            createdAt: 'AWS Managed',
            account: 'AWS development account',
            detailsLabel: 'View details',
          },
        ],
        securityLesson:
          'Unused credentials should be removed, not merely monitored. Dormant IAM users with active keys create unnecessary risk, and simple context such as ownership tags is often enough to route the fix to the right team.',
        ownerOptions: ['DevOps Team', 'Security Team'],
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
        diagram: {
          src: '/scenario-diagrams/aws/bastion-prod.svg',
          alt: 'Internal administrative access path from the corporate VPN through a bastion security group to the bastion host and the private production database.',
          title: 'Private administrative access path',
        },
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
          },
        ],
        securityLesson:
          'Severity alone does not determine priority. Exposure, reachable attack paths, and the operational cost of remediation all matter when deciding whether to fix now or schedule the work.',
        snoozeReasonOptions: [
          'Access is limited to a tightly controlled administrative path, so remediation can be scheduled through normal platform maintenance.',
          'Any vulnerability on a bastion should be deferred automatically because administrators need continuous access.',
          'High-severity package findings should be snoozed whenever the instance is tagged as shared infrastructure.',
        ],
        answer: {
          action: 'snooze',
          snoozeReason:
            'Access is limited to a tightly controlled administrative path, so remediation can be scheduled through normal platform maintenance.',
        },
      },
      {
        id: 'scn-aws-internal-vm-openssh-cves',
        order: 3,
        title: 'EC2 Instance with OpenSSH CVEs',
        description:
          'The vulnerability assessment solution on your virtual machine reported OpenSSH package vulnerabilities. Installed packages with known vulnerabilities should be reviewed and updated in line with the organization remediation policy.',
        severityLabel: 'medium',
        sla: {
          status: 'due_soon',
          days: 14,
        },
        remediation:
          'Upgrade the affected OpenSSH packages to a version that no longer contains the reported vulnerabilities. If the packages are not required for the workload, remove them entirely and confirm the service still operates as expected after the change.',
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
              { field: 'Critical Vulnerabilities', value: '0' },
              { field: 'High Vulnerabilities', value: '2' },
              { field: 'Public IP', value: 'None' },
            ],
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
            detailRows: [{ field: 'Inbound TCP 80', value: '172.31.0.0/20' }],
          },
        ],
        securityLesson:
          'Some findings can be ignored when the required attack path does not exist. In those cases, the better long-term fix is often improving the tool so non-actionable issues are suppressed automatically.',
        answer: {
          action: 'ignore',
          ignoreFeedback:
            'Automatically ignore vulnerabilities when the affected service is reachable only from private CIDR ranges and the host has no public IP.',
        },
      },
      {
        id: 'scn-aws-lambda-admin-role',
        order: 4,
        title: 'Lambda Function with Overly Permissive Execution Role',
        description:
          'Ensure serverless execution roles do not grant full administrative access. Workload identities should follow least privilege and should not use broad administrative policies when more specific permissions are sufficient.',
        severityLabel: 'high',
        sla: {
          status: 'overdue',
          days: 32,
        },
        diagram: {
          src: '/scenario-diagrams/aws/lambda-upload-processor.svg',
          alt: 'Public EC2 instance uploading files to an S3 bucket, which triggers a Lambda function that writes job state to a DynamoDB table.',
        },
        remediation:
          'Review the execution role attached to the serverless function and remove broad administrative permissions. Replace them with a least-privilege policy that grants only the actions required for the function runtime, logging, event handling, and downstream service access.',
        ignoreFeedbackOptions: [
          'Automatically ignore Lambda permission findings when the function is triggered only by S3 uploads.',
          'Automatically ignore AdministratorAccess findings when the function is used for internal file processing.',
          'Automatically ignore IAM policy findings when the owning team is clearly identified in resource tags.',
        ],
        resources: [
          {
            id: 'res-aws-8b',
            name: 'uploads-web-01',
            type: 'VirtualMachine',
            assetTypeLabel: 'AWS::EC2::Instance',
            createdAt: '2024-02-20',
            tags: ['owner:application-team', 'service:uploads-web'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              { field: 'Public IP', value: 'Present' },
              { field: 'Application Role', value: 'Upload entrypoint' },
              {
                field: 'Observed Usage',
                value:
                  'Receives files from end users and writes them to customer-uploads-prod',
              },
            ],
          },
          {
            id: 'res-aws-9',
            name: 'lambda-us-east-1-upload-processor',
            type: 'Serverless',
            assetTypeLabel: 'AWS::Lambda::Function',
            createdAt: '2024-02-21',
            tags: ['app:supplier-integration', 'service:uploads'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              { field: 'Runtime', value: 'python3.12' },
              { field: 'Trigger', value: 's3:ObjectCreated:*' },
              {
                field: 'Upload Source',
                value: 'End-user file uploads via application',
              },
              { field: 'Execution Role', value: 'upload-processor-role' },
              { field: 'Timeout', value: '60 seconds' },
            ],
          },
          {
            id: 'res-aws-10',
            name: 'upload-processor-role',
            type: 'Identity',
            assetTypeLabel: 'AWS::IAM::Role',
            createdAt: '2024-02-21',
            tags: [],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              { field: 'Trusted Service', value: 'lambda.amazonaws.com' },
              { field: 'Attached Policies', value: 'AdministratorAccess' },
              { field: 'Inline Policies', value: 'None' },
            ],
          },
          {
            id: 'res-aws-11',
            name: 'customer-uploads-prod',
            type: 'Storage',
            assetTypeLabel: 'AWS::S3::Bucket',
            createdAt: '2024-02-21',
            tags: ['data:customer-upload'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              {
                field: 'Event Notifications',
                value: 's3:ObjectCreated:* -> upload-processor',
              },
              {
                field: 'Write Path',
                value: 'Application uploads files on behalf of end users',
              },
              { field: 'Public Access', value: 'Blocked' },
              { field: 'Encryption', value: 'SSE-S3 enabled' },
            ],
          },
          {
            id: 'res-aws-11a',
            name: 'upload-jobs-prod',
            type: 'Database',
            assetTypeLabel: 'AWS::DynamoDB::Table',
            createdAt: '2024-02-20',
            tags: ['data:job-metadata'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              { field: 'Primary Key', value: 'jobId' },
              { field: 'Encryption', value: 'AWS owned key' },
              {
                field: 'Observed Usage',
                value: 'Stores upload processing job state',
              },
            ],
          },
          {
            id: 'res-aws-11b',
            name: 'upload-processor/api-credentials',
            type: 'Identity',
            assetTypeLabel: 'AWS::SecretsManager::Secret',
            createdAt: '2024-02-20',
            tags: ['owner:application-team', 'purpose:third-party-api'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              { field: 'Rotation Enabled', value: 'No' },
              {
                field: 'Observed Usage',
                value: 'Read by the upload processing Lambda at runtime',
              },
              { field: 'KMS Key', value: 'aws/secretsmanager' },
            ],
          },
        ],
        securityLesson:
          'Execution-role scope matters as much as network exposure. Event-driven compute that handles user-supplied content should still run with least privilege, because any code flaw, malicious payload, or misconfiguration inherits the full permissions of the role.',
        ownerOptions: [
          'Application Team',
          'Cloud Platform Team',
          'Security Team',
        ],
        answer: {
          action: 'fix',
          ownerTeam: 'Application Team',
        },
      },
      {
        id: 'scn-aws-cross-account-role-outside-org',
        order: 5,
        title: 'IAM Role Trusted by an External AWS Account',
        description:
          'Ensure IAM roles do not trust external AWS accounts unless cross-account access is explicitly required and approved. Trust relationships should be limited to the principals needed for the documented use case.',
        severityLabel: 'medium',
        sla: {
          status: 'due_soon',
          days: 18,
        },
        remediation:
          'Review the role trust policy and remove cross-account principals that are not required. Where external access is approved, scope the trust appropriately and ensure the integration is documented so the control can be assessed with the correct business context.',
        ignoreFeedbackOptions: [
          'Automatically ignore approved third-party cross-account IAM roles when the trusted external account is tied to a verified security integration and the role usage matches that integration.',
          'Automatically ignore all IAM roles that trust accounts outside of the organization whenever the role is tagged as owned by Security.',
          'Automatically ignore cross-account trust findings whenever the role can only be assumed with an external ID.',
        ],
        resources: [
          {
            id: 'res-aws-12',
            name: 'cnapp-integration-role',
            type: 'Identity',
            assetTypeLabel: 'AWS::IAM::Role',
            createdAt: '2024-03-12',
            tags: ['owner:security-team', 'integration:cnapp'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              { field: 'Trusted Account ID', value: '482913570011' },
              {
                field: 'Organization Membership',
                value: 'Outside of AWS Organization',
              },
              { field: 'External ID Required', value: 'Yes' },
              { field: 'Last Assumed', value: '2 hours ago' },
            ],
          },
          {
            id: 'res-aws-13',
            name: 'cnapp-integration-policy',
            type: 'Identity',
            assetTypeLabel: 'AWS::IAM::ManagedPolicy',
            createdAt: '2024-03-12',
            tags: ['owner:security-team'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              {
                field: 'Permissions Scope',
                value: 'Read-only inventory and findings collection',
              },
              { field: 'Write Actions', value: 'None' },
            ],
          },
        ],
        securityLesson:
          'Not every external trust relationship is risky by default. Cross-account roles used by approved security tooling can be legitimate, and the better long-term fix is often improving detection context so known integrations are suppressed automatically instead of creating repeated manual reviews.',
        answer: {
          action: 'ignore',
          ignoreFeedback:
            'Automatically ignore approved third-party cross-account IAM roles when the trusted external account is tied to a verified security integration and the role usage matches that integration.',
        },
      },
      {
        id: 'scn-azure-functions-secrets-in-app-settings',
        order: 6,
        title: 'Secrets Detected in Azure Functions App Settings',
        description:
          'Ensure application secrets are not stored directly in Azure Function App settings. Sensitive values should be managed through a dedicated secret-management mechanism rather than embedded in resource configuration.',
        severityLabel: 'high',
        sla: {
          status: 'overdue',
          days: 27,
        },
        remediation:
          'Move plaintext secrets out of Function App settings and store them in a dedicated secret-management service. Replace inline values with managed secret references where supported so the application can resolve them at runtime without embedding them directly in configuration.',
        ignoreFeedbackOptions: [
          'Automatically ignore secrets in Azure Functions app settings when the Function App uses a system-assigned managed identity.',
          'Automatically ignore app-setting secrets when the resource is tagged as owned by the platform team.',
          'Automatically ignore secrets in Function App environment variables when the values are used only for internal Azure service integrations.',
        ],
        resources: [
          {
            id: 'res-az-1',
            name: 'invoice-processor-func',
            type: 'Serverless',
            assetTypeLabel: 'Microsoft.Web/sites',
            createdAt: '2024-05-18',
            tags: ['owner:application-team', 'service:invoice-processor'],
            account: 'Azure production subscription',
            detailsLabel: 'View details',
            detailRows: [
              { field: 'Hosting Type', value: 'Azure Functions' },
              { field: 'Managed Identity', value: 'System-assigned enabled' },
              { field: 'Runtime', value: '.NET 8 isolated' },
              {
                field: 'App Setting: AzureWebJobsStorage',
                value: 'Storage account connection string',
              },
              {
                field: 'App Setting: DocumentAiApiKey',
                value: 'f0b2a300-5e29-4977-844f-754f54b06dc4',
              },
            ],
          },
        ],
        securityLesson:
          'Secrets should not live directly in Function App environment variables when the platform exposes those settings through control-plane read access. Azure Key Vault references are a straightforward improvement because the app can keep using settings while gaining centralized access control, audit history, and cleaner rotation.',
        ownerOptions: [
          'Application Team',
          'Cloud Platform Team',
          'Security Team',
        ],
        answer: {
          action: 'fix',
          ownerTeam: 'Application Team',
        },
      },
      {
        id: 'scn-eks-public-dashboard-cloud-creds',
        order: 7,
        title: 'Public Kubernetes Dashboard with Exposed Cloud Credentials',
        description:
          'Ensure administrative Kubernetes interfaces are not exposed broadly and that cloud credentials are not stored directly in workload configuration. Administrative surfaces and reusable credentials should be restricted according to least-privilege and management-plane hardening guidance.',
        severityLabel: 'high',
        sla: {
          status: 'due_soon',
          days: 12,
        },
        remediation:
          'Restrict access to administrative Kubernetes interfaces and remove reusable cloud credentials from workload configuration. Replace static credentials with workload-scoped identity where possible and rotate any credentials that may have been exposed through the cluster management surface.',
        ignoreFeedbackOptions: [
          'Automatically ignore public Kubernetes dashboard findings when the dashboard belongs to a non-production cluster.',
          'Automatically ignore cloud credential exposure findings when the leaked AWS key only has access to S3.',
          'Automatically ignore dashboard exposure findings whenever the Kubernetes namespace is clearly tagged as owned by Platform.',
        ],
        resources: [
          {
            id: 'res-eks-1',
            name: 'kubernetes-dashboard',
            type: 'Kubernetes',
            assetTypeLabel: 'Kubernetes Dashboard',
            createdAt: '2024-04-03',
            tags: ['owner:platform-team', 'cluster:shared-eks-prod'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              { field: 'Exposure', value: 'Public internet' },
              { field: 'Authentication', value: 'Weak or missing' },
              {
                field: 'Reachable URL',
                value: 'https://dashboard.shared-eks.example.com',
              },
            ],
          },
          {
            id: 'res-eks-2',
            name: 'build-runner-pod',
            type: 'Kubernetes',
            assetTypeLabel: 'Kubernetes Pod',
            createdAt: '2024-05-14',
            tags: ['owner:platform-team', 'namespace:ops'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              { field: 'Namespace', value: 'ops' },
              {
                field: 'Env: AWS_ACCESS_KEY_ID',
                value: 'AKIAIOSFODNN7EXAMPLE',
              },
              {
                field: 'Env: AWS_SECRET_ACCESS_KEY',
                value: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
              },
              { field: 'Env: AWS_DEFAULT_REGION', value: 'us-west-2' },
              {
                field: 'Container',
                value: 'build-runner',
              },
              { field: 'Runtime Status', value: 'Running' },
            ],
          },
          {
            id: 'res-eks-3',
            name: 'build-runner-aws-user',
            type: 'Identity',
            assetTypeLabel: 'AWS::IAM::User',
            createdAt: '2023-11-22',
            tags: ['owner:platform-team'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              { field: 'Attached Policies', value: 'AmazonS3FullAccess' },
              { field: 'Access Key Type', value: 'Long-lived static key' },
              {
                field: 'Recent Activity',
                value: 'Observed from pod environment',
              },
            ],
          },
        ],
        securityLesson:
          'Administrative interfaces exposed to the internet can collapse multiple layers of trust at once. If an attacker can browse cluster resources and inspect workload configuration, static cloud credentials inside pods quickly turn a Kubernetes exposure into broader cloud-account abuse.',
        ownerOptions: [
          'Cloud Platform Team',
          'Application Team',
          'Security Team',
        ],
        answer: {
          action: 'fix',
          ownerTeam: 'Cloud Platform Team',
        },
      },
      {
        id: 'scn-azure-storage-public-network-access-disabled',
        order: 8,
        title:
          "Ensure 'Public Network Access' Is Disabled for Storage Accounts",
        description:
          'Ensure public network access is disabled for storage accounts unless public access is explicitly required. Storage services should not expose public entry points when a more restrictive network configuration is available.',
        severityLabel: 'medium',
        sla: {
          status: 'due_soon',
          days: 16,
        },
        remediation:
          'Disable public network access for the storage account unless the service is explicitly intended to accept public traffic. Review the effective network configuration and align the account with the expected access model.',
        ignoreFeedbackOptions: [
          'Automatically ignore storage accounts with public network access enabled when the account is associated with an enforced Azure Network Security Perimeter that already governs inbound and outbound public access.',
          'Automatically ignore this finding whenever the storage account also has a private endpoint configured.',
          'Automatically ignore public network access findings for production storage accounts if all current firewall rules are limited to known corporate IP ranges.',
        ],
        resources: [
          {
            id: 'res-az-5',
            name: 'artifactstoreprod',
            type: 'Storage',
            assetTypeLabel: 'Microsoft.Storage/storageAccounts',
            createdAt: '2024-02-08',
            tags: ['owner:platform-team', 'service:artifact-store'],
            account: 'Azure production subscription',
            detailsLabel: 'View details',
            detailRows: [
              { field: 'Public Network Access', value: 'Enabled' },
              { field: 'Private Endpoints', value: 'None' },
              {
                field: 'Allowed Networks',
                value: 'Not relied on for primary enforcement',
              },
            ],
          },
          {
            id: 'res-az-6',
            name: 'prod-storage-perimeter',
            type: 'Identity',
            assetTypeLabel: 'Microsoft.Network/networkSecurityPerimeters',
            createdAt: '2024-07-01',
            tags: ['owner:platform-team'],
            account: 'Azure production subscription',
            detailsLabel: 'View details',
            detailRows: [
              { field: 'Association Mode', value: 'Enforced' },
              { field: 'Inbound Public Access', value: 'Explicit rules only' },
              { field: 'Outbound Public Access', value: 'Explicit rules only' },
            ],
          },
        ],
        securityLesson:
          'A single control setting can be misleading when the platform introduces a newer top-level security mechanism. If an enforced Azure Network Security Perimeter already governs public access to the storage account, the better call may be to ignore the legacy-style finding and push the tool to understand perimeter context instead.',
        answer: {
          action: 'ignore',
          ignoreFeedback:
            'Automatically ignore storage accounts with public network access enabled when the account is associated with an enforced Azure Network Security Perimeter that already governs inbound and outbound public access.',
        },
      },
      {
        id: 'scn-aws-nlb-access-logs-cloudwatch-gap',
        order: 9,
        title: 'Network Load Balancer Reported Without Access Logs',
        description:
          'Ensure access logging is enabled for Network Load Balancers. Load balancer request visibility is commonly required for traffic monitoring, incident response, and compliance evidence.',
        severityLabel: 'low',
        sla: {
          status: 'due_soon',
          days: 20,
        },
        remediation:
          'Enable access logging for the load balancer using a supported logging destination and verify that logs are retained according to the organization monitoring and audit requirements.',
        ignoreFeedbackOptions: [
          'Automatically ignore NLB access-log findings when access logs are already configured through the newer CloudWatch Logs integration, even if the legacy check path does not recognize that destination yet.',
          'Automatically ignore NLB access-log findings whenever the load balancer belongs to a non-internet-facing service.',
          'Automatically ignore NLB access-log findings when VPC Flow Logs are enabled for the surrounding subnet.',
        ],
        resources: [
          {
            id: 'res-aws-14',
            name: 'payments-nlb',
            type: 'VirtualMachine',
            assetTypeLabel: 'AWS::ElasticLoadBalancingV2::LoadBalancer',
            createdAt: '2024-10-07',
            tags: ['owner:platform-team', 'service:payments-edge'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              { field: 'Load Balancer Type', value: 'Network Load Balancer' },
              { field: 'Scheme', value: 'Internet-facing' },
              { field: 'CloudWatch Logs Delivery', value: 'Enabled' },
              { field: 'Legacy S3 Access Logs Check', value: 'Not configured' },
            ],
          },
          {
            id: 'res-aws-15',
            name: '/aws/elb/payments-nlb/access',
            type: 'Storage',
            assetTypeLabel: 'Amazon CloudWatch Logs Log Group',
            createdAt: '2025-11-19',
            tags: ['owner:platform-team'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              { field: 'Log Source', value: 'NLB access logs' },
              { field: 'Delivery Status', value: 'Active' },
              { field: 'Retention', value: '30 days' },
            ],
          },
        ],
        securityLesson:
          'A missing-control alert can become stale when the cloud platform introduces a newer supported implementation path. If NLB access logs are already delivered through CloudWatch Logs, the better answer is often to ignore the finding and push the vendor to recognize the newer AWS-native capability.',
        answer: {
          action: 'ignore',
          ignoreFeedback:
            'Automatically ignore NLB access-log findings when access logs are already configured through the newer CloudWatch Logs integration, even if the legacy check path does not recognize that destination yet.',
        },
      },
      {
        id: 'scn-aws-ec2-imdsv1-ssrf-exfiltration-path',
        order: 10,
        title: 'EC2 Instance Allows IMDSv1',
        description:
          'Ensure EC2 instances require Instance Metadata Service Version 2 (IMDSv2). IMDSv1 does not provide the same request protections as IMDSv2 and should be disabled where possible.',
        severityLabel: 'critical',
        sla: {
          status: 'due_soon',
          days: 3,
        },
        remediation:
          'Update the instance metadata configuration to require IMDSv2 and disable IMDSv1 access. Review the workload identity configuration and align metadata access with the organization hardening standard.',
        ignoreFeedbackOptions: [
          'Automatically ignore IMDSv1 findings when the EC2 instance does not have a public IP.',
          'Automatically ignore IMDSv1 findings whenever the attached IAM role is used only by a web application firewall.',
          'Automatically ignore IMDSv1 findings when the instance profile credentials are temporary rather than static.',
        ],
        resources: [
          {
            id: 'res-aws-16',
            name: 'edge-app-01',
            type: 'VirtualMachine',
            assetTypeLabel: 'AWS::EC2::Instance',
            createdAt: '2024-01-11',
            tags: ['repo:edge', 'service:edge-app'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              { field: 'Metadata Options', value: 'IMDSv1 allowed' },
              { field: 'Instance Profile', value: 'edge-app-role' },
              { field: 'Public IP', value: 'Present' },
              {
                field: 'Exposed Workload',
                value: 'Reverse proxy / application endpoint',
              },
            ],
          },
          {
            id: 'res-aws-17',
            name: 'edge-app-repo',
            type: 'CodeRepository',
            assetTypeLabel: 'Git Repository',
            createdAt: '2024-01-11',
            tags: ['owner:application-team'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              {
                field: 'Language',
                value: 'Node.js',
              },
              {
                field: 'Open SAST Findings',
                value: '3',
              },
              {
                field: 'SAST Finding 1',
                value: 'HTTP request might enable SSRF attack',
              },
              {
                field: 'SAST Finding 2',
                value: 'Unsanitized redirect target from request parameter',
              },
              {
                field: 'SAST Finding 3',
                value: 'User-controlled header forwarded to outbound request',
              },
            ],
          },
          {
            id: 'res-aws-18',
            name: 'edge-app-role',
            type: 'Identity',
            assetTypeLabel: 'AWS::IAM::Role',
            createdAt: '2023-10-27',
            tags: ['owner:platform-team'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              { field: 'Trusted Service', value: 'ec2.amazonaws.com' },
              {
                field: 'Allowed Actions',
                value: 's3:ListBucket, s3:GetObject',
              },
              { field: 'Scope', value: 'customer-data-* buckets' },
            ],
          },
          {
            id: 'res-aws-19',
            name: 'customer-data-archive',
            type: 'Storage',
            assetTypeLabel: 'AWS::S3::Bucket',
            createdAt: '2023-09-04',
            tags: ['owner:data-team', 'classification:sensitive'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              { field: 'Accessible From Role', value: 'edge-app-role' },
              { field: 'Stored Data', value: 'Archived customer documents' },
            ],
          },
        ],
        securityLesson:
          'IMDSv1 by itself is a weak signal, but it becomes a serious exposure when paired with an SSRF-capable application and an over-permissioned instance profile. The real attack path is application request forgery to metadata, metadata to temporary AWS credentials, and credentials to S3 data access.',
        ownerOptions: ['Cloud Platform Team', 'Application Team'],
        answer: {
          action: 'fix',
          ownerTeam: 'Cloud Platform Team',
        },
      },
      {
        id: 'scn-aws-public-ebs-snapshot-shared-dependency',
        order: 11,
        title: 'Publicly Shared EBS Snapshot',
        description:
          'Ensure Amazon EBS snapshots are not publicly shared. Public snapshots can expose operating system images, application artifacts, credentials, or other historical data to any AWS account.',
        severityLabel: 'high',
        sla: {
          status: 'due_soon',
          days: 11,
        },
        remediation:
          'Remove public snapshot sharing and replace it with explicit account-level sharing where required. Review snapshot distribution settings and align access with the intended consumer set.',
        ignoreFeedbackOptions: [
          'Automatically ignore public EBS snapshot findings when the snapshot was created by an approved AMI distribution pipeline.',
          'Automatically ignore public snapshot findings whenever the snapshot is tagged as shared.',
          'Automatically ignore public snapshot findings when the snapshot is older than 90 days.',
        ],
        resources: [
          {
            id: 'res-aws-20',
            name: 'snap-0f3a7f1d4a2b9c118',
            type: 'Storage',
            assetTypeLabel: 'AWS::EC2::Snapshot',
            createdAt: '2024-08-02',
            tags: ['owner:platform-team', 'distribution:golden-ami'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              { field: 'Public Sharing', value: 'Enabled' },
              { field: 'Source Volume', value: 'golden-ami-builder-root' },
              {
                field: 'Description',
                value:
                  'Base image snapshot for partner and internal account distribution',
              },
            ],
          },
          {
            id: 'res-aws-21',
            name: 'golden-image-pipeline',
            type: 'VirtualMachine',
            assetTypeLabel: 'AMI Distribution Workflow',
            createdAt: '2024-06-17',
            tags: ['owner:platform-team'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              {
                field: 'Current Dependents',
                value: '12 downstream AWS accounts',
              },
              {
                field: 'Distribution Method',
                value: 'Public snapshot copied into consumer accounts',
              },
              {
                field: 'Migration Status',
                value: 'Account allowlist migration planned but not complete',
              },
            ],
          },
          {
            id: 'res-aws-22',
            name: 'golden-ami-secrets-scan',
            type: 'Identity',
            assetTypeLabel: 'Snapshot Inspection Result',
            createdAt: '2024-08-03',
            tags: ['owner:security-team'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              {
                field: 'Embedded Secrets',
                value: 'No confirmed plaintext secrets detected',
              },
              {
                field: 'Residual Risk',
                value:
                  'Image contents still visible to any AWS account while public',
              },
            ],
          },
        ],
        securityLesson:
          'Public snapshots are dangerous because they can expose historical system state and embedded secrets, but the best remediation still depends on context. Before revoking public access, understand who depends on that sharing model so you can migrate them safely rather than breaking an active image-distribution workflow.',
        snoozeReasonOptions: [
          'The exposure is real, but an active image-distribution workflow still depends on this sharing model, so consumers should be mapped before changing it.',
          'Public snapshots can be deferred whenever a security scan has not confirmed plaintext secrets.',
          'Snapshot exposure should be snoozed automatically if the backing volume was encrypted originally.',
        ],
        answer: {
          action: 'snooze',
          snoozeReason:
            'The exposure is real, but an active image-distribution workflow still depends on this sharing model, so consumers should be mapped before changing it.',
        },
      },
      {
        id: 'scn-aws-s3-broad-access-kms-protected',
        order: 12,
        title: 'S3 Bucket Policy Allows Broad Access',
        description:
          'Ensure S3 bucket policies do not grant broad access to stored data. Bucket policies should be limited to the principals required for the intended workload and data-access pattern.',
        severityLabel: 'medium',
        sla: {
          status: 'due_soon',
          days: 13,
        },
        remediation:
          'Review and tighten the bucket policy so read access is limited to the intended principals. Align bucket permissions with the expected authorization model and remove any overly broad bucket-level access.',
        ignoreFeedbackOptions: [
          'Automatically ignore broad S3 bucket access findings when the bucket uses SSE-KMS encryption.',
          'Automatically ignore public bucket policy findings when the bucket has versioning enabled.',
          'Automatically ignore broad bucket access findings when the bucket is tagged for internal analytics use.',
        ],
        resources: [
          {
            id: 'res-aws-23',
            name: 'reports-export-prod',
            type: 'Storage',
            assetTypeLabel: 'AWS::S3::Bucket',
            createdAt: '2024-06-10',
            tags: ['owner:data-team', 'service:report-export'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              { field: 'Bucket Policy', value: 'Broad read access present' },
              { field: 'Default Encryption', value: 'SSE-KMS' },
              { field: 'Stored Data', value: 'Exported reporting data' },
            ],
          },
          {
            id: 'res-aws-24',
            name: 'alias/reports-export-kms',
            type: 'Identity',
            assetTypeLabel: 'AWS::KMS::Key',
            createdAt: '2024-06-10',
            tags: ['owner:data-team'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              { field: 'Key Usage', value: 'Encrypt / Decrypt' },
              {
                field: 'Allowed Principals',
                value: 'Restricted application and analytics roles only',
              },
              { field: 'Anonymous or wildcard decrypt', value: 'No' },
            ],
          },
          {
            id: 'res-aws-25',
            name: 'reporting-api-role',
            type: 'Identity',
            assetTypeLabel: 'AWS::IAM::Role',
            createdAt: '2024-06-12',
            tags: ['owner:backend-team'],
            account: 'AWS production account',
            detailsLabel: 'View details',
            detailRows: [
              {
                field: 'S3 Access',
                value: 's3:GetObject on reports-export-prod/*',
              },
              {
                field: 'KMS Access',
                value: 'kms:Decrypt on alias/reports-export-kms',
              },
            ],
          },
        ],
        securityLesson:
          'KMS encryption can materially reduce the immediate impact of a broad S3 policy because object retrieval still depends on decrypt rights. That makes the issue lower urgency than a truly public plaintext bucket, but not safe to ignore, because the access model is still wider than intended and can become exploitable if KMS permissions or encryption patterns change.',
        snoozeReasonOptions: [
          'KMS decrypt permissions still gate data access, which lowers the immediate exfiltration risk enough to defer cleanup into normal backlog work.',
          'Buckets encrypted with SSE-KMS can be snoozed by default because encryption eliminates the access issue.',
          'Any analytics export bucket should be snoozed when it is used by internal reporting jobs.',
        ],
        answer: {
          action: 'snooze',
          snoozeReason:
            'KMS decrypt permissions still gate data access, which lowers the immediate exfiltration risk enough to defer cleanup into normal backlog work.',
        },
      },
    ],
  },
];
