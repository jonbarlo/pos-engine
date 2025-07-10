# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Cross-platform environment variable support with cross-env
- Windows-specific PowerShell testing scripts
- Docker support with Dockerfile and .dockerignore
- Standardized project structure following Node.js conventions

### Changed
- Renamed `src/db/` to `src/database/` for better clarity
- Renamed `src/config/swagger.ts` to `src/config/openapi.ts`
- Consolidated config files into `src/config/` folder
- Updated package.json scripts to use new folder structure

### Fixed
- Environment variable naming mismatch (DB_USER vs DB_USERNAME)
- Windows compatibility issues with nodemon
- Import paths after folder restructuring

## [1.0.0] - 2025-07-09

### Added
- Complete POS engine implementation with restaurant management system
- White label and multi-tenancy support
- Complete sales/orders system with MS SQL Server compatibility
- OpenAPI / Swagger support and comprehensive API documentation
- Restaurant-specific endpoints and functionality
- Cross-platform environment variable support with cross-env

### Changed
- Refactored folder structure to follow Node.js conventions
- Updated Swagger API docs with new endpoints for restaurant support
- Improved code organization and structure

### Fixed
- Environment variable naming for database user (DB_USER vs DB_USERNAME)
- Broken tests and Sequelize instance import/export issues
- SaleService test mocks for sequelize.query
- Item Controller tests for new service-based implementation

## [0.2.0] - 2025-07-07

### Added
- Complete sales/orders system implementation
- MS SQL Server database compatibility
- Enhanced test coverage and mocking

### Fixed
- Sequelize instance import/export issues
- SaleService test mocks
- Item Controller test implementations

## [0.1.0] - 2025-07-06

### Added
- Core NodeJS API with JWT Authentication
- Sequelize ORM integration
- ESLint configuration
- Jest testing framework
- Initial project structure 