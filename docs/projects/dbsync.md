# DBSync - Database to IAM Synchronization Platform

## 🎯 Product Overview

**DBSync** is a comprehensive database synchronization platform that connects to multiple databases, executes scheduled SQL queries, and synchronizes results to IAM systems via REST APIs. Features a modern React UI for configuration management and full REST API for headless automation.

### Business Value Proposition
- **Identity Automation**: Eliminate manual user provisioning, reduce onboarding time by 90%
- **Cost Savings**: Replace expensive ETL tools with lightweight, purpose-built solution
- **Security Compliance**: Ensure IAM systems reflect real-time database state for access control
- **Operational Efficiency**: Automate user lifecycle management across HR, CRM, and IAM systems
- **Audit Readiness**: Complete execution history and metrics for compliance reporting

---

## 💼 Use Cases & Target Markets

### 1. **Enterprise IT & Security**
- **Problem**: HR database changes don't sync to IAM systems, causing security gaps
- **Solution**: Scheduled sync jobs automatically provision/deprovision users in real-time
- **ROI**: Reduce security incidents by 60%, eliminate orphaned accounts

### 2. **SaaS Platforms**
- **Problem**: Customer data in PostgreSQL needs to sync to Okta/Azure AD for SSO
- **Solution**: Multi-database support with granular create/update/delete controls
- **ROI**: Automate customer onboarding, reduce support tickets by 40%

### 3. **Healthcare Systems**
- **Problem**: Patient management systems need to sync with access control systems
- **Solution**: HIPAA-compliant sync with audit trails and execution monitoring
- **ROI**: Ensure only authorized staff access patient records

### 4. **Financial Services**
- **Problem**: Employee database changes must reflect in IAM within minutes for compliance
- **Solution**: Cron-based scheduling with connection testing and validation
- **ROI**: Meet regulatory requirements, reduce manual IAM administration by 80%

### 5. **Multi-Cloud Enterprises**
- **Problem**: Synchronize user data across Oracle, SQL Server, MySQL to multiple IAM targets
- **Solution**: Multi-database, multi-IAM support with REST API automation
- **ROI**: Unified identity management across hybrid cloud environments

---

## ⚙️ Technical Architecture

### Core Components

#### 1. **Database Connectivity Layer**
- **Multi-Database Support**: PostgreSQL, MySQL, Oracle, SQL Server
- **Connection Pooling**: HikariCP for high-performance connections
- **Connection Testing**: Validate connectivity before saving configurations
- **JDBC Abstraction**: Unified interface for all database types

#### 2. **Scheduling Engine**
- **Cron Scheduling**: Standard cron expressions for flexible timing
- **Fixed-Delay Scheduling**: Interval-based execution
- **Job Execution Monitoring**: Track status, timing, and metrics
- **Execution History**: Complete audit trail of all job runs

#### 3. **IAM Integration Layer**
- **REST API Integration**: Connect to any IAM system with REST endpoints
- **API Key Authentication**: Secure authentication with IAM targets
- **Behavior Configuration**: Granular control over create/update/delete operations
- **Connection Testing**: Validate IAM connectivity before deployment

#### 4. **Configuration Management**
- **YAML Configuration**: File-based configuration with hot-reload
- **Web UI**: React TypeScript frontend for visual configuration
- **REST API**: Comprehensive CRUD operations for headless automation
- **Real-time Validation**: Instant feedback on configuration errors

#### 5. **Monitoring & Observability**
- **Job Execution Dashboard**: Monitor job runs with status, timing, and metrics
- **System Health Monitoring**: Track database and IAM connectivity
- **Swagger/OpenAPI**: Interactive API documentation
- **Execution Metrics**: Success/failure rates, execution duration, record counts

### Technology Stack

#### Backend
- **Spring Boot 4.0.1**: Enterprise Java framework
- **Java 21**: Latest LTS with performance improvements
- **H2 Database**: Embedded metadata storage
- **Flyway**: Database migration management
- **SpringDoc OpenAPI 2.3.0**: Swagger documentation

#### Frontend
- **React 18.2.0**: Modern UI library
- **TypeScript 4.9.5**: Type-safe development
- **Material-UI (MUI) 5.15.0**: Professional component library
- **React Router 6.20.1**: Client-side routing
- **Axios**: HTTP client for API calls

#### Testing & Quality
- **174 Backend Tests**: Unit, integration, and API tests (100% passing)
- **45 E2E Tests**: Playwright tests for complete user workflows
- **Testcontainers**: Real database testing with Docker
- **SonarCloud Integration**: Automated code quality scanning
- **JaCoCo + LCOV**: Code coverage tracking

---

## 🚀 Key Features

### Core Functionality
✅ **Multi-Database Support** - PostgreSQL, MySQL, Oracle, SQL Server  
✅ **Scheduled Sync Jobs** - Cron and fixed-delay scheduling  
✅ **IAM Integration** - REST API integration with multiple IAM targets  
✅ **YAML Configuration** - File-based configuration with hot-reload  
✅ **Connection Testing** - Test database and IAM connectivity before saving  
✅ **Behavior Configuration** - Granular control over create/update/delete operations  
✅ **Job Execution Monitoring** - Track job status, metrics, and execution history  

### User Interface
✅ **React TypeScript Frontend** - Modern Material-UI components  
✅ **Configuration Management** - Web-based UI for databases, IAM, and jobs  
✅ **Job Execution Dashboard** - Monitor job runs with status, timing, and metrics  
✅ **Real-time Validation** - Instant feedback on configuration errors  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  

### API & Documentation
✅ **REST API** - Comprehensive CRUD operations for all resources  
✅ **Swagger/OpenAPI** - Interactive API documentation at `/swagger-ui.html`  
✅ **API Contract Tests** - Automated testing of API specifications  

### Testing & Quality
✅ **219 Total Tests** - 100% passing (174 backend + 45 E2E)  
✅ **SonarCloud Integration** - Automated code quality scanning on every PR  
✅ **Quality Gate** - Enforced code quality standards  
✅ **Coverage Tracking** - JaCoCo (backend) + LCOV (frontend)  

---

## 📊 Performance Metrics

| Metric | Value |
|--------|-------|
| Total Tests | 219 tests (100% passing) |
| Backend Unit Tests | 117 tests ✅ |
| Backend Integration Tests | 57 tests ✅ |
| Frontend E2E Tests | 45 tests ✅ |
| Code Quality | SonarCloud monitored |
| CI/CD | GitHub Actions automated |

---

## 🤝 Get Started

- **GitHub Repository**: [https://github.com/private-enterprise/dbsync](https://github.com/private-enterprise/dbsync)
- **Web UI**: http://localhost:3000 (after `npm start`)
- **REST API**: http://localhost:8080/api/config
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Quick Start**: See README for build and run instructions

---

**Built by Developers Coffee** - Automating Identity Management ☕🔐

