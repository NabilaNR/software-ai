export interface VersionCheckResult {
  isOutdated: boolean;
  latestVersion?: string;
  reason?: string;
}

interface TechRecommendation {
  latestVersion: string;
  minSupportedVersion: string;
  isOutdated: (version: string) => boolean;
  reason: string;
}

export const techCatalog: Record<string, TechRecommendation> = {
  react: {
    latestVersion: '18.3.1 (or 19.0.0)',
    minSupportedVersion: '18.0.0',
    isOutdated: (v) => {
      const num = parseFloat(v);
      return !isNaN(num) && num < 18.0;
    },
    reason: 'React versions below 18 lack modern concurrent rendering engines and have security vulnerability risks in older ReactDOM versions.'
  },
  laravel: {
    latestVersion: '11.x',
    minSupportedVersion: '10.x',
    isOutdated: (v) => {
      const num = parseFloat(v);
      return !isNaN(num) && num < 10.0;
    },
    reason: 'Laravel versions below 10 are completely End of Life. PHP 7 support is deprecated, exposing applications to unpatched code injection vulnerabilities.'
  },
  mysql: {
    latestVersion: '8.0.x / 8.4 LTS',
    minSupportedVersion: '8.0.0',
    isOutdated: (v) => {
      const num = parseFloat(v);
      return !isNaN(num) && num < 8.0;
    },
    reason: 'MySQL 5.7 reached End of Life in October 2023. Upgrading to MySQL 8.0+ is critical to receive security patches and JSON query optimizations.'
  },
  postgresql: {
    latestVersion: '16.x',
    minSupportedVersion: '13.0.0',
    isOutdated: (v) => {
      const num = parseFloat(v);
      return !isNaN(num) && num < 13.0;
    },
    reason: 'PostgreSQL 12 and below are deprecated. Version 15+ provides significant improvements in vacuum performance and logical replication.'
  },
  redis: {
    latestVersion: '7.2.x',
    minSupportedVersion: '6.2.0',
    isOutdated: (v) => {
      const num = parseFloat(v);
      return !isNaN(num) && num < 6.2;
    },
    reason: 'Redis 6.0 and below are End of Life. Redis 7+ introduces key improvements in cluster storage optimization and security TLS handshakes.'
  },
  mongodb: {
    latestVersion: '7.0.x',
    minSupportedVersion: '5.0.0',
    isOutdated: (v) => {
      const num = parseFloat(v);
      return !isNaN(num) && num < 5.0;
    },
    reason: 'MongoDB 4.4 and below are EOL. Upgrading to 5.0+ introduces time-series collections and stable serverless support.'
  },
  express: {
    latestVersion: '4.19.x',
    minSupportedVersion: '4.18.0',
    isOutdated: (v) => {
      const match = v.match(/^(\d+)\.(\d+)/);
      if (!match) return false;
      const major = parseInt(match[1]);
      const minor = parseInt(match[2]);
      return major < 4 || (major === 4 && minor < 18);
    },
    reason: 'Express versions prior to 4.18.0 contain body-parser vulnerabilities. Upgrading resolves security advisories.'
  },
  angular: {
    latestVersion: '17.x / 18.x',
    minSupportedVersion: '15.0.0',
    isOutdated: (v) => {
      const num = parseFloat(v);
      return !isNaN(num) && num < 15.0;
    },
    reason: 'Angular 11-14 have reached End of Life. Upgrading is required to support modern TS compilers and standalone components.'
  },
  vue: {
    latestVersion: '3.4.x',
    minSupportedVersion: '3.0.0',
    isOutdated: (v) => {
      const num = parseFloat(v);
      return !isNaN(num) && num < 3.0;
    },
    reason: 'Vue 2 has reached End of Life in December 2023. Migration to Vue 3 is required for support.'
  },
  spring: {
    latestVersion: '3.2.x',
    minSupportedVersion: '3.0.0',
    isOutdated: (v) => {
      const num = parseFloat(v);
      return !isNaN(num) && num < 3.0;
    },
    reason: 'Spring Boot 2.x support has ended. Upgrading to 3.x is necessary to run JDK 17+ and Jakarta EE namespaces.'
  },
  kafka: {
    latestVersion: '3.6.x',
    minSupportedVersion: '3.0.0',
    isOutdated: (v) => {
      const num = parseFloat(v);
      return !isNaN(num) && num < 3.0;
    },
    reason: 'Kafka 2.8 and below rely on deprecated ZooKeeper configuration. Kafka 3.x supports KRaft mode for ZooKeeperless sync.'
  },
  oracle: {
    latestVersion: '19c / 21c',
    minSupportedVersion: '19.0.0',
    isOutdated: (v) => {
      const match = v.match(/^(\d+)/);
      if (!match) return false;
      return parseInt(match[1]) < 19;
    },
    reason: 'Oracle 12c is End of Life. Oracle 19c is the long-term support release and is critical for regulatory data compliance.'
  },
  wildfly: {
    latestVersion: '31.x',
    minSupportedVersion: '26.0.0',
    isOutdated: (v) => {
      const match = v.match(/^(\d+)/);
      if (!match) return false;
      return parseInt(match[1]) < 26;
    },
    reason: 'WildFly 14 is highly obsolete and lacks Jakarta EE compliance. Upgrading ensures library safety.'
  },
  node: {
    latestVersion: '20.x LTS',
    minSupportedVersion: '18.0.0',
    isOutdated: (v) => {
      const match = v.match(/^(\d+)/);
      if (!match) return false;
      return parseInt(match[1]) < 18;
    },
    reason: 'Node.js versions below 18 are End of Life. Upgrading is required to resolve engine compliance and ESM issues.'
  },
  jenkins: {
    latestVersion: '2.452.x LTS',
    minSupportedVersion: '2.426.0',
    isOutdated: (v) => {
      const match = v.match(/^(\d+)\.(\d+)/);
      if (!match) return true; // outdated if version not parseable or too old
      const major = parseInt(match[1]);
      const minor = parseInt(match[2]);
      return major < 2 || (major === 2 && minor < 426);
    },
    reason: 'Jenkins versions below 2.426 have severe security vulnerabilities (arbitrary file read CVE-2024-23897, XSS CVE-2023-24426). Upgrading to modern LTS secures controller-agent channels.'
  },
  docker: {
    latestVersion: '26.x / 27.x',
    minSupportedVersion: '20.10.0',
    isOutdated: (v) => {
      const match = v.match(/^(\d+)/);
      if (!match) return false;
      return parseInt(match[1]) < 20;
    },
    reason: 'Docker versions below 20.10 contain serious vulnerabilities (runc container escape CVE-2024-21626) and lack cgroup v2 systemd resource limiting compliance.'
  },
  kubernetes: {
    latestVersion: '1.30.x',
    minSupportedVersion: '1.26.0',
    isOutdated: (v) => {
      const match = v.match(/^(\d+)\.(\d+)/);
      if (!match) return false;
      const major = parseInt(match[1]);
      const minor = parseInt(match[2]);
      return major < 1 || (major === 1 && minor < 26);
    },
    reason: 'Kubernetes versions below 1.26 are EOL (End of Life). Upgrading is critical to support Pod Admission Standards and secure container namespaces.'
  }
};

export function checkVersionStatus(techName: string, version: string): VersionCheckResult {
  const name = techName.toLowerCase();
  
  let matchedKey = '';
  if (name.includes('react native')) matchedKey = 'react-native'; // special fallback
  else if (name.includes('react')) matchedKey = 'react';
  else if (name.includes('laravel')) matchedKey = 'laravel';
  else if (name.includes('mysql')) matchedKey = 'mysql';
  else if (name.includes('postgres')) matchedKey = 'postgresql';
  else if (name.includes('redis')) matchedKey = 'redis';
  else if (name.includes('mongo')) matchedKey = 'mongodb';
  else if (name.includes('node')) matchedKey = 'node';
  else if (name.includes('express')) matchedKey = 'express';
  else if (name.includes('angular')) matchedKey = 'angular';
  else if (name.includes('vue')) matchedKey = 'vue';
  else if (name.includes('spring')) matchedKey = 'spring';
  else if (name.includes('kafka')) matchedKey = 'kafka';
  else if (name.includes('oracle')) matchedKey = 'oracle';
  else if (name.includes('wildfly') || name.includes('boss')) matchedKey = 'wildfly';
  else if (name.includes('jenkins')) matchedKey = 'jenkins';
  else if (name.includes('docker')) matchedKey = 'docker';
  else if (name.includes('kubernetes') || name.includes('k8s')) matchedKey = 'kubernetes';

  if (matchedKey && techCatalog[matchedKey]) {
    const catalogItem = techCatalog[matchedKey];
    const isOutdated = catalogItem.isOutdated(version);
    if (isOutdated) {
      return {
        isOutdated: true,
        latestVersion: catalogItem.latestVersion,
        reason: catalogItem.reason
      };
    }
  }

  // Handle generic react native fallback
  if (matchedKey === 'react-native') {
    const num = parseFloat(version);
    if (!isNaN(num) && num < 0.70) {
      return {
        isOutdated: true,
        latestVersion: '0.73.x',
        reason: 'React Native versions below 0.70 are End of Life, preventing builds targeting Android API Level 34+.'
      };
    }
  }

  return { isOutdated: false };
}
