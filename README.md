# CAF
Clean Architecture Frontend

**Public API:** The `@caf/core` package exports are documented in [docs/API.md](docs/API.md) (UseCase, Ploc, Pulse, pulse, ApiRequest, RouteManager, RouteRepository, RequestResult, IRequest, RouteManagerAuthOptions).

## Getting started
yarn core:serve



## Domain
less likely to change
the logic that can work without any dependencies and can be ran alone

## application
specific business rules
and logic than may need some dependencies injections

## infrastructures
presenters and gate ways and...
common examples are the repositories
in here we have axios and route manager implementations as examples