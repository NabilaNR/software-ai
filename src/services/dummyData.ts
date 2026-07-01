export interface TechStackItem {
  layer: string;
  technology: string;
  version: string;
  supportStatus: 'Supported' | 'Deprecated' | 'End of Life' | 'Warning';
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface Project {
  id: string;
  name: string;
  owner: string;
  environments: {
    production: string;
    staging: string;
    development: string;
  };
  repository: string;
  techStack: TechStackItem[];
  architectureDiagram: string;
  description: string;
  estimatedMonthlyCost: number;
  isActive?: boolean;
}

export const dummyProjects: Project[] = [
  {
    id: 'digital-banking',
    name: 'Digital Banking (BNI Direct)',
    owner: 'IT Wholesale Banking Division',
    description: 'Corporate and retail digital banking portal handling daily transactions, account openings, and statement generations.',
    environments: {
      production: 'https://bnidirect.bni.co.id',
      staging: 'https://staging.bnidirect.bni.co.id',
      development: 'https://dev.bnidirect.bni.co.id'
    },
    repository: 'https://github.com/bni-enterprise/digital-banking-portal.git',
    estimatedMonthlyCost: 4500,
    techStack: [
      { layer: 'Frontend', technology: 'React', version: '17.0.2', supportStatus: 'Deprecated', risk: 'Medium' },
      { layer: 'Backend', technology: 'Laravel', version: '8.83.27', supportStatus: 'End of Life', risk: 'High' },
      { layer: 'Database', technology: 'MySQL', version: '5.7.44', supportStatus: 'End of Life', risk: 'Critical' },
      { layer: 'Queue', technology: 'RabbitMQ', version: '3.8.14', supportStatus: 'Deprecated', risk: 'Medium' },
      { layer: 'Cache', technology: 'Redis', version: '6.2.6', supportStatus: 'Deprecated', risk: 'Medium' },
      { layer: 'Cloud Infrastructure', technology: 'AWS EC2', version: 'HVM', supportStatus: 'Supported', risk: 'Low' },
      { layer: 'Containerization', technology: 'Docker', version: '20.10.12', supportStatus: 'Supported', risk: 'Low' },
      { layer: 'CI/CD', technology: 'GitLab CI', version: '14.9', supportStatus: 'Supported', risk: 'Low' }
    ],
    architectureDiagram: `flowchart TD
  Client[Client Browser] -->|HTTPS| ALB[AWS Application Load Balancer]
  ALB -->|Port 80/443| EC2[AWS EC2 Instances]
  subgraph AWS [AWS Cloud]
    EC2 -->|Read/Write| MySQL[(MySQL 5.7)]
    EC2 -->|Pub/Sub| RabbitMQ{RabbitMQ}
    EC2 -->|Session/Cache| Redis[(Redis 6.2)]
  end
  subgraph CI_CD [Deployment]
    GitLab[GitLab CI] -->|SSH deploy| EC2
  end`
  },
  {
    id: 'mobile-banking',
    name: 'BNI Mobile Banking v2',
    owner: 'Retail IT Division',
    description: 'Next-generation mobile application for retail customers supporting QRIS payments, bill payments, and cardless withdrawals.',
    environments: {
      production: 'https://mobile.bni.co.id/api/v2',
      staging: 'https://staging-mobile.bni.co.id/api/v2',
      development: 'https://dev-mobile.bni.co.id/api/v2'
    },
    repository: 'https://github.com/bni-enterprise/bni-mobile-v2.git',
    estimatedMonthlyCost: 8200,
    techStack: [
      { layer: 'Mobile App', technology: 'React Native', version: '0.64.4', supportStatus: 'End of Life', risk: 'High' },
      { layer: 'Backend Gateway', technology: 'ExpressJS / Node.js', version: '14.18.2', supportStatus: 'End of Life', risk: 'Critical' },
      { layer: 'Database', technology: 'MongoDB', version: '4.4.15', supportStatus: 'End of Life', risk: 'High' },
      { layer: 'Queue Broker', technology: 'RabbitMQ', version: '3.9.13', supportStatus: 'Supported', risk: 'Low' },
      { layer: 'Cache Layer', technology: 'Redis', version: '6.0.16', supportStatus: 'End of Life', risk: 'High' },
      { layer: 'Cloud Infrastructure', technology: 'AWS ECS (Fargate)', version: 'v1.4.0', supportStatus: 'Supported', risk: 'Low' },
      { layer: 'Containerization', technology: 'Docker', version: '20.10.21', supportStatus: 'Supported', risk: 'Low' },
      { layer: 'CI/CD Pipeline', technology: 'Jenkins', version: '2.319', supportStatus: 'Deprecated', risk: 'Medium' }
    ],
    architectureDiagram: `flowchart TD
  Client[React Native App] -->|HTTPS| Cloudflare[Cloudflare WAF]
  Cloudflare -->|Proxy| ECS[AWS ECS Fargate]
  subgraph ECS_Cluster [ECS Cluster]
    ECS -->|Query| Mongo[(MongoDB 4.4)]
    ECS -->|Job Queue| RabbitMQ{RabbitMQ 3.9}
    ECS -->|Fast Lookups| Redis[(Redis 6.0)]
  end
  subgraph DevOps [Pipeline]
    Jenkins[Jenkins CI] -->|Push Image| ECR[AWS ECR]
    ECR -->|Deploy| ECS
  end`
  },
  {
    id: 'hris',
    name: 'BNI SmartHR (HRIS)',
    owner: 'Human Capital Technology Division',
    description: 'Internal Human Resource Information System tracking employee attendance, payroll processing, benefits, and performance appraisals.',
    environments: {
      production: 'https://smarthr.bni.co.id',
      staging: 'https://staging.smarthr.bni.co.id',
      development: 'https://dev.smarthr.bni.co.id'
    },
    repository: 'https://github.com/bni-enterprise/bni-smarthr.git',
    estimatedMonthlyCost: 2800,
    techStack: [
      { layer: 'Frontend', technology: 'Angular', version: '11.2.14', supportStatus: 'End of Life', risk: 'High' },
      { layer: 'Backend', technology: 'Spring Boot', version: '2.4.5', supportStatus: 'End of Life', risk: 'High' },
      { layer: 'Database', technology: 'PostgreSQL', version: '12.9', supportStatus: 'Deprecated', risk: 'Medium' },
      { layer: 'Queue', technology: 'ActiveMQ', version: '5.16.3', supportStatus: 'Deprecated', risk: 'Medium' },
      { layer: 'Cache', technology: 'Memcached', version: '1.6.12', supportStatus: 'Supported', risk: 'Low' },
      { layer: 'Infrastructure', technology: 'On-Premise VM (vSphere)', version: '7.0', supportStatus: 'Supported', risk: 'Low' },
      { layer: 'Containerization', technology: 'Docker', version: '19.03', supportStatus: 'Deprecated', risk: 'Medium' },
      { layer: 'CI/CD', technology: 'Bitbucket Pipelines', version: 'Standard', supportStatus: 'Supported', risk: 'Low' }
    ],
    architectureDiagram: `flowchart TD
  Employee[Employee Browser] -->|Reverse Proxy| Nginx[Nginx Router]
  Nginx -->|Java Web Context| Spring[Spring Boot 2.4]
  subgraph PrivateVM [On-Premise VM]
    Spring -->|SQL| Postgres[(PostgreSQL 12)]
    Spring -->|JMS Queue| ActiveMQ{ActiveMQ}
    Spring -->|Cache| Memcached[(Memcached)]
  end
  subgraph BuildServer [Bitbucket]
    Bitbucket[Bitbucket Pipelines] -->|Ansible Playbook| Nginx
  end`
  },
  {
    id: 'payment-gateway',
    name: 'BNI PayGateway Engine',
    owner: 'Digital Transaction Banking Division',
    description: 'High-throughput payment gateway processing merchant APIs, credit card checkouts, and e-wallet transfers with strict PCI-DSS requirements.',
    environments: {
      production: 'https://api-pay.bni.co.id',
      staging: 'https://staging-api-pay.bni.co.id',
      development: 'https://dev-api-pay.bni.co.id'
    },
    repository: 'https://github.com/bni-enterprise/pay-gateway.git',
    estimatedMonthlyCost: 15400,
    techStack: [
      { layer: 'Frontend Dashboard', technology: 'Vue', version: '2.6.14', supportStatus: 'End of Life', risk: 'High' },
      { layer: 'Core Engine', technology: 'Go (Gin)', version: '1.16.5', supportStatus: 'End of Life', risk: 'High' },
      { layer: 'Database', technology: 'PostgreSQL', version: '13.5', supportStatus: 'Warning', risk: 'Medium' },
      { layer: 'Queue / Event Streaming', technology: 'Apache Kafka', version: '2.8.1', supportStatus: 'Deprecated', risk: 'Medium' },
      { layer: 'Cache / Rate Limiter', technology: 'Redis', version: '6.2.14', supportStatus: 'Supported', risk: 'Low' },
      { layer: 'Infrastructure', technology: 'Google Cloud GKE (Kubernetes)', version: '1.21.5', supportStatus: 'End of Life', risk: 'High' },
      { layer: 'Containerization', technology: 'Docker', version: '20.10.17', supportStatus: 'Supported', risk: 'Low' },
      { layer: 'CI/CD', technology: 'GitHub Actions', version: 'Self-Hosted', supportStatus: 'Supported', risk: 'Low' }
    ],
    architectureDiagram: `flowchart TD
  Merchant[Merchant Server] -->|REST API| GCLB[GCP Cloud Load Balancer]
  GCLB -->|Ingress| GKE[GKE Kubernetes Cluster]
  subgraph GKE_Pods [Kubernetes Pods]
    GKE -->|Gin Engine| Go[Go Gin Backend]
    Go -->|Pub/Sub Events| Kafka{Apache Kafka 2.8}
    Go -->|Rate Limit / Lock| Redis[(Redis 6.2)]
    Go -->|Transactional DB| Postgres[(PostgreSQL 13)]
  end
  subgraph GCP_Sec [Security]
    Vault[HashiCorp Vault] -->|Secrets| Go
  end`
  },
  {
    id: 'core-loan',
    name: 'Core Loan Processing System',
    owner: 'Credit & Risk Technology Division',
    description: 'Legacy batch and transactional system calculating loan interests, credit scores, monthly installments, and underwriting rules.',
    environments: {
      production: 'https://coreloan.internal.bni.co.id:8443',
      staging: 'https://staging-coreloan.internal.bni.co.id:8443',
      development: 'https://dev-coreloan.internal.bni.co.id:8443'
    },
    repository: 'svn://svn.internal.bni.co.id/core-loan/trunk',
    estimatedMonthlyCost: 22000,
    techStack: [
      { layer: 'Frontend UI', technology: 'JSF / JSP', version: 'Java EE 8', supportStatus: 'End of Life', risk: 'Critical' },
      { layer: 'App Server', technology: 'WildFly (JBoss)', version: '14.0.1', supportStatus: 'End of Life', risk: 'Critical' },
      { layer: 'Database', technology: 'Oracle Database', version: '12c (12.2.0.1)', supportStatus: 'End of Life', risk: 'Critical' },
      { layer: 'Queue', technology: 'IBM MQ', version: '8.0.0.8', supportStatus: 'End of Life', risk: 'Critical' },
      { layer: 'Search Engine', technology: 'Apache Solr', version: '8.4.1', supportStatus: 'Deprecated', risk: 'High' },
      { layer: 'Infrastructure', technology: 'Bare Metal Server (IBM AIX)', version: '7.2', supportStatus: 'Supported', risk: 'Low' },
      { layer: 'Deployment Style', technology: 'WebSphere / Manual EAR', version: '8.5.5', supportStatus: 'End of Life', risk: 'Critical' },
      { layer: 'CI/CD / Versioning', technology: 'Apache Subversion (SVN)', version: '1.9', supportStatus: 'Deprecated', risk: 'High' }
    ],
    architectureDiagram: `flowchart TD
  Staff[Bank Staff Terminal] -->|HTTP/JSP| WAS[WildFly Application Server]
  subgraph IBM_AIX [Bare Metal IBM Power Systems]
    WAS -->|EJB / JDBC| Oracle[(Oracle 12c DB)]
    WAS -->|JMS Engine| IBMMQ{IBM MQ}
    WAS -->|Indexing| Solr[(Solr 8 Search)]
  end
  subgraph VersionControl [SVN Repo]
    SVN[SVN Subversion] -->|Manual Export| Dev[Local Dev Machine]
    Dev -->|Build Ant/EAR| WAS
  end`
  }
];
