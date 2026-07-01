import { AuditResponse } from './aiService';

export const baselineAudits: Record<string, AuditResponse> = {
  'digital-banking': {
    overallScore: 68,
    technologyHealth: 'Fair',
    security: 'Needs Improvement',
    scalability: 'Moderately Scalable',
    maintainability: 'Medium',
    estimatedMonthlyCost: 4500,
    outdatedComponentsCount: 3,
    topRisks: [
      'MySQL 5.7 has reached End of Life (EOL) as of October 2023. No security patches are provided, posing a critical security compliance risk for transaction logs.',
      'Laravel 8.x is End of Life. Vulnerabilities in framework packages could lead to remote code execution (RCE) or session hijackings.',
      'Single-point of failure (SPOF) due to hosting on a single AWS EC2 instance without auto-scaling, leading to potential downtime during high transaction periods.'
    ],
    recommendations: [
      {
        layer: 'Cloud',
        currentTech: 'AWS EC2 (Single VM)',
        recommendedTech: 'AWS ECS Fargate',
        benefit: 'Provides serverless container execution, eliminating OS management overhead, and introducing auto-scaling based on CPU/Memory load. Reduces idle cost by 20%.',
        type: 'cost'
      },
      {
        layer: 'Backend',
        currentTech: 'Laravel 8 (PHP 7.4)',
        recommendedTech: 'NestJS (Node.js/TypeScript) or Laravel 11 (PHP 8.3)',
        benefit: 'Upgrading backend core improves response throughput, memory efficiency, and ensures vendor security updates.',
        type: 'performance'
      },
      {
        layer: 'Database',
        currentTech: 'MySQL 5.7',
        recommendedTech: 'PostgreSQL 15 (AWS RDS)',
        benefit: 'Provides supported long-term support version, native JSON query optimizations, and robust enterprise replication/failover mechanisms.',
        type: 'database'
      },
      {
        layer: 'Queue',
        currentTech: 'RabbitMQ 3.8',
        recommendedTech: 'RabbitMQ 3.12 or Apache Kafka',
        benefit: 'Solves memory leak issues in deprecated RabbitMQ cluster configurations and improves throughput for batch transaction processing.',
        type: 'queue'
      }
    ],
    migrationSteps: [
      {
        title: 'Step 1: Database Migration to AWS RDS PostgreSQL',
        description: 'Set up RDS PostgreSQL 15 target instance. Use AWS DMS (Database Migration Service) to perform schema migration and dynamic data replication with minimal downtime.',
        effort: 'Medium (2-3 weeks)'
      },
      {
        title: 'Step 2: Containerize Backend Application',
        description: 'Write optimized multi-stage Dockerfiles. Migrate from raw EC2 file system dependencies to stateless container configurations, utilizing AWS Systems Manager Parameter Store for secrets.',
        effort: 'Low (1 week)'
      },
      {
        title: 'Step 3: Framework & Language Upgrade',
        description: 'Upgrade codebase syntax to Laravel 11. Run composer updates and replace unsupported package dependencies. Perform comprehensive regression and integration testing.',
        effort: 'High (4-6 weeks)'
      },
      {
        title: 'Step 4: Load Balancer & ECS Deployment',
        description: 'Deploy AWS Application Load Balancer (ALB) and set up ECS Fargate Service. Configure target groups, health checks, and route 10% traffic incrementally using Route 53 weighted records.',
        effort: 'Medium (2 weeks)'
      }
    ],
    potentialSavingPercent: 20
  },
  'mobile-banking': {
    overallScore: 52,
    technologyHealth: 'Poor',
    security: 'Critical Vulnerabilities',
    scalability: 'Moderately Scalable',
    maintainability: 'Low',
    estimatedMonthlyCost: 8200,
    outdatedComponentsCount: 4,
    topRisks: [
      'Node.js 14 backend is End of Life, rendering the core Express.js gateway vulnerable to multiple unpatched Node-core CVEs.',
      'React Native 0.64 is highly outdated, blocking compiler support for Android API Level 34+ and iOS 17+ targets required by Apple App Store and Google Play.',
      'MongoDB 4.4 reached EOL in Feb 2024. Running it in production risks data corruption and compliance failures under Bank Indonesia regulations.'
    ],
    recommendations: [
      {
        layer: 'Backend',
        currentTech: 'ExpressJS on Node.js 14',
        recommendedTech: 'NestJS on Node.js 20 LTS',
        benefit: 'Leverages modern asynchronous processing, native ESM modules, and typed safety via TypeScript, resolving 15+ known security vulnerabilities.',
        type: 'performance'
      },
      {
        layer: 'Database',
        currentTech: 'MongoDB 4.4',
        recommendedTech: 'MongoDB Atlas / DocumentDB 5.0',
        benefit: 'Upgrading database layers ensures official security patches, better compression (WiredTiger updates), and multi-region cluster scaling.',
        type: 'database'
      },
      {
        layer: 'Cache Layer',
        currentTech: 'Redis 6.0',
        recommendedTech: 'Redis 7.2 (AWS ElastiCache)',
        benefit: 'Implements TLS-encrypted command channels, ACL-based user security policies, and active-active replication.',
        type: 'cost'
      }
    ],
    migrationSteps: [
      {
        title: 'Step 1: Mobile App React Native Upgrade',
        description: 'Incrementally upgrade React Native version from 0.64 to 0.73. Update build gradle scripts, CocoaPods dependencies, and rewrite legacy native bridge classes.',
        effort: 'High (5-7 weeks)'
      },
      {
        title: 'Step 2: API Gateway Node.js Runtime Upgrade',
        description: 'Rebuild Docker images using node:20-alpine. Test Express application middleware and upgrade dependencies experiencing compiler warnings under Node 20.',
        effort: 'Medium (2-3 weeks)'
      },
      {
        title: 'Step 3: Database Clustering & Migration',
        description: 'Deploy MongoDB Atlas 5.0 cluster. Use Live Migration Tool to sync active database logs and switch app connections with zero downtime.',
        effort: 'Medium (2 weeks)'
      }
    ],
    potentialSavingPercent: 15
  },
  'hris': {
    overallScore: 64,
    technologyHealth: 'Fair',
    security: 'Needs Improvement',
    scalability: 'Poor Scalability',
    maintainability: 'Medium',
    estimatedMonthlyCost: 2800,
    outdatedComponentsCount: 3,
    topRisks: [
      'Spring Boot 2.4.x and Java EE dependencies do not receive standard support, containing critical Spring4Shell vulnerability exposure.',
      'On-Premise hosting has manual scaling constraints, meaning salary calculation runs at month-end suffer major CPU thrashing and sluggish web page loads.',
      'Angular 11 frontend is deprecated, lacking modern bundle treeshaking, causing slow initial bundle downloads (5MB+) for regional branch networks.'
    ],
    recommendations: [
      {
        layer: 'Infrastructure',
        currentTech: 'On-Premise VM (vSphere)',
        recommendedTech: 'Hybrid Cloud (AWS Outposts or RDS/EC2)',
        benefit: 'Allows dynamic scaling of background workers during salary calculation periods and mitigates local power/hardware failures.',
        type: 'cost'
      },
      {
        layer: 'Frontend',
        currentTech: 'Angular 11',
        recommendedTech: 'Angular 17 / React 18',
        benefit: 'Reduces main bundle size by 60%, introducing standalone components and lazy loading for faster regional load times.',
        type: 'performance'
      }
    ],
    migrationSteps: [
      {
        title: 'Step 1: Spring Boot & JDK Upgrade',
        description: 'Upgrade JDK 11 to JDK 17. Migrating Spring Boot from 2.4 to 3.2, fixing breaking changes in Jakarta EE namespaces (javax to jakarta imports).',
        effort: 'High (4-6 weeks)'
      },
      {
        title: 'Step 2: Client UI Refactoring',
        description: 'Refactor Angular 11 application to Angular 17. Clean up outdated RxJS operator chains and utilize the new standalone component model.',
        effort: 'Medium (3-4 weeks)'
      },
      {
        title: 'Step 3: Containerization & Cloud Dev Setup',
        description: 'Standardize local Docker environments using modern docker-compose configurations. Create CI/CD pipelines pushing to enterprise container registries.',
        effort: 'Low (2 weeks)'
      }
    ],
    potentialSavingPercent: 25
  },
  'payment-gateway': {
    overallScore: 78,
    technologyHealth: 'Good',
    security: 'Good',
    scalability: 'Scalable',
    maintainability: 'Medium',
    estimatedMonthlyCost: 15400,
    outdatedComponentsCount: 3,
    topRisks: [
      'Vue 2 dashboard has reached End of Life. Frontend panels could be vulnerable to new web attacks without official patches, compromising security credentials.',
      'GKE 1.21 is unsupported, which means the host Kubernetes system lacks node kernel security updates and native cloud integration updates.',
      'Kafka 2.8 has known cluster coordination issues when zookeeper loses sync, risking message ordering errors during payment callbacks.'
    ],
    recommendations: [
      {
        layer: 'Frontend Dashboard',
        currentTech: 'Vue 2.6',
        recommendedTech: 'Vue 3 or React 18',
        benefit: 'Upgrading ensures compliance with enterprise software security audits and offers composition API for better merchant panel dashboard customizability.',
        type: 'performance'
      },
      {
        layer: 'Cloud',
        currentTech: 'GKE Kubernetes 1.21',
        recommendedTech: 'GKE 1.28 (Autopilot)',
        benefit: 'Autopilot removes node pool management overhead, automatically applying security updates, and saving up to 30% on idle compute resources.',
        type: 'cost'
      },
      {
        layer: 'Queue',
        currentTech: 'Apache Kafka 2.8',
        recommendedTech: 'Apache Kafka 3.6 (KRaft mode)',
        benefit: 'Eliminates ZooKeeper dependency, simplifying infrastructure complexity, improving metadata sync latency, and resolving cluster splits.',
        type: 'queue'
      }
    ],
    migrationSteps: [
      {
        title: 'Step 1: Kubernetes Cluster Upgrade',
        description: 'Create a new GKE 1.28 Autopilot cluster in parallel. Re-deploy application manifests, verify ingress routing, and switch traffic DNS.',
        effort: 'Medium (2-3 weeks)'
      },
      {
        title: 'Step 2: Vue 2 to Vue 3 Migration',
        description: 'Upgrade the admin panel using Vite and the Vue 3 migration build. Refactor state management from Vuex to Pinia for better performance.',
        effort: 'Medium (3-4 weeks)'
      },
      {
        title: 'Step 3: Kafka Cluster Transition',
        description: 'Set up KRaft-based Kafka 3.6 cluster. Perform mirror replication using Kafka MirrorMaker to migrate active queues with zero message loss.',
        effort: 'Medium (2 weeks)'
      }
    ],
    potentialSavingPercent: 30
  },
  'core-loan': {
    overallScore: 28,
    technologyHealth: 'Critical',
    security: 'Critical Vulnerabilities',
    scalability: 'Poor Scalability',
    maintainability: 'Low',
    estimatedMonthlyCost: 22000,
    outdatedComponentsCount: 7,
    topRisks: [
      'Java EE 8 (WildFly 14) and JSF/JSP tech is highly obsolete, making it extremely difficult to hire software developers to maintain it.',
      'Oracle 12c is EOL and operating on extended support. Lacks modern database features and charges high enterprise license fees.',
      'Deployment on Bare Metal servers lacks containerization, resulting in high resource waste, manual recoveries, and slow disaster response times.',
      'Apache Subversion (SVN) lacks branch security, pipeline webhooks, and modern code review capabilities, leading to quality assurance bottlenecks.'
    ],
    recommendations: [
      {
        layer: 'Cloud',
        currentTech: 'Bare Metal IBM AIX',
        recommendedTech: 'Private Cloud Kubernetes / VM',
        benefit: 'Transitioning to containerized deployments reduces hardware utilization costs, introduces disaster recovery, and modernizes release speed.',
        type: 'cost'
      },
      {
        layer: 'Database',
        currentTech: 'Oracle 12c (12.2)',
        recommendedTech: 'PostgreSQL 16 (RDS / On-Prem)',
        benefit: 'Replaces expensive Oracle licensing costs with an open-source database that handles complex interest calculation workloads.',
        type: 'database'
      },
      {
        layer: 'Queue',
        currentTech: 'IBM MQ 8.0',
        recommendedTech: 'Apache Kafka or RabbitMQ',
        benefit: 'Provides modern microservices communication capabilities, saving millions in commercial middleware licensing.',
        type: 'queue'
      },
      {
        layer: 'CI/CD',
        currentTech: 'SVN Subversion',
        recommendedTech: 'Git / GitLab Enterprise',
        benefit: 'Enables git-flow, automated code scanning, and pull requests to satisfy compliance governance policies.',
        type: 'performance'
      }
    ],
    migrationSteps: [
      {
        title: 'Step 1: Code Repository Migration',
        description: 'Migrate the entire codebase history from SVN to Git using svn2git. Train development teams on Git best practices and establish a branching strategy.',
        effort: 'Low (1-2 weeks)'
      },
      {
        title: 'Step 2: Database Migration assessment',
        description: 'Assess Oracle PL/SQL stored procedures using migration tools. Port procedures to PostgreSQL PL/pgSQL, focusing on mathematical precision.',
        effort: 'High (8-12 weeks)'
      },
      {
        title: 'Step 3: Core API Modularization',
        description: 'Gradually rewrite JSF pages as a REST API using Spring Boot or Go. Migrate frontend templates to React for banking personnel screens.',
        effort: 'High (12-16 weeks)'
      },
      {
        title: 'Step 4: Infrastructure Containerization',
        description: 'Create Docker configurations for the modular APIs and deploy them to a private Kubernetes cluster or cloud VMs.',
        effort: 'Medium (4 weeks)'
      }
    ],
    potentialSavingPercent: 40
  }
};
